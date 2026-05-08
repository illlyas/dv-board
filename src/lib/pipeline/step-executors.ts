/**
 * Pipeline 步骤执行器
 */

import { callPipelineStep, callPipelineStepText } from "@/lib/pipeline-api";
import { jsxCodeSchema, normalizeJSXCode } from "@/lib/board/jsx-output";
import type { JSXCode } from "@/lib/board/jsx-output";
import type { ViTokens } from "@/types/pipeline.types";
import { saveFile } from "./file-operations";

export interface StepExecutorContext {
  signal: AbortSignal;
  projectName: string;
  onProgress?: (partial: string) => void;
}

/**
 * 执行 Design Story 生成步骤
 */
export async function executeDesignStory(
  brief: string,
  answers: Record<string, unknown> | undefined,
  ctx: StepExecutorContext
): Promise<string> {
  const designStory = await callPipelineStepText(
    "/api/board/design-story",
    { brief, ...(answers ? { answers } : {}) },
    ctx.onProgress,
    ctx.signal
  );

  if (ctx.projectName) {
    await saveFile(ctx.projectName, "数据故事", "design-story.md", designStory);
  }

  return designStory;
}

/**
 * 执行 Pages Story 生成步骤
 */
export async function executePagesStory(
  designStory: string,
  ctx: StepExecutorContext
): Promise<string> {
  const pagesStory = await callPipelineStepText(
    "/api/board/design-pages",
    { designStory },
    ctx.onProgress,
    ctx.signal
  );

  if (ctx.projectName) {
    await saveFile(ctx.projectName, "页面结构", "pages-story.md", pagesStory);
  }

  return pagesStory;
}

/**
 * 规范化 AI 产出的 ViTokens 结构
 */
function normalizeViTokens(input: unknown): ViTokens {
  if (!input || typeof input !== "object") {
    return { cssVariables: {}, chartPalette: [], raw: input };
  }
  const obj = input as Record<string, unknown>;

  const mode = obj.mode === "dark" ? "dark" : obj.mode === "light" ? "light" : undefined;

  const cssVariables: Record<string, string> = {};
  if (obj.cssVariables && typeof obj.cssVariables === "object") {
    for (const [k, v] of Object.entries(obj.cssVariables as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim().length > 0) {
        const key = k.startsWith("--") ? k : `--${k}`;
        cssVariables[key] = v;
      }
    }
  }

  const chartPalette: string[] = Array.isArray(obj.chartPalette)
    ? (obj.chartPalette as unknown[]).filter((x): x is string => typeof x === "string")
    : [];

  return {
    mode,
    cssVariables,
    chartPalette,
    raw: obj.raw ?? obj,
  };
}

/**
 * 执行 VI 系统步骤：
 *  1) 读取 design-systems/{style}/DESIGN.md 原文并保存为 vi-system.md
 *  2) 调 design-vi API 生成 CSS Tokens JSON 并保存为 vi-tokens.json
 */
export async function executeVISystem(
  ctx: StepExecutorContext,
  style: string
): Promise<{ tokens: ViTokens; rawMd: string }> {
  const safeStyle = (style || "").trim();
  if (!safeStyle) throw new Error("缺少风格参数 style");

  // 1) 拉取原始 DESIGN.md
  const mdRes = await fetch(`/api/design-systems/read?style=${encodeURIComponent(safeStyle)}`, {
    signal: ctx.signal,
  });
  if (!mdRes.ok) {
    const txt = await mdRes.text().catch(() => "");
    throw new Error(`读取 DESIGN.md 失败 (${mdRes.status}): ${txt}`);
  }
  const rawMd = await mdRes.text();

  if (ctx.projectName) {
    await saveFile(ctx.projectName, "品牌VI", "vi-system.md", rawMd);
  }

  // 给上层一个早期预览
  ctx.onProgress?.(rawMd);

  // 2) 让 AI 根据 DESIGN.md 产出 CSS Tokens JSON
  const { json, rawText } = await callPipelineStep(
    "/api/board/design-vi",
    { style: safeStyle },
    (partial) => {
      // 流式过程中把原始 JSON 字符串透出去供 UI 展示
      ctx.onProgress?.(partial);
    },
    ctx.signal
  );

  const tokens = normalizeViTokens(json);

  if (ctx.projectName) {
    // 存原始 JSON 字符串（保留 AI 原文，便于后续调试 / 渲染）
    const pretty = (() => {
      try {
        return JSON.stringify(json, null, 2);
      } catch {
        return rawText;
      }
    })();
    await saveFile(ctx.projectName, "品牌VI", "vi-tokens.json", pretty);
  }

  return { tokens, rawMd };
}

/**
 * 执行 JSX 代码生成步骤（吃 tokens，直接产出最终带视觉的看板代码）
 */
export async function executeJSXGeneration(
  pagesStory: string,
  tokens: ViTokens,
  ctx: StepExecutorContext,
  filename = "dashboard.jsx"
): Promise<JSXCode> {
  const jsxResult = await callPipelineStep(
    "/api/board/generate-jsx",
    { boardStory: pagesStory, tokens },
    undefined,
    ctx.signal
  );

  const normalizedJSX = normalizeJSXCode(jsxResult.json);
  const jsxCode = jsxCodeSchema.parse(normalizedJSX);

  if (ctx.projectName) {
    await saveFile(ctx.projectName, "页面", filename, jsxCode.code);
  }

  return jsxCode;
}
