"use client";

import React, { useEffect, useRef, useState } from "react";
import { Widget } from "@/components/widget/widget";
import "@/components/widgets"; // 自动注册所有基础组件

/**
 * VI Token 演示看板
 *
 * 要点：
 * - 所有图表 / 指标卡 / 筛选器 均复用 src/components/widgets 下的基础组件
 * - 通过 Widget 容器 + staticData 注入数据，避免重复造轮子
 * - 外层容器的 CSS 变量由 FilePanel 注入，基础组件内部已全部走 var(--xxx)
 */

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// ================= 基础 Token 组合 =================

// 图表色带（走 CSS 变量，与 FilePanel 注入的 --chart-1..N 一致）
const CHART_PALETTE = [
  "var(--chart-1, #3b82f6)",
  "var(--chart-2, #8b5cf6)",
  "var(--chart-3, #06b6d4)",
  "var(--chart-4, #10b981)",
  "var(--chart-5, #f59e0b)",
  "var(--chart-6, #ec4899)",
];

// ================= Mock 数据 =================

const KPI_ITEMS = [
  { title: "总销售额", value: 1284560, unit: "", prefix: "¥ ", format: "number", trendValue: "+12.4%", trendDirection: "up" as const },
  { title: "订单数", value: 28493, unit: "", format: "number", trendValue: "+5.8%", trendDirection: "up" as const },
  { title: "转化率", value: 4.62, unit: "%", format: "decimal", precision: 2, trendValue: "-0.3%", trendDirection: "down" as const },
  { title: "客单价", value: 452, unit: "", prefix: "¥ ", format: "number", trendValue: "+2.1%", trendDirection: "up" as const },
];

const SALES_TREND_DATA = Array.from({ length: 12 }).map((_, i) => ({
  month: `${i + 1}月`,
  sales: Math.round(180000 + Math.sin(i / 2) * 60000 + i * 12000),
  orders: Math.round(2800 + Math.cos(i / 2) * 900 + i * 180),
}));

const WEEKLY_ORDERS_DATA = [
  { day: "周一", newUser: 28, returning: 14 },
  { day: "周二", newUser: 42, returning: 22 },
  { day: "周三", newUser: 34, returning: 19 },
  { day: "周四", newUser: 58, returning: 28 },
  { day: "周五", newUser: 72, returning: 36 },
  { day: "周六", newUser: 48, returning: 24 },
  { day: "周日", newUser: 38, returning: 18 },
];

const TRAFFIC_SOURCE_DATA = [
  { name: "直接访问", value: 38 },
  { name: "搜索引擎", value: 28 },
  { name: "社交媒体", value: 18 },
  { name: "推广渠道", value: 16 },
];

const PRODUCT_TABLE_DATA = [
  { name: "Alpha 系列", revenue: 248300, share: 32, status: "优秀" },
  { name: "Beta 系列", revenue: 186450, share: 24, status: "良好" },
  { name: "Gamma 系列", revenue: 124820, share: 16, status: "持平" },
  { name: "Delta 系列", revenue: 98640, share: 13, status: "待提升" },
  { name: "Epsilon 系列", revenue: 72150, share: 9, status: "待提升" },
];

// ================= 布局片段 =================

