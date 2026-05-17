/**
 * 阶段二 AI 常把 config / 地图 / 表格数据写成非法 payload.kind；
 * 在 Zod 校验前归一为 store-fill 支持的别名（configValue、seedSeriesRows 等）。
 */

const PAYLOAD_KINDS = new Set(["seriesRows", "tableRows", "kpiValue", "selectOptions"]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function normalizePayloadKind(raw: string): string {
  const k = raw.trim();
  const lower = k.toLowerCase();
  if (PAYLOAD_KINDS.has(k)) return k;
  if (lower === "config" || lower === "configuration" || lower === "object") return "kpiValue";
  if (lower === "kpi" || lower === "metric") return "kpiValue";
  if (lower === "series" || lower === "chart" || lower === "line") return "seriesRows";
  if (lower === "table" || lower === "rows") return "tableRows";
  if (lower === "select" || lower === "options") return "selectOptions";
  return k;
}

function inferKindFromSlotId(
  slotId: string,
  value: unknown
): "seriesRows" | "tableRows" | "kpiValue" | "selectOptions" | null {
  if (Array.isArray(value)) {
    if (slotId.includes("table") || slotId.includes("alarm") || slotId.includes("device_log")) {
      return "tableRows";
    }
    return "seriesRows";
  }
  if (isPlainObject(value)) {
    if (slotId.endsWith("province_data")) return "kpiValue";
    if (slotId.includes("config")) return "kpiValue";
    return "kpiValue";
  }
  return null;
}

function normalizeStoreSlotRaw(slotId: string, raw: unknown): Record<string, unknown> {
  if (!isPlainObject(raw)) return {};
  const slot: Record<string, unknown> = { ...raw };

  const unwrapPayloadValue = (p: Record<string, unknown>): unknown =>
    p.value !== undefined ? p.value : p.data !== undefined ? p.data : p.rows;

  // 顶层误写为整段 payload 结构
  if (!slot.payload && PAYLOAD_KINDS.has(String(slot.kind ?? ""))) {
    slot.payload = { kind: slot.kind, value: slot.value ?? slot.data ?? slot.rows };
    delete slot.kind;
    delete slot.value;
    delete slot.data;
    delete slot.rows;
  }

  const payloadIn = slot.payload;
  if (isPlainObject(payloadIn)) {
    const p = { ...payloadIn };
    let kind = typeof p.kind === "string" ? normalizePayloadKind(p.kind) : "";
    const value = unwrapPayloadValue(p);

    if (!PAYLOAD_KINDS.has(kind)) {
      const inferred = inferKindFromSlotId(slotId, value);
      if (inferred) kind = inferred;
    }

    if (!PAYLOAD_KINDS.has(kind)) {
      // 无法修复的 payload → 按槽位拆到别名字段
      if (slotId.endsWith("province_data") && isPlainObject(value)) {
        slot.provinceData = slot.provinceData ?? value;
        delete slot.payload;
      } else if (
        slotId.endsWith("map_scatter") &&
        (Array.isArray(value) ||
          (isPlainObject(value) &&
            (Array.isArray((value as Record<string, unknown>).on) ||
              Array.isArray((value as Record<string, unknown>).off))))
      ) {
        slot.seedSeriesRows = slot.seedSeriesRows ?? value;
        delete slot.payload;
      } else if (slotId.includes("config") && isPlainObject(value)) {
        slot.configValue = slot.configValue ?? value;
        delete slot.payload;
      } else if (Array.isArray(value)) {
        if (kind === "tableRows" || slotId.includes("table")) {
          slot.tableRows = slot.tableRows ?? value;
        } else {
          slot.seedSeriesRows = slot.seedSeriesRows ?? value;
        }
        delete slot.payload;
      } else if (isPlainObject(value)) {
        slot.configValue = slot.configValue ?? value;
        delete slot.payload;
      } else {
        delete slot.payload;
      }
    } else {
      slot.payload = { kind, value };
    }
  }

  // config 槽位：仅有 value/items 等顶层键
  if (slotId.includes("config") && !slotId.endsWith("map_scatter") && !slotId.endsWith("province_data")) {
    if (!slot.configValue && !slot.payload && !slot.seedSeriesRows) {
      if (Array.isArray(slot.items)) {
        slot.configValue = { items: slot.items };
        delete slot.items;
      } else if (isPlainObject(slot.items) || isPlainObject(slot.capacity)) {
        const { items, capacity, plan, capacityBars, planBars, running, abnormal, ...rest } = slot;
        const cv: Record<string, unknown> = {};
        if (items !== undefined) cv.items = items;
        if (capacity !== undefined) cv.capacity = capacity;
        if (plan !== undefined) cv.plan = plan;
        if (capacityBars !== undefined) cv.capacityBars = capacityBars;
        if (planBars !== undefined) cv.planBars = planBars;
        if (running !== undefined) cv.running = running;
        if (abnormal !== undefined) cv.abnormal = abnormal;
        if (Object.keys(cv).length) {
          slot.configValue = cv;
          for (const k of Object.keys(cv)) delete slot[k];
        } else if (Object.keys(rest).length) {
          slot.configValue = rest;
        }
      }
    }
  }

  if (slotId.endsWith("province_data") && !slot.provinceData && isPlainObject(slot.provinces)) {
    slot.provinceData = { ...slot };
    for (const k of ["provinces", "defaultProvince", "header", "mapLegend", "regionCard"]) {
      if (k in slot && k !== "provinceData") delete slot[k];
    }
  }

  // 剔除 widgets 阶段字段（阶段二误写）
  for (const k of [
    "title",
    "subtitle",
    "unit",
    "xAxis",
    "yAxis",
    "xAxisLabel",
    "yAxisLabels",
    "nameField",
    "valueField",
    "columns",
    "seriesName",
  ]) {
    delete slot[k];
  }

  return slot;
}

/** 归一化阶段二模型 JSON，再交给 storeFillSchema.parse */
export function normalizeStoreFillParsed(parsed: unknown): unknown {
  if (!isPlainObject(parsed)) return parsed;
  const out: Record<string, unknown> = { ...parsed };
  const slotsIn = parsed.slots;
  if (!isPlainObject(slotsIn)) return parsed;

  const slotsOut: Record<string, unknown> = {};
  for (const [slotId, slotRaw] of Object.entries(slotsIn)) {
    if (slotRaw == null) {
      slotsOut[slotId] = null;
      continue;
    }
    slotsOut[slotId] = normalizeStoreSlotRaw(slotId, slotRaw);
  }
  out.slots = slotsOut;
  return out;
}
