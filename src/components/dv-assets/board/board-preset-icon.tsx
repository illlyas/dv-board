"use client";

import React from "react";
import { RasterizedSvgFill } from "@/components/dv-assets/rasterized-svg-fill";
import type { SvgMarkupBuilderArgs } from "@/lib/rasterized-svg/svg-markup-types";
import {
  buildBoardPresetIcon1SvgMarkup,
  buildBoardPresetIcon2SvgMarkup,
  buildBoardPresetIcon3SvgMarkup,
  buildBoardPresetIcon4SvgMarkup,
  buildBoardPresetIcon5SvgMarkup,
  buildBoardPresetIcon6SvgMarkup,
} from "@/components/dv-assets/board/board-preset-icon-markups.generated";

export const BOARD_PRESET_ICON_IDS = [
  "preset-icon-1",
  "preset-icon-2",
  "preset-icon-3",
  "preset-icon-4",
  "preset-icon-5",
  "preset-icon-6",
] as const;
export type BoardPresetIconId = (typeof BOARD_PRESET_ICON_IDS)[number];

type MarkupFn = (args: SvgMarkupBuilderArgs) => string;

const BOARD_PRESET_ICON_MARKUP: Record<BoardPresetIconId, MarkupFn> = {
  "preset-icon-1": buildBoardPresetIcon1SvgMarkup,
  "preset-icon-2": buildBoardPresetIcon2SvgMarkup,
  "preset-icon-3": buildBoardPresetIcon3SvgMarkup,
  "preset-icon-4": buildBoardPresetIcon4SvgMarkup,
  "preset-icon-5": buildBoardPresetIcon5SvgMarkup,
  "preset-icon-6": buildBoardPresetIcon6SvgMarkup,
};

export type BoardPresetIconProps = {
  /** 与 `.assets/icon/1.svg` … `6.svg` 一一对应 */
  id?: BoardPresetIconId | (string & {});
  className?: string;
  style?: React.CSSProperties;
  colorSourceRef?: React.RefObject<Element | null>;
  redrawToken?: number | string;
};

/**
 * 看板预设装饰图标（24×24 设计稿，canvas 栅格缩放）。生成 JSX 中写 `<BoardPresetIcon id="preset-icon-1" />`，无需 import。
 */
export function BoardPresetIcon({
  id = "preset-icon-1",
  className,
  style,
  colorSourceRef,
  redrawToken,
}: BoardPresetIconProps) {
  const resolved = (BOARD_PRESET_ICON_IDS as readonly string[]).includes(id as string)
    ? (id as BoardPresetIconId)
    : "preset-icon-1";
  const buildSvgMarkup = BOARD_PRESET_ICON_MARKUP[resolved];
  return (
    <RasterizedSvgFill
      className={className}
      style={style}
      colorSourceRef={colorSourceRef}
      redrawToken={redrawToken}
      buildSvgMarkup={buildSvgMarkup}
      aria-hidden
    />
  );
}
