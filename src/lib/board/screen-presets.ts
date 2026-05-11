/**
 * 设计画布像素预设（与 generate-jsx 根容器 width/height 对齐）。
 */

export type ScreenPresetCategory = "fullhd" | "2k" | "4k" | "ultrawide" | "other";

export interface ScreenPreset {
  id: string;
  label: string;
  /** 卡片副标题，如 1080p / 4K */
  tag: string;
  width: number;
  height: number;
  category: ScreenPresetCategory;
  description: string;
}

export const DEFAULT_SCREEN_PRESET_ID = "1920x1080";

/** 顶栏、分页栏高度（与 generate-jsx 约定一致） */
export const SCREEN_LAYOUT_HEADER_PX = 96;
export const SCREEN_LAYOUT_FOOTER_PX = 56;

export function mainVerticalBudgetSingle(screenHeight: number): number {
  return Math.max(0, screenHeight - SCREEN_LAYOUT_HEADER_PX);
}

export function mainVerticalBudgetMulti(screenHeight: number): number {
  return Math.max(0, screenHeight - SCREEN_LAYOUT_HEADER_PX - SCREEN_LAYOUT_FOOTER_PX);
}

const PRESETS: ScreenPreset[] = [
  {
    id: "1280x720",
    label: "HD 720p",
    tag: "1280×720",
    width: 1280,
    height: 720,
    category: "other",
    description: "入门宽度，适合嵌入或小屏预览；组件数量宜少。",
  },
  {
    id: "1366x768",
    label: "笔记本常见",
    tag: "1366×768",
    width: 1366,
    height: 768,
    category: "other",
    description: "常见办公分辨率；纵向空间有限，避免拥挤。",
  },
  {
    id: "1920x1080",
    label: "Full HD",
    tag: "1080p",
    width: 1920,
    height: 1080,
    category: "fullhd",
    description: "主流看板基准；与既有管线示例一致。",
  },
  {
    id: "1920x1200",
    label: "WUXGA 16:10",
    tag: "1920×1200",
    width: 1920,
    height: 1200,
    category: "other",
    description: "略增高纵向空间，可多排一行辅助模块。",
  },
  {
    id: "2560x1080",
    label: "带鱼入门",
    tag: "2560×1080",
    width: 2560,
    height: 1080,
    category: "ultrawide",
    description: "加宽横向排布，适合多列 KPI 或并排图表。",
  },
  {
    id: "2560x760",
    label: "超宽 HUD",
    tag: "2560×760",
    width: 2560,
    height: 760,
    category: "ultrawide",
    description: "加宽低高度条带布局，适合顶栏 + 三列大屏 HUD；纵向紧凑。",
  },
  {
    id: "2560x1440",
    label: "QHD / 2K",
    tag: "1440p",
    width: 2560,
    height: 1440,
    category: "2k",
    description: "2K 主流；可比 1080p 略增模块密度。",
  },
  {
    id: "2560x1600",
    label: "WQXGA 16:10",
    tag: "2560×1600",
    width: 2560,
    height: 1600,
    category: "2k",
    description: "Mac / 高端办公常见；纵向余量更大。",
  },
  {
    id: "3440x1440",
    label: "21:9 带鱼屏",
    tag: "Ultrawide",
    width: 3440,
    height: 1440,
    category: "ultrawide",
    description: "超宽画布，强调横向叙事与多窗并排。",
  },
  {
    id: "3840x2160",
    label: "4K UHD",
    tag: "2160p",
    width: 3840,
    height: 2160,
    category: "4k",
    description: "标准 4K 大屏；信息容量高，注意字号与间距随画布放大。",
  },
  {
    id: "5120x2880",
    label: "5K",
    tag: "5K",
    width: 5120,
    height: 2880,
    category: "4k",
    description: "超高像素密度；适合精细图表与多区块并存。",
  },
  {
    id: "7680x4320",
    label: "8K",
    tag: "8K",
    width: 7680,
    height: 4320,
    category: "4k",
    description: "巨幅 LED / 拼接墙基准；模块与字体需显著放大以免看不清。",
  },
];

const BY_ID = new Map(PRESETS.map((p) => [p.id, p]));

export function listScreenPresets(): ScreenPreset[] {
  return [...PRESETS];
}

export function getScreenPreset(id: string | undefined): ScreenPreset {
  const key = id?.trim() || DEFAULT_SCREEN_PRESET_ID;
  return BY_ID.get(key) ?? BY_ID.get(DEFAULT_SCREEN_PRESET_ID)!;
}

/** pages-story / design-story 的组件密度提示 */
export function formatPagesStoryDensityHintForScreen(sp: ScreenPreset): string {
  const pixels = sp.width * sp.height;
  if (sp.height <= 800 || pixels < 1_100_000) {
    return "纵向或总面积偏小：**不必**强求每页「除 KPI 外图表/表类 ≥5」；以保证主视觉可读与留白为先，可少于 5 个模块。";
  }
  if (sp.height >= 1600 || sp.width >= 3840 || pixels >= 8_000_000) {
    return "画布面积大：**可适当增加**每页辅助图表/表格数量（仍须有叙事主线，勿无意义堆砌）；主视觉区仍须突出。";
  }
  return "维持既有约束：除 KPI（pixel）外每页图表/表类组件 **至少 5 个**（若叙事上实在多余则可用脚注说明取舍）。";
}

export function assertScreenPresetsValid(): void {
  const ids = new Set<string>();
  for (const p of PRESETS) {
    if (ids.has(p.id)) throw new Error(`duplicate screen preset id: ${p.id}`);
    ids.add(p.id);
    if (p.width < 320 || p.height < 240) throw new Error(`screen preset ${p.id} dimension too small`);
  }
}

assertScreenPresetsValid();
