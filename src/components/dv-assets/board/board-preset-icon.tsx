"use client";

import React from "react";
import {
  DEFAULT_BOARD_PRESET_ICON_ID,
  resolveBoardPresetIconId,
  type BoardPresetIconId,
} from "@/components/dv-assets/kpi-preset-icons/kpi-preset-icon-ids";
import { KpiPresetIconById } from "@/components/dv-assets/kpi-preset-icons/kpi-preset-icon-by-id";

export { BOARD_PRESET_ICON_IDS, DEFAULT_BOARD_PRESET_ICON_ID, type BoardPresetIconId } from "@/components/dv-assets/kpi-preset-icons/kpi-preset-icon-ids";

export type BoardPresetIconProps = {
  /** 语义 id（`kpi-*`）或旧版 `preset-icon-1` … `6` */
  id?: BoardPresetIconId | (string & {});
  className?: string;
  style?: React.CSSProperties;
  /** 历史 API：旧 canvas 方案已移除，保留以兼容旧调用，无效果 */
  colorSourceRef?: React.RefObject<Element | null>;
  /** 历史 API：无效果 */
  redrawToken?: number | string;
};

/**
 * 看板预设装饰图标（纯 SVG + CSS 变量取色）。生成 JSX 中可写 `<BoardPresetIcon id="kpi-sync-refresh" />`，无需 import。
 */
export function BoardPresetIcon({
  id = DEFAULT_BOARD_PRESET_ICON_ID,
  className,
  style,
}: BoardPresetIconProps) {
  const resolved = resolveBoardPresetIconId(id);
  return <KpiPresetIconById id={resolved} className={className} style={style} />;
}
