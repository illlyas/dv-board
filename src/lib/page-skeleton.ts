import { z } from "zod";

// ─── 节点 2 输出：页面结构骨架（纯布局，无视觉样式）────────────
// 与 VisdocModel 结构高度一致，但 layoutStyle 不含任何视觉属性

const colorSchema = z.string().describe("CSS color string, preferably hex.");
const numericTupleSchema = z.tuple([z.number(), z.number()]);

// 精简版 layoutStyle — 只有定位和尺寸，无视觉效果
const skeletonLayoutStyleSchema = z.object({
  position: numericTupleSchema,
  rotation: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  // 注意：没有 borderRadius/borderColor/bgColor/boxShadow/opacity 等
});

// ── 复用与 dashboard-schema 完全一致的子 schema ──

const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValueSchema), z.record(z.string(), jsonValueSchema)]),
);

const groupNodeSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("group"),
  childrenIds: z.array(z.string()),
  $modelType: z.literal("dashboard/GroupModel"),
});

const textWidgetSchema = z.object({
  name: z.string(), id: z.string(), type: z.literal("widget"), widgetType: z.literal("text"),
  config: z.object({
    text: z.string(), color: colorSchema, fontSize: z.number(),
    textAlign: z.enum(["left", "center", "right"]),
    verticalAlign: z.enum(["top", "middle", "bottom"]),
    fontWeight: z.union([z.number(), z.enum(["normal", "bold"])]),
    fontStyle: z.enum(["normal", "italic"]),
  }),
  layoutStyle: skeletonLayoutStyleSchema, // ← 精简版
  $modelType: z.literal("dashboard/WidgetModel"),
});

const imageWidgetSchema = z.object({
  name: z.string(), id: z.string(), type: z.literal("widget"), widgetType: z.literal("image"),
  config: z.object({ sourceType: z.enum(["asset", "url"]), fileKey: z.string(), url: z.string(), fillMode: z.enum(["contain", "cover", "fill"]) }),
  layoutStyle: skeletonLayoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

const pixelWidgetSchema = z.object({
  name: z.string(), id: z.string(), type: z.literal("widget"), widgetType: z.literal("pixel"),
  config: z.object({
    title: z.string(), value: z.number(), target: z.number(),
    pixelsRowCount: z.number().int().positive(), pixelsColumnCount: z.number().int().positive(),
    pixelRowGap: z.number(), pixelColumnGap: z.number(),
    fillMode: z.enum(["adaptive", "fixed"]), animationMode: z.enum(["sequential", "pulse", "none"]),
    borderRadius: z.number(), showTitle: z.boolean(),
    customColorRanges: z.boolean(), customOpacityRanges: z.boolean(), customGlobalOpacityRanges: z.boolean(),
    globalOpacityRanges: z.array(z.object({ min: z.number(), max: z.number(), opacity: z.number() })),
    colorRanges: z.array(z.object({ min: z.number(), max: z.number(), color: colorSchema })),
    opacityRanges: z.array(z.object({ min: z.number(), max: z.number(), opacity: z.number() })),
    autoPlay: z.boolean(), playInterval: z.number(), playDuration: z.number(),
  }),
  layoutStyle: skeletonLayoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

const selectWidgetSchema = z.object({
  name: z.string(), id: z.string(), type: z.literal("widget"), widgetType: z.literal("select"),
  config: z.object({ placeholder: z.string(), options: z.array(z.string()).default([]) }),
  layoutStyle: skeletonLayoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

const chartSeriesSchema = z.object({ name: z.string(), data: z.array(z.union([z.number(), z.null()])), color: colorSchema.optional() });
const chartSliceSchema = z.object({ name: z.string(), value: z.union([z.number(), z.null()]), color: colorSchema.optional() });

const barWidgetSchema = z.object({
  name: z.string(), id: z.string(), type: z.literal("widget"), widgetType: z.literal("bar"),
  config: z.object({ theme: z.string(), title: z.string().optional(), categories: z.array(z.string()), seriesData: z.array(chartSeriesSchema).min(1), barWidth: z.string().optional(), series: jsonValueSchema.optional(), option: jsonValueSchema.optional() }),
  layoutStyle: skeletonLayoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});
const lineWidgetSchema = z.object({
  name: z.string(), id: z.string(), type: z.literal("widget"), widgetType: z.literal("line"),
  config: z.object({ theme: z.string(), title: z.string().optional(), categories: z.array(z.string()), seriesData: z.array(chartSeriesSchema).min(1), smooth: z.boolean().optional(), areaStyle: z.boolean().optional(), series: jsonValueSchema.optional(), option: jsonValueSchema.optional() }),
  layoutStyle: skeletonLayoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});
const pieWidgetSchema = z.object({
  name: z.string(), id: z.string(), type: z.literal("widget"), widgetType: z.literal("pie"),
  config: z.object({ theme: z.string(), title: z.string().optional(), data: z.array(chartSliceSchema).min(3), radius: z.array(z.string()).optional(), series: jsonValueSchema.optional(), option: jsonValueSchema.optional() }),
  layoutStyle: skeletonLayoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});
const funnelWidgetSchema = z.object({
  name: z.string(), id: z.string(), type: z.literal("widget"), widgetType: z.literal("funnel"),
  config: z.object({ theme: z.string(), title: z.string().optional(), data: z.array(chartSliceSchema).min(3), series: jsonValueSchema.optional(), option: jsonValueSchema.optional() }),
  layoutStyle: skeletonLayoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

export const skeletonWidgetSchema = z.discriminatedUnion("widgetType", [
  textWidgetSchema, imageWidgetSchema, pixelWidgetSchema, selectWidgetSchema,
  barWidgetSchema, lineWidgetSchema, pieWidgetSchema, funnelWidgetSchema,
]);
export const skeletonNodeSchema = z.union([groupNodeSchema, skeletonWidgetSchema]);

export const pageSkeletonPageSchema = z.object({
  name: z.string(), backgroundColor: colorSchema, rootNodeId: z.string(), id: z.string(),
  guideLines: z.object({ horizontal: z.array(z.number()), vertical: z.array(z.number()) }),
  $modelType: z.literal("dashboard/PageModel"),
});

export const pageSkeletonSchema = z.object({
  id: z.string(),
  name: z.string(),
  viewSize: z.object({ width: z.number().positive(), height: z.number().positive() }),
  backgroundColor: colorSchema,
  baseNodeMap: z.record(z.string(), jsonValueSchema),
  nodeMap: z.record(z.string(), skeletonNodeSchema),
  pages: z.array(pageSkeletonPageSchema).min(1).max(10),
  currentPageId: z.string(),
  eventRules: z.array(jsonValueSchema),
  usedExtensions: z.array(jsonValueSchema),
  showRulers: z.boolean(),
  lockGuides: z.boolean(),
  variableMap: z.record(z.string(), jsonValueSchema),
  $modelType: z.literal("dashboard/VisdocModel"),
});

export type PageSkeleton = z.infer<typeof pageSkeletonSchema>;
export type SkeletonLayoutStyle = z.infer<typeof skeletonLayoutStyleSchema>;
