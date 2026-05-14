import { z } from "zod";
import { WIND_POWER_EMERALD_OPS_TEMPLATE_ID } from "@/lib/board/wind-template-id";
import type { WindPanelHeaderKey } from "@/lib/board/wind-panels";
import { WIND_PANEL_HEADER_KEYS } from "@/lib/board/wind-panels";

/** 单个 Widget 槽位可填字段（与装配器白名单一致） */
export const templateSlotFillSchema = z
  .object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    unit: z.string().optional(),
    /** 图表类：替换 props 内 xAxis.label */
    xAxisLabel: z.string().optional(),
    /** 按 yAxis 数组下标替换 label */
    yAxisLabels: z.array(z.string()).optional(),
    /** 写入 store payload（kpiValue.value 浅合并） */
    kpiValue: z
      .object({
        value: z.number().optional(),
        unit: z.string().optional(),
        trend: z.enum(["up", "down", "flat"]).optional(),
        trendValue: z.string().optional(),
        comparison: z
          .object({
            label: z.string().optional(),
            value: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    /**
     * Table 等 payload.kind === seriesRows 的整表数据替换（行对象字段须与该槽位 columns.field 一致）。
     * 仅用于 WidgetType === "Table" 的槽位。
     */
    tableRows: z.array(z.record(z.string(), z.any())).optional(),
    /**
     * p0.config.province_data 的 payload.value 合并：除 provinces 外浅合并；
     * provinces 若给出则与模板已有省份字典按键合并（未出现的省保留模板默认）。
     */
    provinceData: z.record(z.string(), z.any()).optional(),
    /**
     * 任意 Config 槽（store 中 widgetType=Config 且 payload.kind=kpiValue），**除** p0.config.province_data（须用 provinceData）外：
     * 整体替换 payload.value；形状须与该 slot 在 dashboard.store.json 中的 value 一致（如 p0.config.gen_progress 的 items、p0.config.production_base 等）。
     */
    configValue: z.record(z.string(), z.any()).optional(),
    /**
     * 第二页 p1.config.power_kpi / p1.config.wind_kpi：整组 KpiGlowBar 数据，写入 store payload.value.items
     * （字段见 widgets.manifest KpiGlowBar：label, value, max, unit, dir, iconId?, tone?）。
     */
    kpiGlowItems: z.array(z.record(z.string(), z.any())).optional(),
    /**
     * 折线/柱/饼/地图散点等 payload.kind === seriesRows 的整表替换（非 Table）。
     * 含：p0.chart.hours_trend、p0.chart.capacity、p0.chart.device_donut、p0.config.map_scatter；
     * p1.chart.power_realtime_seed、p1.chart.wind_speed_seed。行字段须与该图表 dataKey 列一致。
     */
    seedSeriesRows: z.array(z.record(z.string(), z.any())).optional(),
  })
  .strict();

export type TemplateSlotFill = z.infer<typeof templateSlotFillSchema>;

/** 模型常对「本轮不改」的槽位输出 null；装配语义等同于空对象 */
const templateSlotFillSchemaOrNull = z
  .union([templateSlotFillSchema, z.null()])
  .transform((v): z.infer<typeof templateSlotFillSchema> => v ?? {});

const panelHeadersSchema = z
  .object(
    WIND_PANEL_HEADER_KEYS.reduce(
      (acc, k) => {
        acc[k] = z.string().optional();
        return acc;
      },
      {} as Record<WindPanelHeaderKey, z.ZodOptional<z.ZodString>>
    )
  )
  .strict();

export const templateFillSchema = z
  .object({
    version: z.literal(1),
    templateId: z.literal(WIND_POWER_EMERALD_OPS_TEMPLATE_ID),
    /** 顶栏主标题（原「风电智慧运营」） */
    themeDocumentTitle: z.string().min(1),
    /** 各 slotId → 填空；仅允许出现在 slots.schema 中的 slotId（值可为 null，视为不改） */
    slots: z.record(z.string(), templateSlotFillSchemaOrNull).default({}),
    /** PanelShell 分区标题 */
    panelHeaders: panelHeadersSchema.optional(),
  })
  .strict();

export type TemplateFill = z.infer<typeof templateFillSchema>;

export function emptyTemplateFill(themeTitle = "风电智慧运营"): TemplateFill {
  return {
    version: 1,
    templateId: WIND_POWER_EMERALD_OPS_TEMPLATE_ID,
    themeDocumentTitle: themeTitle,
    slots: {},
  };
}

/** 从 AI 返回文本中解析 JSON（支持裸 JSON 或 ```json 围栏） */
export function parseTemplateFillFromModelText(raw: string): TemplateFill {
  const t = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  const jsonStr = fence ? fence[1].trim() : t;
  const parsed: unknown = JSON.parse(jsonStr);
  return templateFillSchema.parse(parsed);
}

/** 供 mock-slot / 预览 excerpt：短 Markdown */
export function templateFillToPagesStoryExcerpt(fill: TemplateFill): string {
  const lines: string[] = [
    `# 模板填空（${fill.templateId}）`,
    "",
    `- **主标题**：${fill.themeDocumentTitle}`,
    "",
    "## 槽位摘要",
    "",
  ];
  const ids = Object.keys(fill.slots).sort();
  for (const id of ids) {
    const s = fill.slots[id];
    const parts: string[] = [];
    if (s.title) parts.push(`title=${s.title}`);
    if (s.subtitle) parts.push(`subtitle=${s.subtitle}`);
    if (s.unit) parts.push(`unit=${s.unit}`);
    if (s.tableRows?.length) parts.push(`tableRows=${s.tableRows.length}条`);
    if (s.kpiGlowItems?.length) parts.push(`kpiGlowItems=${s.kpiGlowItems.length}项`);
    if (s.seedSeriesRows?.length) parts.push(`seedSeriesRows=${s.seedSeriesRows.length}点`);
    if (s.provinceData && typeof s.provinceData === "object" && Object.keys(s.provinceData).length > 0) {
      parts.push("provinceData=已填");
    }
    if (s.configValue && typeof s.configValue === "object" && Object.keys(s.configValue).length > 0) {
      parts.push("configValue=已填");
    }
    lines.push(`- **${id}**：${parts.length ? parts.join("；") : "（默认）"}`);
  }
  if (fill.panelHeaders) {
    lines.push("", "## 分区标题", "");
    for (const k of WIND_PANEL_HEADER_KEYS) {
      const v = fill.panelHeaders[k];
      if (v) lines.push(`- **${k}**：${v}`);
    }
  }
  return lines.join("\n");
}

export function validateSlotIdsAgainstSchema(
  fill: TemplateFill,
  allowedSlotIds: Set<string>
): void {
  for (const id of Object.keys(fill.slots)) {
    if (!allowedSlotIds.has(id)) {
      throw new Error(`template-fill 含未知 slotId: ${id}`);
    }
  }
}
