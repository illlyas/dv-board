import { z } from "zod";
import { normalizeStoreFillParsed } from "@/lib/board/store-fill-normalize";
import { WIND_POWER_EMERALD_OPS_TEMPLATE_ID } from "@/lib/board/wind-template-id";
import type { WindPanelHeaderKey } from "@/lib/board/wind-panels-keys";
import { WIND_PANEL_HEADER_KEYS } from "@/lib/board/wind-panels-keys";

const dashboardStorePayloadSchema = z.object({
  kind: z.enum(["seriesRows", "tableRows", "kpiValue", "selectOptions"]),
  value: z.unknown(),
});

export const axisFieldSchema = z.object({
  field: z.string().min(1),
  label: z.string().optional(),
  color: z.string().optional(),
});

const columnFieldSchema = z.object({
  field: z.string().min(1),
  label: z.string().optional(),
});

/** 阶段一：仅 widgets.json 展示与取数字段契约 */
export const widgetsSlotFillSchema = z
  .object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    unit: z.string().optional(),
    xAxisLabel: z.string().optional(),
    yAxisLabels: z.array(z.string()).optional(),
    /** 笛卡尔图 X 轴字段名（写入 widgets.json xAxis.field） */
    xAxis: axisFieldSchema.optional(),
    /** 笛卡尔图 Y 轴字段名（写入 widgets.json yAxis[].field） */
    yAxis: z.array(axisFieldSchema).optional(),
    nameField: z.string().optional(),
    valueField: z.string().optional(),
    columns: z.array(columnFieldSchema).optional(),
    seriesName: z.string().optional(),
  })
  .strip();

export type WidgetsSlotFill = z.infer<typeof widgetsSlotFillSchema>;

/** 阶段二：仅 dashboard.store.json 业务数据 */
export const storeSlotFillSchema = z
  .object({
    payload: dashboardStorePayloadSchema.optional(),
    configValue: z.record(z.string(), z.unknown()).optional(),
    seedSeriesRows: z.array(z.record(z.string(), z.unknown())).optional(),
    tableRows: z.array(z.record(z.string(), z.unknown())).optional(),
    provinceData: z.record(z.string(), z.unknown()).optional(),
    kpiGlowItems: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .strip();

export type StoreSlotFill = z.infer<typeof storeSlotFillSchema>;

/** 单个槽位：文案（→ widgets.json）+ 业务数据（→ dashboard.store.json） */
export const templateSlotFillSchema = widgetsSlotFillSchema.merge(storeSlotFillSchema);

export type TemplateSlotFill = z.infer<typeof templateSlotFillSchema>;

const templateSlotFillSchemaOrNull = z
  .union([templateSlotFillSchema, z.null()])
  .transform((v): TemplateSlotFill => v ?? {});

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
    themeDocumentTitle: z.string().min(1),
    slots: z.record(z.string(), templateSlotFillSchemaOrNull).default({}),
    panelHeaders: panelHeadersSchema.optional(),
  })
  .strict();

export type TemplateFill = z.infer<typeof templateFillSchema>;

const widgetsSlotFillSchemaOrNull = z
  .union([widgetsSlotFillSchema, z.null()])
  .transform((v): WidgetsSlotFill => v ?? {});

const storeSlotFillSchemaOrNull = z
  .union([storeSlotFillSchema, z.null()])
  .transform((v): StoreSlotFill => v ?? {});

export const widgetsFillSchema = z
  .object({
    version: z.literal(1),
    phase: z.literal("widgets"),
    templateId: z.literal(WIND_POWER_EMERALD_OPS_TEMPLATE_ID),
    themeDocumentTitle: z.string().min(1),
    slots: z.record(z.string(), widgetsSlotFillSchemaOrNull).default({}),
    panelHeaders: panelHeadersSchema.optional(),
  })
  .strict();

export type WidgetsFill = z.infer<typeof widgetsFillSchema>;

export const storeFillSchema = z
  .object({
    version: z.literal(1),
    phase: z.literal("store"),
    templateId: z.literal(WIND_POWER_EMERALD_OPS_TEMPLATE_ID),
    slots: z.record(z.string(), storeSlotFillSchemaOrNull).default({}),
  })
  .strict();

