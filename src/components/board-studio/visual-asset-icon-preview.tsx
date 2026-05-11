"use client";

import React from "react";
import { KpiPresetIconById } from "@/components/dv-assets/kpi-preset-icons/kpi-preset-icon-by-id";
import { CATEGORY_ICONS, DashboardGridIcon, FileIcon, FolderIcon } from "@/components/board-studio/category-icons";
import type { CategoryKey } from "@/types/board-studio.types";

const STUDIO_CATEGORY_IMPL: Record<string, CategoryKey> = {
  "studio-category-story": "数据故事",
  "studio-category-brand-vi": "品牌VI",
  "studio-category-structure": "页面结构",
  "studio-category-document": "页面",
};

export function VisualBuiltInIconPreview({
  implementationId,
  size = 40,
}: {
  implementationId: string;
  size?: number;
}) {
  const wrap = (node: React.ReactNode) => (
    <div className="flex items-center justify-center text-[color:var(--color-text-muted)]" style={{ width: size, height: size }}>
      {node}
    </div>
  );

  if (implementationId.startsWith("kpi-")) {
    return wrap(<KpiPresetIconById id={implementationId} style={{ width: "100%", height: "100%" }} />);
  }

  switch (implementationId) {
    case "studio-file-json":
      return wrap(<FileIcon isJsx={false} />);
    case "studio-file-jsx":
      return wrap(<FileIcon isJsx />);
    case "studio-folder":
      return wrap(<FolderIcon />);
    case "studio-dashboard-grid":
      return wrap(<DashboardGridIcon />);
    default: {
      const cat = STUDIO_CATEGORY_IMPL[implementationId];
      if (cat) return wrap(<span className="inline-flex text-[color:var(--color-text-muted)]">{CATEGORY_ICONS[cat]}</span>);
      return wrap(<span className="text-[10px] text-gray-500">?</span>);
    }
  }
}
