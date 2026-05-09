/**
 * Design Story 专用 agent：数据叙事、指标口径、业务背景等。
 * POST { projectName, selectedText?, userMessage }
 */
import { generateText } from "ai";
import { createDeepSeekModel } from "@/lib/board-stream-utils";
import {
  applyStrReplacePatches,
  parseStrReplaceEditJson,
  readMarkdownUnderProject,
  safeDvProjectRoot,
  writeMarkdownUnderProject,
} from "@/lib/board/agent-markdown-patch";

export const maxDuration = 120;

const REL = ["数据故事", "design-story.md"] as const;

const SYSTEM = `你是「数据故事 / Design Story」文档专家，只修改 design-story.md。

业务重点：
- 看板名称、概述、业务目标、受众、决策支持场景
- 核心指标表（指标名、类型、说明）、分析维度、关键洞察与叙事线
- 数据口径、对比与预警等业务语义（不要编造与原文矛盾的事实）

技术规则：
- 使用 str_replace：oldStr 必须从【当前全文】逐字复制（含反引号、列表符、换行），唯一匹配，必要时扩大上下文；newStr 为替换后完整片段。
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

  let root: string;
  let doc: string;
  try {
    root = safeDvProjectRoot(projectName);
    doc = await readMarkdownUnderProject(root, [...REL]);
  } catch {
    return Response.json({ error: "design-story.md not found" }, { status: 404 });
  }

  const sel = selectedText.trim();
  const userPrompt = `【当前 design-story.md 全文】
\`\`\`markdown
${doc}
\`\`\`

【用户选中的片段】（优先围绕此处改；无选中则按全文与指令）
\`\`\`
${sel || "(无选中)"}
\`\`\`

用户指令：${userMessage}`;

  try {
    const model = createDeepSeekModel();
    const { text } = await generateText({
      model,
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });

    let editResponse: ReturnType<typeof parseStrReplaceEditJson>;
    try {
      editResponse = parseStrReplaceEditJson(text);
    } catch {
      return Response.json({ error: "LLM 返回格式无效", raw: text.slice(0, 400) }, { status: 500 });
    }

    const { result, errors } = applyStrReplacePatches(doc, editResponse.patches ?? []);
    if (errors.length > 0) {
      return Response.json(
        {
          error: "替换未全部成功，未写入磁盘",
          description: editResponse.description,
          patchCount: editResponse.patches?.length ?? 0,
          errors,
        },
        { status: 422 }
      );
    }
    await writeMarkdownUnderProject(root, [...REL], result);

    return Response.json({
      description: editResponse.description,
      patchCount: editResponse.patches?.length ?? 0,
      errors: [],
    });
  } catch (err) {
    console.error("[agent-edit-design-story]", err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
