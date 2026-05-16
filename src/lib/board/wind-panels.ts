import windSlotsSchema from "../../../board-templates/wind-power-emerald-ops/slots.schema.json";
import {
  WIND_PANEL_HEADER_KEYS,
  type WindPanelHeaderKey,
} from "@/lib/board/wind-panels-keys";

export { WIND_PANEL_HEADER_KEYS, type WindPanelHeaderKey } from "@/lib/board/wind-panels-keys";

function readDefaultTitlesFromSchema(): Record<WindPanelHeaderKey, string> {
  const ph = (windSlotsSchema as { panelHeaders?: Record<string, string> }).panelHeaders ?? {};
  const out = {} as Record<WindPanelHeaderKey, string>;
  for (const k of WIND_PANEL_HEADER_KEYS) {
    const v = ph[k];
    out[k] = typeof v === "string" && v.trim() ? v.trim() : k;
  }
  return out;
}

/** 模板 slots.schema.json panelHeaders 中的默认标题 */
export const WIND_PANEL_DEFAULT_TITLES = readDefaultTitlesFromSchema();
