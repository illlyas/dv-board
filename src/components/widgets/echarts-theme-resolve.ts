"use client";

import type { ChartCommonProps } from "@/types/widget.types";
import type { PieChartProps } from "@/types/widget.types";
import { DV_CHART } from "@/lib/dv-chart-tokens";
import { resolveColorList, resolveCssForCanvas } from "@/lib/resolve-chart-css";

export type CartesianResolvedTheme = {
  gridColor: string;
  axisLine: string;
  axisTick: string;
  axisText: string;
  axisTitle: string;
  legendText: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  referenceStroke: string;
  palette: string[];
};

export function resolveCartesianTheme(
  el: HTMLElement,
  props: ChartCommonProps,
  fallbackPalette: string[]
): CartesianResolvedTheme {
  const scheme = props.colorScheme?.length ? props.colorScheme : fallbackPalette;
  return {
    gridColor: resolveCssForCanvas(el, props.gridColor || DV_CHART.gridStroke, "color"),
    axisLine: resolveCssForCanvas(el, props.axisColor || DV_CHART.axisLine, "color"),
    axisTick: resolveCssForCanvas(el, DV_CHART.axisTickStroke, "color"),
    axisText: resolveCssForCanvas(el, props.axisTextColor || DV_CHART.tickLabel, "color"),
    axisTitle: resolveCssForCanvas(el, DV_CHART.axisTitle, "color"),
    legendText: resolveCssForCanvas(el, props.legendTextColor || DV_CHART.legendText, "color"),
    tooltipBg: resolveCssForCanvas(el, props.tooltipBackgroundColor || DV_CHART.tooltipBg, "backgroundColor"),
    tooltipBorder: resolveCssForCanvas(el, props.borderColor || DV_CHART.tooltipBorder, "borderColor"),
    tooltipText: resolveCssForCanvas(el, props.tooltipTextColor || DV_CHART.tooltipFg, "color"),
    referenceStroke: resolveCssForCanvas(el, DV_CHART.referenceStroke, "color"),
    palette: resolveColorList(el, scheme),
  };
}

export type PieResolvedTheme = {
  legendText: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  labelLine: string;
  palette: string[];
};

export function resolvePieTheme(
  el: HTMLElement,
  props: PieChartProps,
  fallbackPalette: string[]
): PieResolvedTheme {
  const scheme = props.colorScheme?.length ? props.colorScheme : fallbackPalette;
  return {
    legendText: resolveCssForCanvas(el, props.legendTextColor || DV_CHART.legendText, "color"),
    tooltipBg: resolveCssForCanvas(el, DV_CHART.tooltipBg, "backgroundColor"),
    tooltipBorder: resolveCssForCanvas(el, props.borderColor || DV_CHART.tooltipBorder, "borderColor"),
    tooltipText: resolveCssForCanvas(el, DV_CHART.tooltipFg, "color"),
    labelLine: resolveCssForCanvas(el, DV_CHART.labelLine, "color"),
    palette: resolveColorList(el, scheme),
  };
}
