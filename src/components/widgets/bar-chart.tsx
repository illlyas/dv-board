"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { BarChartProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";
import { ChartLabelBackdrop } from "@/components/dv-assets";
import { DV_CHART, DV_CHART_TITLE } from "@/lib/dv-chart-tokens";
import { mergeEChartsOption } from "@/lib/echarts-option-merge";
import { resolveCssForCanvas } from "@/lib/resolve-chart-css";
import { resolveCartesianTheme } from "@/components/widgets/echarts-theme-resolve";
import { asScalarReactText, hasScalarContent } from "@/lib/react-text-safety";

const FALLBACK_PALETTE = [
  "var(--chart-1, #3b82f6)",
  "var(--chart-2, #8b5cf6)",
  "var(--chart-3, #06b6d4)",
  "var(--chart-4, #10b981)",
  "var(--chart-5, #f59e0b)",
  "var(--chart-6, #ec4899)",
];

function BarChartWidget({ config, data, loading }: WidgetComponentProps<{ type: "BarChart"; props: BarChartProps }>) {
  const props = config.props;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [theme, setTheme] = React.useState<ReturnType<typeof resolveCartesianTheme> | null>(null);

  const yAxisConfigs = React.useMemo(() => {
    if (!props.yAxis) return [];
    if (Array.isArray(props.yAxis)) {
      return props.yAxis.map((axis) => (typeof axis === "string" ? { field: axis, label: axis } : axis));
    }
    if (typeof props.yAxis === "string") return [{ field: props.yAxis, label: props.yAxis }];
    return [props.yAxis];
  }, [props.yAxis]);

  const xAxisConfig = React.useMemo(() => {
    if (!props.xAxis) return { field: "x", label: "X" };
    if (typeof props.xAxis === "string") return { field: props.xAxis, label: props.xAxis };
    return props.xAxis;
  }, [props.xAxis]);

  const isHorizontal = props.direction === "horizontal";
  const chartData = Array.isArray(data) ? data : [];

  const titleColorRaw =
    props.titleColor ??
    (props.titleBackdrop ? DV_CHART_TITLE.colorBackdrop : "var(--color-text-primary, rgba(17,24,39,0.9))");
  const subtitleColorRaw = props.subtitleColor || "var(--color-text-muted, rgba(17,24,39,0.5))";
  const emptyTextRaw = props.textColor || "var(--color-text-muted, rgba(17,24,39,0.5))";
  const containerBg = props.backgroundColor || "transparent";
  const containerBorder = props.borderColor || "var(--color-border, rgba(17,24,39,0.08))";

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setTheme(resolveCartesianTheme(el, props, FALLBACK_PALETTE));
  }, [
    props.gridColor,
    props.axisColor,
    props.axisTextColor,
    props.legendTextColor,
    props.tooltipBackgroundColor,
    props.tooltipTextColor,
    props.borderColor,
    JSON.stringify(props.colorScheme ?? []),
  ]);

  const titleResolved = React.useMemo(() => {
    const el = containerRef.current;
    if (!el || !theme) {
      return { title: titleColorRaw, subtitle: subtitleColorRaw, empty: emptyTextRaw };
    }
    return {
      title: resolveCssForCanvas(el, titleColorRaw, "color"),
      subtitle: resolveCssForCanvas(el, subtitleColorRaw, "color"),
      empty: resolveCssForCanvas(el, emptyTextRaw, "color"),
    };
  }, [theme, titleColorRaw, subtitleColorRaw, emptyTextRaw]);

  const baseOption = React.useMemo((): EChartsOption | null => {
    if (!theme || chartData.length === 0 || yAxisConfigs.length === 0) return null;

    const categories = chartData.map((d) => String(d[xAxisConfig.field] ?? ""));
    const barMax = props.barWidth ?? 40;

    const markLine =
      props.showTarget && props.targetValue != null
        ? {
            symbol: "none",
            data: isHorizontal
              ? [{ xAxis: props.targetValue, label: { formatter: props.targetLabel || "目标", color: theme.referenceStroke } }]
              : [{ yAxis: props.targetValue, label: { formatter: props.targetLabel || "目标", color: theme.referenceStroke } }],
            lineStyle: { color: theme.referenceStroke, width: 1.5, type: "dashed" as const },
          }
        : undefined;

    const gapPatch =
      props.barGap != null ? { barGap: typeof props.barGap === "number" ? `${props.barGap}%` : String(props.barGap) } : {};

    const series = yAxisConfigs.map((yAxis, index) => {
      const c = yAxis.color || theme.palette[index % theme.palette.length];
      const base = {
        name: yAxis.label || yAxis.field,
        type: "bar" as const,
        data: chartData.map((d) => d[yAxis.field]),
        barMaxWidth: barMax,
        ...gapPatch,
        itemStyle: { color: c, borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
        label: props.showDataLabels
          ? { show: true, color: props.dataLabelColor ? undefined : theme.axisText, fontSize: 10 }
          : undefined,
      };
      if (index === 0 && markLine) {
        return { ...base, markLine };
      }
      return base;
    });

    const categoryAxis = {
      type: "category" as const,
      data: categories,
      axisLine: { lineStyle: { color: theme.axisLine } },
      axisTick: { lineStyle: { color: theme.axisTick } },
      axisLabel: { color: theme.axisText, fontSize: 11 },
      name: xAxisConfig.label,
      nameTextStyle: { color: theme.axisTitle, fontSize: 11 },
    };

    const valueAxis = {
      type: "value" as const,
      axisLine: { lineStyle: { color: theme.axisLine } },
      axisTick: { lineStyle: { color: theme.axisTick } },
      axisLabel: { color: theme.axisText, fontSize: 11 },
      splitLine: {
        show: props.showGrid !== false,
        lineStyle: { color: theme.gridColor, type: "dashed" as const },
      },
    };

    const opt: EChartsOption = {
      color: theme.palette,
      animation: true,
      grid: {
        left: 8,
        right: 12,
        top: props.showLegend ? 36 : 12,
        bottom: 8,
        containLabel: true,
      },
      textStyle: { color: theme.axisText },
      tooltip:
        props.showTooltip === false
          ? { show: false }
          : {
              trigger: "axis",
              axisPointer: { type: "shadow" },
              backgroundColor: theme.tooltipBg,
              borderColor: theme.tooltipBorder,
              borderWidth: 1,
              textStyle: { color: theme.tooltipText },
            },
      legend: props.showLegend
        ? {
            show: true,
            top: 0,
            textStyle: { color: theme.legendText, fontSize: 11 },
          }
        : { show: false },
      xAxis: isHorizontal ? valueAxis : categoryAxis,
      yAxis: isHorizontal ? categoryAxis : valueAxis,
      series,
    };

    return opt;
  }, [theme, chartData, xAxisConfig, yAxisConfigs, props, isHorizontal]);

  const mergedOption = React.useMemo(() => {
    if (!baseOption) return null;
    return mergeEChartsOption(baseOption, props.echartsOptionOverrides ?? null);
  }, [baseOption, props.echartsOptionOverrides]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        background: containerBg,
        border: `1px solid ${containerBorder}`,
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        ...props.style,
      }}
    >
      {hasScalarContent(props.title) && (
        <div
          style={{
            marginBottom: DV_CHART_TITLE.blockMarginBottom,
            ...(props.titleBackdrop
              ? {
                  position: "relative",
                  padding: DV_CHART_TITLE.backdropPadding,
                  overflow: "hidden",
                }
              : {}),
          }}
        >
          {props.titleBackdrop && (
            <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
              <ChartLabelBackdrop style={{ width: "100%", height: "100%", display: "block" }} />
            </div>
          )}
          <div style={props.titleBackdrop ? { position: "relative", zIndex: 1 } : undefined}>
            <div
              style={{
                ...(props.titleBackdrop
                  ? {
                      fontSize: DV_CHART_TITLE.fontSize,
                      fontWeight: DV_CHART_TITLE.fontWeight,
                      lineHeight: DV_CHART_TITLE.lineHeight,
                      fontFamily: DV_CHART_TITLE.fontFamily,
                    }
                  : {
                      fontSize: DV_CHART_TITLE.fontSizeCompact,
                      fontWeight: DV_CHART_TITLE.fontWeightCompact,
                      fontFamily: DV_CHART_TITLE.fontFamily,
                    }),
                color: theme ? titleResolved.title : titleColorRaw,
                marginBottom: hasScalarContent(props.subtitle) ? DV_CHART_TITLE.gapAfterTitle : 0,
              }}
            >
              {asScalarReactText(props.title)}
            </div>
            {hasScalarContent(props.subtitle) && (
              <div
                style={{
                  fontSize: DV_CHART_TITLE.subtitleFontSize,
                  fontFamily: DV_CHART_TITLE.fontFamily,
                  color: theme ? titleResolved.subtitle : subtitleColorRaw,
                }}
              >
                {asScalarReactText(props.subtitle)}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, borderRadius: 4 }}>
        {loading ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme ? titleResolved.empty : emptyTextRaw,
            }}
          >
            加载中...
          </div>
        ) : chartData.length === 0 ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme ? titleResolved.empty : emptyTextRaw,
            }}
          >
            暂无数据
          </div>
        ) : !mergedOption ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme ? titleResolved.empty : emptyTextRaw,
            }}
          >
            准备图表…
          </div>
        ) : (
          <ReactECharts
            option={mergedOption}
            style={{ width: "100%", height: "100%", minHeight: 120 }}
            opts={{ renderer: "canvas" }}
            notMerge
            lazyUpdate
          />
        )}
      </div>
    </div>
  );
}

registerWidget("BarChart", BarChartWidget);

export default BarChartWidget;
