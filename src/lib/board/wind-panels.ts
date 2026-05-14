/**
 * PanelShell 标题：装配时用默认值定位并替换为 AI 产出。
 * key 稳定；defaultTitle 须与 board-templates/wind-power-emerald-ops/dashboard.jsx 一致。
 */
export const WIND_PANEL_HEADER_KEYS = [
  "gen_completion",
  "production_base",
  "capacity",
  "power_realtime",
  "wind_speed",
  "logistics",
  "maintenance",
  "alarm_list",
  "device_log",
] as const;

export type WindPanelHeaderKey = (typeof WIND_PANEL_HEADER_KEYS)[number];

export const WIND_PANEL_DEFAULT_TITLES: Record<WindPanelHeaderKey, string> = {
  gen_completion: "发电量完成情况",
  production_base: "生产基地项目情况",
  capacity: "装机容量",
  power_realtime: "实时功率监控",
  wind_speed: "风速实时监测",
  logistics: "业务系统智慧物流",
  maintenance: "业务系统运维",
  alarm_list: "实时告警列表",
  device_log: "设备运行日志",
};
