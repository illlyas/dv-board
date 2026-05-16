/**
 * V2 管线 — 看板故事结构定义
 *
 * 本质与旧 Step 1 (analyze) 的 AnalysisReport 完全一致，
 * 复用其核心结构，作为 Step 2 的输出。
 * Step 3 (JSX 生成) 将基于此故事 + VI 系统生成最终代码。
 */
import { z } from "zod";

// ─── 枚举 ──────────────────────────────────────────────────

const themeHintSchema = z.enum([
  "dark-tech", "dark-business", "light-clean",
  "dark-executive", "dark-data",
]);

const analysisGoalSchema = z.enum([
  "overview", "trend", "comparison", "composition",
  "target-gap", "ranking", "diagnostic", "risk",
]);

const contentPrioritySchema = z.enum(["high", "medium", "low"]);

const widgetTypeSchema = z.enum([
  "text", "image", "pixel", "bullet", "rank", "table",
  "select", "bar", "line", "pie", "funnel", "waterfall",
]);

const analyticRoleSchema = z.enum([
  "headline", "evidence", "diagnostic", "detail", "filter", "annotation",
]);

export const industryTagSchema = z.enum([
  "energy", "industrial", "water", "transport", "port",
  "tourism", "government", "agriculture", "finance",
  "sports-culture", "campus", "park", "retail", "ops-maintenance", "generic",
]);

// ─── 子 Schema ─────────────────────────────────────────────

const inferredContextSchema = z.object({
  industryTag: industryTagSchema,
  industryHypothesis: z.string(),
  businessModelGuess: z.string(),
  coreEntity: z.string(),
  defaultSlices: z.array(z.string()).min(3).max(8),
  defaultConcerns: z.array(z.string()).min(3).max(8),
});

const visualBriefSchema = z.object({
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
  analyticRole: analyticRoleSchema,
  priority: contentPrioritySchema,
  label: z.string(),
  dataDescription: z.string(),
  rationale: z.string(),
});

const pagePlanSchema = z.object({
  name: z.string(),
  storyRole: z.string(),
  purpose: z.string(),
  keyQuestion: z.string(),
  analysisGoal: analysisGoalSchema,
  analysisAngles: z.array(z.string()).min(2).max(4),
  mustInsights: z.array(z.string()).min(2).max(3),
  decisionAction: z.string(),
  narrative: z.string(),
  keyMetrics: z.array(z.string()),
  primaryData: z.array(z.string()),
  filters: z.array(z.string()).default([]),
  suggestedWidgets: z.array(suggestedWidgetSchema).min(1),
  layoutIdea: z.string().optional(),
});

// ══════════════════════════════════════════════════════════
// ─── 主 Schema：BoardStory ────────────────────────────────
// ══════════════════════════════════════════════════════════

export const boardStorySchema = z.object({
  id: z.string(),
  brief: z.string(),
  summary: z.string(),
  audience: z.string(),
  overallGoal: z.string(),
  inferredContext: inferredContextSchema,
  dataStory: z.string(),
  pages: z.array(pagePlanSchema).min(1).max(10),
  potentialNeeds: z.array(z.string()),
  recommendedTheme: themeHintSchema,
  visualBrief: visualBriefSchema,
});

export const boardStoryJsonSchema = z.toJSONSchema(boardStorySchema);
export const boardStorySchemaPrompt = JSON.stringify(boardStoryJsonSchema, null, 2);

// ─── 类型导出 ─────────────────────────────────────────────

export type BoardStory = z.infer<typeof boardStorySchema>;
export type PagePlanV2 = z.infer<typeof pagePlanSchema>;
export type SuggestedWidgetV2 = z.infer<typeof suggestedWidgetSchema>;
export type InferredContextV2 = z.infer<typeof inferredContextSchema>;
export type VisualBriefV2 = z.infer<typeof visualBriefSchema>;

// ─── Normalize 工具函数 ────────────────────────────────────

function uniqueStrings(values: unknown, fallback: string[]) {
  const list = Array.isArray(values)
    ? values.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
  return Array.from(new Set([...list, ...fallback]));
}

