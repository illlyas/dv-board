import { callPipelineStep } from "@/lib/pipeline-api";
import {
  analyzeResponseSchema,
  isSufficientResponse,
  isFormResponse,
} from "@/lib/board/data-analysis-model";
import {
  executeDesignStory,
  executePagesStory,
  executeVISystem,
  executeJSXGeneration,
} from "@/lib/pipeline/step-executors";
import { readFile } from "@/lib/pipeline/file-operations";
import type { ChatMessage, ViTokens } from "@/types/pipeline.types";
import type { QuestionForm } from "@/lib/board/data-analysis-model";

export interface SkillExecutorContext {
  signal: AbortSignal;
  projectName: string;
  style: string;
  existingFiles: string[];
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  onProgress?: (partial: string) => void;
  onMessage?: (msg: ChatMessage) => void;
}

export type SkillExecutorResult =
  | { type: "done"; generatedFiles?: string[] }  // generatedFiles: 实际生成的文件（相对于项目目录）
  | { type: "form"; form: QuestionForm; extractedInfo: unknown };

export type SkillExecutor = (
  inputs: Record<string, unknown>,
  ctx: SkillExecutorContext
) => Promise<SkillExecutorResult>;

/**
 * 计算下一个可用文件名。
 * 如果 "页面/dashboard.jsx" 已存在，返回 "dashboard-2.jsx"，以此类推。
 */
function nextAvailableFilename(category: string, baseName: string, existingFiles: string[]): string {
  const ext = baseName.includes(".") ? baseName.slice(baseName.lastIndexOf(".")) : "";
  const stem = ext ? baseName.slice(0, baseName.lastIndexOf(".")) : baseName;
  if (!existingFiles.includes(`${category}/${baseName}`)) return baseName;
  let n = 2;
  while (existingFiles.includes(`${category}/${stem}-${n}${ext}`)) n++;
  return `${stem}-${n}${ext}`;
}

const analyzeBrief: SkillExecutor = async (inputs, ctx) => {
  const brief = inputs.brief as string;
  const answers = inputs.answers as Record<string, unknown> | undefined;
  const result = await callPipelineStep(
    "/api/board/analyze-brief",
    {
      brief,
      ...(answers ? { answers } : {}),
      conversationHistory: ctx.conversationHistory ?? [],
    },
    undefined,
    ctx.signal
  );
  const parsed = analyzeResponseSchema.parse(result.json);
  if (isSufficientResponse(parsed)) {
    return { type: "done" };
  }
  if (isFormResponse(parsed)) {
    return { type: "form", form: parsed.form, extractedInfo: parsed.extractedInfo ?? null };
  }
  return { type: "done" };
};

const designStory: SkillExecutor = async (inputs, ctx) => {
  const brief = inputs.brief as string;
  const answers = inputs.answers as Record<string, unknown> | undefined;
  await executeDesignStory(brief, answers, ctx);
  return { type: "done", generatedFiles: ["数据故事/design-story.md"] };
};

const designPages: SkillExecutor = async (inputs, ctx) => {
  let designStoryText = inputs.designStory as string | undefined;
  if (!designStoryText) {
    designStoryText = await readFile(`.dv/${ctx.projectName}/数据故事/design-story.md`);
  }
  await executePagesStory(designStoryText, ctx);
  return { type: "done", generatedFiles: ["页面结构/pages-story.md"] };
};

const designVI: SkillExecutor = async (inputs, ctx) => {
  const style = ((inputs.style as string | undefined) ?? ctx.style ?? "").trim();
  if (!style) {
    throw new Error("design-vi 缺少 style 参数（请在创建项目时选择一个风格）");
  }
  await executeVISystem(ctx, style);
  return {
    type: "done",
    generatedFiles: ["品牌VI/vi-system.md", "品牌VI/vi-tokens.json"],
  };
};

const generateJSX: SkillExecutor = async (inputs, ctx) => {
  let pagesStory = inputs.pagesStory as string | undefined;
  if (!pagesStory) {
    pagesStory = await readFile(`.dv/${ctx.projectName}/页面结构/pages-story.md`);
  }

  // 读取 vi-tokens.json，没有则报错——此步骤强依赖 tokens
  let tokens: ViTokens;
  try {
    const raw = await readFile(`.dv/${ctx.projectName}/品牌VI/vi-tokens.json`);
    const parsed = JSON.parse(raw) as ViTokens;
    tokens = {
      mode: parsed.mode,
      cssVariables: parsed.cssVariables ?? {},
      chartPalette: parsed.chartPalette ?? [],
      raw: parsed.raw ?? parsed,
    };
  } catch (err) {
    throw new Error(
      `无法读取 vi-tokens.json：请先执行 design-vi 生成 CSS Tokens。原始错误：${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  const filename = nextAvailableFilename("页面", "dashboard.jsx", ctx.existingFiles);
  await executeJSXGeneration(pagesStory, tokens, ctx, filename);
  return { type: "done", generatedFiles: [`页面/${filename}`] };
};

export const SKILL_EXECUTORS: Record<string, SkillExecutor> = {
  "analyze-brief": analyzeBrief,
  "design-story": designStory,
  "design-pages": designPages,
  "design-vi": designVI,
  "generate-jsx": generateJSX,
};
