/** 大屏图表绘图区底：主文本色 15% 叠透明（等价 0.15 不透明度语义），与 design-vi / 落盘归一化一致 */
export const DV_CHART_PLOT_BG_KEY = "--dv-chart-plot-bg" as const;

export const DV_CHART_PLOT_BG_VALUE =
  "color-mix(in srgb, var(--color-text-primary) 15%, transparent)";

export function mergeDvChartPlotBg(cssVariables: Record<string, string>): Record<string, string> {
  return { ...cssVariables, [DV_CHART_PLOT_BG_KEY]: DV_CHART_PLOT_BG_VALUE };
}

/** 写入 vi-tokens.json 前调用，保证该键存在且为固定 15% 混合 */
export function applyDvChartPlotBgToViTokensPayload(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  const o = { ...(input as Record<string, unknown>) };
  const rawCv = o.cssVariables;
  const cssVariables: Record<string, string> = {};
  if (rawCv && typeof rawCv === "object") {
    for (const [k, v] of Object.entries(rawCv as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim().length > 0) {
        const key = k.startsWith("--") ? k : `--${k}`;
        cssVariables[key] = v;
      }
    }
  }
  o.cssVariables = mergeDvChartPlotBg(cssVariables);
  return o;
}
