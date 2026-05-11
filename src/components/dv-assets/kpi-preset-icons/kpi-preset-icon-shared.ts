import type React from "react";

export type KpiPresetIconSvgProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * KPI 预设 SVG 内渐变 / mask 使用的局部 CSS 变量，默认映射到全局设计 token。
 */
export function kpiPresetIconCssVars(): React.CSSProperties {
  return {
    ["--asset-icon-stop-shade-mid" as string]: "var(--color-muted)",
    ["--asset-icon-stop-shade-deep" as string]:
      "color-mix(in srgb, var(--color-text-primary) 22%, var(--color-bg))",
    ["--asset-icon-stop-frost-from" as string]:
      "color-mix(in srgb, var(--color-text-primary) 50%, transparent)",
    ["--asset-icon-stop-frost-to" as string]:
      "color-mix(in srgb, var(--color-muted) 62%, transparent)",
    ["--asset-icon-stop-highlight" as string]: "var(--color-text-primary)",
    ["--asset-icon-mask-bg" as string]:
      "color-mix(in srgb, white 92%, var(--color-text-primary))",
    ["--asset-icon-mask-cutout" as string]: "var(--color-text-primary)",
  };
}
