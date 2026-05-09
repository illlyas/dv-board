/**
 * 页面结构 story 专用 agent：分区、布局层级、模块与组件排布、多页结构等。
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

const REL = ["页面结构", "pages-story.md"] as const;

const SYSTEM = `你是「页面结构 / pages-story」文档专家，只修改 pages-story.md。

业务重点：
- 页面分区、栅格与区块层级、模块标题与职责
- 组件类型与摆放（图表、KPI、表格等）、多页/多 Tab 结构
- 与数据故事的呼应（布局服务于指标与叙事，不引入无关新指标名除非用户要求）
- **每页须有「主视觉组件」文案**，且组件清单表格 **「主视觉」列恰一行 ★**，★ 对应大图类组件且须放进下游 JSX **中栏**
- **除 KPI（pixel）外**，每页图表/表类组件 **≥5**；不足则补合理图表或表，勿删至不达标

技术规则：
- 使用 str_replace：oldStr 必须从【当前全文】逐字复制（含反引号、列表符、换行），唯一匹配；newStr 为替换后完整片段。
- 可多个 patch；不要改动用户未要求的部分。
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
    return Response.json({ error: "pages-story.md not found" }, { status: 404 });
  }

  const sel = selectedText.trim();
  const userPrompt = `【当前 pages-story.md 全文】
\`\`\`markdown
${doc}
\`\`\`

【用户选中的片段】
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
    console.error("[agent-edit-pages-story]", err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
