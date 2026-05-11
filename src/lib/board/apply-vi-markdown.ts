/**
 * 服务端：将 vi-system Markdown 写入项目并基于同一文档重算 vi-tokens.json（与 design-vi 使用同一套 system prompt）。
 */
import { generateText } from "ai";
import { createDeepSeekModel } from "@/lib/board-stream-utils";
import { DESIGN_VI_SYSTEM_PROMPT } from "@/lib/board/design-vi-system-prompt";
import { applyDvChartPlotBgToViTokensPayload } from "@/lib/board/vi-tokens-dv-chart-plot-bg";
import { storage, dvPath } from "@/lib/storage";
import { isValidProjectKey } from "@/lib/projects/project-config";

function parseJsonFromLlm(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/, "");
  }
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) cleaned = m[0];
  return JSON.parse(cleaned) as unknown;
}

export async function generateViTokensJsonFromMarkdown(designMd: string): Promise<unknown> {
  const model = createDeepSeekModel();
  const { text } = await generateText({
    model,
    system: DESIGN_VI_SYSTEM_PROMPT,
    prompt: `以下是品牌 "custom-vi-document" 的 Design 文档，请基于它产出完整的 CSS Tokens JSON：

=== DESIGN.md ===
${designMd}

=== 输出要求 ===
严格按 Schema 产出 JSON，所有 cssVariables 字段必须有值，chartPalette 至少 6 色。只输出 JSON。`,
  });
  return parseJsonFromLlm(text);
}

export async function applyViMarkdownToProject(projectName: string, markdown: string): Promise<void> {
  if (!isValidProjectKey(projectName)) {
    throw new Error("Invalid projectName");
  }
  const json = await generateViTokensJsonFromMarkdown(markdown);
  const tokensOut = applyDvChartPlotBgToViTokensPayload(json);
  await storage.writeText(dvPath(projectName, "品牌VI", "vi-system.md"), markdown);
  await storage.writeText(
    dvPath(projectName, "品牌VI", "vi-tokens.json"),
    JSON.stringify(tokensOut, null, 2)
  );
}
