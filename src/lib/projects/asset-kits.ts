import type { VisualAssetItem } from "@/lib/visual-assets/types";
import { createDefaultVisualAssetsBlock } from "@/lib/visual-assets/defaults";
import { isImplementationAllowed } from "@/lib/visual-assets/registry-static";

export interface AssetKitDefinition {
  id: string;
  label: string;
  description?: string;
  /** 按 itemKey 覆盖 implementationId（须通过 registry 校验） */
  itemOverrides?: Partial<Record<string, string>>;
}

export const DEFAULT_ASSET_KIT_ID = "default";

export const ASSET_KITS: AssetKitDefinition[] = [
  {
    id: DEFAULT_ASSET_KIT_ID,
    label: "默认套件",
    description: "画布底纹、标题区、图表标题条、底栏与内置 KPI/Studio 图标的全默认组合。",
  },
  {
    id: "wallboard-showcase",
    label: "大屏展示套件",
    description: "与默认相同的实现集合（后续可切换 hero/page 等为大屏专用 implementation）。",
  },
];

const KIT_BY_ID = new Map(ASSET_KITS.map((k) => [k.id, k]));

export function listAssetKits(): AssetKitDefinition[] {
  return [...ASSET_KITS];
}

export function getAssetKit(id: string | undefined): AssetKitDefinition {
  const k = id?.trim() || DEFAULT_ASSET_KIT_ID;
  return KIT_BY_ID.get(k) ?? KIT_BY_ID.get(DEFAULT_ASSET_KIT_ID)!;
}

/** 由默认 visualAssets 应用套件覆盖，返回新 block（不修改入参） */
export function applyAssetKitToItems(
  baseItems: VisualAssetItem[],
  kitId: string | undefined
): VisualAssetItem[] {
  const kit = getAssetKit(kitId);
  const overrides = kit.itemOverrides;
  if (!overrides || Object.keys(overrides).length === 0) {
    return baseItems.map((i) => ({ ...i }));
  }
  return baseItems.map((it) => {
    const nextId = overrides[it.itemKey];
    if (!nextId || nextId === it.implementationId) return { ...it };
    if (!isImplementationAllowed(it.role, nextId)) return { ...it };
    return { ...it, implementationId: nextId };
  });
}

export function createVisualAssetsForNewProject(kitId: string | undefined) {
  const block = createDefaultVisualAssetsBlock();
  return {
    ...block,
    items: applyAssetKitToItems(block.items, kitId),
  };
}
