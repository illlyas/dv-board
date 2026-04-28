"use client";

import { createElement } from "react";
import ReactECharts from "echarts-for-react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BatteryCharging,
  BusFront,
  Factory,
  Fuel,
  GraduationCap,
  Leaf,
  LineChart,
  Minus,
  MousePointerClick,
  ShieldAlert,
  Ship,
  ShoppingCart,
  Trees,
  TrendingUp,
  Waves,
  Wrench,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type { WidgetNode } from "@/lib/dashboard-schema";

type VisualSystemLike = {
  tokens?: {
    textPrimary?: string;
    textSecondary?: string;
    sectionBg?: string;
    sectionBorder?: string;
    divider?: string;
    chartTitleIcon?: string;
    chartTitleBadgeBg?: string;
    chartTitleBorder?: string;
    chartTitleHighlightBg?: string;
    accent?: string;
    accentSoft?: string;
    panelBorder?: string;
    positive?: string;
    warning?: string;
    negative?: string;
    chartTitleIconSize?: number;
  };
  componentRules?: {
    chartTitleBadge?: "subtle" | "solid";
    chartTitleHighlight?: "none" | "solid-tint" | "gradient-tint";
  };
};

function resolveChartMeta(
  title: string | undefined,
  iconHint: string | undefined,
  widgetType: "bar" | "line" | "pie" | "funnel" | "waterfall",
) {
  const source = `${title ?? ""} ${iconHint ?? ""}`.toLowerCase();
  const iconMap: Array<{ keywords: string[]; icon: LucideIcon }> = [
    { keywords: ["销售", "营收", "收入", "gmv", "订单", "毛利", "利润", "财务"], icon: Banknote },
    { keywords: ["客流", "用户", "客户", "会员", "人群"], icon: TrendingUp },
    { keywords: ["能源", "电", "负荷", "发电", "储能"], icon: BatteryCharging },
    { keywords: ["工业", "制造", "产线", "产能", "工厂"], icon: Factory },
    { keywords: ["水", "水利", "流量", "水位", "供水"], icon: Waves },
    { keywords: ["交通", "客运", "路网", "出行", "线路"], icon: BusFront },
    { keywords: ["港口", "航运", "码头", "泊位", "吞吐"], icon: Ship },
    { keywords: ["农业", "种植", "养殖", "农田"], icon: Leaf },
    { keywords: ["校园", "学校", "学生", "教学"], icon: GraduationCap },
    { keywords: ["园区", "楼宇", "招商", "入驻"], icon: Trees },
    { keywords: ["零售", "门店", "商品", "sku", "库存"], icon: ShoppingCart },
    { keywords: ["运维", "故障", "告警", "sla", "工单"], icon: Wrench },
    { keywords: ["风险", "异常", "预警", "告警"], icon: ShieldAlert },
    { keywords: ["成本", "能耗", "油", "燃料"], icon: Fuel },
  ];

  const matched = iconMap.find((item) => item.keywords.some((keyword) => source.includes(keyword)));
  if (matched) return matched.icon;

  switch (widgetType) {
    case "line":
      return LineChart;
    case "funnel":
      return Activity;
    case "waterfall":
      return AlertTriangle;
    default:
      return TrendingUp;
  }
}

