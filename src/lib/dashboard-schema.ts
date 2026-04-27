import { z } from "zod";

const colorSchema = z.string().describe("CSS color string, preferably hex.");
const numericTupleSchema = z
  .tuple([z.number(), z.number()])
  .describe("Absolute [x, y] position in the 1920x1080 canvas.");

const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

const layoutStyleSchema = z.object({
  position: numericTupleSchema,
  rotation: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  // ── Visual style (AI-driven, all optional) ──
  borderRadius: z.number().optional(),
  borderWidth: z.number().optional(),
  borderColor: colorSchema.optional(),
  borderStyle: z.enum(["solid", "dashed", "dotted"]).optional(),
  backgroundColor: colorSchema.optional(),
  boxShadow: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

const guideLinesSchema = z.object({
  horizontal: z.array(z.number()),
  vertical: z.array(z.number()),
});

const groupNodeSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("group"),
  childrenIds: z.array(z.string()),
  $modelType: z.literal("dashboard/GroupModel"),
});

const textWidgetSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("widget"),
  widgetType: z.literal("text"),
  config: z.object({
    text: z.string(),
    color: colorSchema,
    fontSize: z.number(),
    textAlign: z.enum(["left", "center", "right"]),
    verticalAlign: z.enum(["top", "middle", "bottom"]),
    fontWeight: z.union([z.number(), z.enum(["normal", "bold"])]),
    fontStyle: z.enum(["normal", "italic"]),
  }),
  layoutStyle: layoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

const imageWidgetSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("widget"),
  widgetType: z.literal("image"),
  config: z.object({
    sourceType: z.enum(["asset", "url"]),
    fileKey: z.string(),
    url: z.string(),
    fillMode: z.enum(["contain", "cover", "fill"]),
  }),
  layoutStyle: layoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

const pixelWidgetSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("widget"),
  widgetType: z.literal("pixel"),
  config: z.object({
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
      z.object({
        min: z.number(),
        max: z.number(),
        opacity: z.number(),
      }),
    ),
    colorRanges: z.array(
      z.object({
        min: z.number(),
        max: z.number(),
        color: colorSchema,
      }),
    ),
    opacityRanges: z.array(
      z.object({
        min: z.number(),
        max: z.number(),
        opacity: z.number(),
      }),
    ),
    autoPlay: z.boolean(),
    playInterval: z.number(),
    playDuration: z.number(),
  }),
  layoutStyle: layoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

const selectWidgetSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("widget"),
  widgetType: z.literal("select"),
  config: z.object({
    placeholder: z.string(),
    options: z.array(z.string()).default([]),
  }),
  layoutStyle: layoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

const chartSeriesSchema = z.object({
  name: z.string(),
  data: z.array(z.union([z.number(), z.null()])),
  color: colorSchema.optional(),
});

const chartSliceSchema = z.object({
  name: z.string(),
  value: z.union([z.number(), z.null()]),
  color: colorSchema.optional(),
});

const barWidgetSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("widget"),
  widgetType: z.literal("bar"),
  config: z.object({
    theme: z.string(),
    title: z.string().optional(),
    categories: z.array(z.string()),
    seriesData: z.array(chartSeriesSchema).min(1),
    barWidth: z.string().optional(),
    series: jsonValueSchema.optional(),
    option: jsonValueSchema.optional(),
  }),
  layoutStyle: layoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

const lineWidgetSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("widget"),
  widgetType: z.literal("line"),
  config: z.object({
    theme: z.string(),
    title: z.string().optional(),
    categories: z.array(z.string()),
    seriesData: z.array(chartSeriesSchema).min(1),
    smooth: z.boolean().optional(),
    areaStyle: z.boolean().optional(),
    series: jsonValueSchema.optional(),
    option: jsonValueSchema.optional(),
  }),
  layoutStyle: layoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

const pieWidgetSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("widget"),
  widgetType: z.literal("pie"),
  config: z.object({
    theme: z.string(),
    title: z.string().optional(),
    data: z.array(chartSliceSchema).min(3),
    radius: z.array(z.string()).optional(),
    series: jsonValueSchema.optional(),
    option: jsonValueSchema.optional(),
  }),
  layoutStyle: layoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

const funnelWidgetSchema = z.object({
  name: z.string(),
  id: z.string(),
  type: z.literal("widget"),
  widgetType: z.literal("funnel"),
  config: z.object({
    theme: z.string(),
    title: z.string().optional(),
    data: z.array(chartSliceSchema).min(3),
    series: jsonValueSchema.optional(),
    option: jsonValueSchema.optional(),
  }),
  layoutStyle: layoutStyleSchema,
  $modelType: z.literal("dashboard/WidgetModel"),
});

export const widgetNodeSchema = z.discriminatedUnion("widgetType", [
  textWidgetSchema,
  imageWidgetSchema,
  pixelWidgetSchema,
  selectWidgetSchema,
  barWidgetSchema,
  lineWidgetSchema,
  pieWidgetSchema,
  funnelWidgetSchema,
]);

export const dashboardNodeSchema = z.union([groupNodeSchema, widgetNodeSchema]);

const pageSchema = z.object({
  name: z.string(),
  backgroundColor: colorSchema,
  rootNodeId: z.string(),
  id: z.string(),
  guideLines: guideLinesSchema,
  $modelType: z.literal("dashboard/PageModel"),
});

export const visdocSchema = z.object({
  id: z.string(),
  name: z.string(),
  viewSize: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  backgroundColor: colorSchema,
  baseNodeMap: z.record(z.string(), jsonValueSchema),
  nodeMap: z.record(z.string(), dashboardNodeSchema),
  pages: z.array(pageSchema).min(1).max(10),
  currentPageId: z.string(),
  eventRules: z.array(jsonValueSchema),
  usedExtensions: z.array(jsonValueSchema),
  showRulers: z.boolean(),
  lockGuides: z.boolean(),
  variableMap: z.record(z.string(), jsonValueSchema),
  $modelType: z.literal("dashboard/VisdocModel"),
});

export type DashboardNode = z.infer<typeof dashboardNodeSchema>;
export type GroupNode = z.infer<typeof groupNodeSchema>;
export type WidgetNode = z.infer<typeof widgetNodeSchema>;
export type PageModel = z.infer<typeof pageSchema>;
export type VisdocModel = z.infer<typeof visdocSchema>;

export const LOCAL_STORAGE_KEY = "dv-board.visdoc";

