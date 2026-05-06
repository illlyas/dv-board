/**
 * 数据分析模型类型定义
 * 用于动态表单驱动的数据故事构建
 */
import { z } from "zod";

// ─── 问题表单 Schema ──────────────────────────────────────

export const questionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["radio", "checkbox", "text", "number", "select", "textarea"]),
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

export const storyResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("form"),
    currentModel: dataAnalysisModelSchema.partial(),
    missingFields: z.array(z.string()),
    form: questionFormSchema,
  }),
  z.object({
    type: z.literal("model"),
    currentModel: dataAnalysisModelSchema,
    missingFields: z.array(z.string()),
    form: z.null(),
  }),
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
export type StoryResponse = z.infer<typeof storyResponseSchema>;

// ─── 工具函数 ─────────────────────────────────────────────

export function isFormResponse(response: StoryResponse): response is Extract<StoryResponse, { type: "form" }> {
  return response.type === "form";
}

export function isModelComplete(response: StoryResponse): response is Extract<StoryResponse, { type: "model" }> {
  return response.type === "model";
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
