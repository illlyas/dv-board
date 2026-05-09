"use client";

import React from "react";
import { FooterBarBackdrop } from "@/components/dv-assets/titles/footer-bar-backdrop";
import { useVisualAssetsOptional } from "@/contexts/visual-assets-context";

export const BOARD_FOOTER_BACKDROP_IDS = ["footer-default"] as const;
export type BoardFooterBackdropId = (typeof BOARD_FOOTER_BACKDROP_IDS)[number];

type BackdropComponent = React.ComponentType<{
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
}>;

const BOARD_FOOTER_BACKDROP_REGISTRY: Record<BoardFooterBackdropId, BackdropComponent> = {
  "footer-default": FooterBarBackdrop,
};

export type BoardFooterBackdropProps = {
  id?: BoardFooterBackdropId | (string & {});
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
};

/**
 * 看板底部分页条区背景（可扩展注册表）。生成 JSX 中写 `<BoardFooterBackdrop id="footer-default" />`，无需 import。
 */
export function BoardFooterBackdrop({
  id = "footer-default",
  className,
  style,
  colorSourceRef,
  redrawToken,
}: BoardFooterBackdropProps) {
  const va = useVisualAssetsOptional();
  const eff = va?.getFooterNavEffective(id) ?? { enabled: true, implementationId: id };
  if (!eff.enabled) {
    return null;
  }
  const implId = eff.implementationId;
  const resolved = (BOARD_FOOTER_BACKDROP_IDS as readonly string[]).includes(implId as string)
    ? (implId as BoardFooterBackdropId)
    : "footer-default";
  const Cmp = BOARD_FOOTER_BACKDROP_REGISTRY[resolved];
  return (
    <Cmp
      className={className}
      style={style}
      colorSourceRef={colorSourceRef}
      redrawToken={redrawToken}
    />
  );
}
