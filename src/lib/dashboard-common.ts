import { z } from "zod";

// ─── 原始类型 ─────────────────────────────────────────────


export const colorSchema = z.string().describe("CSS color string, preferably hex.");

export const numericTupleSchema = z
  .tuple([z.number(), z.number()])
  .describe("Absolute [x, y] position in the 1920x1080 canvas.");

export const viewSizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

export const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

// ─── 节点公共字段 ─────────────────────────────────────────

/** group 节点 — 两个 schema 完全一致 */
export const groupNodeSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("group"),
  childrenIds: z.array(z.string()),
  $modelType: z.literal("dashboard/GroupModel"),
});

/** widget 节点的公共字段（不含 widgetType / config / layoutStyle） */
export const widgetBaseFields = {
  name: z.string(),
  id: z.string(),
  type: z.literal("widget"),
  $modelType: z.literal("dashboard/WidgetModel"),
} as const;

export const widgetTypeValues = [
  "section",
  "divider",
  "text",
  "image",
  "pixel",
  "bullet",
  "rank",
  "table",
  "select",
  "bar",
  "line",
  "pie",
  "funnel",
  "waterfall",
] as const;

export const widgetTypeSchema = z.enum(widgetTypeValues);

// ─── Widget Config（纯配置，不含 layoutStyle / 元信息）─────

export const textWidgetConfigSchema = z.object({
  text: z.string(),
  color: colorSchema,
  fontSize: z.number(),
  textAlign: z.enum(["left", "center", "right"]),
  verticalAlign: z.enum(["top", "middle", "bottom"]),
  fontWeight: z.union([z.number(), z.enum(["normal", "bold"])]),
  fontStyle: z.enum(["normal", "italic"]),
});

export const sectionWidgetConfigSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  align: z.enum(["left", "center", "right"]).default("left"),
});

export const dividerWidgetConfigSchema = z.object({
  direction: z.enum(["horizontal", "vertical"]),
  emphasis: z.enum(["subtle", "strong"]).default("subtle"),
  label: z.string().optional(),
});

export const imageWidgetConfigSchema = z.object({
  sourceType: z.enum(["asset", "url"]),
  fileKey: z.string(),
  url: z.string(),
  fillMode: z.enum(["contain", "cover", "fill"]),
});

export const pixelWidgetConfigSchema = z.object({
  title: z.string(),
  value: z.number(),
  target: z.number(),
  pixelsRowCount: z.number().int().positive(),
  pixelsColumnCount: z.number().int().positive(),
  pixelRowGap: z.number(),
  pixelColumnGap: z.number(),
  fillMode: z.enum(["adaptive", "fixed"]),
  animationMode: z.enum(["sequential", "pulse", "none"]),
  borderRadius: z.number(),
  showTitle: z.boolean(),
  customColorRanges: z.boolean(),
  customOpacityRanges: z.boolean(),
  customGlobalOpacityRanges: z.boolean(),
  globalOpacityRanges: z.array(
    z.object({ min: z.number(), max: z.number(), opacity: z.number() }),
  ),
  colorRanges: z.array(
    z.object({ min: z.number(), max: z.number(), color: colorSchema }),
  ),
  opacityRanges: z.array(
    z.object({ min: z.number(), max: z.number(), opacity: z.number() }),
  ),
  autoPlay: z.boolean(),
  playInterval: z.number(),
  playDuration: z.number(),
});

export const selectWidgetConfigSchema = z.object({
  placeholder: z.string(),
  options: z.array(z.string()).default([]),
});

export const bulletWidgetConfigSchema = z.object({
  title: z.string(),
  value: z.number(),
  target: z.number(),
  previous: z.number().optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
  accentColor: colorSchema.optional(),
  positiveColor: colorSchema.optional(),
  negativeColor: colorSchema.optional(),
});

export const rankWidgetConfigSchema = z.object({
  title: z.string().optional(),
  items: z.array(z.object({
    name: z.string(),
    value: z.number(),
    rank: z.number().int().positive(),
    previousRank: z.number().int().positive().optional(),
    note: z.string().optional(),
    highlight: z.boolean().optional(),
  })).min(3).max(10),
});

export const tableWidgetConfigSchema = z.object({
  title: z.string().optional(),
  columns: z.array(z.string()).min(2).max(8),
  rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))).min(1).max(12),
  summary: z.string().optional(),
  anomalyRowIndexes: z.array(z.number().int().nonnegative()).default([]),
});

// ─── layoutStyle 基础字段（位置 + 尺寸，两个 schema 共用）──

