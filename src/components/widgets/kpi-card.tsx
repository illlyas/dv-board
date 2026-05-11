"use client";

import React, { useMemo } from "react";
import { useWidgetData } from "@/hooks/use-widget-data";
import { buildKpiGroupItemPropsSnapshot } from "@/lib/dashboard-store";
import { KpiPresetIconById } from "@/components/dv-assets/kpi-preset-icons/kpi-preset-icon-by-id";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { KPIProps, KPIWidgetGroupItem, KPIMiniChartConfig } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";
import { KPIMiniSparkline } from "@/components/widgets/kpi-mini-sparkline";

function formatMetricValue(
  val: unknown,
  format: KPIProps["format"],
  precision?: number
): string {
  const n = typeof val === "number" ? val : Number(val);
  if (Number.isNaN(n)) return "—";
  if (format === "currency") return `¥${n.toLocaleString()}`;
  if (format === "percentage") return `${n.toFixed(precision ?? 1)}%`;
  if (format === "decimal") return n.toFixed(precision ?? 2);
  return n.toLocaleString();
}

type MetricSlice = {
  value?: unknown;
  trendValue?: string | number;
  trendDirection?: "up" | "down" | "flat";
  comparison?: { value?: string | number; label?: string };
};

function readMetricSlice(data: Record<string, unknown> | null | undefined, valueKey: string): MetricSlice {
  if (!data || !(valueKey in data)) return {};
  const raw = data[valueKey];
  if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    if ("value" in o) {
      return {
        value: o.value,
        trendValue: o.trendValue as string | number | undefined,
        trendDirection: (o.trendDirection ?? o.trend) as MetricSlice["trendDirection"],
        comparison: o.comparison as MetricSlice["comparison"],
      };
    }
  }
  return { value: raw };
}

function getPrimaryNumeric(
  data: Record<string, unknown> | null | undefined,
  valueKey: string | undefined,
  propsValueFallback?: unknown
): number {
  if (!data && propsValueFallback == null) return 0;
  if (valueKey && data && valueKey in data) {
    const s = readMetricSlice(data, valueKey);
    const v = s.value;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  const v0 = data?.value ?? propsValueFallback;
  const n = typeof v0 === "number" ? v0 : Number(v0);
  return Number.isNaN(n) ? 0 : n;
}

function trendSemanticColor(direction: "up" | "down" | "flat"): string {
  if (direction === "up") return "var(--kpi-delta-up)";
  if (direction === "down") return "var(--kpi-delta-down)";
  return "var(--kpi-delta-flat)";
}

function TrendGlyph({ direction }: { direction: "up" | "down" | "flat" }) {
  const ch = direction === "up" ? "↗" : direction === "down" ? "↘" : "→";
  return <span style={{ fontSize: "var(--font-size-sm)" }}>{ch}</span>;
}

function ValueSkeleton() {
  return (
    <div
      style={{
        height: "1.1em",
        width: "4.5rem",
        maxWidth: "100%",
        borderRadius: "var(--radius-sm)",
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 75%)",
        backgroundSize: "200% 100%",
        animation: "kpi-shimmer 1.2s ease-in-out infinite",
      }}
    />
  );
}

function resolveMiniSeries(
  data: Record<string, unknown> | null | undefined,
  cfg: KPIMiniChartConfig
): number[] | Record<string, unknown>[] | null {
  if (!data || !cfg.seriesKey) return null;
  const raw = data[cfg.seriesKey];
  if (!Array.isArray(raw) || raw.length === 0) return null;
  if (typeof raw[0] === "number") return raw as number[];
  return raw as Record<string, unknown>[];
}

function IconSlot({
  presetIconId,
  icon,
  size = 32,
}: {
  presetIconId?: KPIProps["presetIconId"];
  icon?: string;
  size?: number;
}) {
  if (presetIconId) {
    return (
      <div style={{ width: size, height: size, flexShrink: 0, opacity: 0.92 }} aria-hidden>
        <KpiPresetIconById id={presetIconId} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
    );
  }
  if (icon) {
    return <div style={{ fontSize: size * 0.75, opacity: 0.6, lineHeight: 1 }}>{icon}</div>;
  }
  return null;
}

