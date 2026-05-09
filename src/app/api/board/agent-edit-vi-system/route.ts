/**
 * VI 系统文档专用 agent：品牌色、字体、间距、组件气质、暗色/浅色叙事等。
 * 修改 vi-system.md 后必须通过 applyViMarkdownToProject 重算 vi-tokens.json。
 * POST { projectName, selectedText?, userMessage }
 */
import { generateText } from "ai";
import { createDeepSeekModel } from "@/lib/board-stream-utils";
import { applyViMarkdownToProject } from "@/lib/board/apply-vi-markdown";
import {
  applyStrReplacePatches,
  parseStrReplaceEditJson,
  readMarkdownUnderProject,
  safeDvProjectRoot,
} from "@/lib/board/agent-markdown-patch";

export const maxDuration = 120;

const REL = ["品牌VI", "vi-system.md"] as const;

const SYSTEM = `你是「品牌 VI / vi-system」文档专家，只修改 vi-system.md（通常为品牌 Design 说明 Markdown）。

业务重点：
- 色彩体系、字体与排版、圆角阴影、间距与层级、品牌气质与使用约束
- 与数据看板相关的视觉原则（对比度、图表区可读性、KPI 卡等若文档中有描述）
- 保持文档内部术语与结构一致；不随意删除大块规范除非用户明确要求

技术规则（违反则替换会失败）：
- 使用 str_replace：oldStr 必须从【当前全文】代码块内逐字复制，含行首「- 」、空格、反引号（如十六进制常写作 \`#08090a\` 而不是裸写 #08090a）、括号与换行；禁止凭记忆改写或省略反引号。
- oldStr 在全文里必须恰好出现一次；若一处要改多行，请把连续多行整段放进 oldStr。
- newStr 为替换后的完整片段（与 oldStr 等范围对应）。
- 可多个 patch，按顺序应用；不要改动用户未要求的部分。
- 只输出 JSON，禁止 markdown 围栏。

格式：{ "patches": [ { "oldStr": "...", "newStr": "..." } ], "description": "一句话" }`;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectName?: string;
    selectedText?: string;
    userMessage?: string;
  };
  const projectName = body.projectName?.trim();
  const selectedText = typeof body.selectedText === "string" ? body.selectedText : "";
  const userMessage = body.userMessage?.trim();
  if (!projectName || !userMessage) {
    return Response.json({ error: "Missing projectName or userMessage" }, { status: 400 });
  }

  let doc: string;
  try {
    doc = await readMarkdownUnderProject(safeDvProjectRoot(projectName), [...REL]);
  } catch {
    return Response.json({ error: "vi-system.md not found" }, { status: 404 });
  }

  const sel = selectedText.trim();
  const userPrompt = `【当前 vi-system.md 全文】
\`\`\`markdown
${doc}
\`\`\`

【用户选中的片段】（来自页面 innerText 纯文本，可能与 Markdown 源码符号不一致，例如源码中色值常带反引号而选中里没有）
\`\`\`
${sel || "(无选中)"}
\`\`\`

用户指令：${userMessage}`;

  try {
    const model = createDeepSeekModel();
    const runLlm = (userContent: string) =>
      generateText({
        model,
        system: SYSTEM,
        messages: [{ role: "user", content: userContent }],
      });

    let { text } = await runLlm(userPrompt);

    let editResponse: ReturnType<typeof parseStrReplaceEditJson>;
    try {
      editResponse = parseStrReplaceEditJson(text);
    } catch {
      return Response.json({ error: "LLM 返回格式无效", raw: text.slice(0, 400) }, { status: 500 });
    }

    let { result, errors } = applyStrReplacePatches(doc, editResponse.patches ?? []);

    if (errors.length > 0) {
      const retryUser = `${userPrompt}

【重要：上一轮有 ${errors.length} 个 patch 的 oldStr 与原文不一致或未唯一匹配】
${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}

请重新输出完整 JSON：oldStr 必须从上方【当前 vi-system.md 全文】中复制粘贴（注意反引号包裹的色值、列表符、换行），不要改写或缩写。`;
      ({ text } = await runLlm(retryUser));
      try {
        editResponse = parseStrReplaceEditJson(text);
      } catch {
        return Response.json(
          { error: "重试时 LLM 返回格式无效", errors, raw: text.slice(0, 400) },
          { status: 500 }
        );
      }
      ({ result, errors } = applyStrReplacePatches(doc, editResponse.patches ?? []));
    }

    if (errors.length > 0) {
      return Response.json(
        {
          error: "替换未全部成功，未写入磁盘（避免文档与 token 不一致）",
          description: editResponse.description,
          patchCount: editResponse.patches?.length ?? 0,
          errors,
        },
        { status: 422 }
      );
    }

    await applyViMarkdownToProject(projectName, result);

    return Response.json({
      description: editResponse.description,
      patchCount: editResponse.patches?.length ?? 0,
      errors: [],
    });
  } catch (err) {
    console.error("[agent-edit-vi-system]", err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
