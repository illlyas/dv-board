import { z } from "zod";
import { widgetTypeSchema } from "./dashboard-common";

// ─── 节点 1 输出：需求分析报告（纯文字/结构化，不涉及像素坐标）────

const contentPrioritySchema = z.enum(["high", "medium", "low"]);
const themeHintSchema = z.enum(["dark-tech", "dark-business", "light-clean", "dark-executive", "dark-data"]);

export const visualBriefSchema = z.object({
  audience: z.string(),
  overallGoal: z.string(),
  tone: z.enum(["executive", "operational", "analytical", "command"]),
  themeHint: themeHintSchema,
  densityHint: z.enum(["compact", "balanced", "spacious"]),
  emphasis: z.enum(["kpi-first", "chart-first", "narrative-first"]),
});

const suggestedWidgetSchema = z.object({
  type: widgetTypeSchema,
  role: z.enum(["title", "kpi", "chart", "filter", "annotation", "media"]),
  priority: contentPrioritySchema,
  label: z.string(),           // 组件用途说明
  dataDescription: z.string(), // 数据描述
  rationale: z.string(),       // 为什么这个内容块必须存在
});

const pagePlanSchema = z.object({
  name: z.string(),                 // 页面名称建议
  storyRole: z.string(),            // 该页在整套叙事中的角色
  purpose: z.string(),              // 该页面核心目的
  keyQuestion: z.string(),          // 该页重点回答的问题
  narrative: z.string(),            // 用户在该页应该看到怎样的故事推进
  keyMetrics: z.array(z.string()),  // 关键指标/维度
  primaryData: z.array(z.string()), // 本页主要承接的数据内容
  filters: z.array(z.string()).default([]),
  suggestedWidgets: z.array(suggestedWidgetSchema).min(1),
  layoutIdea: z.string(),           // 布局思路描述
});

export const analysisReportSchema = z.object({
  id: z.string(),
  brief: z.string(),                      // 原始用户需求
  summary: z.string(),                    // 一句话总结
  audience: z.string(),                   // 主要观看对象
  overallGoal: z.string(),                // 看板最终要支撑的决策/沟通目标
  dataStory: z.string(),                  // 数据故事线逻辑（为什么这样分页）
  pages: z.array(pagePlanSchema).min(1).max(10),
  potentialNeeds: z.array(z.string()),    // 识别出的潜在需求
  recommendedTheme: themeHintSchema,
  visualBrief: visualBriefSchema,
});

export type AnalysisReport = z.infer<typeof analysisReportSchema>;
export type SuggestedWidget = z.infer<typeof suggestedWidgetSchema>;
export type PagePlan = z.infer<typeof pagePlanSchema>;
export type VisualBrief = z.infer<typeof visualBriefSchema>;
