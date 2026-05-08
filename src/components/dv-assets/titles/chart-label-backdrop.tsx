"use client";

import React from "react";
import { RasterizedSvgFill } from "@/components/dv-assets/rasterized-svg-fill";
import { buildChartLabelSvgMarkup } from "@/components/dv-assets/titles/chart-label-backdrop-markup";

export type ChartLabelBackdropProps = {
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
};

/**
 * 图表/表格卡片标题条装饰底图（558×51 设计稿几何）。
 * 源文件：`.assets/chart-label/分组 22.svg`；运行时解析 VI CSS 变量后栅格为 canvas 拉伸铺满。
 */
export function ChartLabelBackdrop({ className, style, colorSourceRef, redrawToken }: ChartLabelBackdropProps) {
  return (
    <RasterizedSvgFill
      className={className}
      style={style}
      colorSourceRef={colorSourceRef}
      redrawToken={redrawToken}
      buildSvgMarkup={buildChartLabelSvgMarkup}
      aria-hidden
    />
  );
}
