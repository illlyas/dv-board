import type { DashboardStoreFile } from "@/types/dashboard-store.types";
import type { TemplateFill, TemplateSlotFill } from "@/lib/board/template-fill-schema";
import {
  applyTemplateFillToStore,
  ensureStoreHasTemplateSkeleton,
} from "@/lib/board/template-fill-store";
import type { DashboardWidgetsMap } from "@/lib/board/load-dashboard-widgets";
import { panelHeadersFromSlotsSchema } from "@/lib/board/load-dashboard-panel-headers";
import { WIND_PANEL_HEADER_KEYS } from "@/lib/board/wind-panels-keys";
import type { WindPanelHeaderKey } from "@/lib/board/wind-panels-keys";
import { WIND_TEMPLATE_MARKER } from "@/lib/board/wind-template-id";

const DEFAULT_HERO_TITLE = "运营监控中心";

export type SlotsSchemaFile = {
  slots: Array<{
    slotId: string;
    widgetKey?: string;
    kind?: string;
    surface?: string;
    dataShape?: string;
    fill?: string | Record<string, unknown>;
    notes?: string;
    pageIndex?: number;
  }>;
  panelHeaders?: Partial<Record<WindPanelHeaderKey, string>>;
  panelShellBindings?: Array<{
    key: string;
    component: string;
    pageIndex: number;
    region: string;
  }>;
};

export type WidgetsManifestFile = {
  templateId?: string;
  description?: string;
  components?: Array<{
    importName: string;
    file?: string;
    role?: string;
    props?: Record<string, string>;
  }>;
  platformWidgetsUsed?: string[];
  widgetsConfigFile?: string;
};

export function slotIdToWidgetKeyMap(schema: SlotsSchemaFile): Map<string, string> {
  const m = new Map<string, string>();
  for (const s of schema.slots) {
    if (s.widgetKey) m.set(s.slotId, s.widgetKey);
  }
  return m;
}

