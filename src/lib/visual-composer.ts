import { visdocSchema, type VisdocModel, type WidgetNode } from "@/lib/dashboard-schema";
import type { BoardStructure } from "@/lib/structure-schema";
import type { VisualSystemSpec } from "@/lib/visual-system";

function mergeOption(base: Record<string, unknown>, override: unknown) {
  return override && typeof override === "object" && !Array.isArray(override)
    ? { ...base, ...(override as Record<string, unknown>) }
    : base;
}

function shadowValue(shadow: VisualSystemSpec["tokens"]["shadow"], accentSoft: string) {
  switch (shadow) {
    case "elevated":
      return `0 10px 32px ${accentSoft}`;
    case "soft":
      return "0 8px 24px rgba(15, 23, 42, 0.18)";
    default:
      return "none";
  }
}

function panelStyle(
  variant: "transparent" | "soft" | "solid" | "outline",
  visual: VisualSystemSpec,
) {
  const { tokens } = visual;
  const base = {
    borderRadius: tokens.radius,
    borderWidth: tokens.borderWidth,
    borderStyle: "solid" as const,
    boxShadow: shadowValue(tokens.shadow, tokens.accentSoft),
  };

  switch (variant) {
    case "transparent":
      return {
        ...base,
        backgroundColor: "transparent",
        borderColor: "transparent",
        borderWidth: 0,
        boxShadow: "none",
      };
    case "outline":
      return {
        ...base,
        backgroundColor: "transparent",
        borderColor: tokens.panelBorder,
      };
    case "solid":
      return {
        ...base,
        backgroundColor: tokens.panelBg,
        borderColor: tokens.panelBorder,
      };
    default:
      return {
        ...base,
        backgroundColor: tokens.panelBg,
        borderColor: tokens.panelBorder,
      };
  }
}

function chartPanelVariant(visual: VisualSystemSpec) {
  switch (visual.componentRules.chartPanel) {
    case "transparent":
      return "transparent" as const;
    case "solid-panel":
      return "solid" as const;
    default:
      return "soft" as const;
  }
}

function textRole(node: BoardStructure["nodeMap"][string]) {
  if (!node || node.type !== "widget" || node.widgetType !== "text") return "body" as const;
  const y = node.layoutStyle.position[1];
  const width = node.layoutStyle.width;
  const text = node.config.text ?? "";
  if (y < 140 || width > 720 || text.length <= 20) return "title" as const;
  if (text.length >= 48) return "annotation" as const;
  return "body" as const;
}

function styleTextWidget(node: Extract<BoardStructure["nodeMap"][string], { type: "widget"; widgetType: "text" }>, visual: VisualSystemSpec) {
  const role = textRole(node);
  const { tokens, componentRules } = visual;

  return {
    ...node,
    config: {
      ...node.config,
      color: role === "annotation" ? tokens.textSecondary : tokens.textPrimary,
      fontSize:
        role === "title"
          ? tokens.titleSize
          : role === "annotation"
            ? Math.max(12, tokens.bodySize - 1)
            : tokens.sectionTitleSize,
      fontWeight: role === "title" ? 700 : 500,
    },
    layoutStyle: {
      ...node.layoutStyle,
      ...panelStyle(componentRules.titleText === "panel" ? "soft" : "transparent", visual),
    },
  };
}

function styleSelectWidget(node: Extract<BoardStructure["nodeMap"][string], { type: "widget"; widgetType: "select" }>, visual: VisualSystemSpec) {
  return {
    ...node,
    layoutStyle: {
      ...node.layoutStyle,
      ...panelStyle(visual.componentRules.filterControl === "outline" ? "outline" : "soft", visual),
    },
  };
}

function stylePixelWidget(node: Extract<BoardStructure["nodeMap"][string], { type: "widget"; widgetType: "pixel" }>, visual: VisualSystemSpec) {
  const palette = [visual.tokens.negative, visual.tokens.warning, visual.tokens.positive];
  return {
    ...node,
    config: {
      ...node.config,
      borderRadius: Math.max(4, visual.tokens.radius - 4),
      colorRanges: node.config.colorRanges.length > 0
        ? node.config.colorRanges.map((range, index) => ({ ...range, color: palette[index % palette.length] }))
        : [
            { min: 1, max: 33, color: palette[0] },
            { min: 34, max: 66, color: palette[1] },
            { min: 67, max: 100, color: palette[2] },
          ],
    },
    layoutStyle: {
      ...node.layoutStyle,
      ...panelStyle(
        visual.componentRules.kpiCard === "outline"
          ? "outline"
          : visual.componentRules.kpiCard === "solid"
            ? "solid"
            : "soft",
        visual,
      ),
    },
  };
}

