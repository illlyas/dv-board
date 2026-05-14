/**
 * POST /api/board/dashboard-intent
 * 非流式：根据当前项目文件与用户消息，返回本轮需要同步的文档范围（保守布尔 + 可选 vi 全文）。
 */
import { generateText } from "ai";
import { createDeepSeekModel } from "@/lib/board-stream-utils";
import { storage, dvPath } from "@/lib/storage";
import { isValidProjectKey } from "@/lib/projects/project-config";

export const maxDuration = 60;

const TRUNC = 8000;

async function readSnippet(logicalPath: string): Promise<string> {
  const raw = await storage.tryReadText(logicalPath);
  if (raw === null) return "";
  if (raw.length <= TRUNC) return raw;
  return `${raw.slice(0, TRUNC)}\n\n...[truncated, ${raw.length - TRUNC} chars omitted]`;
}

function parseIntentJson(text: string): Record<string, unknown> {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/, "");
  }
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) cleaned = m[0];
  return JSON.parse(cleaned) as Record<string, unknown>;
}

const SYSTEM = `你是看板「迭代」意图分类器。项目的「AI 长期记忆」已通过文件夹固化，优先级如下：
1) 模板填空：**template-fill.json**（风电运营固定骨架的槽位文案；摘要见 pages-story.md）
2) 业务叙事：**design-story.md**
3) 品牌与变量：**vi-system.md** + **vi-tokens.json**
4) 当前实现：**dashboard.jsx**（由 wind-power-emerald-ops 模板装配）

**每一轮对话的核心目的**：在以上记忆之上**演进**看板（改填空、改 VI、再装配 dashboard.jsx），而不是发明新布局。

你只输出一个 JSON 对象，禁止 markdown 围栏、禁止解释文字。

字段（严格遵守键名）：
- "clarification": string | null。仅当完全无法判断要做什么时给一句短追问；能做事时必须是 null。
- "updateStory": boolean。仅当用户**明确**要改数据叙事、指标口径、业务背景、分析章节等（影响 design-story.md）时为 true。泛泛的「优化看板」若没有叙事层改动 → false。
- "updatePages": boolean。仅当用户**明确**要改模板槽位标题、分区标题、轴标签、KPI 展示数值等（影响 template-fill.json）时为 true。若 updateStory 为 true，服务端会强制同步模板填空（等价于本字段视为 true）。
- "updateViReload": boolean。用户要换整套预设品牌风格、从内置设计系统重装 VI 时为 true。细碎图表配色、改文案、仅重装 dashboard 不要开。
- "viSystemMarkdown": string | null。若用户需要自定义写入 vi-system.md 的完整 Markdown（不走预设 style 复制），给全文；否则 null。若此字段为非空字符串，执行时以它为准，忽略 updateViReload 的「从 style 复制」语义（但仍会据此重生 token）。

**默认保守策略（极其重要）**：不确定上述布尔字段时一律 false，viSystemMarkdown 为 null。此时流水线仍会从磁盘读取当前的 template-fill、vi-tokens 与 dashboard.jsx 摘录，**仅刷新装配**。**禁止**无理由打开 updateStory/updatePages 导致整篇重写。不要误开 updateViReload。`;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    userMessage?: string;
    projectName?: string;
    style?: string;
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  const userMessage = body?.userMessage?.trim();
  const projectName = body?.projectName?.trim();
  const style = (body?.style ?? "").trim();
  const conversationHistory = Array.isArray(body?.conversationHistory) ? body!.conversationHistory! : [];

  if (!userMessage) {
    return Response.json({ error: "Missing userMessage" }, { status: 400 });
  }
  if (!projectName) {
    return Response.json({ error: "Missing projectName" }, { status: 400 });
  }
  if (!isValidProjectKey(projectName)) {
    return Response.json({ error: "Invalid projectName" }, { status: 400 });
  }

  try {
    const [story, templateFill, pagesExcerpt, viMd, tokens, dashboard] = await Promise.all([
      readSnippet(dvPath(projectName, "数据故事", "design-story.md")),
      readSnippet(dvPath(projectName, "页面结构", "template-fill.json")),
      readSnippet(dvPath(projectName, "页面结构", "pages-story.md")),
      readSnippet(dvPath(projectName, "品牌VI", "vi-system.md")),
      readSnippet(dvPath(projectName, "品牌VI", "vi-tokens.json")),
      readSnippet(dvPath(projectName, "页面", "dashboard.jsx")),
    ]);

    const tokensMissing = !tokens.trim();
    const structureCtx =
      templateFill.trim() ||
      pagesExcerpt.trim() ||
      "(缺失：尚无 template-fill.json / pages-story.md)";
    const fileCtx = `项目名称：${projectName}
${style ? `项目风格(style)：${style}\n` : ""}
【当前 design-story.md】
${story || "(缺失)"}

【当前 template-fill.json 或摘要】
${structureCtx}

【当前 vi-system.md】
${viMd || "(缺失)"}

【当前 vi-tokens.json 是否存在】
${tokensMissing ? "否或为空 — 若本轮要装配看板，必须把 updateViReload 或 viSystemMarkdown 置为可产出 token 的状态（例如 updateViReload=true，或提供 viSystemMarkdown）。" : "是"}

【当前 dashboard.jsx 片段】
${dashboard || "(缺失)"}

用户消息：
${userMessage}`;

    const model = createDeepSeekModel();
    const { text } = await generateText({
      model,
      system: SYSTEM,
      messages: [
        ...conversationHistory.slice(-8),
        { role: "user", content: fileCtx },
      ],
    });

    const raw = parseIntentJson(text);
    const updateStory = Boolean(raw.updateStory);
    const updatePages = Boolean(raw.updatePages);
    let updateViReload = Boolean(raw.updateViReload);
    const viSystemMarkdown =
      typeof raw.viSystemMarkdown === "string" && raw.viSystemMarkdown.trim().length > 0
        ? raw.viSystemMarkdown.trim()
        : null;
    const clarification = typeof raw.clarification === "string" && raw.clarification.trim() ? raw.clarification.trim() : null;

    if (tokensMissing && !viSystemMarkdown) {
      updateViReload = true;
    }

    const effectiveUpdatePages = updateStory ? true : updatePages;

    return Response.json({
      clarification,
      updateStory,
      updatePages: effectiveUpdatePages,
      updateViReload,
      viSystemMarkdown,
    });
  } catch (err) {
    console.error("[board/dashboard-intent] error:", err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
