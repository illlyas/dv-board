"use client";

import React from "react";
import type { AnyWidgetConfig } from "@/types/widget.types";

interface PlaceholderProps {
  config: AnyWidgetConfig;
  error?: Error | null;
  loading?: boolean;
}

/**
 * Widget 占位符组件
 * 当真实组件未实现或加载失败时显示
 */
export function Placeholder({ config, error, loading }: PlaceholderProps) {
  const { type, props } = config;
  
  // 获取图标
  const getIcon = () => {
    const iconMap: Record<string, string> = {
      KPI: "💳",
      Metric: "📊",
      StatCard: "📈",
      LineChart: "📈",
      BarChart: "📊",
      PieChart: "🥧",
      DonutChart: "🍩",
      AreaChart: "📉",
      Table: "📋",
      List: "📝",
      DateRangePicker: "📅",
      Select: "🔽",
      MultiSelect: "☑️",
      Map: "🗺️",
    };
    return iconMap[type] || "📦";
  };

  // 加载状态
  if (loading) {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(139,92,246,0.03) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: "3px solid rgba(59,130,246,0.2)",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <div style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
        }}>加载中...</div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(220,38,38,0.05) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}>
        <div style={{ fontSize: 32, opacity: 0.6 }}>⚠️</div>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(239,68,68,0.9)",
        }}>加载失败</div>
        <div style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
          maxWidth: "80%",
        }}>{error.message}</div>
      </div>
    );
  }

  // 默认占位符
  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(139,92,246,0.05) 100%)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: 24,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: "absolute",
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />
      
      {/* 图标 */}
      <div style={{
        fontSize: 32,
        opacity: 0.6,
        marginBottom: 8,
      }}>{getIcon()}</div>
      
      {/* 类型标签 */}
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase",
        letterSpacing: 1.5,
      }}>{type}</div>
      
      {/* 标题 */}
      {props.title && (
        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          lineHeight: 1.4,
        }}>{props.title}</div>
      )}
      
      {/* 副标题 */}
      {props.subtitle && (
        <div style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
        }}>{props.subtitle}</div>
      )}
      
      {/* 配置信息（调试用） */}
      {process.env.NODE_ENV === "development" && (
        <details style={{
          marginTop: 12,
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          maxWidth: "90%",
        }}>
          <summary style={{ cursor: "pointer", marginBottom: 4 }}>
            查看配置
          </summary>
          <pre style={{
            background: "rgba(0,0,0,0.2)",
            padding: 8,
            borderRadius: 4,
            overflow: "auto",
            maxHeight: 120,
            fontSize: 10,
          }}>
            {JSON.stringify(props, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
