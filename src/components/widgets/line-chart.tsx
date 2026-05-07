"use client";

import React from "react";
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { LineChartProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";

/**
 * 折线图组件
 */
function LineChartWidget({ config, data, loading }: WidgetComponentProps<{ type: "LineChart"; props: LineChartProps }>) {
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
            <RechartsLine
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              {props.showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
              )}
              
              <XAxis
                dataKey={xAxisConfig.field}
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                label={xAxisConfig.label ? {
                  value: xAxisConfig.label,
                  position: "insideBottom",
                  offset: -5,
                  fill: "rgba(255,255,255,0.5)",
                  fontSize: 11,
                } : undefined}
              />
              
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              />
              
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
              
              {yAxisConfigs.map((yAxis, index) => (
                <Line
                  key={yAxis.field}
                  type={props.smooth ? "monotone" : "linear"}
                  dataKey={yAxis.field}
                  name={yAxis.label || yAxis.field}
                  stroke={yAxis.color || colors[index % colors.length]}
                  strokeWidth={props.lineWidth || 2}
                  dot={props.showPoints !== false ? { r: props.pointSize || 4 } : false}
                  activeDot={{ r: 6 }}
                  fill={props.area ? yAxis.color || colors[index % colors.length] : "none"}
                  fillOpacity={props.area ? 0.2 : 0}
                />
              ))}
            </RechartsLine>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// 注册组件
registerWidget("LineChart", LineChartWidget);
registerWidget("AreaChart", LineChartWidget);

export default LineChartWidget;
