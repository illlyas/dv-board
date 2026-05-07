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
            <RechartsBar
              data={data}
              layout={isHorizontal ? "horizontal" : "vertical"}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              {props.showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
              )}
              
              {isHorizontal ? (
                <>
                  <XAxis
                    type="number"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey={xAxisConfig.field}
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={xAxisConfig.field}
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  />
                </>
              )}
              
              {props.showTooltip !== false && (
                <Tooltip
                  contentStyle={{
                    background: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
              )}
              
              {props.showLegend && (
                <Legend
                  wrapperStyle={{
                    paddingTop: 10,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                  }}
                />
              )}
              
              {/* 目标线 */}
              {props.showTarget && props.targetValue && (
                <ReferenceLine
                  y={props.targetValue}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{
                    value: props.targetLabel || "目标",
                    fill: "#ef4444",
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