function chartOptionBase(visual: VisualSystemSpec) {
  const gridLineColor =
    visual.componentRules.chartGrid === "strong"
      ? "rgba(148,163,184,0.22)"
      : visual.componentRules.chartGrid === "none"
        ? "transparent"
        : "rgba(148,163,184,0.10)";
  const legendColor = visual.componentRules.chartLegend === "bright" ? visual.tokens.textPrimary : visual.tokens.textSecondary;

  return {
    textStyle: { color: visual.tokens.textPrimary, fontFamily: "inherit" },
    title: { textStyle: { color: visual.tokens.textPrimary, fontSize: visual.tokens.sectionTitleSize, fontWeight: 600 } },
    tooltip: {
      backgroundColor: visual.tokens.panelBg,
      borderColor: visual.tokens.panelBorder,
      textStyle: { color: visual.tokens.textPrimary },
    },
    legend: { textStyle: { color: legendColor, fontSize: Math.max(11, visual.tokens.bodySize - 2) } },
    xAxis: {
      axisLabel: { color: visual.tokens.textSecondary, fontSize: Math.max(11, visual.tokens.bodySize - 2) },
      splitLine: { lineStyle: { color: gridLineColor } },
    },
    yAxis: {
      axisLabel: { color: visual.tokens.textSecondary, fontSize: Math.max(11, visual.tokens.bodySize - 2) },
      splitLine: { lineStyle: { color: gridLineColor } },
    },
  };
}

function styleChartWidget(
  node: Extract<BoardStructure["nodeMap"][string], { type: "widget"; widgetType: "bar" | "line" | "pie" | "funnel" }>,
  visual: VisualSystemSpec,
) {
  const palette = visual.tokens.chartPalette;
  const optionBase = chartOptionBase(visual);

  if (node.widgetType === "bar" || node.widgetType === "line") {
    return {
      ...node,
      config: {
        ...node.config,
        theme: visual.themeProfile.theme,
        seriesData: node.config.seriesData.map((series, index) => ({
          ...series,
          color: palette[index % palette.length],
        })),
        option: mergeOption(optionBase, node.config.option),
      },
      layoutStyle: {
        ...node.layoutStyle,
        ...panelStyle(chartPanelVariant(visual), visual),
      },
    };
  }

  return {
    ...node,
    config: {
      ...node.config,
      theme: visual.themeProfile.theme,
      data: node.config.data.map((item, index) => ({
        ...item,
        color: palette[index % palette.length],
      })),
      option: mergeOption(optionBase, node.config.option),
    },
    layoutStyle: {
      ...node.layoutStyle,
      ...panelStyle(chartPanelVariant(visual), visual),
    },
  };
}

function styleImageWidget(node: Extract<BoardStructure["nodeMap"][string], { type: "widget"; widgetType: "image" }>, visual: VisualSystemSpec) {
  return {
    ...node,
    layoutStyle: {
      ...node.layoutStyle,
      ...panelStyle("soft", visual),
    },
  };
}

function styleNode(node: BoardStructure["nodeMap"][string], visual: VisualSystemSpec): VisdocModel["nodeMap"][string] {
  if (node.type === "group") return node;

  switch (node.widgetType) {
    case "text":
      return styleTextWidget(node, visual) as WidgetNode;
    case "select":
      return styleSelectWidget(node, visual) as WidgetNode;
    case "pixel":
      return stylePixelWidget(node, visual) as WidgetNode;
    case "bar":
    case "line":
    case "pie":
    case "funnel":
      return styleChartWidget(node, visual) as WidgetNode;
    case "image":
      return styleImageWidget(node, visual) as WidgetNode;
  }

  return node as never;
}

export function composeVisdoc(structure: BoardStructure, visual: VisualSystemSpec): VisdocModel {
  const nodeMap = Object.fromEntries(
    Object.entries(structure.nodeMap).map(([id, node]) => [id, styleNode(node, visual)]),
  );

  return visdocSchema.parse({
    ...structure,
    backgroundColor: visual.tokens.pageBg,
    visualSystem: visual,
    pages: structure.pages.map((page, index) => ({
      ...page,
      backgroundColor: index % 2 === 0 ? visual.tokens.pageBg : visual.tokens.pageBgAlt,
    })),
    nodeMap,
  });
}
