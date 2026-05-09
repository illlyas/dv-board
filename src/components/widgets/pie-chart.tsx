"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { PieChartProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";
import { ChartLabelBackdrop } from "@/components/dv-assets";
import { DV_CHART, DV_CHART_TITLE } from "@/lib/dv-chart-tokens";
import { mergeEChartsOption } from "@/lib/echarts-option-merge";
import { resolveCssForCanvas } from "@/lib/resolve-chart-css";
import { resolvePieTheme } from "@/components/widgets/echarts-theme-resolve";

const FALLBACK_PALETTE = [
  "var(--chart-1, #3b82f6)",
  "var(--chart-2, #8b5cf6)",
  "var(--chart-3, #06b6d4)",
  "var(--chart-4, #10b981)",
  "var(--chart-5, #f59e0b)",
  "var(--chart-6, #ec4899)",
  "var(--chart-1, #3b82f6)",
];

function PieChartWidget({ config, data, loading }: WidgetComponentProps<{ type: "PieChart"; props: PieChartProps }>) {
  const props = config.props;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [theme, setTheme] = React.useState<ReturnType<typeof resolvePieTheme> | null>(null);

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
    setTheme(resolvePieTheme(el, props, FALLBACK_PALETTE));
  }, [
    props.legendTextColor,
    props.borderColor,
    props.donut,
    props.innerRadius,
    props.outerRadius,
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

  const legendOnSide = props.showLegend && (props.legendPosition === "left" || props.legendPosition === "right");

  const baseOption = React.useMemo((): EChartsOption | null => {
    if (!theme || chartData.length === 0) return null;

    const innerPct = props.donut ? Math.min(Math.max(props.innerRadius ?? 42, 10), 88) : 0;
    const outerPct = Math.min(Math.max(props.outerRadius ?? 68, innerPct + 8), 92);

    const legendCfg: EChartsOption["legend"] =
      props.showLegend === false
        ? { show: false }
        : {
            show: true,
            orient: legendOnSide ? "vertical" : "horizontal",
            textStyle: { color: theme.legendText, fontSize: 11 },
            ...(props.legendPosition === "left" && { left: "left", top: "middle" }),
            ...(props.legendPosition === "right" && { right: "4%", top: "middle" }),
            ...(props.legendPosition === "top" && { top: "top", left: "center" }),
            ...(props.legendPosition === "bottom" && { bottom: "bottom", left: "center" }),
          };

    const labelFormatter = (p: { name?: string; percent?: number }) => {
      const name = String(p.name ?? "");
      if (!props.showPercentage) return name;
      const pct = p.percent != null ? Number(p.percent).toFixed(1) : "";
      return pct ? `${name} ${pct}%` : name;
    };

    const el = containerRef.current;
    const labelColorResolved =
      el && props.labelColor ? resolveCssForCanvas(el, props.labelColor, "color") : theme.legendText;

    const opt: EChartsOption = {
      color: theme.palette,
      animation: true,
      tooltip: {
        trigger: "item",
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: theme.tooltipText },
      },
      legend: legendCfg,
      series: [
        {
          type: "pie",
          radius: props.donut ? [`${innerPct}%`, `${outerPct}%`] : [`0%`, `${outerPct}%`],
          center: legendOnSide ? ["42%", "50%"] : ["50%", "52%"],
          data: chartData.map((item: Record<string, unknown>) => ({
            name: String(item[props.nameField] ?? ""),
            value: Number(item[props.valueField] ?? 0),
          })),
          label: {
            show: true,
            formatter: labelFormatter,
            color: labelColorResolved,
            fontSize: 11,
          },
          labelLine: {
            lineStyle: { color: theme.labelLine },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 8,
              shadowOffsetX: 0,
              shadowColor: "rgba(0,0,0,0.25)",
            },
          },
        },
      ],
    };
    return opt;
  }, [theme, chartData, props, legendOnSide]);

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
      {props.title && (
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
                marginBottom: props.subtitle ? DV_CHART_TITLE.gapAfterTitle : 0,
              }}
            >
              {props.title}
            </div>
            {props.subtitle && (
              <div
                style={{
                  fontSize: DV_CHART_TITLE.subtitleFontSize,
                  fontFamily: DV_CHART_TITLE.fontFamily,
                  color: theme ? titleResolved.subtitle : subtitleColorRaw,
                }}
              >
                {props.subtitle}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "visible",
          background: DV_CHART.plotBg,
          borderRadius: 4,
        }}
      >
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

registerWidget("PieChart", PieChartWidget);
registerWidget("DonutChart", PieChartWidget);

export default PieChartWidget;