export function buildDemoVisdoc(): VisdocModel {
  const page1Root = crypto.randomUUID();
  const page2Root = crypto.randomUUID();
  const title1 = crypto.randomUUID();
  const subtitle1 = crypto.randomUUID();
  const pixel1 = crypto.randomUUID();
  const bar1 = crypto.randomUUID();
  const pie1 = crypto.randomUUID();
  const select1 = crypto.randomUUID();
  const title2 = crypto.randomUUID();
  const image2 = crypto.randomUUID();
  const funnel2 = crypto.randomUUID();
  const line2 = crypto.randomUUID();
  const docId = crypto.randomUUID();
  const page1Id = crypto.randomUUID();
  const page2Id = crypto.randomUUID();

  return {
    id: docId,
    name: "AI 运营总览看板",
    viewSize: {
      width: 1920,
      height: 1080,
    },
    backgroundColor: "#081121",
    baseNodeMap: {},
    nodeMap: {
      [page1Root]: {
        name: "$page-root",
        id: page1Root,
        type: "group",
        childrenIds: [title1, subtitle1, pixel1, bar1, pie1, select1],
        $modelType: "dashboard/GroupModel",
      },
      [title1]: {
        name: "看板标题",
        id: title1,
        type: "widget",
        widgetType: "text",
        config: {
          text: "新能源汽车全国经营驾驶舱",
          color: "#F8FAFC",
          fontSize: 48,
          textAlign: "left",
          verticalAlign: "middle",
          fontWeight: 700,
          fontStyle: "normal",
        },
        layoutStyle: {
          position: [96, 52],
          rotation: 0,
          width: 840,
          height: 72,
        },
        $modelType: "dashboard/WidgetModel",
      },
      [subtitle1]: {
        name: "说明",
        id: subtitle1,
        type: "widget",
        widgetType: "text",
        config: {
          text: "监控销量、区域分布、转化率与渠道效率，多分页切换不同主题视角。",
          color: "#94A3B8",
          fontSize: 22,
          textAlign: "left",
          verticalAlign: "middle",
          fontWeight: 400,
          fontStyle: "normal",
        },
        layoutStyle: {
          position: [96, 124],
          rotation: 0,
          width: 1040,
          height: 40,
        },
        $modelType: "dashboard/WidgetModel",
      },
      [pixel1]: {
        name: "像素进度",
        id: pixel1,
        type: "widget",
        widgetType: "pixel",
        config: {
          title: "季度目标完成率",
          value: 78,
          target: 100,
          pixelsRowCount: 10,
          pixelsColumnCount: 10,
          pixelRowGap: 4,
          pixelColumnGap: 4,
          fillMode: "adaptive",
          animationMode: "sequential",
          borderRadius: 10,
          showTitle: true,
          customColorRanges: false,
          customOpacityRanges: false,
          customGlobalOpacityRanges: false,
          globalOpacityRanges: [
            { min: 1, max: 78, opacity: 1 },
            { min: 79, max: 100, opacity: 0.24 },
          ],
          colorRanges: [
            { min: 1, max: 30, color: "#ef4444" },
            { min: 31, max: 60, color: "#f59e0b" },
            { min: 61, max: 100, color: "#10b981" },
          ],
          opacityRanges: [
            { min: 1, max: 3, opacity: 0.35 },
            { min: 4, max: 6, opacity: 0.65 },
            { min: 7, max: 10, opacity: 1 },
          ],
          autoPlay: true,
          playInterval: 5000,
          playDuration: 2000,
        },
        layoutStyle: {
          position: [96, 214],
          rotation: 0,
          width: 360,
          height: 280,
        },
        $modelType: "dashboard/WidgetModel",
      },
      [bar1]: {
        name: "区域销量柱状图",
        id: bar1,
        type: "widget",
        widgetType: "bar",
        config: {
          theme: "executive",
          title: "大区销量对比",
          categories: ["华东", "华南", "华北", "西南", "华中"],
          seriesData: [
            {
              name: "销量",
              data: [182, 168, 151, 129, 118],
              color: "#f97316",
            },
          ],
          barWidth: "48%",
          series: {
            itemStyle: {
              borderRadius: [8, 8, 0, 0],
            },
          },
        },
        layoutStyle: {
          position: [500, 214],
          rotation: 0,
          width: 664,
          height: 360,
        },
        $modelType: "dashboard/WidgetModel",
      },
      [pie1]: {
        name: "渠道占比",
        id: pie1,
        type: "widget",
        widgetType: "pie",
        config: {
          theme: "executive",
          title: "渠道成交占比",
          data: [
            { name: "直营", value: 38, color: "#38bdf8" },
            { name: "经销", value: 34, color: "#14b8a6" },
            { name: "线上", value: 18, color: "#f97316" },
            { name: "合作生态", value: 10, color: "#facc15" },
          ],
          radius: ["44%", "68%"],
          series: {
            label: {
              color: "#dbeafe",
            },
          },
        },
        layoutStyle: {
          position: [1210, 214],
          rotation: 0,
          width: 612,
          height: 360,
        },
        $modelType: "dashboard/WidgetModel",
      },
      [select1]: {
        name: "筛选器",
        id: select1,
        type: "widget",
        widgetType: "select",
        config: {
          placeholder: "切换区域维度",
          options: ["全国", "华东", "华南", "华北", "西南"],
        },
        layoutStyle: {
          position: [96, 540],
          rotation: 0,
          width: 240,
          height: 48,
        },
        $modelType: "dashboard/WidgetModel",
      },
      [page2Root]: {
        name: "$page-root",
        id: page2Root,
        type: "group",
        childrenIds: [title2, image2, funnel2, line2],
        $modelType: "dashboard/GroupModel",
      },
      [title2]: {
        name: "第二页标题",
        id: title2,
        type: "widget",
        widgetType: "text",
        config: {
          text: "线索转化与品牌热度",
          color: "#F8FAFC",
          fontSize: 44,
          textAlign: "left",
          verticalAlign: "middle",
          fontWeight: 700,
          fontStyle: "normal",
        },
        layoutStyle: {
          position: [96, 56],
          rotation: 0,
          width: 680,
          height: 72,
        },
        $modelType: "dashboard/WidgetModel",
      },
      [image2]: {
        name: "品牌视觉",
        id: image2,
        type: "widget",
        widgetType: "image",
        config: {
          sourceType: "url",
          fileKey: "",
          url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
          fillMode: "cover",
        },
        layoutStyle: {
          position: [1080, 164],
          rotation: 0,
          width: 744,
          height: 460,
        },
        $modelType: "dashboard/WidgetModel",
      },
      [funnel2]: {
        name: "漏斗图",
        id: funnel2,
        type: "widget",
        widgetType: "funnel",
        config: {
          theme: "executive",
          title: "转化漏斗",
          data: [
            { name: "曝光", value: 120000, color: "#38bdf8" },
            { name: "点击", value: 42000, color: "#14b8a6" },
            { name: "留资", value: 12800, color: "#f97316" },
            { name: "试驾", value: 5400, color: "#fb7185" },
            { name: "成交", value: 1680, color: "#facc15" },
          ],
          series: {
            label: {
              show: true,
              position: "inside",
              formatter: "{b}: {c}",
            },
            gap: 2,
          },
        },
        layoutStyle: {
          position: [96, 204],
          rotation: 0,
          width: 420,
          height: 520,
        },
        $modelType: "dashboard/WidgetModel",
      },
      [line2]: {
        name: "热度趋势",
        id: line2,
        type: "widget",
        widgetType: "line",
        config: {
          theme: "executive",
          title: "话题热度与线索增长",
          categories: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
          seriesData: [
            {
              name: "话题热度",
              data: [62, 68, 74, 88, 95, 90, 86],
              color: "#38bdf8",
            },
            {
              name: "新增线索",
              data: [22, 28, 35, 44, 52, 49, 46],
              color: "#f97316",
            },
          ],
          smooth: true,
          areaStyle: false,
          series: {
            lineStyle: {
              width: 3,
            },
          },
        },
        layoutStyle: {
          position: [560, 204],
          rotation: 0,
          width: 464,
          height: 520,
        },
        $modelType: "dashboard/WidgetModel",
      },
    },
    pages: [
      {
        name: "页面 1",
        backgroundColor: "#081121",
        rootNodeId: page1Root,
        id: page1Id,
        guideLines: {
          horizontal: [],
          vertical: [],
        },
        $modelType: "dashboard/PageModel",
      },
      {
        name: "页面 2",
        backgroundColor: "#07111f",
        rootNodeId: page2Root,
        id: page2Id,
        guideLines: {
          horizontal: [],
          vertical: [],
        },
        $modelType: "dashboard/PageModel",
      },
    ],
    currentPageId: page1Id,
    eventRules: [],
    usedExtensions: [],
    showRulers: false,
    lockGuides: false,
    variableMap: {},
    $modelType: "dashboard/VisdocModel",
  };
}