function DashboardContent() {
  const cardStyle: React.CSSProperties = {
    background: "var(--color-surface, #ffffff)",
    border: "1px solid var(--color-border, #e5e7eb)",
    borderRadius: "var(--radius-lg, 12px)",
    boxShadow: "var(--shadow-md, 0 4px 6px rgba(0,0,0,0.05))",
    padding: "var(--space-5, 20px)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3, 12px)",
    overflow: "hidden",
  };

  return (
    <div
      style={{
        width: CANVAS_W,
        height: CANVAS_H,
        background: "var(--color-bg, #f8fafc)",
        color: "var(--color-text-primary, #111827)",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 顶部 Header（布局代码，非 widget） */}
      <header
        style={{
          height: 88,
          padding: "0 var(--space-8, 32px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border, #e5e7eb)",
          background: "var(--color-surface, #ffffff)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4, 16px)" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md, 8px)",
              background: "linear-gradient(135deg, var(--color-primary, #3b82f6), var(--color-accent, #8b5cf6))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-inverse, #ffffff)",
              fontWeight: "var(--font-weight-bold, 700)",
              fontSize: "var(--font-size-lg, 18px)",
              boxShadow: "var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1))",
            }}
          >
            DV
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "var(--font-size-2xl, 28px)",
                fontWeight: "var(--font-weight-bold, 700)",
                fontFamily: "var(--font-display, var(--font-body, system-ui))",
                letterSpacing: "var(--letter-spacing-tight, -0.02em)",
                color: "var(--color-text-primary, #111827)",
              }}
            >
              VI Token 演示看板
            </h1>
            <span style={{ fontSize: "var(--font-size-sm, 13px)", color: "var(--color-text-muted, #64748b)" }}>
              所有图表、指标卡、筛选器均复用基础 widgets，统一走 CSS Token
            </span>
          </div>
        </div>

        {/* 筛选器区：使用基础 DateRangePicker + Select */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3, 12px)" }}>
          <Widget
            enableData={false}
            config={{
              type: "DateRangePicker",
              props: {
                label: "时间范围",
                defaultValue: "last_30_days",
              },
            }}
          />
          <Widget
            enableData={false}
            config={{
              type: "Select",
              props: {
                label: "区域",
                placeholder: "全部",
                options: [
                  { label: "全部", value: "all" },
                  { label: "华北", value: "north" },
                  { label: "华东", value: "east" },
                  { label: "华南", value: "south" },
                ],
              },
            }}
          />
          <button
            type="button"
            style={{
              height: 40,
              padding: "0 var(--space-5, 20px)",
              background: "var(--color-primary, #3b82f6)",
              color: "var(--color-text-inverse, #ffffff)",
              border: "none",
              borderRadius: "var(--radius-md, 8px)",
              fontSize: "var(--font-size-sm, 13px)",
              fontWeight: "var(--font-weight-semibold, 600)",
              boxShadow: "var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1))",
              cursor: "pointer",
            }}
          >
            应用筛选
          </button>
        </div>
      </header>

      {/* 主体网格 */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateRows: "200px 360px 1fr",
          gap: "var(--space-6, 24px)",
          padding: "var(--space-8, 32px)",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* KPI 行：4 张 KPI 卡 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-5, 20px)" }}>
          {KPI_ITEMS.map((k, i) => (
            <Widget
              key={i}
              config={{
                type: "KPI",
                props: {
                  title: k.title,
                  subtitle: "较上期",
                  prefix: k.prefix,
                  unit: k.unit,
                  format: k.format as any,
                  precision: (k as any).precision,
                  trend: true,
                  trendValue: k.trendValue,
                  trendDirection: k.trendDirection,
                  staticData: { value: k.value },
                  shadow: true,
                  gradient: [
                    `color-mix(in srgb, ${CHART_PALETTE[i % CHART_PALETTE.length]} 85%, transparent)`,
                    `color-mix(in srgb, ${CHART_PALETTE[(i + 1) % CHART_PALETTE.length]} 55%, transparent)`,
                  ],
                },
              }}
            />
          ))}
        </div>

        {/* 趋势图 + 周订单分布：均使用基础 LineChart / BarChart */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-5, 20px)", minHeight: 0 }}>
          <Widget
            config={{
              type: "LineChart",
              props: {
                title: "销售额与订单趋势",
                subtitle: "最近 12 个月",
                xAxis: "month",
                yAxis: [
                  { field: "sales", label: "销售额" },
                  { field: "orders", label: "订单数" },
                ],
                smooth: true,
                area: true,
                showGrid: true,
                showLegend: true,
                showTooltip: true,
                colorScheme: CHART_PALETTE,
                staticData: SALES_TREND_DATA,
              },
            }}
          />
          <Widget
            config={{
              type: "BarChart",
              props: {
                title: "周订单分布",
                subtitle: "新客 vs 回购对比",
                xAxis: "day",
                yAxis: [
                  { field: "newUser", label: "新用户" },
                  { field: "returning", label: "回购用户" },
                ],
                showGrid: true,
                showLegend: true,
                showTooltip: true,
                barWidth: 14,
                colorScheme: CHART_PALETTE,
                staticData: WEEKLY_ORDERS_DATA,
              },
            }}
          />
        </div>

        {/* 饼图 + 表格：均使用基础 PieChart / Table */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--space-5, 20px)", minHeight: 0 }}>
          <Widget
            config={{
              type: "DonutChart",
              props: {
                title: "流量来源",
                subtitle: "按渠道占比",
                nameField: "name",
                valueField: "value",
                donut: true,
                innerRadius: 60,
                outerRadius: 95,
                showPercentage: true,
                showLegend: true,
                legendPosition: "right",
                colorScheme: CHART_PALETTE,
                staticData: TRAFFIC_SOURCE_DATA,
              },
            }}
          />
          <Widget
            config={{
              type: "Table",
              props: {
                title: "产品系列表现",
                subtitle: "按销售额排序",
                columns: [
                  { field: "name", label: "系列", sortable: true },
                  { field: "revenue", label: "销售额", align: "right", format: "currency", sortable: true },
                  { field: "share", label: "占比", align: "right", format: "percentage", unit: "%", sortable: true },
                  { field: "status", label: "状态", align: "center" },
                ],
                striped: true,
                bordered: true,
                size: "medium",
                showIndex: true,
                pagination: false,
                staticData: PRODUCT_TABLE_DATA,
              } as any,
            }}
          />
        </div>

      </main>
    </div>
  );
}

/** 左侧演示看板：按容器宽高等比缩放到 1920x1080 内部画布 */
export function TokenDemoDashboard({
  cssVariables,
}: {
  cssVariables?: Record<string, string>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / CANVAS_W, height / CANVAS_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: "var(--color-bg, #0f172a)" }}
    >
      <div
        style={{
          ...(cssVariables as React.CSSProperties | undefined),
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
        }}
      >
        <DashboardContent />
      </div>
    </div>
  );
}
