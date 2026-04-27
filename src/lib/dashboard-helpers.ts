import type { CSSProperties } from "react";

import type { WidgetNode, GroupNode, PageModel, VisdocModel } from "@/lib/dashboard-schema";

// ─── Types ────────────────────────────────────────────────

type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U> | undefined>
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type StreamedVisdocModel = DeepPartial<VisdocModel>;

// ─── Guards ───────────────────────────────────────────────

export function isGroupNode(node: unknown): node is GroupNode {
  return Boolean(node && typeof node === "object" && (node as Record<string, unknown>).type === "group");
}

export function isWidgetNode(node: unknown): node is WidgetNode {
  return Boolean(
    node && typeof node === "object" &&
    (node as Record<string, unknown>).type === "widget" &&
    "widgetType" in (node as Record<string, unknown>),
  );
}

// ─── Helpers ──────────────────────────────────────────────

/** 从 AI 数据的 layoutStyle 提取绝对定位样式 + 视觉风格 */
export function widgetShell(style: WidgetNode["layoutStyle"] | undefined | null): CSSProperties {
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

  if (style.borderRadius != null) shell.borderRadius = style.borderRadius;
  if (style.borderWidth != null) shell.borderWidth = style.borderWidth;
  if (style.borderColor) shell.borderColor = style.borderColor;
  if (style.borderStyle) shell.borderStyle = style.borderStyle;
  if (style.backgroundColor) shell.backgroundColor = style.backgroundColor;
  if (style.boxShadow) shell.boxShadow = style.boxShadow;
  if (style.opacity != null) shell.opacity = style.opacity;

  return shell;
}

/** 解析当前激活页面 */
export function resolveActivePage(
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
