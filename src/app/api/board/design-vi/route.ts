/**
 * Step 3: VI Token 生成
 *
 * POST /api/board/design-vi
 *
 * 输入：{ style: string }
 * 步骤：
 *   1. 读取 design-systems/{style}/DESIGN.md
 *   2. 调用 DeepSeek，从 DESIGN.md 抽取结构化 CSS Tokens JSON
 *   3. 以流式文本返回 JSON（前端 callPipelineStep 解析）
 */
import { promises as fs } from "fs";
import path from "path";
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { DESIGN_VI_SYSTEM_PROMPT } from "@/lib/board/design-vi-system-prompt";

export const maxDuration = 120;

const STYLE_RE = /^[a-zA-Z0-9_-]+$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { style?: string; designMarkdown?: string };
  const style = body?.style?.trim();
  const designMarkdown = typeof body.designMarkdown === "string" ? body.designMarkdown.trim() : "";

  if (!designMarkdown && (!style || !STYLE_RE.test(style))) {
    return new Response(JSON.stringify({ error: "Provide style or non-empty designMarkdown" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    let designMd: string;
    let label: string;

    if (designMarkdown) {
      designMd = designMarkdown;
      label = style && STYLE_RE.test(style) ? style : "custom-vi-document";
    } else {
      const root = path.join(process.cwd(), "design-systems");
      const target = path.join(root, style!, "DESIGN.md");
      const resolved = path.resolve(target);
      if (!resolved.startsWith(path.resolve(root) + path.sep)) {
        return new Response(JSON.stringify({ error: "Invalid path" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      designMd = await fs.readFile(resolved, "utf-8");
      label = style!;
    }

    const model = createDeepSeekModel();
    const result = streamText({
      model,
      system: DESIGN_VI_SYSTEM_PROMPT,
      prompt: `以下是品牌 "${label}" 的 Design 文档，请基于它产出完整的 CSS Tokens JSON：

=== DESIGN.md ===
${designMd}

=== 输出要求 ===
严格按 Schema 产出 JSON，所有 cssVariables 字段必须有值，chartPalette 至少 6 色。只输出 JSON。`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/design-vi] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
