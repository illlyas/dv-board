import { WIND_PANEL_DEFAULT_TITLES } from "@/lib/board/wind-panels";
import {
  WIND_PANEL_HEADER_KEYS,
  type WindPanelHeaderKey,
} from "@/lib/board/wind-panels-keys";
import type { SlotsSchemaFile } from "@/lib/board/wind-template-assembler";

/** PanelShell 标题：与 slots.schema.json 的 panelHeaders 字段同结构 */
export type DashboardPanelHeadersMap = Record<WindPanelHeaderKey, string>;

export function panelHeadersFromSlotsSchema(
  schema: Pick<SlotsSchemaFile, "panelHeaders"> | null | undefined
): Partial<DashboardPanelHeadersMap> | null {
  const ph = schema?.panelHeaders;
  if (!ph || typeof ph !== "object" || Array.isArray(ph)) return null;
  return ph as Partial<DashboardPanelHeadersMap>;
}

export function parsePanelHeadersFromSlotsSchemaJson(raw: string): Partial<DashboardPanelHeadersMap> | null {
  const t = raw?.trim();
  if (!t) return null;
  try {
    const parsed = JSON.parse(t) as SlotsSchemaFile;
    return panelHeadersFromSlotsSchema(parsed);
  } catch {
    return null;
  }
}

/** 以 slots.schema panelHeaders（或内置默认）为底，合并运行时覆盖 */
export function resolveDashboardPanelHeaders(
  parsed?: Partial<DashboardPanelHeadersMap> | null
): DashboardPanelHeadersMap {
  const out = { ...WIND_PANEL_DEFAULT_TITLES };
  if (!parsed || typeof parsed !== "object") return out;
  for (const k of WIND_PANEL_HEADER_KEYS) {
    const v = parsed[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return out;
}
