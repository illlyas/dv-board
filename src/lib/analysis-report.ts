import { z } from "zod";

// ─── 节点 1 输出：需求分析报告（纯文字/结构化，不涉及像素坐标）────

const suggestedWidgetSchema = z.object({
  type: z.enum(["text", "bar", "line", "pie", "funnel", "pixel", "select", "image"]),
  label: z.string(),           // 组件用途说明
  dataDescription: z.string(), // 数据描述
});

const pagePlanSchema = z.object({
  name: z.string(),                    // 页面名称建议
  purpose: z.string(),                     // 该页面核心目的
  keyMetrics: z.array(z.string()),     // 关键指标/维度
  suggestedWidgets: z.array(suggestedWidgetSchema).min(1),
  layoutIdea: z.string(),             // 布局思路描述
});

export const analysisReportSchema = z.object({
  id: z.string(),
  brief: z.string(),                   // 原始用户需求
  summary: z.string(),                 // 一句话总结
  dataStory: z.string(),               // 数据故事线逻辑（为什么这样分页）
  pages: z.array(pagePlanSchema).min(1).max(10),
  potentialNeeds: z.array(z.string()), // 识别出的潜在需求
  recommendedTheme: z.enum(["dark-tech", "dark-business", "light-clean", "dark-executive", "dark-data"]),
});

export type AnalysisReport = z.infer<typeof analysisReportSchema>;
export type SuggestedWidget = z.infer<typeof suggestedWidgetSchema>;
export type PagePlan = z.infer<typeof pagePlanSchema>;
