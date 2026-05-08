"use client";

import React from "react";
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { BarChartProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";
import { ChartLabelBackdrop } from "@/components/dv-assets";

/**
 * 柱状图组件
 */
function BarChartWidget({ config, data, loading }: WidgetComponentProps<{ type: "BarChart"; props: BarChartProps }>) {
  const props = config.props;
  
  // 处理 Y 轴配置
  const yAxisConfigs = React.useMemo(() => {
    if (!props.yAxis) return [];
    
    if (Array.isArray(props.yAxis)) {
      return props.yAxis.map(axis => 
        typeof axis === "string" ? { field: axis, label: axis } : axis
      );
    }
    
    if (typeof props.yAxis === "string") {
      return [{ field: props.yAxis, label: props.yAxis }];
    }
    
    return [props.yAxis];
  }, [props.yAxis]);

  // X 轴配置
  const xAxisConfig = React.useMemo(() => {
    if (!props.xAxis) return { field: "x", label: "X" };
    if (typeof props.xAxis === "string") return { field: props.xAxis, label: props.xAxis };
    return props.xAxis;
  }, [props.xAxis]);

  // 颜色方案
  const colors = props.colorScheme || [
    "var(--chart-1, #3b82f6)",
    "var(--chart-2, #8b5cf6)",
    "var(--chart-3, #06b6d4)",
    "var(--chart-4, #10b981)",
    "var(--chart-5, #f59e0b)",
    "var(--chart-6, #ec4899)",
  ];

  // 是否横向条形图（Recharts：layout "horizontal" = 竖向柱图； "vertical" = 横向条形图，与旧版直觉相反）
  const isHorizontal = props.direction === "horizontal";

  // 默认色值均走 CSS 变量，在 light/dark 下自适应；允许 AI 通过 props 覆盖
  const titleColor =
    props.titleColor ?? (props.titleBackdrop ? "#0f172a" : "var(--color-text-primary, rgba(17,24,39,0.9))");
  const subtitleColor = props.subtitleColor || "var(--color-text-muted, rgba(17,24,39,0.5))";
  const axisColor = props.axisColor || "var(--color-border, rgba(17,24,39,0.3))";
  const axisTextColor = props.axisTextColor || "var(--color-text-secondary, rgba(17,24,39,0.7))";
  const gridColor = props.gridColor || "var(--color-grid, rgba(17,24,39,0.1))";
  const legendTextColor = props.legendTextColor || "var(--color-text-secondary, rgba(17,24,39,0.7))";
  const tooltipBg = props.tooltipBackgroundColor || "var(--color-surface, rgba(255,255,255,0.95))";
  const tooltipText = props.tooltipTextColor || "var(--color-text-primary, #111827)";
  const tooltipBorder = props.borderColor || "var(--color-border, rgba(17,24,39,0.15))";
  const emptyText = props.textColor || "var(--color-text-muted, rgba(17,24,39,0.5))";
  const containerBg = props.backgroundColor || "transparent";
  const containerBorder = props.borderColor || "var(--color-border, rgba(17,24,39,0.08))";

  // 数据防御
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div style={{
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
    }}>
      {/* 标题 */}
      {props.title && (
        <div
          style={{
            marginBottom: 16,
            ...(props.titleBackdrop
              ? {
                  position: "relative",
                  padding: "10px 12px 12px",
                  overflow: "hidden",
                }
              : {}),
          }}
        >
          {props.titleBackdrop && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
              }}
            >
              <ChartLabelBackdrop style={{ width: "100%", height: "100%", display: "block" }} />
            </div>
          )}
          <div style={props.titleBackdrop ? { position: "relative", zIndex: 1 } : undefined}>
            <div
              style={{
                fontSize: props.titleBackdrop ? 20 : 16,
                fontWeight: props.titleBackdrop ? 700 : 600,
                lineHeight: props.titleBackdrop ? 1.3 : undefined,
                color: titleColor,
                marginBottom: props.subtitle ? 4 : 0,
              }}
            >
              {props.title}
            </div>
            {props.subtitle && (
              <div
                style={{
                  fontSize: 12,
                  color: subtitleColor,
                }}
              >
                {props.subtitle}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 图表 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {loading ? (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: emptyText,
          }}>
            加载中...
          </div>
        ) : chartData.length === 0 ? (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: emptyText,
          }}>
            暂无数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBar
              data={chartData}
              layout={isHorizontal ? "vertical" : "horizontal"}
              margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
            >
              {props.showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                />
              )}

              {isHorizontal ? (
                <>
                  <XAxis
                    type="number"
                    stroke={axisColor}
                    tick={{ fill: axisTextColor, fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey={xAxisConfig.field}
                    stroke={axisColor}
                    tick={{ fill: axisTextColor, fontSize: 12 }}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={xAxisConfig.field}
                    stroke={axisColor}
                    tick={{ fill: axisTextColor, fontSize: 12 }}
                  />
                  <YAxis
                    width={44}
                    stroke={axisColor}
                    tick={{ fill: axisTextColor, fontSize: 12 }}
                  />
                </>
              )}

              {props.showTooltip !== false && (
                <Tooltip
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: 8,
                    color: tooltipText,
                  }}
                  labelStyle={{ color: tooltipText }}
                  itemStyle={{ color: tooltipText }}
                />
              )}

              {props.showLegend && (
                <Legend
                  wrapperStyle={{
                    paddingTop: 10,
                    fontSize: 12,
                    color: legendTextColor,
                  }}
                />
              )}

              {/* 目标线 */}
              {props.showTarget && props.targetValue && (
                <ReferenceLine
                  y={props.targetValue}
                  stroke="var(--color-danger, #ef4444)"
                  strokeDasharray="3 3"
                  label={{
                    value: props.targetLabel || "目标",
                    fill: "var(--color-danger, #ef4444)",
                    fontSize: 11,
                  }}
                />
              )}

              {yAxisConfigs.map((yAxis, index) => (
                <Bar
                  key={yAxis.field}
                  dataKey={yAxis.field}
                  name={yAxis.label || yAxis.field}
                  fill={yAxis.color || colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={props.barWidth || 40}
                />
              ))}
            </RechartsBar>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// 注册组件
registerWidget("BarChart", BarChartWidget);

export default BarChartWidget;
