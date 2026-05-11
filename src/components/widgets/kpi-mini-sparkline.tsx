"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { resolveCssForCanvas } from "@/lib/resolve-chart-css";

type Row = Record<string, unknown>;

export interface KPIMiniSparklineProps {
  rows: Row[] | number[] | null | undefined;
  kind?: "line" | "bar";
  height?: number;
  xField?: string;
  yField?: string;
  /**
   * true：在 flex 布局中占满父级分配高度，用 ResizeObserver 同步 ECharts 高度（避免 KPI 行过矮时只剩一条线）
   */
  measureContainer?: boolean;
}

/**
 * KPI 内嵌微型趋势（ECharts）；颜色解析自主色 Token。
 */
export function KPIMiniSparkline({
  rows,
  kind = "line",
  height = 40,
  xField = "x",
  yField = "y",
  measureContainer = false,
}: KPIMiniSparklineProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [stroke, setStroke] = React.useState("rgba(74, 222, 128, 0.9)");
  const [measuredPx, setMeasuredPx] = React.useState(() => Math.max(48, height));

  React.useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setStroke(resolveCssForCanvas(el, "var(--color-primary)", "color"));
  }, []);

  React.useLayoutEffect(() => {
    if (!measureContainer) return;
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      setMeasuredPx((prev) => {
        const next = Math.max(48, h);
        return next === prev ? prev : next;
      });
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureContainer]);

  React.useEffect(() => {
    if (!measureContainer) {
      setMeasuredPx(Math.max(48, height));
    }
  }, [measureContainer, height]);

  const chartPixelHeight = measureContainer ? measuredPx : height;

  const { categories, values } = React.useMemo(() => {
    if (!rows?.length) return { categories: [] as string[], values: [] as number[] };
    const first = rows[0];
    if (typeof first === "number") {
      const nums = rows as number[];
      return {
        categories: nums.map((_, i) => String(i)),
        values: nums,
      };
    }
    const arr = rows as Row[];
    return {
      categories: arr.map((r, i) => String(r[xField] ?? i)),
      values: arr.map((r) => Number(r[yField] ?? 0)),
    };
  }, [rows, xField, yField]);

  const option = React.useMemo((): EChartsOption => {
    const isBar = kind === "bar";
    return {
      animation: false,
      grid: { left: 0, right: 0, top: 2, bottom: 0 },
      xAxis: { type: "category", show: false, data: categories },
      yAxis: { type: "value", show: false },
      series: [
        isBar
          ? {
              type: "bar",
              data: values,
              barWidth: "55%",
              itemStyle: { color: stroke, borderRadius: [2, 2, 0, 0] },
            }
          : {
              type: "line",
              data: values,
              smooth: true,
              symbol: "none",
              lineStyle: { width: 2, color: stroke },
              areaStyle: { opacity: 0.14, color: stroke },
            },
      ],
      tooltip: { show: false },
    };
  }, [categories, values, kind, stroke]);

  if (!rows?.length) return null;

  const wrapStyle: React.CSSProperties = measureContainer
    ? {
        flex: 1,
        alignSelf: "stretch",
        minHeight: Math.max(48, height),
        width: "100%",
        minWidth: 0,
      }
    : {
        height,
        width: "100%",
        minHeight: height,
        minWidth: 0,
      };

  return (
    <div ref={wrapRef} style={wrapStyle}>
      <ReactECharts
        option={option}
        style={{ height: chartPixelHeight, width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
