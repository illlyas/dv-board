import type { DashboardWidgetsMap } from "@/lib/board/load-dashboard-widgets";
import type { SlotsSchemaFile } from "@/lib/board/wind-template-assembler";
import type { StoreFill, WidgetsFill } from "@/lib/board/template-fill-schema";
import { resolveSlotFillPayload } from "@/lib/board/template-fill-store";

export type SlotFieldContract = {
  slotId: string;
  widgetKey?: string;
  widgetType?: string;
  /** seriesRows 每行必须包含的键（顺序无关） */
  rowKeys?: string[];
  /** KPI payload.value 顶层键提示 */
  kpiValueShape?: string;
  /** Table 列 field */
  tableColumnFields?: string[];
  /** Donut/Pie nameField + valueField */
  nameField?: string;
  valueField?: string;
};

function getXField(props: Record<string, unknown>): string | undefined {
  const xa = props.xAxis;
  if (typeof xa === "string" && xa.trim()) return xa.trim();
  if (xa && typeof xa === "object" && !Array.isArray(xa)) {
    const f = (xa as { field?: string }).field;
    if (typeof f === "string" && f.trim()) return f.trim();
  }
  return undefined;
}

function getYFields(props: Record<string, unknown>): string[] {
  const ya = props.yAxis;
  if (!ya) return [];
  const list = Array.isArray(ya) ? ya : [ya];
  return list
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const f = (item as { field?: string }).field;
        return typeof f === "string" ? f.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
}

/** 从 widgets.json 条目 + 可选 widgets-fill 覆盖解析字段契约 */
export function extractSlotFieldContract(
  slotId: string,
  widgetKey: string | undefined,
  widgets: DashboardWidgetsMap,
  widgetsFillSlot?: Record<string, unknown>
): SlotFieldContract | null {
  if (!widgetKey) return null;
  const entry = widgets[widgetKey];
  if (!entry?.props) return null;

  const props = { ...(entry.props as Record<string, unknown>) };
  if (widgetsFillSlot) {
    if (widgetsFillSlot.xAxis && typeof widgetsFillSlot.xAxis === "object") {
      props.xAxis = widgetsFillSlot.xAxis;
    }
    if (widgetsFillSlot.yAxis) props.yAxis = widgetsFillSlot.yAxis;
    if (typeof widgetsFillSlot.nameField === "string") props.nameField = widgetsFillSlot.nameField;
    if (typeof widgetsFillSlot.valueField === "string") props.valueField = widgetsFillSlot.valueField;
    if (Array.isArray(widgetsFillSlot.columns)) props.columns = widgetsFillSlot.columns;
  }

  const contract: SlotFieldContract = {
    slotId,
    widgetKey,
    widgetType: entry.type,
  };

  const x = getXField(props);
  const ys = getYFields(props);
  if (x || ys.length) {
    contract.rowKeys = [...(x ? [x] : []), ...ys];
  }

  const nf = props.nameField;
  const vf = props.valueField;
  if (typeof nf === "string" && nf.trim()) contract.nameField = nf.trim();
  if (typeof vf === "string" && vf.trim()) contract.valueField = vf.trim();
  if (contract.nameField && contract.valueField) {
    contract.rowKeys = [contract.nameField, contract.valueField];
  }

  const cols = props.columns;
  if (Array.isArray(cols) && cols.length) {
    contract.tableColumnFields = cols
      .map((c) => {
        if (c && typeof c === "object" && !Array.isArray(c)) {
          const f = (c as { field?: string }).field;
          return typeof f === "string" ? f.trim() : "";
        }
        return "";
      })
      .filter(Boolean);
    if (contract.tableColumnFields.length) contract.rowKeys = contract.tableColumnFields;
  }

  const wt = (entry.type ?? "").toLowerCase();
  if (wt.includes("kpi") || wt.includes("metric")) {
    contract.kpiValueShape =
      "{ value, unit?, trend?, trendValue?, comparison?, subtitle? } — 数值字段名与 Story 一致，装配为 payload.kind=kpiValue";
  }

  return contract;
}

