"use client";

import React from "react";
import { HeroTitleBackdrop } from "@/components/dv-assets/titles/hero-title-backdrop";
import { useVisualAssetsOptional } from "@/contexts/visual-assets-context";

/** 当前已注册的主标题区背景素材 id（扩展时在此追加并实现对应组件） */
export const BOARD_HERO_BACKDROP_IDS = ["hero-default"] as const;
export type BoardHeroBackdropId = (typeof BOARD_HERO_BACKDROP_IDS)[number];

type BackdropComponent = React.ComponentType<{
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
}>;

const BOARD_HERO_BACKDROP_REGISTRY: Record<BoardHeroBackdropId, BackdropComponent> = {
  "hero-default": HeroTitleBackdrop,
};

export type BoardHeroBackdropProps = {
  /** 背景素材 id；未知 id 时回退到 hero-default，保证扩展期兼容生成代码 */
  id?: BoardHeroBackdropId | (string & {});
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
};

/**
 * 看板顶栏主标题区背景（可扩展注册表）。
 * AI 生成 JSX 中写 `<BoardHeroBackdrop id="hero-default" style={...} />`，无需 import。
 */
export function BoardHeroBackdrop({
  id = "hero-default",
  className,
  style,
  colorSourceRef,
  redrawToken,
}: BoardHeroBackdropProps) {
  const va = useVisualAssetsOptional();
  const eff = va?.getHeroHeaderEffective(id) ?? { enabled: true, implementationId: id };
  if (!eff.enabled) {
    return null;
  }
  const implId = eff.implementationId;
  const resolved = (BOARD_HERO_BACKDROP_IDS as readonly string[]).includes(implId as string)
    ? (implId as BoardHeroBackdropId)
    : "hero-default";
  const Cmp = BOARD_HERO_BACKDROP_REGISTRY[resolved];
  return (
    <Cmp
      className={className}
      style={style}
      colorSourceRef={colorSourceRef}
      redrawToken={redrawToken}
    />
  );
}
