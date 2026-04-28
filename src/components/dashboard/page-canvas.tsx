"use client";

import type { ReactNode } from "react";
import { ScanLine, ImageIcon, LayoutGrid, ListTree, Minus, MousePointerClick, PanelsTopLeft, Table2, Target, TrendingUp, Type } from "lucide-react";

import type { WidgetNode } from "@/lib/dashboard-schema";
import { useCanvasScale } from "@/hooks/use-canvas-scale";
import { isGroupNode, isWidgetNode, widgetShell } from "@/lib/dashboard-helpers";
import type { StreamedVisdocModel } from "@/lib/dashboard-helpers";
import {
  SectionWidget,
  DividerWidget,
  TextWidget,
  ImageWidget,
  PixelWidget,
  BulletWidget,
  RankWidget,
  TableWidget,
  SelectWidget,
  ChartWidget,
} from "@/components/dashboard/widgets";

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

// ─── Widget Router ────────────────────────────────────────

function renderWidgetByType(widget: WidgetNode, visualSystem?: VisualSystemLike): ReactNode {
  switch (widget.widgetType) {
    case "section": return <SectionWidget config={widget.config} visualSystem={visualSystem} />;
    case "divider": return <DividerWidget config={widget.config} visualSystem={visualSystem} />;
    case "text":   return <TextWidget config={widget.config} visualSystem={visualSystem} />;
    case "image":  return <ImageWidget config={widget.config} />;
    case "pixel":  return <PixelWidget config={widget.config} visualSystem={visualSystem} />;
    case "bullet": return <BulletWidget config={widget.config} visualSystem={visualSystem} />;
    case "rank":   return <RankWidget config={widget.config} visualSystem={visualSystem} />;
    case "table":  return <TableWidget config={widget.config} visualSystem={visualSystem} />;
    case "select": return <SelectWidget config={widget.config} visualSystem={visualSystem} />;
    case "bar":
    case "line":
    case "pie":
    case "funnel":
    case "waterfall": return <ChartWidget widget={widget} visualSystem={visualSystem} />;
    default:       return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/32">
        未知类型: {String((widget as Record<string, unknown>).widgetType)}
      </div>
    );
  }
}

function widgetIcon(type: string) {
  switch (type) {
    case "section": return <PanelsTopLeft className="h-3 w-3" />;
    case "divider": return <Minus className="h-3 w-3" />;
    case "text":   return <Type className="h-3 w-3" />;
    case "image":  return <ImageIcon className="h-3 w-3" />;
    case "pixel":  return <LayoutGrid className="h-3 w-3" />;
    case "bullet": return <Target className="h-3 w-3" />;
    case "rank":   return <TrendingUp className="h-3 w-3" />;
    case "table":  return <Table2 className="h-3 w-3" />;
    case "select": return <MousePointerClick className="h-3 w-3" />;
    case "waterfall": return <ListTree className="h-3 w-3" />;
    default:       return <ScanLine className="h-3 w-3" />;
  }
}

// ─── Node Tree Renderer ──────────────────────────────────

function RenderNode({
  nodeId,
  nodeMap,
  visualSystem,
}: {
  nodeId: string;
  nodeMap: StreamedVisdocModel["nodeMap"];
  visualSystem?: VisualSystemLike;
}): ReactNode {
  const node = nodeMap?.[nodeId];

  if (!node || !nodeId || typeof nodeId !== "string") {
    return null;
  }

  // Group 节点：递归渲染子节点
  if (isGroupNode(node)) {
    const children = node.childrenIds?.filter(Boolean).map((childId) => {
      if (typeof childId !== "string") return null;
      return <RenderNode key={childId} nodeId={childId} nodeMap={nodeMap} visualSystem={visualSystem} />;
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
        <div
          className="pointer-events-none absolute -top-4 left-0 z-50 hidden max-w-[160px] truncate rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-white/60 group-hover/widget:block"
          title={`${node.name} (${node.widgetType})`}
        >
          {widgetIcon(node.widgetType)} {node.name}
        </div>
        {renderWidgetByType(node, visualSystem)}
      </div>
    );
  }

  return null;
}

// ══════════════════════════════════════════════════════════
// ─── Page Canvas ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════

export function PageCanvas({
  board,
  page,
}: {
  board: StreamedVisdocModel;
  page?: NonNullable<StreamedVisdocModel["pages"]>[number];
}) {
  const width = board.viewSize?.width ?? 1920;
  const height = board.viewSize?.height ?? 1080;
  const bgColor = (page?.backgroundColor ?? board.backgroundColor ?? "#081121") as string;
  const visualSystem = board.visualSystem;
  const { hostRef, scale } = useCanvasScale(width, height);

  return (
    <div
      ref={hostRef}
      className="relative h-full w-full overflow-hidden"
    >
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
        <div className="relative" style={{ width, height }}>
          {page?.rootNodeId ? (
            <RenderNode nodeId={page.rootNodeId} nodeMap={board.nodeMap} visualSystem={visualSystem} />
          ) : (
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
