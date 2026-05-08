"use client";

import React from "react";
import { RasterizedSvgFill } from "@/components/dv-assets/rasterized-svg-fill";
import { buildHeroTitleSvgMarkup } from "@/components/dv-assets/titles/hero-title-backdrop-markup";

export type HeroTitleBackdropProps = {
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
};

/**
 * 顶栏主标题区装饰底图（1920×96 设计稿几何）。
 * 源文件：`.assets/title/组合 41.svg`；运行时解析 VI CSS 变量后栅格为 canvas 拉伸铺满。
 */
export function HeroTitleBackdrop({ className, style, colorSourceRef, redrawToken }: HeroTitleBackdropProps) {
  return (
    <RasterizedSvgFill
      className={className}
      style={style}
      colorSourceRef={colorSourceRef}
      redrawToken={redrawToken}
      buildSvgMarkup={buildHeroTitleSvgMarkup}
      aria-hidden
    />
  );
}
