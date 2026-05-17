import {
  normalizeProductionBaseConfigValue,
  normalizeWorkOrdersConfigValue,
} from "@/lib/board/config-field-contract";
import type { DashboardStorePayload } from "@/types/dashboard-store.types";
import {
  normalizeMapScatterValue,
  normalizeProvinceDataValue,
} from "@/lib/board/province-map-normalize";

type PropsSnap = Record<string, unknown>;

function getXField(props: PropsSnap): string | null {
  const xa = props.xAxis;
  if (typeof xa === "string" && xa.trim()) return xa.trim();
  if (xa && typeof xa === "object" && !Array.isArray(xa)) {
    const f = (xa as { field?: string }).field;
    if (typeof f === "string" && f.trim()) return f.trim();
  }
  return null;
}

function getYFields(props: PropsSnap): string[] {
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

function normalizePercentStatBlock(
  block: unknown,
  fallbackLabel: string
): { label: string; current: number; total: number } {
  if (block && typeof block === "object" && !Array.isArray(block)) {
    const o = block as Record<string, unknown>;
    if ("current" in o || "total" in o) {
      const current = Number(o.current);
      const total = Number(o.total);
      return {
        label: String(o.label ?? fallbackLabel),
        current: Number.isFinite(current) ? current : 0,
        total: Number.isFinite(total) && total > 0 ? total : Math.max(1, Number.isFinite(current) ? current : 1),
      };
    }
  }
  if (typeof block === "string" && block.trim()) {
    const nums = [...block.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
    const label = block.includes(":") ? block.split(":")[0]!.trim() : fallbackLabel;
    const current = nums[0] ?? 0;
    const total = nums[1] ?? (current > 0 ? current : 1);
    return { label, current, total };
  }
  return { label: fallbackLabel, current: 0, total: 1 };
}

/** p0.config.production_base — 圆环 KpiPercentStat + 滚动条 KpiGlowBar（bars 须 value/max） */
function normalizeProductionBaseValue(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      capacity: { label: "产能", current: 0, total: 1 },
      capacityBars: [],
      plan: { label: "计划", current: 0, total: 1 },
      planBars: [],
    };
  }
  try {
    return normalizeProductionBaseConfigValue(value);
  } catch {
    const v = { ...(value as Record<string, unknown>) };
    v.capacity = normalizePercentStatBlock(v.capacity, "产能达成");
    v.plan = normalizePercentStatBlock(v.plan, "计划达成");
    if (!Array.isArray(v.capacityBars)) v.capacityBars = [];
    if (!Array.isArray(v.planBars)) v.planBars = [];
    return v;
  }
}

const MAINTENANCE_GAUGE_ICONS = ["kpi-sync-refresh", "kpi-analytics-bars", "kpi-pharmacy"] as const;

/** p0.config.maintenance_metrics — 对齐 KpiGaugeStat（title/iconId/tone，非 KpiGlowBar 的 label/max） */
function normalizeMaintenanceMetricsValue(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { items: [] };
  }
  const v = value as Record<string, unknown>;
  const itemsIn = Array.isArray(v.items) ? v.items : [];
  const items = itemsIn
    .map((raw, i) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
      const o = raw as Record<string, unknown>;
      const title = String(o.title ?? o.label ?? o.name ?? "").trim();
      let displayValue: string;
      const n = Number(o.value);
      if (Number.isFinite(n)) {
        displayValue = Number.isInteger(n) ? String(n) : n.toFixed(1);
      } else if (o.value != null && String(o.value).trim()) {
        displayValue = String(o.value).trim();
      } else {
        displayValue = "0";
      }
      const tone =
        o.tone === "warning" || o.tone === "neutral" ? o.tone : ("success" as const);
      const iconId =
        typeof o.iconId === "string" && o.iconId.trim()
          ? o.iconId.trim()
          : MAINTENANCE_GAUGE_ICONS[i % MAINTENANCE_GAUGE_ICONS.length];
      return {
        iconId,
        title,
        value: displayValue,
        unit: String(o.unit ?? "").trim(),
        tone,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);
  return { items };
}

