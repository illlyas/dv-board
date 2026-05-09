/**
 * 大屏「装饰性 UI 素材」：矢量底纹、标题托底、卡片角标等。
 * 与 `components/widgets`（数据绑定型图表/KPI）并列，职责不混用。
 *
 * 约定：按类型分子目录 — titles / cards / metrics / icons / panels …
 */
export {
  RasterizedSvgFill,
  type RasterizedSvgFillProps,
} from "./rasterized-svg-fill";
export type { SvgMarkupBuilderArgs } from "@/lib/rasterized-svg/svg-markup-types";
export { renderSvgMarkupToCanvas } from "@/lib/rasterized-svg/render-svg-markup-to-canvas";

export { HeroTitleBackdrop, type HeroTitleBackdropProps } from "./titles/hero-title-backdrop";
export { ChartLabelBackdrop, type ChartLabelBackdropProps } from "./titles/chart-label-backdrop";
export {
  BoardHeroBackdrop,
  type BoardHeroBackdropProps,
  BOARD_HERO_BACKDROP_IDS,
  type BoardHeroBackdropId,
} from "./board/board-hero-backdrop";
export {
  BoardFooterBackdrop,
  type BoardFooterBackdropProps,
  BOARD_FOOTER_BACKDROP_IDS,
  type BoardFooterBackdropId,
} from "./board/board-footer-backdrop";
export {
  BoardPageBackdrop,
  type BoardPageBackdropProps,
  BOARD_PAGE_BACKDROP_IDS,
  type BoardPageBackdropId,
} from "./board/board-page-backdrop";
export {
  BoardPresetIcon,
  type BoardPresetIconProps,
  BOARD_PRESET_ICON_IDS,
  type BoardPresetIconId,
} from "./board/board-preset-icon";
export { buildHeroTitleSvgMarkup } from "./titles/hero-title-backdrop-markup";
export { buildChartLabelSvgMarkup } from "./titles/chart-label-backdrop-markup";
export { buildFooterBarSvgMarkup } from "./titles/footer-bar-backdrop-markup";
