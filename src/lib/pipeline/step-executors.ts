/**
 * Pipeline 步骤执行器
 */

import { callPipelineStep, callPipelineStepText } from "@/lib/pipeline-api";
import { jsxCodeSchema } from "@/lib/board/jsx-output";
import type { JSXCode } from "@/lib/board/jsx-output";
import type { ViTokens } from "@/types/pipeline.types";
import { applyDvChartPlotBgToViTokensPayload, mergeDvChartPlotBg } from "@/lib/board/vi-tokens-dv-chart-plot-bg";
import { mergeAccentGold } from "@/lib/board/vi-tokens-accent-gold";
import {
  emptyTemplateFill,
  mergeWidgetsAndStoreFill,
  parseStoreFillFromModelText,
  parseTemplateFillFromModelText,
  parseWidgetsFillFromModelText,
  storeFillFromTemplateFill,
  templateFillToPagesStoryExcerpt,
  widgetsFillFromTemplateFill,
} from "@/lib/board/template-fill-schema";
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
 * 两阶段模板填空：
 * 1) design-template-widgets → widgets-fill.json（字段契约）
 * 2) design-template-store → store-fill.json（业务数据，键名对齐 widgets）
 * 合并为 template-fill.json + pages-story 摘要
 */
export async function executeTemplateFill(
  designStory: string,
  ctx: StepExecutorContext,
  opts?: { existingFillJson?: string }
): Promise<string> {
  const ex = opts?.existingFillJson?.trim();
  let existingWidgetsFill = "";
  let existingStoreFill = "";
  if (ex) {
    try {
      const prev = parseTemplateFillFromModelText(ex);
      existingWidgetsFill = JSON.stringify(widgetsFillFromTemplateFill(prev), null, 2);
      existingStoreFill = JSON.stringify(storeFillFromTemplateFill(prev), null, 2);
    } catch {
      existingWidgetsFill = ex;
    }
  }

  const widgetsBody: Record<string, unknown> = { designStory };
  if (existingWidgetsFill) widgetsBody.existingWidgetsFill = existingWidgetsFill;
  if (ctx.projectName) widgetsBody.projectKey = ctx.projectName;

  const widgetsRaw = await callPipelineStepText(
    "/api/board/design-template-widgets",
    widgetsBody,
    ctx.onProgress,
    ctx.signal
  );

  let widgetsFill = parseWidgetsFillFromModelText(widgetsRaw);

  const storeBody: Record<string, unknown> = {
    designStory,
    widgetsFill,
  };
  if (existingStoreFill) storeBody.existingStoreFill = existingStoreFill;

  const storeRaw = await callPipelineStepText(
    "/api/board/design-template-store",
    storeBody,
    ctx.onProgress,
    ctx.signal
  );

  let storeFill = parseStoreFillFromModelText(storeRaw);
  const fill = mergeWidgetsAndStoreFill(widgetsFill, storeFill);
  const pretty = JSON.stringify(fill, null, 2);
  const widgetsPretty = JSON.stringify(widgetsFill, null, 2);
  const storePretty = JSON.stringify(storeFill, null, 2);
  const excerpt = templateFillToPagesStoryExcerpt(fill);

  if (ctx.projectName) {
    await saveFile(ctx.projectName, "页面结构", "widgets-fill.json", widgetsPretty);
    await saveFile(ctx.projectName, "页面结构", "store-fill.json", storePretty);
    await saveFile(ctx.projectName, "页面结构", "template-fill.json", pretty);
    await saveFile(ctx.projectName, "页面结构", "pages-story.md", excerpt);
  }

  return pretty;
}

/**
 * 规范化 AI 产出的 ViTokens 结构
 */
function normalizeViTokens(input: unknown): ViTokens {
  if (!input || typeof input !== "object") {
    return { cssVariables: mergeDvChartPlotBg(mergeAccentGold({})), chartPalette: [], raw: input };
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
    cssVariables: mergeDvChartPlotBg(mergeAccentGold(cssVariables)),
    chartPalette,
    raw: obj.raw ?? obj,
  };
}

/**
 * 执行 VI 系统步骤：
 *  1) 读取 design-systems/{style}/design.md（或 DESIGN.md）原文并保存为 vi-system.md
 *  2) 若存在 design-systems/{style}/vi-system.json 或 vi-tokens.json 则直接落盘；否则调 design-vi API 生成
 */
export async function executeVISystem(
  ctx: StepExecutorContext,
  style: string
): Promise<{ tokens: ViTokens; rawMd: string }> {
  const safeStyle = (style || "").trim();
  if (!safeStyle) throw new Error("缺少风格参数 style");

  // 1) 拉取设计说明（优先 design.md）
  const mdRes = await fetch(`/api/design-systems/read?style=${encodeURIComponent(safeStyle)}`, {
    signal: ctx.signal,
  });
  if (!mdRes.ok) {
    const txt = await mdRes.text().catch(() => "");
    throw new Error(`读取设计说明失败 (${mdRes.status}): ${txt}`);
  }
  const rawMd = await mdRes.text();

  if (ctx.projectName) {
    await saveFile(ctx.projectName, "品牌VI", "vi-system.md", rawMd);
  }

  ctx.onProgress?.(rawMd);

  // 2) 预置 vi-system.json → 跳过 AI；否则走 design-vi
  const presetRes = await fetch(`/api/design-systems/vi-system?style=${encodeURIComponent(safeStyle)}`, {
    signal: ctx.signal,
  });

  let tokens: ViTokens;
  let diskPayload: unknown;
  let rawTextFallback = "";

  if (presetRes.ok) {
    const presetJson = (await presetRes.json()) as unknown;
    tokens = normalizeViTokens(presetJson);
    diskPayload = presetJson;
    ctx.onProgress?.("\n\n（已使用预置 vi-system.json / vi-tokens.json，跳过 AI Token 生成）\n\n");
  } else {
    const { json, rawText } = await callPipelineStep(
      "/api/board/design-vi",
      { style: safeStyle },
      (partial) => {
        ctx.onProgress?.(partial);
      },
      ctx.signal
    );
    tokens = normalizeViTokens(json);
    diskPayload = json;
    rawTextFallback = rawText;
  }

  if (ctx.projectName) {
    const jsonForDisk = applyDvChartPlotBgToViTokensPayload(diskPayload);
    const pretty = (() => {
      try {
        return JSON.stringify(jsonForDisk, null, 2);
      } catch {
        return rawTextFallback;
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
 * 从模板确定性装配 dashboard.jsx、widgets.json、slots.schema.json；
 * store 写入 template-fill 中的业务数据；未填槽位预览时仍可由 mock-slot 补数。
 */
export async function executeWindTemplateAssembly(
  templateFillJson: string,
  ctx: StepExecutorContext
): Promise<JSXCode> {
  if (!ctx.projectName?.trim()) throw new Error("assemble 需要 projectName");

  const trimmed = (templateFillJson ?? "").trim();
  const fill = trimmed
    ? parseTemplateFillFromModelText(trimmed)
    : emptyTemplateFill("风电智慧运营");

  const res = await fetch("/api/board/assemble-wind-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectName: ctx.projectName,
      templateFill: fill,
    }),
    signal: ctx.signal,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `assemble-wind-template ${res.status}`);
  }

  const data = (await res.json()) as { jsxCode?: unknown };
  return jsxCodeSchema.parse(data.jsxCode);
}