function PrimaryValueText({
  children,
  colorToken,
  glow,
}: {
  children: React.ReactNode;
  colorToken?: string;
  glow: "inherit" | "off";
}) {
  return (
    <span
      style={{
        fontSize: "var(--kpi-font-size-value)",
        fontWeight: "var(--font-weight-bold)",
        color: colorToken ?? "var(--kpi-text-primary)",
        lineHeight: 1.1,
        wordBreak: "break-all",
        fontFamily: "var(--font-display, var(--font-body))",
        ...(glow === "inherit"
          ? {
              /* 近似「rgba(…,0.8) 0 2px 16px」的近距强光晕 + 外层柔光；色相来自 --kpi-glow-base */
              textShadow: [
                "0 var(--kpi-glow-offset-y, 2px) var(--kpi-glow-blur-inner, 16px) color-mix(in srgb, var(--kpi-glow-base, transparent) var(--kpi-glow-alpha-inner, 78%), transparent)",
                "0 0 var(--kpi-glow-blur-outer, 30px) color-mix(in srgb, var(--kpi-glow-base, transparent) var(--kpi-glow-alpha-outer, 46%), transparent)",
              ].join(", "),
            }
          : {}),
      }}
    >
      {children}
    </span>
  );
}

type Surface = NonNullable<KPIProps["presentation"]>["surface"];
type Layout = NonNullable<KPIProps["presentation"]>["layout"];

function KpiGroupItemDataBridge({
  item,
  widgetType,
  parentProps,
  glow,
  hairlineRight,
  hairlineBottom,
  compact,
  enableWidgetData,
}: {
  item: KPIWidgetGroupItem;
  widgetType: string;
  parentProps: KPIProps;
  glow: "inherit" | "off";
  hairlineRight?: boolean;
  hairlineBottom?: boolean;
  compact?: boolean;
  enableWidgetData: boolean;
}) {
  const propsSnapshot = useMemo(
    () =>
      buildKpiGroupItemPropsSnapshot(widgetType, parentProps as unknown as Record<string, unknown>, item),
    [widgetType, parentProps, item]
  );
  const baseSlot = parentProps.dataSlotId?.trim() ?? "";
  const itemSlotId = baseSlot ? `${baseSlot}.__${item.id}` : undefined;

  const { data, loading } = useWidgetData({
    widgetType,
    enabled: enableWidgetData,
    dataSlotId: itemSlotId,
    pageIndex: parentProps.pageIndex,
    dataKey: parentProps.dataKey,
    dataSource: parentProps.dataSource,
    query: parentProps.query,
    staticData: parentProps.staticData,
    propsSnapshot,
  });

  const rowObj = (data ?? {}) as Record<string, unknown>;

  return (
    <GroupMetricItem
      item={item}
      data={rowObj}
      loading={loading}
      glow={glow}
      hairlineRight={hairlineRight}
      hairlineBottom={hairlineBottom}
      compact={compact}
    />
  );
}

function KPIMetricGroup({
  config,
  enableWidgetData = true,
}: WidgetComponentProps<{ type: "KPI"; props: KPIProps }> & { enableWidgetData?: boolean }) {
  const props = config.props;
  const items = props.groupItems!;
  const pres = props.presentation ?? {};
  const surface: Surface = pres.surface ?? "none";
  const layout: Layout = pres.layout ?? "metric-group-inline";
  const glow = pres.valueGlow ?? "inherit";

  const isInline = layout === "metric-group-inline" || layout === "header-inline";
  const hairlineBetween = surface === "hairline";

  const outerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: isInline ? "row" : "column",
    alignItems: isInline ? "stretch" : "stretch",
    /* 多列 inline 时允许换行，避免列宽被 flex:1 1 0 压到 0 导致字叠在一起 */
    flexWrap: isInline ? "wrap" : undefined,
    alignContent: isInline ? "flex-start" : undefined,
    gap: isInline ? "var(--space-2)" : "var(--space-2)",
    ...props.style,
  };

  if (surface === "card") {
    outerStyle.background = props.gradient
      ? `linear-gradient(135deg, ${props.gradient[0]} 0%, ${props.gradient[1]} 100%)`
      : "linear-gradient(135deg, var(--kpi-bg-from, #1e293b) 0%, var(--kpi-bg-to, #334155) 100%)";
    outerStyle.borderRadius = 16;
    outerStyle.padding = "var(--space-4)";
    outerStyle.boxShadow = props.shadow ? "var(--shadow-md, 0 4px 24px rgba(0,0,0,0.15))" : "none";
  } else if (surface === "hairline") {
    outerStyle.border = "1px solid var(--color-border)";
    outerStyle.borderRadius = "var(--radius-md)";
    outerStyle.padding = "var(--space-3)";
  } else {
    outerStyle.background = "transparent";
    outerStyle.padding = "var(--space-1)";
  }

  const wt = config.type;

  return (
    <div style={outerStyle}>
      {items.map((item, idx) => (
        <KpiGroupItemDataBridge
          key={item.id}
          item={item}
          widgetType={wt}
          parentProps={props}
          glow={glow}
          hairlineRight={hairlineBetween && isInline && idx < items.length - 1}
          hairlineBottom={hairlineBetween && !isInline && idx < items.length - 1}
          compact={isInline}
          enableWidgetData={enableWidgetData}
        />
      ))}
    </div>
  );
}

