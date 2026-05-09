"use client";

import React from "react";
import { RasterizedSvgFill } from "@/components/dv-assets/rasterized-svg-fill";
import { buildFooterBarSvgMarkup } from "@/components/dv-assets/titles/footer-bar-backdrop-markup";

export type FooterBarBackdropProps = {
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
};

/**
 * 画布底部分页条区装饰（1920×60）。源：`.assets/footer/footer1.svg`，运行时注入 VI Token。
 */
export function FooterBarBackdrop({ className, style, colorSourceRef, redrawToken }: FooterBarBackdropProps) {
  return (
    <RasterizedSvgFill
      className={className}
      style={style}
      colorSourceRef={colorSourceRef}
      redrawToken={redrawToken}
      buildSvgMarkup={buildFooterBarSvgMarkup}
      aria-hidden
    />
  );
}
