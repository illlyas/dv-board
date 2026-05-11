/**
 * Pipeline 步骤执行器
 */

import { callPipelineStep, callPipelineStepText } from "@/lib/pipeline-api";
import { jsxCodeSchema, normalizeJSXCode } from "@/lib/board/jsx-output";
import type { JSXCode } from "@/lib/board/jsx-output";
import type { ViTokens } from "@/types/pipeline.types";
import { applyDvChartPlotBgToViTokensPayload, mergeDvChartPlotBg } from "@/lib/board/vi-tokens-dv-chart-plot-bg";
import { readFile, saveFile } from "./file-operations";

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
  ctx: StepExecutorContext,
  opts?: { existingStory?: string }
): Promise<string> {
  const body: Record<string, unknown> = { brief, ...(answers ? { answers } : {}) };
  const ex = opts?.existingStory?.trim();
  if (ex) body.existingStory = ex;
  if (ctx.projectName) body.projectKey = ctx.projectName;

  const designStory = await callPipelineStepText("/api/board/design-story", body, ctx.onProgress, ctx.signal);

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
  ctx: StepExecutorContext,
  opts?: { existingPages?: string }
): Promise<string> {
  const body: Record<string, unknown> = { designStory };
  const ex = opts?.existingPages?.trim();
  if (ex) body.existingPages = ex;
  if (ctx.projectName) body.projectKey = ctx.projectName;

  const pagesStory = await callPipelineStepText("/api/board/design-pages", body, ctx.onProgress, ctx.signal);

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
    return { cssVariables: mergeDvChartPlotBg({}), chartPalette: [], raw: input };
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
    cssVariables: mergeDvChartPlotBg(cssVariables),
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
    const jsonForDisk = applyDvChartPlotBgToViTokensPayload(json);
    const pretty = (() => {
      try {
        return JSON.stringify(jsonForDisk, null, 2);
      } catch {
        return rawText;
      }
    })();
    await saveFile(ctx.projectName, "品牌VI", "vi-tokens.json", pretty);
  }

  return { tokens, rawMd };
}

/**
 * 将自定义 vi-system Markdown 落盘，并基于该文档重新生成 vi-tokens.json（与 vi-system 联动）。
 */
export async function executeViTokensFromMarkdown(
  viMarkdown: string,
  ctx: StepExecutorContext
): Promise<{ tokens: ViTokens }> {
  if (!ctx.projectName) throw new Error("缺少 projectName");

  ctx.onProgress?.(viMarkdown);

  const res = await fetch("/api/board/apply-vi-markdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName: ctx.projectName, markdown: viMarkdown }),
    signal: ctx.signal,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `apply-vi-markdown ${res.status}`);
  }

  const raw = await readFile(`.dv/${ctx.projectName}/品牌VI/vi-tokens.json`);
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  return { tokens: normalizeViTokens(parsed) };
}

/**
 * 执行 JSX 代码生成步骤（吃 tokens，直接产出最终带视觉的看板代码）
 */
const JSX_CTX_TRUNC = 9000;
const VI_CTX_TRUNC = 6000;

export async function executeJSXGeneration(
  pagesStory: string,
  tokens: ViTokens,
  ctx: StepExecutorContext,
  filename = "dashboard.jsx"
): Promise<JSXCode> {
  let existingDashboard = "";
  let viSystemExcerpt = "";
  if (ctx.projectName) {
    try {
      existingDashboard = await readFile(`.dv/${ctx.projectName}/页面/${filename}`);
    } catch {
      /* 新建项目可能尚无 dashboard */
    }
    try {
      viSystemExcerpt = await readFile(`.dv/${ctx.projectName}/品牌VI/vi-system.md`);
    } catch {
      /* 可选 */
    }
  }

  const payload: Record<string, unknown> = {
    boardStory: pagesStory,
    tokens,
  };
  if (ctx.projectName) payload.projectKey = ctx.projectName;
  if (existingDashboard.trim()) {
    payload.existingDashboard =
      existingDashboard.length <= JSX_CTX_TRUNC
        ? existingDashboard
        : `${existingDashboard.slice(0, JSX_CTX_TRUNC)}\n\n...[truncated ${existingDashboard.length - JSX_CTX_TRUNC} chars]`;
  }
  if (viSystemExcerpt.trim()) {
    payload.viSystemExcerpt =
      viSystemExcerpt.length <= VI_CTX_TRUNC
        ? viSystemExcerpt
        : `${viSystemExcerpt.slice(0, VI_CTX_TRUNC)}\n\n...[truncated ${viSystemExcerpt.length - VI_CTX_TRUNC} chars]`;
  }

  const jsxResult = await callPipelineStep("/api/board/generate-jsx", payload, undefined, ctx.signal);

  const normalizedJSX = normalizeJSXCode(jsxResult.json);
  const jsxCode = jsxCodeSchema.parse(normalizedJSX);

  if (ctx.projectName) {
    await saveFile(ctx.projectName, "页面", filename, jsxCode.code);
  }

  return jsxCode;
}
