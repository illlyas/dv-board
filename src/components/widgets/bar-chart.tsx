"use client";

import React from "react";
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { BarChartProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";

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
  const colors = props.colorScheme || ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

  // 是否横向
  const isHorizontal = props.direction === "horizontal";

  // 默认色值均走 CSS 变量，在 light/dark 下自适应；允许 AI 通过 props 覆盖
  const titleColor = props.titleColor || "var(--color-text-primary, rgba(17,24,39,0.9))";
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
        <div style={{
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: titleColor,
            marginBottom: 4,
          }}>{props.title}</div>
          {props.subtitle && (
            <div style={{
              fontSize: 12,
              color: subtitleColor,
            }}>{props.subtitle}</div>
          )}
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
              layout={isHorizontal ? "horizontal" : "vertical"}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
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