function ChartHeader({
  title,
  subtitle,
  iconHint,
  widgetType,
  visualSystem,
}: {
  title?: string;
  subtitle?: string;
  iconHint?: string;
  widgetType: "bar" | "line" | "pie" | "funnel" | "waterfall";
  visualSystem?: VisualSystemLike;
}) {
  if (!title) return null;

  const chartIcon = resolveChartMeta(title, iconHint, widgetType);
  const primaryText = visualSystem?.tokens?.textPrimary ?? "#f8fafc";
  const secondaryText = visualSystem?.tokens?.textSecondary ?? "rgba(248,250,252,0.72)";
  const iconColor = visualSystem?.tokens?.chartTitleIcon ?? visualSystem?.tokens?.accent ?? "#38bdf8";
  const borderColor = visualSystem?.tokens?.chartTitleBorder ?? visualSystem?.tokens?.divider ?? "rgba(255,255,255,0.12)";
  const highlightBg = visualSystem?.tokens?.chartTitleHighlightBg ?? "rgba(56,189,248,0.10)";
  const badgeBg = visualSystem?.componentRules?.chartTitleBadge === "solid"
    ? (visualSystem?.tokens?.chartTitleBadgeBg ?? "rgba(56,189,248,0.16)")
    : (visualSystem?.tokens?.chartTitleBadgeBg ?? "rgba(255,255,255,0.05)");
  const iconSize = visualSystem?.tokens?.chartTitleIconSize ?? 16;
  const highlightMode = visualSystem?.componentRules?.chartTitleHighlight ?? "solid-tint";
  const headerBackground =
    highlightMode === "gradient-tint"
      ? `linear-gradient(90deg, ${highlightBg} 0%, rgba(255,255,255,0) 100%)`
      : highlightMode === "solid-tint"
        ? highlightBg
        : "transparent";

  return (
    <div
      className="mb-3 flex items-start justify-between gap-3 rounded-xl border-b px-3 py-3"
      style={{
        borderColor,
        background: headerBackground,
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="flex shrink-0 items-center justify-center rounded-lg border"
            style={{
              width: iconSize + 14,
              height: iconSize + 14,
              color: iconColor,
              borderColor,
              backgroundColor: badgeBg,
            }}
          >
            {createElement(chartIcon, { size: iconSize, strokeWidth: 2.1 })}
          </span>
          <h3 className="truncate text-sm font-semibold" style={{ color: primaryText }}>
            {title}
          </h3>
        </div>
        {subtitle ? (
          <p className="mt-1 pl-[34px] text-xs leading-5" style={{ color: secondaryText }}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function mergeSeriesOverrides<T extends Record<string, unknown>>(base: T, override: unknown) {
  if (!override || typeof override !== "object" || Array.isArray(override)) {
    return base;
  }
  return { ...base, ...(override as Record<string, unknown>) } as T & Record<string, unknown>;
}

function formatValue(value: number, unit?: string) {
  const rendered = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${rendered}${unit ?? ""}`;
}

function deltaTone(value: number, visualSystem?: VisualSystemLike) {
  if (value > 0) return visualSystem?.tokens?.positive ?? "#22c55e";
  if (value < 0) return visualSystem?.tokens?.negative ?? "#ef4444";
  return visualSystem?.tokens?.warning ?? "#f59e0b";
}

export function TextWidget({
  config,
  visualSystem,
}: {
  config: Extract<WidgetNode, { widgetType: "text" }>["config"];
  visualSystem?: VisualSystemLike;
}) {
  if (!config) return <div className="flex h-full w-full items-center justify-center text-xs text-white/30">空文本</div>;

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

export function SectionWidget({
  config,
  visualSystem,
}: {
  config: Extract<WidgetNode, { widgetType: "section" }>["config"];
  visualSystem?: VisualSystemLike;
}) {
  if (!config) return <div className="h-full w-full" />;

  const primaryText = visualSystem?.tokens?.textPrimary ?? "#f8fafc";
  const secondaryText = visualSystem?.tokens?.textSecondary ?? "rgba(248,250,252,0.72)";
  const justifyContent =
    config.align === "center" ? "center" :
    config.align === "right" ? "flex-end" :
    "flex-start";
  const textAlign = config.align ?? "left";

  return (
    <div className="pointer-events-none flex h-full w-full flex-col p-5" style={{ justifyContent: "flex-start" }}>
      <div style={{ textAlign, alignSelf: justifyContent }}>
        <div className="text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: secondaryText }}>
          section
        </div>
        <h3 className="mt-2 text-lg font-semibold" style={{ color: primaryText }}>{config.title}</h3>
        {config.subtitle ? (
          <p className="mt-1 max-w-[80%] text-xs leading-5" style={{ color: secondaryText }}>
            {config.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function DividerWidget({
  config,
  visualSystem,
}: {
  config: Extract<WidgetNode, { widgetType: "divider" }>["config"];
  visualSystem?: VisualSystemLike;
}) {
  if (!config) return <div className="h-full w-full" />;

  const lineColor = visualSystem?.tokens?.divider ?? visualSystem?.tokens?.sectionBorder ?? visualSystem?.tokens?.panelBorder ?? "rgba(255,255,255,0.14)";
  const textColor = visualSystem?.tokens?.textSecondary ?? "rgba(248,250,252,0.72)";
  const thickness = config.emphasis === "strong" ? 2 : 1;

  if (config.direction === "vertical") {
    return (
      <div className="pointer-events-none flex h-full w-full items-center justify-center">
        <div style={{ width: thickness, height: "100%", backgroundColor: lineColor, opacity: config.emphasis === "strong" ? 0.7 : 0.38 }} />
      </div>
    );
  }

  return (
    <div className="pointer-events-none flex h-full w-full items-center gap-3">
      <div style={{ height: thickness, flex: 1, backgroundColor: lineColor, opacity: config.emphasis === "strong" ? 0.7 : 0.38 }} />
      {config.label ? (
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: textColor }}>
          {config.label}
        </span>
      ) : null}
      {config.label ? (
        <div style={{ height: thickness, flex: 1, backgroundColor: lineColor, opacity: config.emphasis === "strong" ? 0.7 : 0.38 }} />
      ) : null}
    </div>
  );
}

export function ImageWidget({ config }: { config: Extract<WidgetNode, { widgetType: "image" }>["config"] }) {
  if (!config) return <div className="flex h-full w-full items-center justify-center text-xs text-white/30">空图片</div>;

  const src = config.url || config.fileKey;
  if (!src) {
    return <div className="flex h-full w-full items-center justify-center text-sm text-white/36">图片资源待配置</div>;
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
          <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: secondaryText }}>pixel metric</p>
          <span className="text-3xl font-bold tabular-nums" style={{ color: primaryText }}>{value}%</span>
        </div>
      ) : null}
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

export function BulletWidget({
  config,
  visualSystem,
}: {
  config: Extract<WidgetNode, { widgetType: "bullet" }>["config"];
  visualSystem?: VisualSystemLike;
}) {
  if (!config) return <div className="h-full w-full" />;

  const primaryText = visualSystem?.tokens?.textPrimary ?? "#f8fafc";
  const secondaryText = visualSystem?.tokens?.textSecondary ?? "rgba(248,250,252,0.72)";
  const accent = config.accentColor ?? visualSystem?.tokens?.accent ?? "#38bdf8";
  const positive = config.positiveColor ?? visualSystem?.tokens?.positive ?? "#22c55e";
  const negative = config.negativeColor ?? visualSystem?.tokens?.negative ?? "#ef4444";
  const targetSafe = config.target === 0 ? 1 : config.target;
  const completion = Math.max(0, Math.min(1.2, config.value / targetSafe));
  const variance = config.value - config.target;
  const variancePct = (variance / targetSafe) * 100;
  const previousDelta = typeof config.previous === "number" ? config.value - config.previous : null;

  return (
    <div className="flex h-full w-full flex-col justify-between p-4">
      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: secondaryText }}>target attainment</div>
        <h3 className="mt-2 text-base font-semibold" style={{ color: primaryText }}>{config.title}</h3>
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-bold tabular-nums" style={{ color: primaryText }}>
            {formatValue(config.value, config.unit)}
          </div>
          <div className="mt-1 text-xs" style={{ color: secondaryText }}>
            目标 {formatValue(config.target, config.unit)}
          </div>
        </div>
        <div
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            color: variance >= 0 ? positive : negative,
            backgroundColor: `${variance >= 0 ? positive : negative}1A`,
          }}
        >
          {variance >= 0 ? "+" : ""}{variancePct.toFixed(1)}%
        </div>
      </div>

      <div className="mt-4">
        <div className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: `${accent}20` }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(completion * 100, 100)}%`,
              backgroundColor: variance >= 0 ? positive : accent,
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs" style={{ color: secondaryText }}>
          <span>达成率 {(completion * 100).toFixed(1)}%</span>
          {previousDelta != null ? (
            <span style={{ color: deltaTone(previousDelta, visualSystem) }}>
              较上期 {previousDelta >= 0 ? "+" : ""}{formatValue(previousDelta, config.unit)}
            </span>
          ) : (
            <span>{config.note ?? "关注目标偏差与修复动作"}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function RankWidget({
  config,
  visualSystem,
}: {
  config: Extract<WidgetNode, { widgetType: "rank" }>["config"];
  visualSystem?: VisualSystemLike;
}) {
  if (!config) return <div className="h-full w-full" />;

  const primaryText = visualSystem?.tokens?.textPrimary ?? "#f8fafc";
  const secondaryText = visualSystem?.tokens?.textSecondary ?? "rgba(248,250,252,0.72)";
  const borderColor = visualSystem?.tokens?.panelBorder ?? "rgba(255,255,255,0.12)";

  return (
    <div className="flex h-full w-full flex-col p-4">
      {config.title ? <h3 className="mb-3 text-base font-semibold" style={{ color: primaryText }}>{config.title}</h3> : null}
      <div className="space-y-2">
        {config.items.map((item) => {
          const movement = typeof item.previousRank === "number" ? item.previousRank - item.rank : 0;
          const tone = deltaTone(movement, visualSystem);
          return (
            <div
              key={`${item.rank}-${item.name}`}
              className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
              style={{ borderColor, backgroundColor: item.highlight ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)" }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ color: primaryText, backgroundColor: "rgba(255,255,255,0.06)" }}>
                {item.rank}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium" style={{ color: primaryText }}>{item.name}</div>
                <div className="truncate text-xs" style={{ color: secondaryText }}>
                  {item.note ?? `当前值 ${formatValue(item.value)}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums" style={{ color: primaryText }}>{formatValue(item.value)}</span>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: tone }}>
                  {movement > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : movement < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                  {movement > 0 ? `升 ${movement}` : movement < 0 ? `降 ${Math.abs(movement)}` : "持平"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TableWidget({
  config,
  visualSystem,
}: {
  config: Extract<WidgetNode, { widgetType: "table" }>["config"];
  visualSystem?: VisualSystemLike;
}) {
  if (!config) return <div className="h-full w-full" />;

  const primaryText = visualSystem?.tokens?.textPrimary ?? "#f8fafc";
  const secondaryText = visualSystem?.tokens?.textSecondary ?? "rgba(248,250,252,0.72)";
  const borderColor = visualSystem?.tokens?.panelBorder ?? "rgba(255,255,255,0.10)";

  return (
    <div className="flex h-full w-full flex-col p-4">
      {config.title ? <h3 className="mb-3 text-base font-semibold" style={{ color: primaryText }}>{config.title}</h3> : null}
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border" style={{ borderColor }}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
              {config.columns.map((column) => (
                <th key={column} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: secondaryText }}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.rows.map((row, rowIndex) => {
              const highlighted = config.anomalyRowIndexes.includes(rowIndex);
              return (
                <tr key={`${rowIndex}-${row.join("-")}`} style={{ backgroundColor: highlighted ? "rgba(239,68,68,0.08)" : "transparent" }}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${rowIndex}-${cellIndex}`}
                      className="border-t px-3 py-2 text-xs"
                      style={{ borderColor, color: cellIndex === 0 ? primaryText : secondaryText }}
                    >
                      {cell == null ? "—" : String(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {config.summary ? <p className="mt-2 text-xs leading-5" style={{ color: secondaryText }}>{config.summary}</p> : null}
    </div>
  );
}

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
    grid: { left: 16, right: 16, top: 12, bottom: 20, containLabel: true },
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
    grid: { left: 16, right: 16, top: 16, bottom: 20, containLabel: true },
    tooltip: { trigger: "axis", confine: true },
    legend: { top: 8, right: 10, textStyle: { color: "rgba(226,232,240,0.68)", fontSize: 11 } },
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
    tooltip: { trigger: "item", confine: true },
    series: [
      mergeSeriesOverrides(
        { type: "funnel", left: "6%", top: 16, width: "88%", height: "80%", label: { show: true, position: "inside" as const, color: "#f8fafc", fontSize: 11 }, itemStyle: { borderColor: "rgba(255,255,255,0.6)", borderWidth: 1 }, data: (cfg.data ?? []).map((d) => ({ ...d, itemStyle: { color: d.color } })) },
        cfg.series,
      ),
    ],
    ...(typeof cfg.option === "object" && cfg.option ? (cfg.option as Record<string, unknown>) : {}),
  };
}

function buildWaterfallOption(cfg: NonNullable<Extract<WidgetNode, { widgetType: "waterfall" }>["config"]>) {
  const cumulative = [cfg.startValue];
  for (const step of cfg.steps) {
    cumulative.push(cumulative[cumulative.length - 1] + step.value);
  }
  const categories = [cfg.startLabel ?? "起点", ...cfg.steps.map((step) => step.name), cfg.endLabel ?? "结果"];
  const helpData = [0];
  for (let index = 0; index < cfg.steps.length; index += 1) {
    const base = Math.min(cumulative[index], cumulative[index + 1]);
    helpData.push(base);
  }
  helpData.push(0);

  const deltaBars = cfg.steps.map((step) => ({
    value: Math.abs(step.value),
    itemStyle: { color: step.color ?? (step.value >= 0 ? "#22c55e" : "#ef4444") },
  }));

  return {
    backgroundColor: "transparent",
    animation: true,
    grid: { left: 16, right: 16, top: 16, bottom: 24, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: { type: "category" as const, data: categories, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "rgba(226,232,240,0.66)", fontSize: 11 } },
    yAxis: { type: "value" as const, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "rgba(226,232,240,0.66)", fontSize: 11 }, splitLine: { lineStyle: { color: "rgba(148,163,184,0.10)" } } },
    series: [
      {
        type: "bar",
        stack: "total",
        silent: true,
        itemStyle: { color: "transparent" },
        emphasis: { disabled: true },
        data: helpData,
      },
      {
        type: "bar",
        stack: "total",
        label: { show: true, position: "top" as const, color: "rgba(248,250,252,0.78)", fontSize: 11 },
        data: [
          { value: cfg.startValue, itemStyle: { color: "#38bdf8" } },
          ...deltaBars,
          { value: cfg.endValue, itemStyle: { color: "#f59e0b" } },
        ],
      },
    ],
  };
}

export function ChartWidget({
  widget,
  visualSystem,
}: {
  widget: Extract<WidgetNode, { widgetType: "bar" | "line" | "pie" | "funnel" | "waterfall" }>;
  visualSystem?: VisualSystemLike;
}) {
  const option = (() => {
    if (!widget.config) return {};
    switch (widget.widgetType) {
      case "bar": return buildBarOption(widget.config);
      case "line": return buildLineOption(widget.config);
      case "pie": return buildPieOption(widget.config);
      case "funnel": return buildFunnelOption(widget.config);
      case "waterfall": return buildWaterfallOption(widget.config);
      default: return {};
    }
  })();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-4">
      <ChartHeader
        title={widget.config?.title ?? widget.name}
        subtitle={widget.config?.subtitle}
        iconHint={widget.config?.iconHint}
        widgetType={widget.widgetType}
        visualSystem={visualSystem}
      />
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%", minHeight: 0, flex: 1 }}
        notMerge
        lazyUpdate
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
