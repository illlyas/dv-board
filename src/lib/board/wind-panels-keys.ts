/** PanelShell 标题键，与 slots.schema.json panelHeaders / panelShellBindings[].key 一致 */
export const WIND_PANEL_HEADER_KEYS = [
  "gen_completion",
  "production_base",
  "capacity",
  "realtime_primary",
  "realtime_secondary",
  "logistics",
  "maintenance",
  "alarm_list",
  "device_log",
] as const;

export type WindPanelHeaderKey = (typeof WIND_PANEL_HEADER_KEYS)[number];
