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

  // 自定义标签
  const renderLabel = (entry: any) => {
    if (!props.showPercentage) return entry[props.nameField];
    const percent = ((entry.value / data.reduce((sum: number, item: any) => sum + item[props.valueField], 0)) * 100).toFixed(1);
    return `${entry[props.nameField]} (${percent}%)`;
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(139,92,246,0.03) 100%)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.08)",
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
            color: "rgba(255,255,255,0.9)",
            marginBottom: 4,
          }}>{props.title}</div>
          {props.subtitle && (
            <div style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
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
            color: "rgba(255,255,255,0.5)",
          }}>
            加载中...
          </div>
        ) : !data || data.length === 0 ? (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
          }}>
            暂无数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie
                data={data}
                dataKey={props.valueField}
                nameKey={props.nameField}
                cx="50%"
                cy="50%"
                innerRadius={props.donut ? (props.innerRadius || 60) : 0}
                outerRadius={props.outerRadius || 80}
                label={renderLabel}
                labelLine={{ stroke: "rgba(255,255,255,0.3)" }}
              >
                {data.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  color: "#fff",
                }}
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
                    color: "rgba(255,255,255,0.7)",
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