/** 所有 layoutStyle 共有的定位与尺寸字段 */
export const layoutStyleBaseSchema = z.object({
  position: z.tuple([z.number(), z.number()])
    .describe("Absolute [x, y] position in the 1920x1080 canvas."),
  rotation: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const pageBaseFields = {
  name: z.string(),
  backgroundColor: colorSchema,
  rootNodeId: z.string(),
  id: z.string(),
  $modelType: z.literal("dashboard/PageModel"),
} as const;

export const visdocBaseFields = {
  id: z.string(),
  name: z.string(),
  viewSize: viewSizeSchema,
  backgroundColor: colorSchema,
  baseNodeMap: z.record(z.string(), jsonValueSchema),
  currentPageId: z.string(),
  $modelType: z.literal("dashboard/VisdocModel"),
} as const;

export function makePageSchema<Extra extends z.ZodRawShape>(extraFields: Extra) {
  return z.object({
    ...pageBaseFields,
    ...extraFields,
  });
}

export function makeVisdocSchema<
  Node extends z.ZodTypeAny,
  Page extends z.ZodTypeAny,
  Extra extends z.ZodRawShape,
>(nodeSchema: Node, pageSchema: Page, extraFields: Extra) {
  return z.object({
    ...visdocBaseFields,
    nodeMap: z.record(z.string(), nodeSchema),
    pages: z.array(pageSchema).min(1).max(10),
    ...extraFields,
  });
}

// ─── Chart 子 schema ───────────────────────────────────────

export const chartSeriesSchema = z.object({
  name: z.string(),
  data: z.array(z.union([z.number(), z.null()])),
  color: colorSchema.optional(),
});

const chartHeaderSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  iconHint: z.string().optional(),
});

export const chartSliceSchema = z.object({
  name: z.string(),
  value: z.union([z.number(), z.null()]),
  color: colorSchema.optional(),
});

export const barWidgetConfigSchema = chartHeaderSchema.extend({
  theme: z.string(),
  categories: z.array(z.string()),
  seriesData: z.array(chartSeriesSchema).min(1),
  barWidth: z.string().optional(),
  series: jsonValueSchema.optional(),
  option: jsonValueSchema.optional(),
});

export const lineWidgetConfigSchema = chartHeaderSchema.extend({
  theme: z.string(),
  categories: z.array(z.string()),
  seriesData: z.array(chartSeriesSchema).min(1),
  smooth: z.boolean().optional(),
  areaStyle: z.boolean().optional(),
  series: jsonValueSchema.optional(),
  option: jsonValueSchema.optional(),
});

export const pieWidgetConfigSchema = chartHeaderSchema.extend({
  theme: z.string(),
  data: z.array(chartSliceSchema).min(3),
  radius: z.array(z.string()).optional(),
  series: jsonValueSchema.optional(),
  option: jsonValueSchema.optional(),
});

export const funnelWidgetConfigSchema = chartHeaderSchema.extend({
  theme: z.string(),
  data: z.array(chartSliceSchema).min(3),
  series: jsonValueSchema.optional(),
  option: jsonValueSchema.optional(),
});

export const waterfallWidgetConfigSchema = chartHeaderSchema.extend({
  startLabel: z.string().optional(),
  endLabel: z.string().optional(),
  startValue: z.number(),
  steps: z.array(z.object({
    name: z.string(),
    value: z.number(),
    color: colorSchema.optional(),
  })).min(2).max(8),
  endValue: z.number(),
});

// ─── Widget schema 工厂（接受任意 layoutStyle schema）────────

/**
 * 根据传入的 layoutStyle schema 生成完整的 discriminatedUnion widget schema。
 * dashboard-schema 传入含视觉属性的完整版，structure-schema 传入精简版。
 */
export function makeWidgetSchemas<L extends z.ZodTypeAny>(layoutStyle: L) {
  const section = z.object({ ...widgetBaseFields, widgetType: z.literal("section"), config: sectionWidgetConfigSchema, layoutStyle });
  const divider = z.object({ ...widgetBaseFields, widgetType: z.literal("divider"), config: dividerWidgetConfigSchema, layoutStyle });
  const text   = z.object({ ...widgetBaseFields, widgetType: z.literal("text"),   config: textWidgetConfigSchema,   layoutStyle });
  const image  = z.object({ ...widgetBaseFields, widgetType: z.literal("image"),  config: imageWidgetConfigSchema,  layoutStyle });
  const pixel  = z.object({ ...widgetBaseFields, widgetType: z.literal("pixel"),  config: pixelWidgetConfigSchema,  layoutStyle });
  const bullet = z.object({ ...widgetBaseFields, widgetType: z.literal("bullet"), config: bulletWidgetConfigSchema, layoutStyle });
  const rank   = z.object({ ...widgetBaseFields, widgetType: z.literal("rank"),   config: rankWidgetConfigSchema,   layoutStyle });
  const table  = z.object({ ...widgetBaseFields, widgetType: z.literal("table"),  config: tableWidgetConfigSchema,  layoutStyle });
  const select = z.object({ ...widgetBaseFields, widgetType: z.literal("select"), config: selectWidgetConfigSchema, layoutStyle });
  const bar    = z.object({ ...widgetBaseFields, widgetType: z.literal("bar"),    config: barWidgetConfigSchema,    layoutStyle });
  const line   = z.object({ ...widgetBaseFields, widgetType: z.literal("line"),   config: lineWidgetConfigSchema,   layoutStyle });
  const pie    = z.object({ ...widgetBaseFields, widgetType: z.literal("pie"),    config: pieWidgetConfigSchema,    layoutStyle });
  const funnel = z.object({ ...widgetBaseFields, widgetType: z.literal("funnel"), config: funnelWidgetConfigSchema, layoutStyle });
  const waterfall = z.object({ ...widgetBaseFields, widgetType: z.literal("waterfall"), config: waterfallWidgetConfigSchema, layoutStyle });

  return z.discriminatedUnion("widgetType", [section, divider, text, image, pixel, bullet, rank, table, select, bar, line, pie, funnel, waterfall]);
}
