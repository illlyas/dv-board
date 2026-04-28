import { z } from "zod";

import type { BoardStructure } from "@/lib/structure-schema";

type WidgetTypeKey = "text" | "image" | "pixel" | "select" | "bar" | "line" | "pie" | "funnel";

const widgetCountRecordSchema = z.object({
  text: z.number().int().nonnegative(),
  image: z.number().int().nonnegative(),
  pixel: z.number().int().nonnegative(),
  select: z.number().int().nonnegative(),
  bar: z.number().int().nonnegative(),
  line: z.number().int().nonnegative(),
  pie: z.number().int().nonnegative(),
  funnel: z.number().int().nonnegative(),
});

export const structureDigestSchema = z.object({
  pageCount: z.number().int().positive(),
  canvas: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  totals: widgetCountRecordSchema,
  pages: z.array(z.object({
    name: z.string(),
    widgetCounts: widgetCountRecordSchema,
    dominantWidget: z.enum(["text", "image", "pixel", "select", "bar", "line", "pie", "funnel", "mixed"]),
    hasFilters: z.boolean(),
    hasHeroTitle: z.boolean(),
    density: z.enum(["low", "medium", "high"]),
    layoutPattern: z.enum(["header-kpi-chart", "grid", "split", "single-focus", "mixed"]),
  })).min(1),
});

export type StructureDigest = z.infer<typeof structureDigestSchema>;

function emptyCounts(): Record<WidgetTypeKey, number> {
  return {
    text: 0,
    image: 0,
    pixel: 0,
    select: 0,
    bar: 0,
    line: 0,
    pie: 0,
    funnel: 0,
  };
}

type StructureWidget = Extract<BoardStructure["nodeMap"][string], { type: "widget" }>;

function isWidget(node: unknown): node is StructureWidget {
  return Boolean(
    node &&
    typeof node === "object" &&
    (node as Record<string, unknown>).type === "widget" &&
    typeof (node as Record<string, unknown>).widgetType === "string",
  );
}

function collectWidgets(structure: BoardStructure, nodeId: string, acc: StructureWidget[]) {
  const node = structure.nodeMap[nodeId];
  if (!node || typeof node !== "object") return;
  if ((node as { type?: string }).type === "group") {
    for (const childId of (node as { childrenIds?: string[] }).childrenIds ?? []) {
      if (typeof childId === "string") collectWidgets(structure, childId, acc);
    }
    return;
  }
  if (isWidget(node)) acc.push(node);
}

function detectLayoutPattern(widgets: StructureWidget[]) {
  const positioned = widgets;
  if (!positioned.length) return "mixed" as const;
  const heroTitle = positioned.some((node) => node.widgetType === "text" && (node.layoutStyle?.position?.[1] ?? 9999) < 140 && (node.layoutStyle?.width ?? 0) > 720);
  const kpiCount = positioned.filter((node) => node.widgetType === "pixel").length;
  const chartCount = positioned.filter((node) => ["bar", "line", "pie", "funnel"].includes(node.widgetType)).length;
  const leftSide = positioned.filter((node) => (node.layoutStyle?.position?.[0] ?? 0) < 640).length;
  const rightSide = positioned.length - leftSide;

  if (positioned.length <= 2 && chartCount >= 1) return "single-focus" as const;
  if (heroTitle && kpiCount >= 2 && chartCount >= 1) return "header-kpi-chart" as const;
  if (Math.abs(leftSide - rightSide) <= 1 && positioned.length >= 4) return "split" as const;
  if (positioned.length >= 6) return "grid" as const;
  return "mixed" as const;
}

export function buildStructureDigest(structure: BoardStructure): StructureDigest {
  const totals = emptyCounts();

  const pages = structure.pages.map((page) => {
    const widgets: StructureWidget[] = [];
    collectWidgets(structure, page.rootNodeId, widgets);
    const widgetCounts = emptyCounts();

    for (const node of widgets) {
      if (!isWidget(node)) continue;
      widgetCounts[node.widgetType] += 1;
      totals[node.widgetType] += 1;
    }

    const counts = Object.entries(widgetCounts).sort((a, b) => b[1] - a[1]);
    const dominantWidget = counts[0]?.[1] && counts[0][1] > counts[1]?.[1]
      ? counts[0][0] as StructureDigest["pages"][number]["dominantWidget"]
      : "mixed";
    const widgetTotal = Object.values(widgetCounts).reduce((sum, value) => sum + value, 0);

    return {
      name: page.name,
      widgetCounts,
      dominantWidget,
      hasFilters: widgetCounts.select > 0,
      hasHeroTitle: widgets.some((node) => isWidget(node) && node.widgetType === "text" && (node.layoutStyle?.position?.[1] ?? 9999) < 140),
      density: widgetTotal >= 8 ? "high" : widgetTotal >= 5 ? "medium" : "low",
      layoutPattern: detectLayoutPattern(widgets),
    };
  });

  return structureDigestSchema.parse({
    pageCount: structure.pages.length,
    canvas: structure.viewSize,
    totals,
    pages,
  });
}
