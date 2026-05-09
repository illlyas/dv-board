/**
 * POST /api/board/dashboard-intent
 * 非流式：根据当前项目文件与用户消息，返回本轮需要同步的文档范围（保守布尔 + 可选 vi 全文）。
 */
import { promises as fs } from "fs";
import path from "path";
import { generateText } from "ai";
import { createDeepSeekModel } from "@/lib/board-stream-utils";

export const maxDuration = 60;

const TRUNC = 8000;

function safeProjectDir(projectName: string): string {
  const base = path.resolve(process.cwd(), ".dv");
  const resolved = path.resolve(base, projectName);
  if (!resolved.startsWith(base + path.sep)) {
    throw new Error("Invalid projectName");
  }
  return resolved;
}

async function readSnippet(abs: string): Promise<string> {
  try {
    const s = await fs.readFile(abs, "utf-8");
    if (s.length <= TRUNC) return s;
    return `${s.slice(0, TRUNC)}\n\n...[truncated, ${s.length - TRUNC} chars omitted]`;
  } catch {
    return "";
  }
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

const SYSTEM = `你是看板「迭代」意图分类器。项目已有基础文件，用户发来新诉求。最终代码落点始终是 页面/dashboard.jsx。

你只输出一个 JSON 对象，禁止 markdown 围栏、禁止解释文字。

字段（严格遵守键名）：
- "clarification": string | null。仅当完全无法判断要做什么时给一句短追问；能做事时必须是 null。
- "updateStory": boolean。用户明确要改数据叙事、指标口径、业务背景、分析章节等（影响 design-story.md）时为 true。
- "updatePages": boolean。用户明确要改页面分区、布局层级、模块排布（影响 pages-story.md）时为 true。若 updateStory 为 true，通常也应为 true（系统会在服务端在 updateStory=true 时强制同步页面结构）。
- "updateViReload": boolean。用户要换整套预设品牌风格、从内置设计系统重装 VI 时为 true。细碎图表配色、改文案不要开。
- "viSystemMarkdown": string | null。若用户需要自定义写入 vi-system.md 的完整 Markdown（不走预设 style 复制），给全文；否则 null。若此字段为非空字符串，执行时以它为准，忽略 updateViReload 的「从 style 复制」语义（但仍会据此重生 token）。

保守策略：不确定时 updateStory、updatePages、updateViReload 均为 false，viSystemMarkdown 为 null；只更新 dashboard.jsx。不要误开 updateViReload。`;

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

  try {
    const root = safeProjectDir(projectName);
    const storyPath = path.join(root, "数据故事", "design-story.md");
    const pagesPath = path.join(root, "页面结构", "pages-story.md");
    const viPath = path.join(root, "品牌VI", "vi-system.md");
    const tokPath = path.join(root, "品牌VI", "vi-tokens.json");
    const dashPath = path.join(root, "页面", "dashboard.jsx");

    const [story, pages, viMd, tokens, dashboard] = await Promise.all([
      readSnippet(storyPath),
      readSnippet(pagesPath),
      readSnippet(viPath),
      readSnippet(tokPath),
      readSnippet(dashPath),
    ]);

    const tokensMissing = !tokens.trim();
    const fileCtx = `项目名称：${projectName}
${style ? `项目风格(style)：${style}\n` : ""}
【当前 design-story.md】
${story || "(缺失)"}

【当前 pages-story.md】
${pages || "(缺失)"}

【当前 vi-system.md】
${viMd || "(缺失)"}

【当前 vi-tokens.json 是否存在】
${tokensMissing ? "否或为空 — 若本轮要生成 JSX，必须把 updateViReload 或 viSystemMarkdown 置为可产出 token 的状态（例如 updateViReload=true，或提供 viSystemMarkdown）。" : "是"}

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
    let updateStory = Boolean(raw.updateStory);
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
