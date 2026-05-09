/** 与 docs/visual-assets.md 一致 */

export type VisualAssetScope = {
  pageIndex?: number;
  slotId?: string;
  widgetType?: string;
};

export interface VisualAssetItem {
  itemKey: string;
  role: string;
  implementationId: string;
  enabled: boolean;
  label?: string;
  description?: string;
  options?: Record<string, unknown>;
  scope?: VisualAssetScope;
}

export interface VisualAssetsBlock {
  version: 1;
  items: VisualAssetItem[];
  lastScanAt?: string;
}

export const VISUAL_ROLE_HERO_HEADER = "hero.header";
export const VISUAL_ROLE_CHART_TITLE = "chart.title";

export const ITEM_KEY_HERO_MAIN = "hero:main";
export const ITEM_KEY_CHART_TITLE_GLOBAL = "chart:title:global";

export const IMPLEMENTATION_HERO_DEFAULT = "hero-default";
export const IMPLEMENTATION_CHART_LABEL_DEFAULT = "chart-label-default";
