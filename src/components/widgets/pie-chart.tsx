"use client";

import React from "react";
import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { PieChartProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";
import { ChartLabelBackdrop } from "@/components/dv-assets";

/**
 * 饼图组件
 */
function PieChartWidget({ config, data, loading }: WidgetComponentProps<{ type: "PieChart"; props: PieChartProps }>) {
  const props = config.props;
  
  // 颜色方案
  const colors = props.colorScheme || [
    "var(--chart-1, #3b82f6)",
    "var(--chart-2, #8b5cf6)",
    "var(--chart-3, #06b6d4)",
    "var(--chart-4, #10b981)",
    "var(--chart-5, #f59e0b)",
    "var(--chart-6, #ec4899)",
    "var(--chart-1, #3b82f6)",
    "var(--chart-2, #8b5cf6)",
  ];

  // 默认色值均走 CSS 变量，在 light/dark 下自适应
  const titleColor =
    props.titleColor ?? (props.titleBackdrop ? "#0f172a" : "var(--color-text-primary, rgba(17,24,39,0.9))");
  const subtitleColor = props.subtitleColor || "var(--color-text-muted, rgba(17,24,39,0.5))";
  const legendTextColor = props.legendTextColor || "var(--color-text-secondary, rgba(17,24,39,0.7))";
  const tooltipBg = "var(--color-surface, rgba(255,255,255,0.95))";
  const tooltipText = "var(--color-text-primary, #111827)";
  const tooltipBorder = props.borderColor || "var(--color-border, rgba(17,24,39,0.15))";
  const emptyText = props.textColor || "var(--color-text-muted, rgba(17,24,39,0.5))";
  const containerBg = props.backgroundColor || "transparent";
  const containerBorder = props.borderColor || "var(--color-border, rgba(17,24,39,0.08))";
  const labelLineColor = "var(--color-border, rgba(17,24,39,0.2))";

  // 数据防御
  const chartData = Array.isArray(data) ? data : [];

  const legendOnSide = props.showLegend && (props.legendPosition === "left" || props.legendPosition === "right");
  const chartMargin = props.legendPosition === "right"
    ? { top: 12, right: 8, bottom: 12, left: 56 }
    : props.legendPosition === "left"
      ? { top: 12, right: 56, bottom: 12, left: 8 }
      : { top: 8, right: 48, bottom: 48, left: 48 };

  // 自定义标签（Recharts 传入的 payload 含 name / value / percent 等）
  const renderLabel = (labelProps: any) => {
    const name =
      labelProps?.name ??
      labelProps?.[props.nameField] ??
      labelProps?.payload?.[props.nameField];
    const raw = labelProps?.percent;
    const pct = typeof raw === "number" ? (raw * 100).toFixed(1) : null;
    if (!props.showPercentage) return name;
    if (pct != null) return `${name} ${pct}%`;
    const total = chartData.reduce((sum: number, item: any) => sum + (item[props.valueField] || 0), 0) || 1;
    const percent = (((labelProps?.value ?? 0) / total) * 100).toFixed(1);
    return `${name} ${percent}%`;
  };

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

      {/* 图表：overflow 可见，避免引导线/标签被父级裁切 */}
      <div style={{ flex: 1, minHeight: 0, overflow: "visible" }}>
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
            <RechartsPie margin={chartMargin}>
              <Pie
                data={chartData}
                dataKey={props.valueField}
                nameKey={props.nameField}
                cx="50%"
                cy="50%"
                innerRadius={props.donut ? (props.innerRadius || 60) : 0}
                outerRadius={props.outerRadius || 80}
                label={renderLabel}
                labelLine={{ stroke: labelLineColor }}
              >
                {chartData.map((_entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>

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

              {props.showLegend && (
                <Legend
                  layout={legendOnSide ? "vertical" : "horizontal"}
                  verticalAlign={
                    props.legendPosition === "top" || props.legendPosition === "bottom"
                      ? props.legendPosition
                      : "middle"
                  }
                  align={
                    props.legendPosition === "left" || props.legendPosition === "right"
                      ? props.legendPosition
                      : "center"
                  }
                  wrapperStyle={{
                    fontSize: 12,
                    color: legendTextColor,
                    maxWidth: legendOnSide ? 120 : undefined,
                    paddingLeft: props.legendPosition === "right" ? 4 : undefined,
                    paddingRight: props.legendPosition === "left" ? 4 : undefined,
                  }}
                />
              )}
            </RechartsPie>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// 注册组件
registerWidget("PieChart", PieChartWidget);
registerWidget("DonutChart", PieChartWidget);

export default PieChartWidget;
