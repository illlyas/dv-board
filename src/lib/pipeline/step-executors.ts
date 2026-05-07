/**
 * Pipeline 步骤执行器
 */

import { callPipelineStep, callPipelineStepText } from "@/lib/pipeline-api";
import { jsxCodeSchema, normalizeJSXCode } from "@/lib/board/jsx-output";
import type { JSXCode } from "@/lib/board/jsx-output";
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
 * 执行 VI 系统加载步骤
 */
export async function executeVISystem(ctx: StepExecutorContext): Promise<string> {
  const viContent = await callPipelineStepText(
    "/api/board/design-vi",
    {},
    ctx.onProgress,
    ctx.signal
  );

  if (ctx.projectName) {
    await saveFile(ctx.projectName, "品牌VI", "vi-system.md", viContent);
  }

  return viContent;
}

/**
 * 执行 JSX 代码生成步骤（线框）
 */
export async function executeJSXGeneration(
  pagesStory: string,
  ctx: StepExecutorContext
): Promise<JSXCode> {
  const jsxResult = await callPipelineStep(
    "/api/board/generate-jsx",
    { boardStory: pagesStory },
    undefined,
    ctx.signal
  );

  const normalizedJSX = normalizeJSXCode(jsxResult.json);
  const jsxCode = jsxCodeSchema.parse(normalizedJSX);

  // 保存线框代码，供后端 apply-vi 直接读取
  if (ctx.projectName) {
    await saveFile(ctx.projectName, "页面", "wireframe.jsx", jsxCode.code);
  }

  return jsxCode;
}

/**
 * 执行 VI 系统应用步骤
 */
export async function executeVIApplication(
  ctx: StepExecutorContext
): Promise<JSXCode> {
  const viResult = await callPipelineStep(
    "/api/board/apply-vi",
    { projectId: ctx.projectName },
    undefined,
    ctx.signal
  );

  const normalizedJSX = normalizeJSXCode(viResult.json);
  const jsxCode = jsxCodeSchema.parse(normalizedJSX);

  // 保存最终的品牌化代码
  if (ctx.projectName) {
    await saveFile(ctx.projectName, "页面", "dashboard.jsx", jsxCode.code);
  }

  return jsxCode;
}
