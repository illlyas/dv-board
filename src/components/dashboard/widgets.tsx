"use client";

import ReactECharts from "echarts-for-react";
import { MousePointerClick } from "lucide-react";

import type { WidgetNode } from "@/lib/dashboard-schema";

type VisualSystemLike = {
  tokens?: {
    textPrimary?: string;
    textSecondary?: string;
  };
};

// ─── ECharts Helpers ──────────────────────────────────────

/** 合并 ECharts series 覆盖配置 */
function mergeSeriesOverrides<T extends Record<string, unknown>>(base: T, override: unknown) {
  if (!override || typeof override !== "object" || Array.isArray(override)) {
    return base;
  }
  return { ...base, ...(override as Record<string, unknown>) } as T & Record<string, unknown>;
}

// ══════════════════════════════════════════════════════════
// ─── Widget Renderers ────────────────────────────────────
// ══════════════════════════════════════════════════════════

/** Text 文本组件 */
export function TextWidget({
  config,
  visualSystem,
}: {
  config: Extract<WidgetNode, { widgetType: "text" }>["config"];
  visualSystem?: VisualSystemLike;
}) {
  if (!config) return <div className="h-full w-full flex items-center justify-center text-xs text-white/30">空文本</div>;

  return (
    <div
      className="flex h-full w-full items-center p-3"
      style={{
        color: config.color ?? visualSystem?.tokens?.textPrimary ?? "#fff",
        fontSize: `${config.fontSize ?? 16}px`,
        fontWeight: config.fontWeight ?? 400,
        fontStyle: config.fontStyle ?? "normal",
        textAlign: config.textAlign ?? "left",
        lineHeight: 1.4,
        justifyContent:
          config.textAlign === "center" ? "center" :
          config.textAlign === "right" ? "flex-end" : "flex-start",
        alignItems:
          config.verticalAlign === "middle" ? "center" :
          config.verticalAlign === "bottom" ? "flex-end" : "flex-start",
      }}
    >
      <span className="break-words">{config.text}</span>
    </div>
  );
}

/** Image 图片组件 */
export function ImageWidget({ config }: { config: Extract<WidgetNode, { widgetType: "image" }>["config"] }) {
  if (!config) return <div className="h-full w-full flex items-center justify-center text-xs text-white/30">空图片</div>;

  const src = config.url || config.fileKey;
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/36">
        图片资源待配置
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={config.url ? "dashboard image" : ""}
      className="h-full w-full"
      draggable={false}
      style={{ objectFit: config.fillMode ?? "cover" }}
    />
  );
}