export type StoreFill = z.infer<typeof storeFillSchema>;

function parseJsonFromModelText(raw: string): unknown {
  const t = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  const jsonStr = fence ? fence[1].trim() : t;
  return JSON.parse(jsonStr);
}

export function parseWidgetsFillFromModelText(raw: string): WidgetsFill {
  const parsed = parseJsonFromModelText(raw);
  return widgetsFillSchema.parse(parsed);
}

export function parseStoreFillFromModelText(raw: string): StoreFill {
  const parsed = parseJsonFromModelText(raw);
  return storeFillSchema.parse(normalizeStoreFillParsed(parsed));
}

/** 合并两阶段产物为 template-fill（供装配与 pages-story） */
const STORE_SLOT_KEYS = [
  "payload",
  "configValue",
  "seedSeriesRows",
  "tableRows",
  "provinceData",
  "kpiGlowItems",
] as const;

/** 从合并后的 template-fill 拆出 store 阶段产物（供校验） */
export function storeFillFromTemplateFill(fill: TemplateFill): StoreFill {
  const slots: Record<string, StoreSlotFill> = {};
  for (const [slotId, slot] of Object.entries(fill.slots)) {
    const out: StoreSlotFill = {};
    for (const k of STORE_SLOT_KEYS) {
      const v = slot[k as keyof TemplateSlotFill];
      if (v !== undefined) (out as Record<string, unknown>)[k] = v;
    }
    if (Object.keys(out).length) slots[slotId] = out;
  }
  return {
    version: 1,
    phase: "store",
    templateId: WIND_POWER_EMERALD_OPS_TEMPLATE_ID,
    slots,
  };
}

export function widgetsFillFromTemplateFill(fill: TemplateFill): WidgetsFill {
  const slots: Record<string, WidgetsSlotFill> = {};
  for (const [slotId, slot] of Object.entries(fill.slots)) {
    const {
      payload: _p,
      configValue: _c,
      seedSeriesRows: _s,
      tableRows: _t,
      provinceData: _pd,
      kpiGlowItems: _k,
      ...widgetsPart
    } = slot;
    if (Object.keys(widgetsPart).length) slots[slotId] = widgetsPart;
  }
  return {
    version: 1,
    phase: "widgets",
    templateId: WIND_POWER_EMERALD_OPS_TEMPLATE_ID,
    themeDocumentTitle: fill.themeDocumentTitle,
    panelHeaders: fill.panelHeaders,
    slots,
  };
}

export function mergeWidgetsAndStoreFill(widgetsFill: WidgetsFill, storeFill: StoreFill): TemplateFill {
  const slotIds = new Set([
    ...Object.keys(widgetsFill.slots),
    ...Object.keys(storeFill.slots),
  ]);
  const slots: Record<string, TemplateSlotFill> = {};
  for (const slotId of slotIds) {
    slots[slotId] = {
      ...(widgetsFill.slots[slotId] ?? {}),
      ...(storeFill.slots[slotId] ?? {}),
    };
  }
  return {
    version: 1,
    templateId: WIND_POWER_EMERALD_OPS_TEMPLATE_ID,
    themeDocumentTitle: widgetsFill.themeDocumentTitle,
    panelHeaders: widgetsFill.panelHeaders,
    slots,
  };
}

export function emptyTemplateFill(themeTitle = "运营监控中心"): TemplateFill {
  return {
    version: 1,
    templateId: WIND_POWER_EMERALD_OPS_TEMPLATE_ID,
    themeDocumentTitle: themeTitle,
    slots: {},
  };
}

export function parseTemplateFillFromModelText(raw: string): TemplateFill {
  return templateFillSchema.parse(parseJsonFromModelText(raw));
}

