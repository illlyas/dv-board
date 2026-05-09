/**
 * 大屏图表域 CSS 变量名（与 src/styles/dv-chart-tokens.css 一致）
 * 组件内默认值应写作 var(--dv-chart-xxx) 以便父级 / VI 注入覆盖
 */
export const DV_CHART = {
  /** 图表 Widget 外层壳（与 token-demo / generate-jsx 一致） */
  panelBg: "var(--dv-chart-panel-bg)",
  panelPadding: "var(--dv-chart-panel-padding)",
  panelBorder: "var(--dv-chart-panel-border)",
  panelRadius: "var(--dv-chart-panel-radius)",
  plotBg: "var(--dv-chart-plot-bg)",
  gridStroke: "var(--dv-chart-grid-stroke)",
  gridDash: "var(--dv-chart-grid-dash)",
  axisLine: "var(--dv-chart-axis-line)",
  axisTickStroke: "var(--dv-chart-axis-tick-stroke)",
  tickLabel: "var(--dv-chart-tick-label)",
  axisTitle: "var(--dv-chart-axis-title)",
  legendText: "var(--dv-chart-legend-text)",
  legendInactive: "var(--dv-chart-legend-inactive)",
  tooltipBg: "var(--dv-chart-tooltip-bg)",
  tooltipBorder: "var(--dv-chart-tooltip-border)",
  tooltipFg: "var(--dv-chart-tooltip-fg)",
  referenceStroke: "var(--dv-chart-reference-stroke)",
  labelLine: "var(--dv-chart-label-line)",
} as const;

/** 图表/表格 Widget 标题区排版（与 src/styles/dv-chart-tokens.css 一致） */
export const DV_CHART_TITLE = {
  colorBackdrop: "var(--dv-chart-title-color-backdrop)",
  blockMarginBottom: "var(--dv-chart-title-block-margin-bottom)",
  backdropPadding: "var(--dv-chart-title-backdrop-padding)",
  fontSize: "var(--dv-chart-title-font-size)",
  fontSizeCompact: "var(--dv-chart-title-font-size-compact)",
  fontWeight: "var(--dv-chart-title-font-weight)",
  fontWeightCompact: "var(--dv-chart-title-font-weight-compact)",
  lineHeight: "var(--dv-chart-title-line-height)",
  fontFamily: "var(--dv-chart-title-font-family)",
  gapAfterTitle: "var(--dv-chart-title-gap-after-title)",
  subtitleFontSize: "var(--dv-chart-title-subtitle-font-size)",
} as const;
