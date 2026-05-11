import type { VisualAssetItem, VisualAssetRoleDefinition } from "@/lib/visual-assets/types";

export type BuiltinIconVisualSpec = {
  itemKey: string;
  role: string;
  implementationId: string;
  displayGroup: string;
  title: string;
  description: string;
};

/**
 * 项目内建图标目录：供视觉素材 Tab 注册、配置项与纯 SVG 预览（不经 canvas）。
 * 顺序即默认配置与预览区展示顺序。
 */
export const BUILTIN_ICON_VISUAL_SPECS: readonly BuiltinIconVisualSpec[] = [
  {
    itemKey: "kpi:icon:sync-refresh",
    role: "kpi.icon.sync-refresh",
    implementationId: "kpi-sync-refresh",
    displayGroup: "看板图标",
    title: "KPI · 同步刷新",
    description: "KPI 卡 presetIconId / BoardPresetIcon；矢量描边，色值走 --kpi-icon-fg 等 CSS 变量。",
  },
  {
    itemKey: "kpi:icon:analytics-bars",
    role: "kpi.icon.analytics-bars",
    implementationId: "kpi-analytics-bars",
    displayGroup: "看板图标",
    title: "KPI · 分析柱",
    description: "KPI 预设柱状示意图标。",
  },
  {
    itemKey: "kpi:icon:insight-badge",
    role: "kpi.icon.insight-badge",
    implementationId: "kpi-insight-badge",
    displayGroup: "看板图标",
    title: "KPI · 洞察",
    description: "KPI 预设灯泡/洞察图标。",
  },
  {
    itemKey: "kpi:icon:capsule",
    role: "kpi.icon.capsule",
    implementationId: "kpi-capsule",
    displayGroup: "看板图标",
    title: "KPI · 胶囊",
    description: "KPI 预设胶囊形图标。",
  },
  {
    itemKey: "kpi:icon:pharmacy",
    role: "kpi.icon.pharmacy",
    implementationId: "kpi-pharmacy",
    displayGroup: "看板图标",
    title: "KPI · 医药十字",
    description: "KPI 预设十字圆标图标。",
  },
  {
    itemKey: "kpi:icon:package",
    role: "kpi.icon.package",
    implementationId: "kpi-package",
    displayGroup: "看板图标",
    title: "KPI · 包裹",
    description: "KPI 预设包裹/物流图标。",
  },
  {
    itemKey: "studio:icon:file-json",
    role: "studio.icon.file-json",
    implementationId: "studio-file-json",
    displayGroup: "工作台图标",
    title: "文件 · JSON/配置",
    description: "文件树中非 JSX 文件图标；currentColor + --color-text-muted。",
  },
  {
    itemKey: "studio:icon:file-jsx",
    role: "studio.icon.file-jsx",
    implementationId: "studio-file-jsx",
    displayGroup: "工作台图标",
    title: "文件 · JSX",
    description: "文件树中 dashboard.jsx 等；强调色 --color-primary。",
  },
  {
    itemKey: "studio:icon:folder",
    role: "studio.icon.folder",
    implementationId: "studio-folder",
    displayGroup: "工作台图标",
    title: "文件夹",
    description: "侧栏目录文件夹图标。",
  },
  {
    itemKey: "studio:icon:dashboard-grid",
    role: "studio.icon.dashboard-grid",
    implementationId: "studio-dashboard-grid",
    displayGroup: "工作台图标",
    title: "看板工具栏 · 网格",
    description: "编辑工具条左侧看板缩略图标。",
  },
  {
    itemKey: "studio:icon:category-story",
    role: "studio.icon.category-story",
    implementationId: "studio-category-story",
    displayGroup: "工作台图标",
    title: "分类 · 数据故事",
    description: "内容分类「数据故事」树节点图标。",
  },
  {
    itemKey: "studio:icon:category-brand-vi",
    role: "studio.icon.category-brand-vi",
    implementationId: "studio-category-brand-vi",
    displayGroup: "工作台图标",
    title: "分类 · 品牌 VI",
    description: "内容分类「品牌 VI」树节点图标。",
  },
  {
    itemKey: "studio:icon:category-structure",
    role: "studio.icon.category-structure",
    implementationId: "studio-category-structure",
    displayGroup: "工作台图标",
    title: "分类 · 页面结构",
    description: "内容分类「页面结构」树节点图标。",
  },
  {
    itemKey: "studio:icon:category-document",
    role: "studio.icon.category-document",
    implementationId: "studio-category-document",
    displayGroup: "工作台图标",
    title: "分类 · 页面",
    description: "内容分类「页面」树节点图标。",
  },
] as const;

export function builtinIconRoleRegistry(): Record<string, VisualAssetRoleDefinition> {
  const out: Record<string, VisualAssetRoleDefinition> = {};
  for (const s of BUILTIN_ICON_VISUAL_SPECS) {
    out[s.role] = {
      displayGroup: s.displayGroup,
      defaultImplementationId: s.implementationId,
      allowedImplementationIds: [s.implementationId],
      implementations: {
        [s.implementationId]: { title: s.title, description: s.description },
      },
    };
  }
  return out;
}

export function builtinIconDefaultItems(): VisualAssetItem[] {
  return BUILTIN_ICON_VISUAL_SPECS.map((s) => ({
    itemKey: s.itemKey,
    role: s.role,
    implementationId: s.implementationId,
    enabled: true,
    label: s.title,
    description: s.description,
  }));
}
