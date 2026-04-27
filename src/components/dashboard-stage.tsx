"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  ImageIcon,
  LayoutGrid,
  MousePointerClick,
  ScanLine,
  Type,
} from "lucide-react";

import type {
  DashboardNode,
  GroupNode,
  PageModel,
  VisdocModel,
  WidgetNode,
} from "@/lib/dashboard-schema";
import { visdocSchema, LOCAL_STORAGE_KEY } from "@/lib/dashboard-schema";

// ─── Types ───────────────────────────────────────────────

type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U> | undefined>
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

type StreamedVisdocModel = DeepPartial<VisdocModel>;

type StageProps = {
  board?: StreamedVisdocModel;
  isLoading: boolean;
  activePageId?: string;
  onPageChange?: (pageId: string) => void;
};

// ─── Guards ──────────────────────────────────────────────

function isGroupNode(node: unknown): node is GroupNode {
  return Boolean(node && typeof node === "object" && (node as Record<string, unknown>).type === "group");
}

function isWidgetNode(node: unknown): node is WidgetNode {
  return Boolean(
    node && typeof node === "object" &&
    (node as Record<string, unknown>).type === "widget" &&
    "widgetType" in (node as Record<string, unknown>),
  );
}

// ─── Helpers ─────────────────────────────────────────────

/** 从 AI 数据的 layoutStyle 提取绝对定位样式 + 视觉风格（纯数据驱动） */
function widgetShell(style: WidgetNode["layoutStyle"] | undefined | null): CSSProperties {
  if (!style) {
    return { position: "absolute" as const, left: 0, top: 0, width: 320, height: 180 };
  }

  const shell: CSSProperties = {
    position: "absolute",
    left: style.position?.[0] ?? 0,
    top: style.position?.[1] ?? 0,
    width: style.width ?? 320,
    height: style.height ?? 180,
    transform: `rotate(${style.rotation ?? 0}deg)`,
    transformOrigin: "center center",
    overflow: "hidden",
  };

  // ── AI 驱动的视觉属性 ──
  if (style.borderRadius != null) shell.borderRadius = style.borderRadius;
  if (style.borderWidth != null) shell.borderWidth = style.borderWidth;
  if (style.borderColor) shell.borderColor = style.borderColor;
  if (style.borderStyle) shell.borderStyle = style.borderStyle;
  if (style.backgroundColor) shell.backgroundColor = style.backgroundColor;
  if (style.boxShadow) shell.boxShadow = style.boxShadow;
  if (style.opacity != null) shell.opacity = style.opacity;

  return shell;
}

/** 合并 ECharts series 覆盖配置 */
function mergeSeriesOverrides<T extends Record<string, unknown>>(base: T, override: unknown) {
  if (!override || typeof override !== "object" || Array.isArray(override)) {
    return base;
  }
  return { ...base, ...(override as Record<string, unknown>) } as T & Record<string, unknown>;
}

/** 解析当前激活页面 */
function resolveActivePage(
  board: StreamedVisdocModel | undefined,
  activePageId?: string,
) {
  const pages = (board?.pages?.filter(Boolean) ?? []) as NonNullable<StreamedVisdocModel["pages"]>;
  const page =
    pages.find((item) => item?.id === activePageId) ??
    pages.find((item) => item?.id === board?.currentPageId) ??
    pages[0];
  return { pages, activePage: page };
}

// ─── Canvas Auto-Scaling ────────────────────────────────

/**
 * 根据 host 容器实际尺寸与画布设计尺寸(viewSize)，计算等比缩放比例。
 * 确保画布始终完整显示在容器内（fit-content）。
 */
function useCanvasScale(width: number, height: number) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = hostRef.current;
    if (!element || !width || !height) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const nextScale = Math.min(
        entry.contentRect.width / width,
        entry.contentRect.height / height,
      );
      setScale(nextScale > 0 ? nextScale : 1);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [width, height]);

  return { hostRef, scale };
}

// ══════════════════════════════════════════════════════════
// ─── Widget Renderers ────────────────────────────────────
// ══════════════════════════════════════════════════════════

