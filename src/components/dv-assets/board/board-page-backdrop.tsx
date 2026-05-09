"use client";

import React from "react";
import { PageBackgroundBackdrop } from "@/components/dv-assets/board/page-background-backdrop";
import { useVisualAssetsOptional } from "@/contexts/visual-assets-context";

export const BOARD_PAGE_BACKDROP_IDS = ["page-default"] as const;
export type BoardPageBackdropId = (typeof BOARD_PAGE_BACKDROP_IDS)[number];

type BackdropComponent = React.ComponentType<{
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
}>;

const BOARD_PAGE_BACKDROP_REGISTRY: Record<BoardPageBackdropId, BackdropComponent> = {
  "page-default": PageBackgroundBackdrop,
};

export type BoardPageBackdropProps = {
  id?: BoardPageBackdropId | (string & {});
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
};

/**
 * 看板整页画布背景（可扩展注册表）。生成 JSX 中写 `<BoardPageBackdrop id="page-default" />`，无需 import。
 */
export function BoardPageBackdrop({
  id = "page-default",
  className,
  style,
  colorSourceRef,
  redrawToken,
}: BoardPageBackdropProps) {
  const va = useVisualAssetsOptional();
  const eff = va?.getPageBackgroundEffective(id) ?? { enabled: true, implementationId: id };
  if (!eff.enabled) {
    return null;
  }
  const implId = eff.implementationId;
  const resolved = (BOARD_PAGE_BACKDROP_IDS as readonly string[]).includes(implId as string)
    ? (implId as BoardPageBackdropId)
    : "page-default";
  const Cmp = BOARD_PAGE_BACKDROP_REGISTRY[resolved];
  return (
    <Cmp
      className={className}
      style={style}
      colorSourceRef={colorSourceRef}
      redrawToken={redrawToken}
    />
  );
}
