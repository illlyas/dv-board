/** 语义化 KPI 预设图标 id（生成 JSX / 配置优先使用） */
export const KPI_PRESET_ICON_IDS_SEMANTIC = [
  "kpi-sync-refresh",
  "kpi-analytics-bars",
  "kpi-insight-badge",
  "kpi-capsule",
  "kpi-pharmacy",
  "kpi-package",
] as const;

export type KpiPresetIconIdSemantic = (typeof KPI_PRESET_ICON_IDS_SEMANTIC)[number];

/** 旧版数字 id，仍解析到同一套图标 */
export const KPI_PRESET_ICON_IDS_LEGACY = [
  "preset-icon-1",
  "preset-icon-2",
  "preset-icon-3",
  "preset-icon-4",
  "preset-icon-5",
  "preset-icon-6",
] as const;

export const BOARD_PRESET_ICON_IDS = [
  ...KPI_PRESET_ICON_IDS_SEMANTIC,
  ...KPI_PRESET_ICON_IDS_LEGACY,
] as const;

export type BoardPresetIconId = (typeof BOARD_PRESET_ICON_IDS)[number];

export const DEFAULT_BOARD_PRESET_ICON_ID: BoardPresetIconId = "kpi-sync-refresh";

const LEGACY_TO_SEMANTIC: Record<string, KpiPresetIconIdSemantic> = {
  "preset-icon-1": "kpi-sync-refresh",
  "preset-icon-2": "kpi-analytics-bars",
  "preset-icon-3": "kpi-insight-badge",
  "preset-icon-4": "kpi-capsule",
  "preset-icon-5": "kpi-pharmacy",
  "preset-icon-6": "kpi-package",
};

/** 将任意已支持 id 规范为语义 id；未知则回退默认 */
export function normalizeKpiPresetIconId(id: string | undefined): KpiPresetIconIdSemantic {
  if (id && (KPI_PRESET_ICON_IDS_SEMANTIC as readonly string[]).includes(id)) {
    return id as KpiPresetIconIdSemantic;
  }
  if (id && LEGACY_TO_SEMANTIC[id]) return LEGACY_TO_SEMANTIC[id]!;
  return KPI_PRESET_ICON_IDS_SEMANTIC[0];
}

export function isKnownBoardPresetIconId(id: string | undefined): id is BoardPresetIconId {
  if (id == null || id === "") return false;
  return (BOARD_PRESET_ICON_IDS as readonly string[]).includes(id);
}

export function resolveBoardPresetIconId(id: string | undefined): BoardPresetIconId {
  if (id && isKnownBoardPresetIconId(id)) return id;
  return DEFAULT_BOARD_PRESET_ICON_ID;
}
