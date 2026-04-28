import { z } from "zod";
import { widgetTypeSchema } from "./dashboard-common";

// ─── 节点 1 输出：需求分析报告（纯文字/结构化，不涉及像素坐标）────

const contentPrioritySchema = z.enum(["high", "medium", "low"]);
const themeHintSchema = z.enum(["dark-tech", "dark-business", "light-clean", "dark-executive", "dark-data"]);
const analysisGoalSchema = z.enum(["overview", "trend", "comparison", "composition", "target-gap", "ranking", "diagnostic", "risk"]);
const analyticRoleSchema = z.enum(["headline", "evidence", "diagnostic", "detail", "filter", "annotation"]);
export const industryTagSchema = z.enum([
  "energy",
  "industrial",
  "water",
  "transport",
  "port",
  "tourism",
  "government",
  "agriculture",
  "finance",
  "sports-culture",
  "campus",
  "park",
  "retail",
  "ops-maintenance",
  "generic",
]);

export const visualBriefSchema = z.object({
  audience: z.string(),
  overallGoal: z.string(),
  tone: z.enum(["executive", "operational", "analytical", "command"]),
  themeHint: themeHintSchema,
  densityHint: z.enum(["compact", "balanced", "spacious"]),
  emphasis: z.enum(["kpi-first", "chart-first", "narrative-first"]),
});

const inferredContextSchema = z.object({
  industryTag: industryTagSchema,
  industryHypothesis: z.string(),      // 对用户行业/业务场景的合理推断
  businessModelGuess: z.string(),      // 对收入/运营模式的推断
  coreEntity: z.string(),              // 分析围绕的核心对象
  defaultSlices: z.array(z.string()).min(3).max(8), // 默认应切分的分析维度
  defaultConcerns: z.array(z.string()).min(3).max(8), // 默认应关注的问题
});

const suggestedWidgetSchema = z.object({
  type: widgetTypeSchema,
  role: z.enum(["title", "kpi", "chart", "filter", "annotation", "media"]),
  analyticRole: analyticRoleSchema,
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
  analysisGoal: analysisGoalSchema, // 该页的主要分析动作
  analysisAngles: z.array(z.string()).min(2).max(4), // 本页应展开的分析角度
  mustInsights: z.array(z.string()).min(2).max(3), // 本页必须讲清的关键洞察
  decisionAction: z.string(),       // 看完本页后应采取的判断或动作
  narrative: z.string(),            // 用户在该页应该看到怎样的故事推进
  keyMetrics: z.array(z.string()),  // 关键指标/维度
  primaryData: z.array(z.string()), // 本页主要承接的数据内容
  filters: z.array(z.string()).default([]),
  suggestedWidgets: z.array(suggestedWidgetSchema).min(1),
  layoutIdea: z.string().optional(), // 布局思路描述
});

export const analysisReportSchema = z.object({
  id: z.string(),
  brief: z.string(),                      // 原始用户需求
  summary: z.string(),                    // 一句话总结
  audience: z.string(),                   // 主要观看对象
  overallGoal: z.string(),                // 看板最终要支撑的决策/沟通目标
  inferredContext: inferredContextSchema, // 基于模糊 brief 推断出的业务分析上下文
  dataStory: z.string(),                  // 数据故事线逻辑（为什么这样分页）
  pages: z.array(pagePlanSchema).min(1).max(10),
  potentialNeeds: z.array(z.string()),    // 识别出的潜在需求
  recommendedTheme: themeHintSchema,
  visualBrief: visualBriefSchema,
});

const INDUSTRY_TAG_VALUES = new Set(industryTagSchema.options);
const WIDGET_TYPE_VALUES = new Set(widgetTypeSchema.options);
const ANALYTIC_ROLE_VALUES = new Set(["headline", "evidence", "diagnostic", "detail", "filter", "annotation"] as const);

function uniqueStrings(values: unknown, fallback: string[]) {
  const list = Array.isArray(values)
    ? values.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
  const merged = Array.from(new Set([...list, ...fallback]));
  return merged;
}

function normalizeIndustryTag(value: unknown) {
  if (typeof value !== "string") return "generic";
  const normalized = value.trim().toLowerCase();
  if (INDUSTRY_TAG_VALUES.has(normalized as z.infer<typeof industryTagSchema>)) {
    return normalized;
  }

  if (["能源", "电力", "新能源"].some((keyword) => normalized.includes(keyword))) return "energy";
  if (["工业", "制造", "工厂", "产线"].some((keyword) => normalized.includes(keyword))) return "industrial";
  if (["水利", "水务", "供水", "排水"].some((keyword) => normalized.includes(keyword))) return "water";
  if (["交通", "客运", "出行", "路网"].some((keyword) => normalized.includes(keyword))) return "transport";
  if (["港口", "码头", "航运", "泊位"].some((keyword) => normalized.includes(keyword))) return "port";
  if (["文旅", "旅游", "景区", "酒店"].some((keyword) => normalized.includes(keyword))) return "tourism";
  if (["政务", "政府", "审批", "治理"].some((keyword) => normalized.includes(keyword))) return "government";
  if (["农业", "种植", "养殖", "农田"].some((keyword) => normalized.includes(keyword))) return "agriculture";
  if (["金融", "银行", "证券", "保险"].some((keyword) => normalized.includes(keyword))) return "finance";
  if (["文体", "体育", "赛事", "文化", "演出"].some((keyword) => normalized.includes(keyword))) return "sports-culture";
  if (["校园", "学校", "高校", "学生"].some((keyword) => normalized.includes(keyword))) return "campus";
  if (["园区", "楼宇", "招商", "入驻"].some((keyword) => normalized.includes(keyword))) return "park";
  if (["零售", "门店", "商超", "sku", "商品"].some((keyword) => normalized.includes(keyword))) return "retail";
  if (["运维", "监控", "工单", "sla", "告警"].some((keyword) => normalized.includes(keyword))) return "ops-maintenance";

  return "generic";
}