/** Pixel 像素进度组件 */
export function PixelWidget({
  config,
  visualSystem,
}: {
  config: Extract<WidgetNode, { widgetType: "pixel" }>["config"];
  visualSystem?: VisualSystemLike;
}) {
  if (!config) return <div className="h-full w-full" />;

  const {
    title = "",
    value = 0,
    target = 100,
    pixelsRowCount = 10,
    pixelsColumnCount = 10,
    pixelRowGap = 4,
    pixelColumnGap = 4,
    borderRadius = 6,
    showTitle = true,
    colorRanges = [],
    globalOpacityRanges = [],
  } = config;

  const total = pixelsRowCount * pixelsColumnCount;
  const filledCount = Math.max(0, Math.min(total, Math.round((value / target) * total)));
  const cells = Array.from({ length: total });

  const resolveColor = (index: number) => {
    const percent = ((index + 1) / total) * 100;
    return colorRanges.find((r) => percent >= r.min && percent <= r.max)?.color ?? "#38bdf8";
  };

  const resolveOpacity = (index: number, filled: boolean) => {
    if (!filled) {
      const percent = ((index + 1) / total) * 100;
      return globalOpacityRanges.find((r) => percent >= r.min && percent <= r.max)?.opacity ?? 0.18;
    }
    return 1;
  };

  const primaryText = visualSystem?.tokens?.textPrimary ?? "#f8fafc";
  const secondaryText = visualSystem?.tokens?.textSecondary ?? "rgba(248,250,252,0.72)";

  return (
    <div className="flex h-full w-full flex-col p-4">
      {showTitle && title ? (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] font-medium" style={{ color: secondaryText }}>pixel metric</p>
          <span className="text-3xl font-bold tabular-nums" style={{ color: primaryText }}>{value}%</span>
        </div>
      ) : showTitle ? null : null}
      <h3 className={`text-lg font-semibold ${!showTitle ? "" : "mt-1"}`} style={{ color: primaryText }}>{title}</h3>
      <div
        className="grid flex-1"
        style={{
          gridTemplateColumns: `repeat(${pixelsColumnCount}, minmax(0, 1fr))`,
          gap: `${pixelRowGap}px ${pixelColumnGap}px`,
        }}
      >
        {cells.map((_, index) => {
          const filled = index < filledCount;
          return (
            <span
              key={index}
              className="transition-all duration-500"
              style={{
                borderRadius,
                backgroundColor: resolveColor(index),
                opacity: resolveOpacity(index, filled),
                boxShadow: filled ? "0 0 14px rgba(56,189,248,0.16)" : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Select 选择器组件 */
export function SelectWidget({
  config,
  visualSystem,
}: {
  config: Extract<WidgetNode, { widgetType: "select" }>["config"];
  visualSystem?: VisualSystemLike;
}) {
  if (!config) return <div className="h-full w-full" />;

  const primaryText = visualSystem?.tokens?.textPrimary ?? "#f8fafc";
  const secondaryText = visualSystem?.tokens?.textSecondary ?? "rgba(248,250,252,0.72)";

  return (
    <div className="flex h-full w-full items-center px-3">
      <div className="w-full px-3 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em]" style={{ color: secondaryText }}>
          <MousePointerClick className="h-3 w-3" />
          filter
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span style={{ color: primaryText }}>{config.placeholder || "请选择…"}</span>
          <span style={{ color: secondaryText }}>{config.options?.[0] ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Chart Builders (per-type, avoids union narrowing issues) ──

function buildBarOption(cfg: NonNullable<Extract<WidgetNode, { widgetType: "bar" }>["config"]>) {
  const axisStyle = {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: "rgba(226,232,240,0.66)", fontSize: 11 },
    splitLine: { lineStyle: { color: "rgba(148,163,184,0.10)" } },
  };
  return {
    backgroundColor: "transparent",
    animation: true,
    ...(cfg.title ? { title: { text: cfg.title, left: 10, top: 8, textStyle: { color: "#f8fafc", fontSize: 15, fontWeight: 600 } } } : {}),
    grid: { left: 16, right: 16, top: cfg.title ? 48 : 16, bottom: 20, containLabel: true },
    tooltip: { trigger: "axis", confine: true },
    xAxis: { type: "category" as const, data: cfg.categories ?? [], ...axisStyle },
    yAxis: { type: "value" as const, ...axisStyle },
    series: (cfg.seriesData ?? []).map((item) =>
      mergeSeriesOverrides(
        { type: "bar", name: item.name, data: item.data, itemStyle: { color: item.color ?? "#f97316", borderRadius: [6, 6, 0, 0] }, barWidth: cfg.barWidth ?? "52%" },
        cfg.series,
      ),
    ),
    ...(typeof cfg.option === "object" && cfg.option ? (cfg.option as Record<string, unknown>) : {}),
  };
}

function buildLineOption(cfg: NonNullable<Extract<WidgetNode, { widgetType: "line" }>["config"]>) {
  const axisStyle = {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: "rgba(226,232,240,0.66)", fontSize: 11 },
    splitLine: { lineStyle: { color: "rgba(148,163,184,0.10)" } },
  };
  return {
    backgroundColor: "transparent",
    animation: true,
    ...(cfg.title ? { title: { text: cfg.title, left: 10, top: 8, textStyle: { color: "#f8fafc", fontSize: 15, fontWeight: 600 } } } : {}),
    grid: { left: 16, right: 16, top: cfg.title ? 48 : 16, bottom: 20, containLabel: true },
    tooltip: { trigger: "axis", confine: true },
    legend: { top: cfg.title ? 44 : 8, right: 10, textStyle: { color: "rgba(226,232,240,0.68)", fontSize: 11 } },
    xAxis: { type: "category" as const, data: cfg.categories ?? [], ...axisStyle },
    yAxis: { type: "value" as const, ...axisStyle },
    series: (cfg.seriesData ?? []).map((item) =>
      mergeSeriesOverrides(
        { type: "line", name: item.name, data: item.data, smooth: cfg.smooth ?? true, lineStyle: { color: item.color ?? "#38bdf8", width: 2.5 }, itemStyle: { color: item.color ?? "#38bdf8" }, areaStyle: cfg.areaStyle ? { color: item.color ?? "#38bdf8", opacity: 0.12 } : undefined },
        cfg.series,
      ),
    ),
    ...(typeof cfg.option === "object" && cfg.option ? (cfg.option as Record<string, unknown>) : {}),
  };
}

function buildPieOption(cfg: NonNullable<Extract<WidgetNode, { widgetType: "pie" }>["config"]>) {
  return {
    backgroundColor: "transparent",
    animation: true,
    ...(cfg.title ? { title: { text: cfg.title, left: 10, top: 8, textStyle: { color: "#f8fafc", fontSize: 15, fontWeight: 600 } } } : {}),
    tooltip: { trigger: "item", confine: true },
    legend: { orient: "vertical" as const, right: 8, top: "center", textStyle: { color: "rgba(226,232,240,0.68)", fontSize: 11 } },
    series: [
      mergeSeriesOverrides(
        { type: "pie", radius: cfg.radius ?? ["40%", "68%"], center: ["36%", "54%"], data: (cfg.data ?? []).map((d) => ({ ...d, itemStyle: { color: d.color } })), label: { color: "rgba(226,232,240,0.78)", fontSize: 11 } },
        cfg.series,
      ),
    ],
    ...(typeof cfg.option === "object" && cfg.option ? (cfg.option as Record<string, unknown>) : {}),
  };
}

function buildFunnelOption(cfg: NonNullable<Extract<WidgetNode, { widgetType: "funnel" }>["config"]>) {
  return {
    backgroundColor: "transparent",
    animation: true,
    ...(cfg.title ? { title: { text: cfg.title, left: 10, top: 8, textStyle: { color: "#f8fafc", fontSize: 15, fontWeight: 600 } } } : {}),
    tooltip: { trigger: "item", confine: true },
    series: [
      mergeSeriesOverrides(
        { type: "funnel", left: "6%", top: cfg.title ? 48 : 16, width: "88%", height: "80%", label: { show: true, position: "inside" as const, color: "#f8fafc", fontSize: 11 }, itemStyle: { borderColor: "rgba(255,255,255,0.6)", borderWidth: 1 }, data: (cfg.data ?? []).map((d) => ({ ...d, itemStyle: { color: d.color } })) },
        cfg.series,
      ),
    ],
    ...(typeof cfg.option === "object" && cfg.option ? (cfg.option as Record<string, unknown>) : {}),
  };
}

// ─── Chart Widget (unified entry) ────────────────────────

/** Chart 图表统一渲染器 */
export function ChartWidget({
  widget,
}: {
  widget: Extract<WidgetNode, { widgetType: "bar" | "line" | "pie" | "funnel" }>;
}) {
  const option = (() => {
    if (!widget.config) return {};
    switch (widget.widgetType) {
      case "bar":    return buildBarOption(widget.config);
      case "line":   return buildLineOption(widget.config);
      case "pie":    return buildPieOption(widget.config);
      case "funnel": return buildFunnelOption(widget.config);
      default:       return {};
    }
  })();

  return (
    <div className="h-full w-full overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        notMerge
        lazyUpdate
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
