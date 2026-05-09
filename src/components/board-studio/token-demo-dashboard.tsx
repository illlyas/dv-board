"use client";

import React, { useEffect, useRef, useState } from "react";
import { Widget } from "@/components/widget/widget";
import { BoardHeroBackdrop } from "@/components/dv-assets";
import { DV_CHART_PANEL_WIDGET_STYLE } from "@/lib/dv-board-styles";
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
  { day: "周一", newUser: 418, returning: 246 },
  { day: "周二", newUser: 502, returning: 312 },
  { day: "周三", newUser: 465, returning: 289 },
  { day: "周四", newUser: 538, returning: 356 },
  { day: "周五", newUser: 612, returning: 398 },
  { day: "周六", newUser: 489, returning: 302 },
  { day: "周日", newUser: 401, returning: 268 },
];

const TRAFFIC_SOURCE_DATA = [
  { name: "直接访问", value: 38 },
  { name: "搜索引擎", value: 28 },
  { name: "社交媒体", value: 18 },
  { name: "推广渠道", value: 16 },
];

const PRODUCT_TABLE_DATA = [
  { name: "Alpha 系列", revenue: 248300, share: 32, status: "优秀", mom: "+14.2%" },
  { name: "Beta 系列", revenue: 186450, share: 24, status: "良好", mom: "+8.1%" },
  { name: "Gamma 系列", revenue: 124820, share: 16, status: "持平", mom: "+0.4%" },
  { name: "Delta 系列", revenue: 98640, share: 13, status: "待提升", mom: "-3.2%" },
  { name: "Epsilon 系列", revenue: 72150, share: 9, status: "待提升", mom: "-6.7%" },
];

// ================= 布局片段 =================

function ChartCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: 0,
        height: "100%",
        borderRadius: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}

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
          position: "relative",
          height: 96,
          padding: "0 var(--space-8, 32px)",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          borderBottom: "1px solid var(--color-border, #e5e7eb)",
          background: "var(--color-surface, #ffffff)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <BoardHeroBackdrop id="hero-default" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            width: "100%",
            minWidth: 0,
            minHeight: 0,
            height: "100%",
          }}
        >
          <h1
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              margin: 0,
              fontSize: "var(--font-size-2xl, 28px)",
              fontWeight: "var(--font-weight-bold, 700)",
              fontFamily: "var(--font-display, var(--font-body, system-ui))",
              letterSpacing: "var(--letter-spacing-tight, -0.02em)",
              color: "var(--color-text-primary, #111827)",
              lineHeight: "var(--line-height-tight, 1.2)",
              textAlign: "center",
              pointerEvents: "none",
              textShadow:
                "0 0 12px color-mix(in srgb, var(--color-surface, #ffffff) 85%, transparent), 0 1px 2px color-mix(in srgb, var(--color-bg, #f8fafc) 60%, transparent)",
            }}
          >
            VI Token 演示看板
          </h1>

          <div
            role="group"
            aria-label="筛选"
            style={{
              position: "absolute",
              zIndex: 1,
              right: "calc(-1 * var(--space-3, 12px))",
              bottom: 0,
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3, 12px)",
              flexShrink: 0,
              padding: "var(--space-1, 8px) var(--space-3, 12px) 0",
              borderTopLeftRadius: "var(--radius-md, 8px)",
              borderTopRightRadius: "var(--radius-md, 8px)",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              border: "1px solid var(--color-border, #e5e7eb)",
              borderBottom: "none",
            }}
          >
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
                flexShrink: 0,
              }}
            >
              应用筛选
            </button>
          </div>
        </div>
      </header>

      {/* 主体网格 */}
      <main
        style={{
          flex: 1,
          display: "grid",
          /* 中间与底部按 1 : 1.4 分剩余高度，并保证最小行高，避免图表/表格在 flex 链上被裁切 */
          gridTemplateRows: "minmax(160px, 200px) minmax(240px, 1fr) minmax(300px, 1.4fr)",
          gap: "var(--space-6, 24px)",
          padding: "var(--space-8, 32px)",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* KPI 行：4 张 KPI 卡 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-5, 20px)", minHeight: 0 }}>
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "var(--space-5, 20px)",
            minHeight: 0,
            height: "100%",
          }}
        >
          <ChartCardShell>
            <Widget
              config={{
                type: "LineChart",
                props: {
                  style: DV_CHART_PANEL_WIDGET_STYLE,
                  titleBackdrop: true,
                  title: "销售额与订单趋势",
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
          </ChartCardShell>
          <ChartCardShell>
            <Widget
              config={{
                type: "BarChart",
                props: {
                  style: DV_CHART_PANEL_WIDGET_STYLE,
                  titleBackdrop: true,
                  title: "周订单分布",
                  xAxis: "day",
                  yAxis: [
                    { field: "newUser", label: "新用户" },
                    { field: "returning", label: "回购用户" },
                  ],
                  showGrid: true,
                  showLegend: true,
                  showTooltip: true,
                  barWidth: 28,
                  colorScheme: [CHART_PALETTE[0], CHART_PALETTE[1]],
                  staticData: WEEKLY_ORDERS_DATA,
                },
              }}
            />
          </ChartCardShell>
        </div>

        {/* 饼图 + 表格：均使用基础 PieChart / Table */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "var(--space-5, 20px)",
            minHeight: 0,
            height: "100%",
          }}
        >
          <ChartCardShell>
            <Widget
              config={{
                type: "DonutChart",
                props: {
                  style: DV_CHART_PANEL_WIDGET_STYLE,
                  titleBackdrop: true,
                  title: "流量来源",
                  nameField: "name",
                  valueField: "value",
                  donut: true,
                  innerRadius: 52,
                  outerRadius: 78,
                  showPercentage: true,
                  showLegend: true,
                  legendPosition: "bottom",
                  colorScheme: CHART_PALETTE,
                  staticData: TRAFFIC_SOURCE_DATA,
                },
              }}
            />
          </ChartCardShell>
          <ChartCardShell>
            <Widget
              config={{
                type: "Table",
                props: {
                  style: DV_CHART_PANEL_WIDGET_STYLE,
                  titleBackdrop: true,
                  backgroundColor: "transparent",
                  title: "产品系列表现",
                  columns: [
                    { field: "name", label: "系列", sortable: true },
                    { field: "revenue", label: "销售额", align: "right", format: "currency", sortable: true },
                    {
                      field: "share",
                      label: "占比",
                      align: "right",
                      sortable: true,
                      cellType: "progress",
                      unit: "%",
                      progressShowLabel: true,
                    },
                    {
                      field: "status",
                      label: "状态",
                      align: "center",
                      sortable: true,
                      cellType: "tag",
                      tagVariantMap: {
                        优秀: "success",
                        良好: "info",
                        持平: "default",
                        待提升: "warning",
                      } as Record<string, "default" | "success" | "warning" | "danger" | "info">,
                    },
                    {
                      field: "mom",
                      label: "环比",
                      align: "center",
                      sortable: true,
                      cellType: "tag",
                      tagVariantMap: {
                        "+14.2%": "success",
                        "+8.1%": "success",
                        "+0.4%": "info",
                        "-3.2%": "warning",
                        "-6.7%": "danger",
                      },
                    },
                  ],
                  striped: true,
                  bordered: true,
                  size: "medium",
                  showIndex: true,
                  pagination: false,
                  staticData: PRODUCT_TABLE_DATA,
                },
              }}
            />
          </ChartCardShell>
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