function normalizeWidgetType(value: unknown) {
  if (typeof value !== "string") return "text";
  const normalized = value.trim().toLowerCase();
  if (WIDGET_TYPE_VALUES.has(normalized as z.infer<typeof widgetTypeSchema>)) {
    return normalized;
  }

  if (["标题", "文本", "说明", "注释", "headline", "annotation"].some((keyword) => normalized.includes(keyword))) return "text";
  if (["区域", "分区", "section", "block", "panel"].some((keyword) => normalized.includes(keyword))) return "section";
  if (["分割", "divider", "separator", "line"].some((keyword) => normalized.includes(keyword))) return "divider";
  if (["图片", "image", "photo", "logo"].some((keyword) => normalized.includes(keyword))) return "image";
  if (["进度", "kpi", "pixel", "达成"].some((keyword) => normalized.includes(keyword))) return "pixel";
  if (["目标", "bullet", "达成率", "variance"].some((keyword) => normalized.includes(keyword))) return "bullet";
  if (["排名", "排行", "rank", "top"].some((keyword) => normalized.includes(keyword))) return "rank";
  if (["表格", "明细", "table", "grid", "list"].some((keyword) => normalized.includes(keyword))) return "table";
  if (["筛选", "filter", "select"].some((keyword) => normalized.includes(keyword))) return "select";
  if (["柱", "bar", "histogram"].some((keyword) => normalized.includes(keyword))) return "bar";
  if (["折线", "line", "trend"].some((keyword) => normalized.includes(keyword))) return "line";
  if (["饼", "pie", "donut"].some((keyword) => normalized.includes(keyword))) return "pie";
  if (["漏斗", "funnel"].some((keyword) => normalized.includes(keyword))) return "funnel";
  if (["瀑布", "waterfall", "拆解", "贡献"].some((keyword) => normalized.includes(keyword))) return "waterfall";

  return "text";
}

function normalizeAnalyticRole(value: unknown) {
  if (typeof value !== "string") return "evidence";
  const normalized = value.trim().toLowerCase();
  if (ANALYTIC_ROLE_VALUES.has(normalized as "headline" | "evidence" | "diagnostic" | "detail" | "filter" | "annotation")) {
    return normalized;
  }

  if (["headline", "title", "标题", "结论", "主结论", "总述"].some((keyword) => normalized.includes(keyword))) return "headline";
  if (["evidence", "chart", "主图", "证据", "趋势", "对比", "分析"].some((keyword) => normalized.includes(keyword))) return "evidence";
  if (["diagnostic", "诊断", "归因", "拆解", "原因"].some((keyword) => normalized.includes(keyword))) return "diagnostic";
  if (["detail", "table", "明细", "清单", "对象", "列表"].some((keyword) => normalized.includes(keyword))) return "detail";
  if (["filter", "筛选", "条件", "过滤"].some((keyword) => normalized.includes(keyword))) return "filter";
  if (["annotation", "注释", "说明", "备注", "解释"].some((keyword) => normalized.includes(keyword))) return "annotation";

  return "evidence";
}

export function normalizeAnalysisReport(input: unknown) {
  if (!input || typeof input !== "object") return input;

  const raw = input as Record<string, unknown>;
  const inferredContext = raw.inferredContext && typeof raw.inferredContext === "object"
    ? raw.inferredContext as Record<string, unknown>
    : {};
  const pages = Array.isArray(raw.pages) ? raw.pages : [];

  return {
    ...raw,
    inferredContext: {
      industryTag: normalizeIndustryTag(inferredContext.industryTag),
      industryHypothesis: inferredContext.industryHypothesis ?? "基于用户输入推断的一般业务场景",
      businessModelGuess: inferredContext.businessModelGuess ?? "通过核心业务对象的规模、效率和风险变化来评估经营表现",
      coreEntity: inferredContext.coreEntity ?? "业务对象",
      defaultSlices: uniqueStrings(inferredContext.defaultSlices, ["时间", "区域", "渠道"]).slice(0, 8),
      defaultConcerns: uniqueStrings(inferredContext.defaultConcerns, ["增长是否健康", "哪里表现异常", "该优先处理什么"]).slice(0, 8),
    },
    pages: pages.map((page, index) => {
      if (!page || typeof page !== "object") return page;
      const rawPage = page as Record<string, unknown>;
      return {
        ...rawPage,
        analysisAngles: uniqueStrings(rawPage.analysisAngles, ["趋势变化", "结构拆解"]).slice(0, 4),
        mustInsights: uniqueStrings(rawPage.mustInsights, [`P${index + 1} 需要先明确关键结论`, `P${index + 1} 需要指出后续关注重点`]).slice(0, 3),
        decisionAction: rawPage.decisionAction ?? "根据本页结论安排后续核查和优化动作",
        suggestedWidgets: Array.isArray(rawPage.suggestedWidgets)
          ? rawPage.suggestedWidgets.map((widget) => {
              if (!widget || typeof widget !== "object") return widget;
              const rawWidget = widget as Record<string, unknown>;
              return {
                ...rawWidget,
                type: normalizeWidgetType(rawWidget.type),
                analyticRole: normalizeAnalyticRole(rawWidget.analyticRole),
              };
            })
          : rawPage.suggestedWidgets,
      };
    }),
  };
}

export type AnalysisReport = z.infer<typeof analysisReportSchema>;
export type SuggestedWidget = z.infer<typeof suggestedWidgetSchema>;
export type PagePlan = z.infer<typeof pagePlanSchema>;
export type VisualBrief = z.infer<typeof visualBriefSchema>;
