import type { ProjectConfig } from "@/lib/projects/project-config";
import { createDefaultVisualAssetsBlock } from "@/lib/visual-assets/defaults";
import type { VisualAssetItem, VisualAssetsBlock } from "@/lib/visual-assets/types";
import {
  ITEM_KEY_CHART_TITLE_GLOBAL,
  ITEM_KEY_FOOTER_MAIN,
  ITEM_KEY_HERO_MAIN,
  ITEM_KEY_PAGE_MAIN,
  VISUAL_ROLE_FOOTER_NAV,
  VISUAL_ROLE_HERO_HEADER,
  VISUAL_ROLE_PAGE_BACKGROUND,
} from "@/lib/visual-assets/types";
import { isImplementationAllowed } from "@/lib/visual-assets/registry-static";

function appendMissingDefaultVisualItems(items: VisualAssetItem[]): VisualAssetItem[] {
  const defaults = createDefaultVisualAssetsBlock().items;
  const keys = new Set(items.map((i) => i.itemKey));
  const out = [...items];
  for (const d of defaults) {
    if (!keys.has(d.itemKey)) out.push({ ...d });
  }
  return out;
}

export function parseProjectConfigJson(raw: string): ProjectConfig | null {
  try {
    const o = JSON.parse(raw) as ProjectConfig;
    if ((o.configVersion !== 1 && o.configVersion !== 2) || typeof o.id !== "string" || typeof o.name !== "string") {
      return null;
    }
    return o;
  } catch {
    return null;
  }
}

/** 若无 visualAssets 则补默认块；可将 configVersion 升为 2 */
export function ensureProjectVisualAssets(cfg: ProjectConfig): ProjectConfig {
  if (cfg.visualAssets?.version === 1 && Array.isArray(cfg.visualAssets.items)) {
    const mergedItems = appendMissingDefaultVisualItems(cfg.visualAssets.items);
    let next: ProjectConfig = cfg;
    if (mergedItems.length !== cfg.visualAssets.items.length) {
      next = {
        ...cfg,
        visualAssets: { ...cfg.visualAssets, items: mergedItems },
        configVersion: 2,
      };
    }
    if (next.configVersion < 2) {
      return { ...next, configVersion: 2 };
    }
    return next;
  }
  const visualAssets = createDefaultVisualAssetsBlock();
  return {
    ...cfg,
    configVersion: 2,
    visualAssets,
  };
}

/** 写回磁盘前确保结构存在 */
export function withPersistedDefaults(cfg: ProjectConfig): ProjectConfig {
  return ensureProjectVisualAssets(cfg);
}

/**
 * 将扫描结果合并到现有 items：更新 hero implementation、图表 title 开关建议。
 */
export function mergeScanIntoVisualAssets(
  current: VisualAssetsBlock,
  heroIds: string[],
  chartTitleUsed: boolean,
  footerIds: string[] = [],
  pageIds: string[] = []
): VisualAssetsBlock {
  const items = current.items.map((it) => ({ ...it }));
  const heroIdx = items.findIndex((i) => i.itemKey === ITEM_KEY_HERO_MAIN);
  const chartIdx = items.findIndex((i) => i.itemKey === ITEM_KEY_CHART_TITLE_GLOBAL);
  const footerIdx = items.findIndex((i) => i.itemKey === ITEM_KEY_FOOTER_MAIN);
  const pageIdx = items.findIndex((i) => i.itemKey === ITEM_KEY_PAGE_MAIN);
  if (heroIdx >= 0 && heroIds.length > 0) {
    const firstValid = heroIds.find((id) => isImplementationAllowed(VISUAL_ROLE_HERO_HEADER, id));
    if (firstValid) {
      items[heroIdx] = { ...items[heroIdx], implementationId: firstValid };
    }
  }
  if (chartIdx >= 0) {
    items[chartIdx] = { ...items[chartIdx], enabled: chartTitleUsed };
  }
  if (footerIdx >= 0 && footerIds.length > 0) {
    const firstValid = footerIds.find((id) => isImplementationAllowed(VISUAL_ROLE_FOOTER_NAV, id));
    if (firstValid) {
      items[footerIdx] = { ...items[footerIdx], implementationId: firstValid };
    }
  }
  if (pageIdx >= 0 && pageIds.length > 0) {
    const firstValid = pageIds.find((id) => isImplementationAllowed(VISUAL_ROLE_PAGE_BACKGROUND, id));
    if (firstValid) {
      items[pageIdx] = { ...items[pageIdx], implementationId: firstValid };
    }
  }
  return {
    ...current,
    items,
    lastScanAt: new Date().toISOString(),
  };
}