function ensureTemplateMarker(jsx: string): string {
  if (jsx.includes("@dv-template:")) return jsx;
  return `${WIND_TEMPLATE_MARKER}\n${jsx}`;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 仅替换顶栏主标题字符串（props 在 widgets.json，不在 JSX 内嵌） */
export function applyThemeTitleToDashboardJsx(jsx: string, fill: TemplateFill): string {
  let out = ensureTemplateMarker(jsx);
  const title = fill.themeDocumentTitle?.trim() || DEFAULT_HERO_TITLE;
  out = out.replace(
    new RegExp(`\\{\\s*"${escapeRegExp(DEFAULT_HERO_TITLE)}"\\s*\\}`),
    `{${JSON.stringify(title)}}`
  );
  return out;
}

function mergeSlotFillIntoWidgetProps(
  props: Record<string, unknown>,
  slotFill: TemplateSlotFill
): void {
  if (slotFill.title !== undefined) props.title = slotFill.title;
  if (slotFill.subtitle !== undefined) props.subtitle = slotFill.subtitle;
  if (slotFill.unit !== undefined) props.unit = slotFill.unit;

  if (slotFill.xAxis) {
    const xa = props.xAxis;
    const base =
      xa && typeof xa === "object" && !Array.isArray(xa)
        ? { ...(xa as Record<string, unknown>) }
        : {};
    props.xAxis = { ...base, ...slotFill.xAxis };
  } else if (slotFill.xAxisLabel !== undefined) {
    const xa = props.xAxis;
    if (xa && typeof xa === "object" && !Array.isArray(xa)) {
      props.xAxis = { ...(xa as Record<string, unknown>), label: slotFill.xAxisLabel };
    } else {
      props.xAxis = { label: slotFill.xAxisLabel };
    }
  }

  if (slotFill.yAxis?.length) {
    const ya = props.yAxis;
    const baseArr = Array.isArray(ya) ? ya : [];
    props.yAxis = slotFill.yAxis.map((axis, i) => {
      const prev = baseArr[i];
      const prevObj =
        prev && typeof prev === "object" && !Array.isArray(prev)
          ? { ...(prev as Record<string, unknown>) }
          : {};
      return { ...prevObj, ...axis };
    });
  } else if (slotFill.yAxisLabels?.length) {
    const ya = props.yAxis;
    if (Array.isArray(ya)) {
      for (let i = 0; i < slotFill.yAxisLabels.length && i < ya.length; i++) {
        const item = ya[i];
        if (item && typeof item === "object" && !Array.isArray(item)) {
          (item as Record<string, unknown>).label = slotFill.yAxisLabels[i];
        }
      }
    }
  }

  if (slotFill.nameField !== undefined) props.nameField = slotFill.nameField;
  if (slotFill.valueField !== undefined) props.valueField = slotFill.valueField;
  if (slotFill.columns?.length) {
    const cols = props.columns;
    const baseArr = Array.isArray(cols) ? cols : [];
    props.columns = slotFill.columns.map((col, i) => {
      const prev = baseArr[i];
      const prevObj =
        prev && typeof prev === "object" && !Array.isArray(prev)
          ? { ...(prev as Record<string, unknown>) }
          : {};
      return { ...prevObj, ...col };
    });
  }
  if (slotFill.seriesName !== undefined) {
    const cur = props.echartsOptionOverrides;
    const base =
      cur && typeof cur === "object" && !Array.isArray(cur)
        ? { ...(cur as Record<string, unknown>) }
        : {};
    const seriesRaw = base.series;
    const series = Array.isArray(seriesRaw) ? [...seriesRaw] : [{}];
    const first =
      series[0] && typeof series[0] === "object" && !Array.isArray(series[0])
        ? { ...(series[0] as Record<string, unknown>) }
        : {};
    first.name = slotFill.seriesName;
    series[0] = first;
    base.series = series;
    props.echartsOptionOverrides = base;
  }
}

/** 将 template-fill 合并进 widgets.json（仅含 widgetKey 的 slot） */
export function applyTemplateFillToWidgetsJson(
  widgets: DashboardWidgetsMap,
  fill: TemplateFill,
  slotToWidget: Map<string, string>
): DashboardWidgetsMap {
  const next = structuredClone(widgets) as DashboardWidgetsMap;
  for (const [slotId, slotFill] of Object.entries(fill.slots)) {
    const wk = slotToWidget.get(slotId);
    if (!wk || !next[wk]) continue;
    const entry = next[wk];
    entry.props = { ...entry.props };
    mergeSlotFillIntoWidgetProps(entry.props, slotFill);
  }
  return next;
}

export function parseWidgetsJson(raw: string): DashboardWidgetsMap {
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("widgets.json 须为对象");
  }
  return parsed as DashboardWidgetsMap;
}

/** 将 template-fill 中的 panelHeaders 合并进 slots.schema.json */
export function applyTemplateFillToSlotsSchemaJson(
  slotsSchemaJson: string,
  fill: TemplateFill
): string {
  const schema = JSON.parse(slotsSchemaJson) as SlotsSchemaFile;
  if (fill.panelHeaders) {
    const base = panelHeadersFromSlotsSchema(schema) ?? {};
    const merged = { ...base };
    for (const k of WIND_PANEL_HEADER_KEYS) {
      const nv = fill.panelHeaders[k];
      if (typeof nv === "string" && nv.trim()) merged[k] = nv.trim();
    }
    schema.panelHeaders = merged;
  }
  return JSON.stringify(schema, null, 2);
}

/**
 * 将 template-fill 业务数据写入模板 store 骨架（覆盖模板示例 payload，未填槽位清空 payload）。
 */
export function mergeTemplateFillIntoStore(
  templateStore: DashboardStoreFile,
  fill: TemplateFill
): DashboardStoreFile {
  const withSkeleton = ensureStoreHasTemplateSkeleton(templateStore, templateStore);
  return applyTemplateFillToStore(withSkeleton, fill);
}

export function countStoreComponents(store: DashboardStoreFile): number {
  return store.pages.reduce((n, p) => n + p.components.length, 0);
}