function GroupMetricItem({
  item,
  data,
  loading,
  glow,
  hairlineRight,
  hairlineBottom,
  compact,
}: {
  item: KPIWidgetGroupItem;
  data: Record<string, unknown>;
  loading: boolean;
  glow: "inherit" | "off";
  hairlineRight?: boolean;
  hairlineBottom?: boolean;
  compact?: boolean;
}) {
  const slice = readMetricSlice(data, item.valueKey);
  const valueNum = getPrimaryNumeric(data, item.valueKey, slice.value);
  const trendDir = (slice.trendDirection ?? item.trendDirection ?? "flat") as "up" | "down" | "flat";
  const trendVal =
    (item.trendValueKey && data[item.valueKey] && typeof data[item.valueKey] === "object"
      ? (data[item.valueKey] as Record<string, unknown>)[item.trendValueKey]
      : undefined) ??
    slice.trendValue ??
    item.trendValue;
  const showTrend = item.trend && trendVal != null && trendVal !== "";
  const mini = item.miniChart ? resolveMiniSeries(data, item.miniChart) : null;

  const inner: React.CSSProperties = {
    flex: compact ? "1 1 148px" : "none",
    minWidth: compact ? 120 : 0,
    minHeight: 0,
    display: "flex",
    flexDirection: compact ? "row" : "column",
    /* stretch：有 mini 时让右侧文案列吃满 KPI 行高，迷你图才能 flex 长高 */
    alignItems: compact ? "stretch" : "flex-start",
    gap: compact ? "var(--space-3)" : "var(--space-2)",
    padding: compact ? "var(--space-2)" : "var(--space-2) 0",
    borderRight: hairlineRight ? "1px solid var(--kpi-group-divider)" : undefined,
    borderBottom: hairlineBottom ? "1px solid var(--kpi-group-divider)" : undefined,
  };

  return (
    <div style={inner}>
      <div style={{ flexShrink: 0, alignSelf: compact ? "center" : undefined }}>
        <IconSlot presetIconId={item.presetIconId} size={compact ? 28 : 36} />
      </div>
      <div
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          minHeight: compact ? 0 : undefined,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        {item.title ? (
          <div
            style={{
              fontSize: "var(--kpi-font-size-label)",
              fontWeight: 500,
              color: "var(--kpi-text-secondary)",
            }}
          >
            {item.title}
          </div>
        ) : null}
        {item.subtitle ? (
          <div style={{ fontSize: "var(--kpi-font-size-footnote)", color: "var(--kpi-text-muted)" }}>{item.subtitle}</div>
        ) : null}
        {loading ? (
          <ValueSkeleton />
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-1)", flexWrap: "wrap" }}>
            {item.prefix ? (
              <span style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--kpi-text-secondary)" }}>
                {item.prefix}
              </span>
            ) : null}
            <PrimaryValueText glow={glow}>{formatMetricValue(valueNum, item.format, item.precision)}</PrimaryValueText>
            {item.unit ? (
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--kpi-text-secondary)" }}>{item.unit}</span>
            ) : null}
            {item.suffix ? (
              <span style={{ fontSize: "var(--font-size-base)", color: "var(--kpi-text-secondary)" }}>{item.suffix}</span>
            ) : null}
          </div>
        )}
        {showTrend && !loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "var(--kpi-font-size-footnote)",
              fontWeight: 600,
              color: trendSemanticColor(trendDir),
            }}
          >
            <TrendGlyph direction={trendDir} />
            <span>{String(trendVal)}</span>
          </div>
        ) : null}
        {item.comparison && !loading ? (
          <div style={{ fontSize: "var(--kpi-font-size-footnote)", color: "var(--kpi-text-muted)" }}>
            {item.comparison.label}:{" "}
            {item.comparison.valueKey && data[item.valueKey] && typeof data[item.valueKey] === "object"
              ? String((data[item.valueKey] as Record<string, unknown>)[item.comparison.valueKey!] ?? "")
              : slice.comparison?.value ?? item.comparison.value ?? ""}
          </div>
        ) : null}
        {mini && item.miniChart ? (
          <div
            style={{
              width: "100%",
              minHeight: Math.max(52, item.miniChart.height ?? 44),
              minWidth: 0,
              display: "flex",
              flex: compact ? 1 : undefined,
            }}
          >
            <KPIMiniSparkline
              rows={mini}
              kind={item.miniChart.kind}
              height={item.miniChart.height ?? 44}
              xField={item.miniChart.xField}
              yField={item.miniChart.yField}
              measureContainer={compact}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function KPISingle({ config, data, loading }: WidgetComponentProps<{ type: "KPI"; props: KPIProps }>) {
  const props = config.props;
  const pres = props.presentation ?? {};
  const surface: Surface = pres.surface ?? "card";
  const layout: Layout = pres.layout ?? "classic";
  const glow = pres.valueGlow ?? "inherit";
  const row = (data ?? {}) as Record<string, unknown>;

  const valueKey = props.valueKey;
  const slice = valueKey ? readMetricSlice(row, valueKey) : {};
  const value = getPrimaryNumeric(row, valueKey, row.value);
  const trendDirection = (
    slice.trendDirection ??
    (typeof row.trend === "string" ? row.trend : undefined) ??
    props.trendDirection ??
    "flat"
  ) as "up" | "down" | "flat";
  const trendValue = row.trendValue ?? slice.trendValue ?? props.trendValue;

  const secondary = props.secondaryStatistic;
  let secondaryDisplay: string | undefined;
  if (secondary?.valueKey && row[secondary.valueKey] != null) {
    secondaryDisplay = formatMetricValue(row[secondary.valueKey], secondary.format ?? props.format, secondary.precision);
  }

  const footerText = (row.footerText as string | undefined) ?? props.footer;
  const miniRows = props.miniChart ? resolveMiniSeries(row, props.miniChart) : null;

  const showBottomMetrics =
    (props.trend && trendValue != null && trendValue !== "") || props.comparison || !!secondaryDisplay;
  const hasIcon = Boolean(props.presetIconId || props.icon);
  const twoColClassic = layout === "classic" && (hasIcon || showBottomMetrics);

  const trendBlock =
    props.trend && trendValue != null && trendValue !== "" ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: "var(--font-size-sm)",
          fontWeight: 600,
          color: trendSemanticColor(trendDirection),
        }}
      >
        <TrendGlyph direction={trendDirection} />
        <span>{String(trendValue)}</span>
      </div>
    ) : null;

  const comparisonBlock =
    props.comparison ? (
      <div style={{ fontSize: "var(--kpi-font-size-footnote)", color: "var(--kpi-text-muted)", wordBreak: "break-word" }}>
        {props.comparison.label}:{" "}
        {(row.comparison as { value?: string | number } | undefined)?.value ?? props.comparison.value}
      </div>
    ) : null;

  const secondaryBlock =
    secondary && secondaryDisplay != null ? (
      <div style={{ fontSize: "var(--kpi-font-size-footnote)", color: "var(--kpi-text-secondary)" }}>
        {secondary.label}: {secondary.prefix}
        {secondaryDisplay}
        {secondary.suffix}
      </div>
    ) : null;

  const metricsEl =
    showBottomMetrics || secondaryBlock ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: layout === "header-inline" ? "flex-end" : "flex-end",
          gap: 4,
          flexShrink: 0,
          textAlign: layout === "header-inline" ? "right" : "right",
          minWidth: 0,
        }}
      >
        {trendBlock}
        {comparisonBlock}
        {secondaryBlock}
      </div>
    ) : null;

  const iconEl = <IconSlot presetIconId={props.presetIconId} icon={props.icon} size={layout === "pedestal-row" ? 48 : 32} />;

  const valueRow = loading ? (
    <ValueSkeleton />
  ) : (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4, flexWrap: "wrap", minWidth: 0 }}>
      {props.prefix ? (
        <span style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--kpi-text-secondary)" }}>
          {props.prefix}
        </span>
      ) : null}
      <PrimaryValueText colorToken={props.color} glow={glow}>
        {formatMetricValue(value, props.format, props.precision)}
      </PrimaryValueText>
      {props.unit ? (
        <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--kpi-text-secondary)" }}>
          {props.unit}
        </span>
      ) : null}
      {props.suffix ? (
        <span style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--kpi-text-secondary)" }}>
          {props.suffix}
        </span>
      ) : null}
    </div>
  );

  const titleBlock = (
    <>
      {props.title ? (
        <div style={{ fontSize: "var(--kpi-font-size-label)", fontWeight: 500, color: "var(--kpi-text-secondary)", marginBottom: 4 }}>
          {props.title}
        </div>
      ) : null}
      {props.subtitle ? (
        <div style={{ fontSize: "var(--kpi-font-size-footnote)", color: "var(--kpi-text-muted)" }}>{props.subtitle}</div>
      ) : null}
    </>
  );

  const decoOrb =
    surface === "card" ? (
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
    ) : null;

  const shellBase: React.CSSProperties = {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    ...props.style,
  };

  if (surface === "card") {
    shellBase.background = props.gradient
      ? `linear-gradient(135deg, ${props.gradient[0]} 0%, ${props.gradient[1]} 100%)`
      : "linear-gradient(135deg, var(--kpi-bg-from, #1e293b) 0%, var(--kpi-bg-to, #334155) 100%)";
    shellBase.backdropFilter = "blur(10px)";
    shellBase.border = "none";
    shellBase.borderRadius = 16;
    shellBase.padding = "var(--space-5)";
    shellBase.boxShadow = props.shadow ? "var(--shadow-md, 0 4px 24px rgba(0,0,0,0.1))" : "none";
    shellBase.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  } else if (surface === "hairline") {
    shellBase.background = "transparent";
    shellBase.border = "1px solid var(--color-border)";
    shellBase.borderRadius = "var(--radius-md)";
    shellBase.padding = "var(--space-4)";
  } else {
    shellBase.background = "transparent";
    shellBase.border = "none";
    shellBase.padding = layout === "pedestal-row" ? "var(--space-2)" : "var(--space-3)";
    shellBase.borderRadius = 0;
  }

  if (layout === "header-inline") {
    return (
      <div style={{ ...shellBase, display: "flex", flexDirection: "row", alignItems: "stretch", gap: "var(--space-4)", zIndex: 1 }}>
        {decoOrb}
        {iconEl ? <div style={{ flexShrink: 0, alignSelf: "center" }}>{iconEl}</div> : null}
        <div
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          <div style={{ flexShrink: 0 }}>{titleBlock}</div>
          <div style={{ flexShrink: 0 }}>{valueRow}</div>
          {miniRows && props.miniChart ? (
            <div style={{ flex: 1, minHeight: 56, minWidth: 0, width: "100%", display: "flex" }}>
              <KPIMiniSparkline
                rows={miniRows}
                kind={props.miniChart.kind}
                height={props.miniChart.height ?? 48}
                xField={props.miniChart.xField}
                yField={props.miniChart.yField}
                measureContainer
              />
            </div>
          ) : null}
          {footerText ? (
            <div style={{ flexShrink: 0, fontSize: "var(--kpi-font-size-footnote)", color: "var(--kpi-text-muted)", marginTop: "var(--space-1)" }}>
              {footerText}
            </div>
          ) : null}
        </div>
        {metricsEl ? <div style={{ flexShrink: 0, alignSelf: "center" }}>{metricsEl}</div> : null}
      </div>
    );
  }

  if (layout === "pedestal-row") {
    return (
      <div
        style={{
          ...shellBase,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "center",
          gap: "var(--space-2)",
          zIndex: 1,
        }}
      >
        {decoOrb}
        {iconEl}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", alignItems: "center", flexShrink: 0 }}>
          {titleBlock}
          {valueRow}
        </div>
        {miniRows && props.miniChart ? (
          <div style={{ width: "100%", maxWidth: 320, flex: 1, minHeight: 56, minWidth: 0, display: "flex" }}>
            <KPIMiniSparkline
              rows={miniRows}
              kind={props.miniChart.kind}
              height={props.miniChart.height ?? 48}
              xField={props.miniChart.xField}
              yField={props.miniChart.yField}
              measureContainer
            />
          </div>
        ) : null}
        {metricsEl}
        {footerText ? (
          <div style={{ flexShrink: 0, fontSize: "var(--kpi-font-size-footnote)", color: "var(--kpi-text-muted)" }}>{footerText}</div>
        ) : null}
      </div>
    );
  }

  if (layout === "sidebar-stack") {
    return (
      <div style={{ ...shellBase, display: "flex", flexDirection: "column", alignItems: "stretch", gap: "var(--space-3)", zIndex: 1 }}>
        {decoOrb}
        <div style={{ flexShrink: 0 }}>{titleBlock}</div>
        <div style={{ flexShrink: 0 }}>{valueRow}</div>
        {miniRows && props.miniChart ? (
          <div style={{ flex: 1, minHeight: 56, width: "100%", minWidth: 0, display: "flex" }}>
            <KPIMiniSparkline
              rows={miniRows}
              kind={props.miniChart.kind}
              height={props.miniChart.height ?? 48}
              xField={props.miniChart.xField}
              yField={props.miniChart.yField}
              measureContainer
            />
          </div>
        ) : null}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: "var(--space-4)", flexShrink: 0 }}>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>{metricsEl}</div>
        </div>
        {footerText ? (
          <div style={{ flexShrink: 0, fontSize: "var(--kpi-font-size-footnote)", color: "var(--kpi-text-muted)" }}>{footerText}</div>
        ) : null}
      </div>
    );
  }

  /* classic (default grid) */
  const hasMini = Boolean(miniRows && props.miniChart);
  return (
    <div style={{ ...shellBase, display: "grid", gridTemplateColumns: twoColClassic ? "minmax(0, 1fr) max-content" : "minmax(0, 1fr)", columnGap: 12, alignItems: "stretch", zIndex: 1 }}>
      {decoOrb}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, height: "100%", overflow: "hidden" }}>
        <div style={{ flexShrink: 0, marginBottom: 8 }}>{titleBlock}</div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            overflow: "hidden",
            gap: "var(--space-2)",
          }}
        >
          <div style={{ flexShrink: 0, width: "100%", minWidth: 0 }}>{valueRow}</div>
          {hasMini ? (
            <div style={{ flex: 1, minHeight: 56, width: "100%", minWidth: 0, display: "flex", flexDirection: "column" }}>
              <KPIMiniSparkline
                rows={miniRows}
                kind={props.miniChart!.kind}
                height={props.miniChart!.height ?? 48}
                xField={props.miniChart!.xField}
                yField={props.miniChart!.yField}
                measureContainer
              />
            </div>
          ) : null}
          {footerText ? (
            <div style={{ flexShrink: 0, fontSize: "var(--kpi-font-size-footnote)", color: "var(--kpi-text-muted)" }}>{footerText}</div>
          ) : null}
        </div>
      </div>
      {twoColClassic ? (
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", height: "100%", minHeight: 0, flexShrink: 0 }}>
          {iconEl ? <div style={{ flexShrink: 0 }}>{iconEl}</div> : null}
          {metricsEl ? (
            <div style={{ flexShrink: 0, marginTop: "auto", paddingTop: iconEl ? 8 : 0 }}>{metricsEl}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function KPICard(
  props: WidgetComponentProps<{ type: "KPI"; props: KPIProps }> & { enableWidgetData?: boolean }
) {
  const groupItems = props.config.props.groupItems;
  if (groupItems?.length) {
    return <KPIMetricGroup {...props} />;
  }
  return <KPISingle {...props} />;
}

registerWidget("KPI", KPICard);
registerWidget("Metric", KPICard);
registerWidget("StatCard", KPICard);

export default KPICard;
