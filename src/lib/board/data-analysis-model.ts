/**
 * 数据分析模型类型定义
 * 用于动态表单驱动的数据故事构建
 */
import { z } from "zod";

// ─── 问题表单 Schema ──────────────────────────────────────

export const questionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["radio", "checkbox", "select"]),
  options: z.array(z.union([z.string(), z.object({ label: z.string(), value: z.string() })])).nullable().optional(),
  required: z.boolean(),
  description: z.string(),
  placeholder: z.string().optional(),
});

export const questionFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(questionSchema),
});

// ─── 数据分析模型 Schema ──────────────────────────────────

export const metricSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    type: z.enum(["kpi", "process", "diagnostic"]).optional(),
    description: z.string().optional(),
    unit: z.string().optional(),
  }),
]);

export const dimensionSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    type: z.enum(["time", "category", "geography", "hierarchy"]).optional(),
    values: z.array(z.string()).optional(),
  }),
]);

export const comparisonSchema = z.union([
  z.string(),
  z.object({
    type: z.enum(["yoy", "mom", "target", "benchmark"]).optional(),
    description: z.string().optional(),
  }),
]);

export const decisionPointSchema = z.union([
  z.string(),
  z.object({
    condition: z.string().optional(),
    action: z.string().optional(),
    priority: z.enum(["high", "medium", "low"]).optional(),
  }),
]);

export const alertRuleSchema = z.union([
  z.string(),
  z.object({
    metric: z.string().optional(),
    condition: z.string().optional(),
    threshold: z.union([z.number(), z.string()]).optional(),
    action: z.string().optional(),
  }),
]);

export const dataAnalysisModelSchema = z.object({
  business_objective: z.union([z.string(), z.array(z.string())]).optional().default(""),
  analysis_type: z.union([z.string(), z.array(z.string())]).optional().default(""),
  metrics: z.array(metricSchema).optional().default([]),
  dimensions: z.array(dimensionSchema).optional().default([]),
  filters: z.array(z.string()).optional().default([]),
  comparisons: z.array(comparisonSchema).optional().default([]),
  decision_points: z.array(decisionPointSchema).optional().default([]),
  alert_rules: z.array(alertRuleSchema).optional().default([]),
});

// ─── API 响应 Schema ──────────────────────────────────────

/** analyze-brief 等 LLM JSON 里偶发把「页数预期」写成数字，统一成字符串 */
const extractedInfoStringField = z.union([z.string(), z.number()]).transform((v) => String(v));

// 阶段一响应 A：信息充足，无需表单
export const sufficientResponseSchema = z.object({
  type: z.literal("sufficient"),
  extractedInfo: z.object({
    business_objective: z.string().optional().default(""),
    audience: z.string().optional().default(""),
    metrics: z.array(z.string()).optional().default([]),
    dimensions: z.array(z.string()).optional().default([]),
    comparisons: z.array(z.string()).optional().default([]),
    decision_points: z.array(z.string()).optional().default([]),
    filters: z.array(z.string()).optional().default([]),
    alert_rules: z.array(z.string()).optional().default([]),
    update_frequency: z.string().optional().default(""),
    page_count_hint: extractedInfoStringField.optional().default(""),
    visual_tone: z.string().optional().default(""),
    industry: z.string().optional().default(""),
    analysis_type: z.string().optional().default(""),
  }).optional(),
});

// 阶段一响应 B：信息不足，返回表单（只含缺失字段）
export const formResponseSchema = z.object({
  type: z.literal("form"),
  extractedInfo: z.object({
    business_objective: z.string().optional().default(""),
    audience: z.string().optional().default(""),
    metrics: z.array(z.string()).optional().default([]),
    dimensions: z.array(z.string()).optional().default([]),
    comparisons: z.array(z.string()).optional().default([]),
    filters: z.array(z.string()).optional().default([]),
    alert_rules: z.array(z.string()).optional().default([]),
    update_frequency: z.string().optional().default(""),
    page_count_hint: extractedInfoStringField.optional().default(""),
    visual_tone: z.string().optional().default(""),
    industry: z.string().optional().default(""),
    analysis_type: z.string().optional().default(""),
  }).optional(),
  missingFields: z.array(z.string()).optional().default([]),
  form: questionFormSchema,
});

// 阶段二响应：Markdown story（纯文本流）
export const storyMarkdownResponseSchema = z.object({
  type: z.literal("story"),
  markdown: z.string(),
});

export const analyzeResponseSchema = z.discriminatedUnion("type", [
  sufficientResponseSchema,
  formResponseSchema,
]);

export const storyResponseSchema = z.discriminatedUnion("type", [
  formResponseSchema,
  storyMarkdownResponseSchema,
]);

// ─── 类型导出 ─────────────────────────────────────────────

export type Question = z.infer<typeof questionSchema>;
export type QuestionForm = z.infer<typeof questionFormSchema>;
export type Metric = z.infer<typeof metricSchema>;
export type Dimension = z.infer<typeof dimensionSchema>;
export type Comparison = z.infer<typeof comparisonSchema>;
export type DecisionPoint = z.infer<typeof decisionPointSchema>;
export type AlertRule = z.infer<typeof alertRuleSchema>;
export type DataAnalysisModel = z.infer<typeof dataAnalysisModelSchema>;
export type SufficientResponse = z.infer<typeof sufficientResponseSchema>;
export type FormResponse = z.infer<typeof formResponseSchema>;
export type StoryMarkdownResponse = z.infer<typeof storyMarkdownResponseSchema>;
export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;
export type StoryResponse = z.infer<typeof storyResponseSchema>;

// ─── 工具函数 ─────────────────────────────────────────────

export function isSufficientResponse(response: AnalyzeResponse): response is SufficientResponse {
  return response.type === "sufficient";
}

export function isFormResponse(response: AnalyzeResponse): response is FormResponse {
  return response.type === "form";
}

export function isStoryResponse(response: StoryResponse): response is StoryMarkdownResponse {
  return response.type === "story";
}

/** @deprecated 旧多轮流程使用，保留兼容性 */
export function isModelComplete(response: StoryResponse): boolean {
  return response.type === "story";
}

// 标准化函数：将字符串转换为对象格式
export function normalizeMetric(metric: Metric): { name: string; type?: string; description?: string; unit?: string } {
  if (typeof metric === "string") {
    return { name: metric };
  }
  return metric;
}

export function normalizeDimension(dimension: Dimension): { name: string; type?: string; values?: string[] } {
  if (typeof dimension === "string") {
    return { name: dimension };
  }
  return dimension;
}

export function normalizeComparison(comparison: Comparison): { type?: string; description?: string } {
  if (typeof comparison === "string") {
    return { description: comparison };
  }
  return comparison;
}

export function normalizeDecisionPoint(point: DecisionPoint): { condition?: string; action?: string; priority?: string } {
  if (typeof point === "string") {
    return { action: point };
  }
  return point;
}

export function normalizeAlertRule(rule: AlertRule): { metric?: string; condition?: string; threshold?: number | string; action?: string } {
  if (typeof rule === "string") {
    return { action: rule };
  }
  return rule;
}

// 标准化字符串或数组为字符串
export function normalizeStringOrArray(value: string | string[] | undefined): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return value;
}
