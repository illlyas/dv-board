import type { SvgMarkupBuilderArgs } from "@/lib/rasterized-svg/svg-markup-types";
import { PAGE_BACKGROUND_PATTERN_IMAGE_HREF } from "@/components/dv-assets/board/page-background-pattern-href";

/**
 * 整页画布背景纹理（1920×1080）。几何与 `.assets/page/背景素材2.svg` 一致；
 * 图案为内嵌 PNG，整层 fill-opacity 与源稿一致。
 */
export function buildPageBackgroundSvgMarkup({ idPrefix, color: _color }: SvgMarkupBuilderArgs): string {
  void _color;
  const p = idPrefix;
  const href = PAGE_BACKGROUND_PATTERN_IMAGE_HREF;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080" fill="none">
<rect width="1920" height="1080" fill="url(#${p}-pattern)" fill-opacity="0.16"/>
<defs>
<pattern id="${p}-pattern" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#${p}-image" transform="matrix(0.00171527 0 0 0.00304936 0 -0.0168668)"/>
</pattern>
<image id="${p}-image" width="583" height="339" preserveAspectRatio="none" xlink:href="${href}"/>
</defs>
</svg>`;
}
