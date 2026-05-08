"use client";

import React from "react";
import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { PieChartProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";

/**
 * 饼图组件
 */
function PieChartWidget({ config, data, loading }: WidgetComponentProps<{ type: "PieChart"; props: PieChartProps }>) {
  const props = config.props;
  
  // 颜色方案
  const colors = props.colorScheme || [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#06b6d4",
    "#ef4444",
    "#6366f1",
  ];

  // 默认色值均走 CSS 变量，在 light/dark 下自适应
  const titleColor = props.titleColor || "var(--color-text-primary, rgba(17,24,39,0.9))";
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

  // 自定义标签
  const renderLabel = (entry: any) => {
    if (!props.showPercentage) return entry[props.nameField];
    const total = chartData.reduce((sum: number, item: any) => sum + (item[props.valueField] || 0), 0) || 1;
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${entry[props.nameField]} (${percent}%)`;
  };

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
            <RechartsPie>
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