export function buildFieldContractsFromWidgetsFill(
  widgetsFill: WidgetsFill,
  schema: SlotsSchemaFile,
  templateWidgets: DashboardWidgetsMap,
  slotToWidget: Map<string, string>
): SlotFieldContract[] {
  const out: SlotFieldContract[] = [];
  for (const s of schema.slots) {
    if (!s.widgetKey) continue;
    const fillSlot = widgetsFill.slots[s.slotId];
    const c = extractSlotFieldContract(
      s.slotId,
      s.widgetKey,
      templateWidgets,
      fillSlot as Record<string, unknown> | undefined
    );
    if (c) out.push(c);
  }
  return out;
}

export function buildStoreFieldContractPrompt(contracts: SlotFieldContract[]): string {
  if (!contracts.length) return "（无平台 Widget 数据槽）";
  return contracts
    .map((c) => {
      const parts: string[] = [`- **${c.slotId}**（${c.widgetType ?? "Widget"}）`];
      if (c.rowKeys?.length) {
        parts.push(`  - 行对象**必须且仅能**使用下列字段键：\`${c.rowKeys.join("`, `")}\``);
      }
      if (c.kpiValueShape) parts.push(`  - KPI：${c.kpiValueShape}`);
      if (c.tableColumnFields?.length) {
        parts.push(`  - 表格列 field：\`${c.tableColumnFields.join("`, `")}\``);
      }
      return parts.join("\n");
    })
    .join("\n");
}

function firstSeriesRow(storeSlot: Record<string, unknown> | undefined): Record<string, unknown> | null {
  if (!storeSlot) return null;
  const rows = storeSlot.seedSeriesRows ?? storeSlot.tableRows;
  if (!Array.isArray(rows) || !rows.length) return null;
  const first = rows[0];
  if (first && typeof first === "object" && !Array.isArray(first)) {
    return first as Record<string, unknown>;
  }
  return null;
}

/** 装配前校验 store 行字段与 widgets 契约一致 */
export function validateStoreFillAgainstWidgets(
  storeFill: StoreFill,
  contracts: SlotFieldContract[]
): void {
  const bySlot = new Map(contracts.map((c) => [c.slotId, c]));

  for (const [slotId, slot] of Object.entries(storeFill.slots)) {
    const contract = bySlot.get(slotId);
    if (!contract?.rowKeys?.length) continue;

    const row = firstSeriesRow(slot as Record<string, unknown>);
    if (!row) continue;

    const required = new Set(contract.rowKeys);
    const missing = [...required].filter((k) => row[k] === undefined || row[k] === null);
    if (missing.length) {
      throw new Error(
        `store-fill 槽位 ${slotId} 的首行缺少 widgets 契约字段：${missing.join(", ")}（需要：${contract.rowKeys.join(", ")}）`
      );
    }

    const extra = Object.keys(row).filter((k) => !required.has(k));
    if (extra.length > 5) {
      console.warn(`[validateStoreFill] ${slotId} 行含额外字段（可忽略）：${extra.join(", ")}`);
    }
  }
}

/** 从 store-fill 单槽解析 seriesRows 首行（用于校验） */
export function getStoreFillSeriesSample(
  slotId: string,
  storeFill: StoreFill
): Record<string, unknown> | null {
  const slot = storeFill.slots[slotId];
  if (!slot) return null;
  const payload = resolveSlotFillPayload(slot);
  if (payload?.kind === "seriesRows" && Array.isArray(payload.value) && payload.value[0]) {
    const r = payload.value[0];
    if (r && typeof r === "object" && !Array.isArray(r)) return r as Record<string, unknown>;
  }
  return firstSeriesRow(slot as Record<string, unknown>);
}