function normalizeIndustryTag(value: unknown): string {
  if (typeof value !== "string") return "generic";
  const v = value.trim().toLowerCase();
  const TAG_MAP: Record<string, string[]> = {
    energy: ["能源", "电力", "新能源", "光伏", "运营"],
    industrial: ["工业", "制造", "工厂", "产线", "车间"],
    water: ["水利", "水务", "供水", "排水", "水库"],
    transport: ["交通", "公交", "地铁", "铁路", "客运"],
    port: ["港口", "码头", "航运", "泊位"],
    tourism: ["文旅", "旅游", "景区", "酒店"],
    government: ["政务", "政府", "治理", "审批"],
    agriculture: ["农业", "种植", "养殖", "农田"],
    finance: ["金融", "银行", "证券", "保险", "基金"],
    "sports-culture": ["文体", "体育", "赛事", "文化"],
    campus: ["校园", "学校", "高校", "学生"],
    park: ["园区", "楼宇", "招商", "入驻"],
    retail: ["零售", "门店", "商超", "sku"],
    "ops-maintenance": ["运维", "监控", "告警", "工单"],
  };
  for (const [tag, keywords] of Object.entries(TAG_MAP)) {
    if (keywords.some((kw) => v.includes(kw))) return tag;
  }
  if ([...(industryTagSchema.options as readonly string[])].includes(v)) return v;
  return "generic";
}

function normalizeWidgetType(value: unknown): string {
  if (typeof value !== "string") return "text";
  const v = value.trim().toLowerCase();
  const TYPE_MAP: Record<string, string[]> = {
    text: ["标题", "文本", "说明", "注释", "headline"],
    image: ["图片", "image", "photo", "logo"],
    pixel: ["进度", "kpi", "pixel"],
    bullet: ["目标", "bullet", "达成率", "variance"],
    rank: ["排名", "排行", "rank", "top"],
    table: ["表格", "明细", "table", "grid"],
    select: ["筛选", "filter"],
    bar: ["柱", "bar", "histogram"],
    line: ["折线", "line", "trend"],
    pie: ["饼", "pie", "donut"],
    funnel: ["漏斗", "funnel"],
    waterfall: ["瀑布", "waterfall", "拆解", "贡献"],
  };
  for (const [type, keywords] of Object.entries(TYPE_MAP)) {
    if (keywords.some((kw) => v.includes(kw))) return type;
  }
  return "text";
}

function normalizeAnalyticRole(value: unknown): string {
  if (typeof value !== "string") return "evidence";
  const v = value.trim().toLowerCase();
  const ROLE_MAP: Record<string, string[]> = {
    headline: ["headline", "标题", "结论", "主结论"],
    evidence: ["evidence", "chart", "主图", "证据"],
    diagnostic: ["diagnostic", "诊断", "归因", "原因"],
    detail: ["detail", "table", "明细", "清单"],
    filter: ["filter", "筛选", "条件"],
    annotation: ["annotation", "注释", "说明"],
  };
  for (const [role, keywords] of Object.entries(ROLE_MAP)) {
    if (keywords.some((kw) => v.includes(kw))) return role;
  }
  return "evidence";
}

/** 标准化 AI 输出的看板故事数据 */
export function normalizeBoardStory(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") return {} as Record<string, unknown>;
  const raw = input as Record<string, unknown>;
  const ctx = raw.inferredContext && typeof raw.inferredContext === "object"
    ? raw.inferredContext as Record<string, unknown>
    : {};
  const pages = Array.isArray(raw.pages) ? raw.pages : [];

  return {
    ...raw,
    inferredContext: {
      industryTag: normalizeIndustryTag(ctx.industryTag),
      industryHypothesis: ctx.industryHypothesis ?? "基于用户输入推断的一般业务场景",
      businessModelGuess: ctx.businessModelGuess ?? "通过核心业务对象的规模、效率和风险变化来评估经营表现",
      coreEntity: ctx.coreEntity ?? "业务对象",
      defaultSlices: uniqueStrings(ctx.defaultSlices, ["时间", "区域", "渠道"]).slice(0, 8),
      defaultConcerns: uniqueStrings(ctx.defaultConcerns, ["增长是否健康", "哪里表现异常", "该优先处理什么"]).slice(0, 8),
    },
    pages: pages.map((page, index) => {
      if (!page || typeof page !== "object") return page;
      const rp = page as Record<string, unknown>;
      return {
        ...rp,
        analysisAngles: uniqueStrings(rp.analysisAngles, ["趋势变化", "结构拆解"]).slice(0, 4),
        mustInsights: uniqueStrings(rp.mustInsights, [`P${index + 1} 需要先明确关键结论`, `P${index + 1} 需要指出后续关注重点`]).slice(0, 3),
        decisionAction: rp.decisionAction ?? "根据本页结论安排后续核查和优化动作",
        suggestedWidgets: Array.isArray(rp.suggestedWidgets)
          ? rp.suggestedWidgets.map((widget) => {
              if (!widget || typeof widget !== "object") return widget;
              const rw = widget as Record<string, unknown>;
              return { ...rw, type: normalizeWidgetType(rw.type), analyticRole: normalizeAnalyticRole(rw.analyticRole) };
            })
          : rp.suggestedWidgets,
      };
    }),
  };
}
