import type { CSSProperties } from "react";

/**
 * 图表 / 表格类 Widget 外层壳样式（与 token-demo、generate-jsx 约定一致）。
 * 视觉由 `--dv-chart-panel-*` 控制，见 `src/styles/dv-chart-tokens.css` 与 VI `cssVariables`。
 */
export const DV_CHART_PANEL_WIDGET_STYLE: CSSProperties = {
  border: "var(--dv-chart-panel-border, none)",
  padding: "var(--dv-chart-panel-padding, 0)",
  borderRadius: "var(--dv-chart-panel-radius, 0)",
  background: "var(--dv-chart-panel-bg)",
};