export function templateFillToPagesStoryExcerpt(fill: TemplateFill): string {
  const lines: string[] = [
    `# 模板填空（${fill.templateId}）`,
    "",
    `- **主标题**：${fill.themeDocumentTitle}`,
    "",
    "## 平台 Widget 槽位（→ widgets.json）",
    "",
  ];
  const ids = Object.keys(fill.slots).sort();
  for (const id of ids) {
    const s = fill.slots[id];
    const parts: string[] = [];
    if (s.title) parts.push(`title=${s.title}`);
    if (s.subtitle) parts.push(`subtitle=${s.subtitle}`);
    if (s.unit) parts.push(`unit=${s.unit}`);
    if (s.xAxis?.field) parts.push(`xField=${s.xAxis.field}`);
    if (s.yAxis?.length) parts.push(`yFields=${s.yAxis.map((y) => y.field).join("、")}`);
    if (s.xAxisLabel) parts.push(`xAxisLabel=${s.xAxisLabel}`);
    if (s.yAxisLabels?.length) parts.push(`yAxisLabels=${s.yAxisLabels.join("、")}`);
    if (s.nameField) parts.push(`nameField=${s.nameField}`);
    if (s.valueField) parts.push(`valueField=${s.valueField}`);
    if (s.seriesName) parts.push(`seriesName=${s.seriesName}`);
    const hasData =
      s.payload != null ||
      s.configValue != null ||
      s.seedSeriesRows != null ||
      s.tableRows != null ||
      s.provinceData != null ||
      s.kpiGlowItems != null;
    if (hasData) parts.push("store=已填");
    lines.push(`- **${id}**：${parts.length ? parts.join("；") : "（默认）"}`);
  }
  if (fill.panelHeaders) {
    lines.push("", "## 分区标题（→ slots.schema panelHeaders）", "");
    for (const k of WIND_PANEL_HEADER_KEYS) {
      const v = fill.panelHeaders[k];
      if (v) lines.push(`- **${k}**：${v}`);
    }
  }
  return lines.join("\n");
}

function normalizeSlotKeys<T extends { slots: Record<string, unknown> }>(
  fill: T,
  slots: ReadonlyArray<{ slotId: string; widgetKey?: string }>
): T {
  const allowedSlotIds = new Set(slots.map((s) => s.slotId));
  const widgetKeyToSlotId = new Map<string, string>();
  for (const s of slots) {
    if (s.widgetKey) widgetKeyToSlotId.set(s.widgetKey, s.slotId);
  }

  const normalizedSlots: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(fill.slots)) {
    const slotFill = raw ?? {};
    let slotId = key;
    if (!allowedSlotIds.has(slotId)) {
      const mapped = widgetKeyToSlotId.get(key);
      if (mapped) slotId = mapped;
    }
    if (!allowedSlotIds.has(slotId)) continue;
    normalizedSlots[slotId] = { ...(normalizedSlots[slotId] as object), ...slotFill };
  }
  return { ...fill, slots: normalizedSlots } as T;
}

export function normalizeWidgetsFillSlotKeys(
  fill: WidgetsFill,
  slots: ReadonlyArray<{ slotId: string; widgetKey?: string }>
): WidgetsFill {
  return normalizeSlotKeys(fill, slots);
}

export function normalizeStoreFillSlotKeys(
  fill: StoreFill,
  slots: ReadonlyArray<{ slotId: string; widgetKey?: string }>
): StoreFill {
  return normalizeSlotKeys(fill, slots);
}

/** 将 AI 误用的 widgetKey（如 p0_kpi_hero_01）映射为 slotId（如 p0.kpi.hero_01） */
export function normalizeTemplateFillSlotKeys(
  fill: TemplateFill,
  slots: ReadonlyArray<{ slotId: string; widgetKey?: string }>
): TemplateFill {
  return normalizeSlotKeys(fill, slots);
}

export function validateSlotIdsAgainstSchema(
  fill: TemplateFill,
  allowedSlotIds: Set<string>,
  widgetKeyToSlotId?: ReadonlyMap<string, string>
): void {
  for (const id of Object.keys(fill.slots)) {
    if (!allowedSlotIds.has(id)) {
      const mapped = widgetKeyToSlotId?.get(id);
      const hint = mapped
        ? `（${id} 是 widgetKey，应使用 slotId「${mapped}」）`
        : "";
      throw new Error(`template-fill 含未知 slotId: ${id}${hint}`);
    }
  }
}