/** Text 文本组件 */
function TextWidget({ config }: { config: Extract<WidgetNode, { widgetType: "text" }>["config"] }) {
  if (!config) return <div className="h-full w-full flex items-center justify-center text-xs text-white/30">空文本</div>;

  return (
    <div
      className="flex h-full w-full items-center p-3"
      style={{
        color: config.color ?? "#fff",
        fontSize: `${config.fontSize ?? 16}px`,
        fontWeight: config.fontWeight ?? 400,
        fontStyle: config.fontStyle ?? "normal",
        textAlign: config.textAlign ?? "left",
        lineHeight: 1.4,
        // verticalAlign 在 div 上通过 flex 对齐模拟
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
function ImageWidget({ config }: { config: Extract<WidgetNode, { widgetType: "image" }>["config"] }) {
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
function PixelWidget({ config }: { config: Extract<WidgetNode, { widgetType: "pixel" }>["config"] }) {
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

  return (
    <div className="flex h-full w-full flex-col p-4">
      {showTitle && title ? (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-white/35 font-medium">pixel metric</p>
          <span className="text-3xl font-bold tabular-nums text-white">{value}%</span>
        </div>
      ) : showTitle ? null : null}
      <h3 className={`text-lg font-semibold text-white ${!showTitle ? "" : "mt-1"}`}>{title}</h3>
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
function SelectWidget({ config }: { config: Extract<WidgetNode, { widgetType: "select" }>["config"] }) {
  if (!config) return <div className="h-full w-full" />;

  return (
    <div className="flex h-full w-full items-center px-3">
      <div className="w-full px-3 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-white/34">
          <MousePointerClick className="h-3 w-3" />
          filter
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-white/72">{config.placeholder || "请选择…"}</span>
          <span className="text-white/34">{config.options?.[0] ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}

/** 构建 ECharts option（bar / line / pie / funnel） */
function buildChartOption(widget: Extract<WidgetNode, { widgetType: "bar" | "line" | "pie" | "funnel" }>) {
  const cfg = widget.config;
  if (!cfg) return {};

  const titleStyle = {
    color: "#f8fafc",
    fontSize: cfg.title ? 16 : 0,
    fontWeight: 600 as const,
  };

  const axisStyle = {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: "rgba(226,232,240,0.66)", fontSize: 11 },
    splitLine: { lineStyle: { color: "rgba(148,163,184,0.10)" } },
  };

  const baseOption: Record<string, unknown> = {
    backgroundColor: "transparent",
    animation: true,
  };

  // 添加标题（如果有）
  if (cfg.title) {
    baseOption.title = { text: cfg.title, left: 10, top: 8, textStyle: { ...titleStyle, fontSize: 15 } };
  }

  switch (widget.widgetType) {
    case "bar":
      return {
        ...baseOption,
        grid: { left: 16, right: 16, top: cfg.title ? 48 : 16, bottom: 20, containLabel: true },
        tooltip: { trigger: "axis", confine: true },
        xAxis: { type: "category", data: cfg.categories ?? [], ...axisStyle },
        yAxis: { type: "value", ...axisStyle },
        series: (cfg.seriesData ?? []).map((item) =>
          mergeSeriesOverrides(
            {
              type: "bar",
              name: item.name,
              data: item.data,
              itemStyle: { color: item.color ?? "#f97316", borderRadius: [6, 6, 0, 0] },
              barWidth: cfg.barWidth ?? "52%",
            },
            cfg.series,
          ),
        ),
        ...(typeof cfg.option === "object" && cfg.option ? (cfg.option as Record<string, unknown>) : {}),
      };

    case "line":
      return {
        ...baseOption,
        grid: { left: 16, right: 16, top: cfg.title ? 48 : 16, bottom: 20, containLabel: true },
        tooltip: { trigger: "axis", confine: true },
        legend: { top: cfg.title ? 44 : 8, right: 10, textStyle: { color: "rgba(226,232,240,0.68)", fontSize: 11 } },
        xAxis: { type: "category", data: cfg.categories ?? [], ...axisStyle },
        yAxis: { type: "value", ...axisStyle },
        series: (cfg.seriesData ?? []).map((item) =>
          mergeSeriesOverrides(
            {
              type: "line",
              name: item.name,
              data: item.data,
              smooth: cfg.smooth ?? true,
              lineStyle: { color: item.color ?? "#38bdf8", width: 2.5 },
              itemStyle: { color: item.color ?? "#38bdf8" },
              areaStyle: cfg.areaStyle ? { color: item.color ?? "#38bdf8", opacity: 0.12 } : undefined,
            },
            cfg.series,
          ),
        ),
        ...(typeof cfg.option === "object" && cfg.option ? (cfg.option as Record<string, unknown>) : {}),
      };

    case "pie":
      return {
        ...baseOption,
        tooltip: { trigger: "item", confine: true },
        legend: { orient: "vertical" as const, right: 8, top: "center", textStyle: { color: "rgba(226,232,240,0.68)", fontSize: 11 } },
        series: [
          mergeSeriesOverrides(
            {
              type: "pie",
              radius: cfg.radius ?? ["40%", "68%"],
              center: ["36%", "54%"],
              data: (cfg.data ?? []).map((d) => ({ ...d, itemStyle: { color: d.color } })),
              label: { color: "rgba(226,232,240,0.78)", fontSize: 11 },
            },
            cfg.series,
          ),
        ],
        ...(typeof cfg.option === "object" && cfg.option ? (cfg.option as Record<string, unknown>) : {}),
      };

    case "funnel":
      return {
        ...baseOption,
        tooltip: { trigger: "item", confine: true },
        series: [
          mergeSeriesOverrides(
            {
              type: "funnel",
              left: "6%",
              top: cfg.title ? 48 : 16,
              width: "88%",
              height: "80%",
              label: { show: true, position: "inside" as const, color: "#f8fafc", fontSize: 11 },
              itemStyle: { borderColor: "rgba(255,255,255,0.6)", borderWidth: 1 },
              data: (cfg.data ?? []).map((d) => ({ ...d, itemStyle: { color: d.color } })),
            },
            cfg.series,
          ),
        ],
        ...(typeof cfg.option === "object" && cfg.option ? (cfg.option as Record<string, unknown>) : {}),
      };

    default:
      return baseOption;
  }
}

/** Chart 图表统一渲染器 */
function ChartWidget({ widget }: { widget: Extract<WidgetNode, { widgetType: "bar" | "line" | "pie" | "funnel" }> }) {
  return (
    <div className="h-full w-full overflow-hidden">
      <ReactECharts
        option={buildChartOption(widget)}
        style={{ height: "100%", width: "100%" }}
        notMerge
        lazyUpdate
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ─── Unified Widget Router ───────────────────────────────
// ══════════════════════════════════════════════════════════

/** 根据 widgetType 分发到对应的渲染器 */
function renderWidgetByType(widget: WidgetNode): ReactNode {
  switch (widget.widgetType) {
    case "text":   return <TextWidget config={widget.config} />;
    case "image":  return <ImageWidget config={widget.config} />;
    case "pixel":  return <PixelWidget config={widget.config} />;
    case "select": return <SelectWidget config={widget.config} />;
    case "bar":
    case "line":
    case "pie":
    case "funnel": return <ChartWidget widget={widget} />;
    default:       return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/32">
        未知类型: {String((widget as Record<string, unknown>).widgetType)}
      </div>
    );
  }
}

/** Widget 类型图标 */
function widgetIcon(type: string) {
  switch (type) {
    case "text":   return <Type className="h-3 w-3" />;
    case "image":  return <ImageIcon className="h-3 w-3" />;
    case "pixel":  return <LayoutGrid className="h-3 w-3" />;
    case "select": return <MousePointerClick className="h-3 w-3" />;
    default:       return <ScanLine className="h-3 w-3" />;
  }
}

// ══════════════════════════════════════════════════════════
// ─── Node Tree Renderer ──────────────────────────────────
// ══════════════════════════════════════════════════════════

/**
 * 递归渲染节点树：
 * - group 节点：递归渲染其 childrenIds
 * - widget 节点：根据 layoutStyle 绝对定位，分发到对应渲染器
 *
 * AI 返回的数据结构：
 *   page.rootNodeId → group node → childrenIds → [widget ids]
 *   每个 widget 的 layoutStyle 包含 [x,y] 坐标和宽高
 */
function RenderNode({
  nodeId,
  nodeMap,
}: {
  nodeId: string;
  nodeMap: StreamedVisdocModel["nodeMap"];
}): ReactNode {
  const node = nodeMap?.[nodeId];

  // 防御：节点不存在或 ID 无效
  if (!node || !nodeId || typeof nodeId !== "string") {
    return null;
  }

  // Group 节点：递归渲染子节点
  if (isGroupNode(node)) {
    const children = node.childrenIds?.filter(Boolean).map((childId) => {
      if (typeof childId !== "string") return null;
      return <RenderNode key={childId} nodeId={childId} nodeMap={nodeMap} />;
    });
    return <>{children}</>;
  }

  // Widget 节点：绝对定位 + 内容渲染
  if (isWidgetNode(node)) {
    return (
      <div
        key={node.id}
        style={widgetShell(node.layoutStyle)}
        className="group/widget"
        data-widget-id={node.id}
        data-widget-type={node.widgetType}
      >
        {/* 调试信息角标（可选） */}
        <div
          className="pointer-events-none absolute -top-4 left-0 z-50 hidden max-w-[160px] truncate rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-white/60 group-hover/widget:block"
          title={`${node.name} (${node.widgetType})`}
        >
          {widgetIcon(node.widgetType)} {node.name}
        </div>
        {renderWidgetByType(node)}
      </div>
    );
  }

  return null;
}

// ══════════════════════════════════════════════════════════
// ─── Page Canvas (Absolute Layout Container) ────────────
// ══════════════════════════════════════════════════════════

/**
 * 核心画布容器（纯 AI 数据驱动）：
 * 1. 尺寸由 AI 返回的 viewSize 决定（如 1920×1080）
 * 2. 通过 ResizeObserver 自动计算缩放比例，确保画布完整适配父容器
 * 3. 背景色完全来自 AI 数据（page.backgroundColor 或全局 backgroundColor）
 * 4. 无任何装饰层/边框/阴影 — 纯净画布
 */
function PageCanvas({
  board,
  page,
}: {
  board: StreamedVisdocModel;
  page?: DeepPartial<PageModel>;
}) {
  const width = board.viewSize?.width ?? 1920;
  const height = board.viewSize?.height ?? 1080;
  const bgColor = (page?.backgroundColor ?? board.backgroundColor ?? "#081121") as string;
  const { hostRef, scale } = useCanvasScale(width, height);

  return (
    <div
      ref={hostRef}
      className="relative h-full w-full overflow-hidden"
    >
      {/* 缩放后的画布主体 — 无预设装饰，纯 AI 驱动 */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          width,
          height,
          background: bgColor,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* 节点树渲染区域 — 所有子组件在此以绝对定位排列 */}
        <div className="relative" style={{ width, height }}>
          {page?.rootNodeId ? (
            <RenderNode nodeId={page.rootNodeId} nodeMap={board.nodeMap} />
          ) : (
            /* 无 rootNodeId 时的降级提示 */
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <ScanLine className="mx-auto mb-3 h-10 w-10 text-white/16" />
                <p className="text-base text-white/42">当前页面无根节点</p>
                <p className="mt-1 text-xs text-white/26">等待 AI 生成看板文档…</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ─── Main Export: DashboardStage ─────────────────────────
// ══════════════════════════════════════════════════════════

export function DashboardStage({
  board,
  isLoading,
  activePageId,
  onPageChange,
}: StageProps) {
  const { pages, activePage } = resolveActivePage(board, activePageId);

  // 是否有有效数据
  const hasData = !!board?.name && !!pages.length;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* ── 纯画布区域（无预设 chrome）── */}
      {!hasData ? (
        /* 空状态 */
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-10 text-center">
            <LayoutGrid className="mx-auto mb-4 h-12 w-12 text-white/[0.12]" />
            <p className="text-base font-medium text-white/48">暂无看板数据</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/28">
              在左侧输入框描述你想要的数据可视化看板，
              <br />AI 将自动生成分页文档并在此处渲染。
            </p>
            <button
              type="button"
              className="mt-5 cursor-pointer rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm text-white/56 transition hover:bg-white/[0.10] hover:text-white/78"
              onClick={() => {
                try {
                  const demoRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
                  if (demoRaw) {
                    window.dispatchEvent(new CustomEvent("dv-board-load-demo"));
                  }
                } catch { /* ignore */ }
              }}
            >
              或加载示例看板预览效果 →
            </button>
          </div>
        </div>
      ) : (
        /* 有数据时显示画布 */
        <PageCanvas board={board!} page={activePage} />
      )}

      {/* ── 极简分页浮层（仅多页时显示，非 header/footer）── */}
      {hasData && pages.length > 1 && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
          <nav className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/40 px-2 py-1.5 backdrop-blur-md">
            {pages.map((pg, idx) =>
              pg?.id ? (
                <button
                  key={pg.id}
                  type="button"
                  onClick={() => onPageChange?.(pg.id as string)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    pg.id === activePage?.id
                      ? "bg-[#f97316] text-[#140a00]"
                      : "text-white/58 hover:text-white/82"
                  }`}
                >
                  {String(pg.name ?? `P${idx + 1}`)}
                </button>
              ) : null,
            )}
          </nav>
        </div>
      )}

      {/* ── 加载状态浮层 ── */}
      {isLoading && hasData && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-20">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-4 py-2 backdrop-blur-md">
            <span className="text-xs text-white/56">AI 更新中…</span>
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-yellow-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
