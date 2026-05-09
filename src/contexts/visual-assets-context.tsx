"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { VisualAssetItem, VisualAssetsBlock } from "@/lib/visual-assets/types";
import { ITEM_KEY_CHART_TITLE_GLOBAL, ITEM_KEY_HERO_MAIN, VISUAL_ROLE_CHART_TITLE, VISUAL_ROLE_HERO_HEADER } from "@/lib/visual-assets/types";

export type VisualAssetsContextValue = {
  block: VisualAssetsBlock;
  /** 主标题：是否绘制底纹、生效的 implementationId（覆盖 JSX props） */
  getHeroHeaderEffective: (jsxId: string | undefined) => { enabled: boolean; implementationId: string };
  /** 图表标题底纹是否启用（与 props.titleBackdrop 相与） */
  isChartTitleBackdropEnabled: () => boolean;
  getItemByItemKey: (itemKey: string) => VisualAssetItem | undefined;
};

const VisualAssetsContext = createContext<VisualAssetsContextValue | null>(null);

function findByRole(items: VisualAssetItem[], role: string): VisualAssetItem | undefined {
  return items.find((i) => i.role === role);
}

function buildValue(block: VisualAssetsBlock): VisualAssetsContextValue {
  return {
    block,
    getHeroHeaderEffective(jsxId) {
      const row = findByRole(block.items, VISUAL_ROLE_HERO_HEADER) ?? block.items.find((i) => i.itemKey === ITEM_KEY_HERO_MAIN);
      const enabled = row?.enabled !== false;
      const id = row?.implementationId ?? jsxId ?? "hero-default";
      return { enabled, implementationId: id };
    },
    isChartTitleBackdropEnabled() {
      const row =
        findByRole(block.items, VISUAL_ROLE_CHART_TITLE) ??
        block.items.find((i) => i.itemKey === ITEM_KEY_CHART_TITLE_GLOBAL);
      return row?.enabled !== false;
    },
    getItemByItemKey(itemKey) {
      return block.items.find((i) => i.itemKey === itemKey);
    },
  };
}

export function VisualAssetsProvider({
  block,
  children,
}: {
  block: VisualAssetsBlock;
  children: React.ReactNode;
}) {
  const value = useMemo(() => buildValue(block), [block]);
  return <VisualAssetsContext.Provider value={value}>{children}</VisualAssetsContext.Provider>;
}

export function useVisualAssetsContext(): VisualAssetsContextValue {
  const v = useContext(VisualAssetsContext);
  if (!v) {
    throw new Error("useVisualAssetsContext must be used within VisualAssetsProvider");
  }
  return v;
}

/** 无 Provider 时（如 Token 演示）返回 null，消费方走默认逻辑 */
export function useVisualAssetsOptional(): VisualAssetsContextValue | null {
  return useContext(VisualAssetsContext);
}
