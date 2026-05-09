import type { VisualAssetsBlock, VisualAssetItem } from "@/lib/visual-assets/types";
import {
  IMPLEMENTATION_CHART_LABEL_DEFAULT,
  IMPLEMENTATION_HERO_DEFAULT,
  ITEM_KEY_CHART_TITLE_GLOBAL,
  ITEM_KEY_HERO_MAIN,
  VISUAL_ROLE_CHART_TITLE,
  VISUAL_ROLE_HERO_HEADER,
} from "@/lib/visual-assets/types";
import { VISUAL_ASSET_ROLE_REGISTRY } from "@/lib/visual-assets/registry-static";

function defaultItem(
  itemKey: string,
  role: string,
  implementationId: string
): VisualAssetItem {
  const def = VISUAL_ASSET_ROLE_REGISTRY[role];
  const meta = def?.implementations[implementationId];
  return {
    itemKey,
    role,
    implementationId,
    enabled: true,
    label: meta?.title,
    description: meta?.description,
  };
}

export function createDefaultVisualAssetsBlock(): VisualAssetsBlock {
  return {
    version: 1,
    items: [
      defaultItem(ITEM_KEY_HERO_MAIN, VISUAL_ROLE_HERO_HEADER, IMPLEMENTATION_HERO_DEFAULT),
      defaultItem(
        ITEM_KEY_CHART_TITLE_GLOBAL,
        VISUAL_ROLE_CHART_TITLE,
        IMPLEMENTATION_CHART_LABEL_DEFAULT
      ),
    ],
  };
}