/** 将 AI 常见的 name/value 行映射到 propsSnapshot 的 xAxis / yAxis 字段 */
function normalizeSeriesRows(value: unknown[], props: PropsSnap): unknown[] {
  if (!value.length) return value;

  const nameField =
    typeof props.nameField === "string" && props.nameField.trim()
      ? props.nameField.trim()
      : "name";
  const valueField =
    typeof props.valueField === "string" && props.valueField.trim()
      ? props.valueField.trim()
      : "value";

  const xField = getXField(props);
  const yFields = getYFields(props);

  if (!xField && yFields.length === 0) {
    const sample = value[0] as Record<string, unknown>;
    if (nameField in sample && valueField in sample) return value;
    return value;
  }

  return value.map((row) => {
    const r = { ...(row as Record<string, unknown>) };

    if (xField) {
      if (r[xField] == null) {
        const xAlias =
          r.line ??
          r.name ??
          r.category ??
          r.label ??
          r.date ??
          r.time ??
          r.month ??
          r.station ??
          r.x;
        if (xAlias != null) r[xField] = xAlias;
      }
    }

    if (yFields.length > 0) {
      const primary = yFields[0]!;
      if (r[primary] == null) {
        const v =
          r.actual ??
          r.output ??
          r.amount ??
          r.power ??
          r.amount ??
          r.value ??
          r[primary];
        if (typeof v === "number" && Number.isFinite(v)) r[primary] = v;
        else if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) r[primary] = Number(v);
      }
      for (let i = 1; i < yFields.length; i++) {
        const yf = yFields[i]!;
        if (r[yf] != null) continue;
        const alias =
          i === 1
            ? (r.series_secondary ?? r.plan_power ?? r.capacity ?? r.target ?? r.plan ?? r.planned ?? r.design ?? r.committed)
            : (r.target ?? r.plan ?? r.planned ?? r.design);
        if (typeof alias === "number" && Number.isFinite(alias)) {
          r[yf] = alias;
          continue;
        }
        if (typeof alias === "string" && alias.trim() && !Number.isNaN(Number(alias))) {
          r[yf] = Number(alias);
          continue;
        }
        const base = Number(r[primary]);
        if (Number.isFinite(base)) {
          r[yf] = Math.round(base * (0.88 + (i % 3) * 0.04));
        }
      }
    } else if (nameField && valueField) {
      if (r[nameField] == null && r.name != null) r[nameField] = r.name;
      if (r[valueField] == null && r.value != null) r[valueField] = r.value;
    }

    return r;
  });
}

/**
 * 按组件类型与 propsSnapshot 修正 store payload，避免 AI 字段名/结构与 widgets 不一致导致空白。
 */
export function normalizeStorePayload(
  payload: DashboardStorePayload,
  widgetType: string,
  propsSnapshot: PropsSnap,
  slotId?: string
): DashboardStorePayload {
  const wt = widgetType.trim();
  const sid = slotId?.trim() ?? "";

  if (payload.kind === "kpiValue" && (sid.endsWith("production_base") || sid.includes("production_base"))) {
    return {
      kind: "kpiValue",
      value: normalizeProductionBaseValue(payload.value),
    };
  }

  if (payload.kind === "kpiValue" && sid.endsWith("province_data")) {
    return {
      kind: "kpiValue",
      value: normalizeProvinceDataValue(payload.value),
    };
  }

  if (payload.kind === "kpiValue" && sid.endsWith("maintenance_metrics")) {
    return {
      kind: "kpiValue",
      value: normalizeMaintenanceMetricsValue(payload.value),
    };
  }

  if (payload.kind === "kpiValue" && sid.endsWith("work_orders")) {
    return {
      kind: "kpiValue",
      value: normalizeWorkOrdersConfigValue(payload.value),
    };
  }

  if (payload.kind === "seriesRows" && sid.endsWith("map_scatter")) {
    return {
      kind: "seriesRows",
      value: normalizeMapScatterValue(payload.value),
    };
  }

  if (payload.kind === "seriesRows" && Array.isArray(payload.value)) {
    const chartTypes = ["LineChart", "BarChart", "AreaChart", "DonutChart", "PieChart", "ColumnChart"];
    if (chartTypes.some((t) => wt.toLowerCase() === t.toLowerCase()) || wt === "Config") {
      return {
        kind: "seriesRows",
        value: normalizeSeriesRows(payload.value, propsSnapshot),
      };
    }
  }

  return payload;
}
