"use client";

import React from "react";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { KPIProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";

/**
 * KPI 卡片组件
 */
function KPICard({ config, data, loading }: WidgetComponentProps<{ type: "KPI"; props: KPIProps }>) {
  const props = config.props;
  
  // 获取数值
  const value = data?.value ?? (props.valueKey && data ? data[props.valueKey] : 0);
  const trendValue = data?.trendValue ?? props.trendValue;
  const trendDirection = data?.trend ?? props.trendDirection ?? "flat";
  
  // 格式化数值
  const formatValue = (val: number) => {
    if (props.format === "currency") {
      return `¥${val.toLocaleString()}`;
    }
    if (props.format === "percentage") {
      return `${val.toFixed(props.precision ?? 1)}%`;
    }
    if (props.format === "decimal") {
      return val.toFixed(props.precision ?? 2);
    }
    return val.toLocaleString();
  };

  // 趋势图标
  const getTrendIcon = () => {
    if (trendDirection === "up") return "↗";
    if (trendDirection === "down") return "↘";
    return "→";
  };

  // 趋势颜色
  const getTrendColor = () => {
    if (trendDirection === "up") return "#10b981";
    if (trendDirection === "down") return "#ef4444";
    return "#6b7280";
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: props.gradient 
        ? `linear-gradient(135deg, ${props.gradient[0]} 0%, ${props.gradient[1]} 100%)`
        : "linear-gradient(135deg, var(--kpi-bg-from, #1e293b) 0%, var(--kpi-bg-to, #334155) 100%)",
      backdropFilter: "blur(10px)",
      border: "1px solid var(--color-border-strong, rgba(255,255,255,0.1))",
      borderRadius: 16,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: props.shadow ? "0 4px 24px rgba(0,0,0,0.1)" : "none",
      ...props.style,
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: "absolute",
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      {/* 顶部：标题和图标 */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 12,
        position: "relative",
        zIndex: 1,
      }}>
        <div>
          {props.title && (
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--kpi-text-secondary, rgba(255,255,255,0.7))",
              marginBottom: 4,
            }}>{props.title}</div>
          )}
          {props.subtitle && (
            <div style={{
              fontSize: 11,
              color: "var(--kpi-text-muted, rgba(255,255,255,0.5))",
            }}>{props.subtitle}</div>
          )}
        </div>
        
        {props.icon && (
          <div style={{
            fontSize: 24,
            opacity: 0.6,
          }}>{props.icon}</div>
        )}
      </div>

      {/* 中部：数值 */}
      <div style={{
        position: "relative",
        zIndex: 1,
      }}>
        {loading ? (
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: "var(--kpi-text-muted, rgba(255,255,255,0.3))",
          }}>--</div>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "baseline",
            gap: 4,
          }}>
            {props.prefix && (
              <span style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--kpi-text-secondary, rgba(255,255,255,0.7))",
              }}>{props.prefix}</span>
            )}
            <span style={{
              fontSize: 32,
              fontWeight: 700,
              color: props.color || "var(--kpi-text-primary, #ffffff)",
              lineHeight: 1,
            }}>{formatValue(value)}</span>
            {props.unit && (
              <span style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--kpi-text-secondary, rgba(255,255,255,0.6))",
                marginLeft: 4,
              }}>{props.unit}</span>
            )}
            {props.suffix && (
              <span style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--kpi-text-secondary, rgba(255,255,255,0.7))",
              }}>{props.suffix}</span>
            )}
          </div>
        )}
      </div>

      {/* 底部：趋势和对比 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 12,
        position: "relative",
        zIndex: 1,
      }}>
        {/* 趋势 */}
        {props.trend && trendValue && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: getTrendColor(),
          }}>
            <span style={{ fontSize: 14 }}>{getTrendIcon()}</span>
            <span>{trendValue}</span>
          </div>
        )}

        {/* 对比 */}
        {props.comparison && (
          <div style={{
            fontSize: 11,
            color: "var(--kpi-text-muted, rgba(255,255,255,0.5))",
          }}>
            {props.comparison.label}: {data?.comparison?.value ?? props.comparison.value}
          </div>
        )}
      </div>
    </div>
  );
}

// 注册组件
registerWidget("KPI", KPICard);
registerWidget("Metric", KPICard);
registerWidget("StatCard", KPICard);

export default KPICard;
