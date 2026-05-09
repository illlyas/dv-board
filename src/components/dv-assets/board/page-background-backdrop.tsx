"use client";

import React from "react";
import { RasterizedSvgFill } from "@/components/dv-assets/rasterized-svg-fill";
import { buildPageBackgroundSvgMarkup } from "@/components/dv-assets/board/page-background-backdrop-markup";

export type PageBackgroundBackdropProps = {
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
};

/**
 * 看板整页背景装饰（1920×1080）。源：`.assets/page/背景素材2.svg`，运行时栅格为 canvas 铺满容器。
 */
export function PageBackgroundBackdrop({
  className,
  style,
  colorSourceRef,
  redrawToken,
}: PageBackgroundBackdropProps) {
  return (
    <RasterizedSvgFill
      className={className}
      style={style}
      colorSourceRef={colorSourceRef}
      redrawToken={redrawToken}
      buildSvgMarkup={buildPageBackgroundSvgMarkup}
      aria-hidden
    />
  );
}
