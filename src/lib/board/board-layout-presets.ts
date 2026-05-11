/**
 * 主区布局 preset（与 generate-jsx 同构）：KPI 横条之下的 content 区 grid 定义。
 */

export type LayoutRegionId =
  | "left"
  | "center"
  | "right"
  | "hero"
  | "botLeft"
  | "botMid"
  | "botRight"
  | "top"
  | "bottom";

export interface BoardLayoutPreset {
  id: string;
  label: string;
  description: string;
  /** KPI 行之下的主体区域（单容器 display:grid） */
  contentZone: {
    gridTemplateColumns: string;
    gridTemplateRows: string;
    /** 多行时用换行分隔，与 CSS grid-template-areas 一致 */
    gridTemplateAreas: string;
    gap: string;
  };
  /** 语义分区名 → grid-area 名称（须出现在 gridTemplateAreas 内） */
  regionPlacement: Record<
    LayoutRegionId,
    { gridArea: string; hint: string }
  >;
  /** 主视觉（★）图表应对齐的分区 */
  primaryChartRegion: LayoutRegionId;
}

export const DEFAULT_LAYOUT_PRESET_ID = "main-lcr-classic";

const PRESETS: BoardLayoutPreset[] = [
  {
    id: "main-lcr-classic",
    label: "左–中–右（经典）",
    description:
      "顶 KPI 横条下方左·中·右三栏；中栏略宽，放置唯一主视觉大图；左右栏垂直均分辅助图表。",
    contentZone: {
      gridTemplateColumns: "minmax(0, 2fr) minmax(0, 5fr) minmax(0, 2fr)",
      gridTemplateRows: "minmax(0, 1fr)",
      gridTemplateAreas: `"left center right"`,
      gap: "var(--space-4)",
    },
    regionPlacement: {
      left: { gridArea: "left", hint: "辅助图、环形图、排行榜等" },
      center: { gridArea: "center", hint: "唯一主视觉大图（evidence ★）" },
      right: { gridArea: "right", hint: "辅助图、表格、明细等" },
      hero: { gridArea: "center", hint: "与中栏同区（主视觉）" },
      botLeft: { gridArea: "left", hint: "—" },
      botMid: { gridArea: "center", hint: "—" },
      botRight: { gridArea: "right", hint: "—" },
      top: { gridArea: "left", hint: "—" },
      bottom: { gridArea: "right", hint: "—" },
    },
    primaryChartRegion: "center",
  },
  {
    id: "main-left-focus",
    label: "左核心 · 中右辅",
    description:
      "左栏更宽承载核心分析区；中、右为辅助；主视觉默认落在左栏（若文档指定中栏则以文档为准）。",
    contentZone: {
      gridTemplateColumns: "minmax(0, 4fr) minmax(0, 3fr) minmax(0, 2fr)",
      gridTemplateRows: "minmax(0, 1fr)",
      gridTemplateAreas: `"left center right"`,
      gap: "var(--space-4)",
    },
    regionPlacement: {
      left: { gridArea: "left", hint: "核心大图或主证据区（默认可放 ★）" },
      center: { gridArea: "center", hint: "次要图表" },
      right: { gridArea: "right", hint: "表格或小图" },
      hero: { gridArea: "left", hint: "主视觉常置左" },
      botLeft: { gridArea: "left", hint: "—" },
      botMid: { gridArea: "center", hint: "—" },
      botRight: { gridArea: "right", hint: "—" },
      top: { gridArea: "center", hint: "—" },
      bottom: { gridArea: "right", hint: "—" },
    },
    primaryChartRegion: "left",
  },
  {
    id: "main-symmetric-3",
    label: "三栏均分",
    description: "三等分列，主视觉默认居中栏；适合对称叙事。",
    contentZone: {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gridTemplateRows: "minmax(0, 1fr)",
      gridTemplateAreas: `"left center right"`,
      gap: "var(--space-4)",
    },
    regionPlacement: {
      left: { gridArea: "left", hint: "左侧模块" },
      center: { gridArea: "center", hint: "主视觉（★）默认落此" },
      right: { gridArea: "right", hint: "右侧模块" },
      hero: { gridArea: "center", hint: "—" },
      botLeft: { gridArea: "left", hint: "—" },
      botMid: { gridArea: "center", hint: "—" },
      botRight: { gridArea: "right", hint: "—" },
      top: { gridArea: "left", hint: "—" },
      bottom: { gridArea: "right", hint: "—" },
    },
    primaryChartRegion: "center",
  },
  {
    id: "main-hero-band-lcr",
    label: "上通栏主图 · 下三栏",
    description:
      "上方一行通栏「hero」放大趋势或地图；下方左·中·右继续排布明细；主视觉默认 hero 区。",
    contentZone: {
      gridTemplateColumns: "minmax(0, 2fr) minmax(0, 5fr) minmax(0, 2fr)",
      /* 禁用 42%/58%：父级为 flex 推导高度时 % 轨易塌成近 0，主区呈一条线 + 假空白 */
      gridTemplateRows: "minmax(0, 2fr) minmax(0, 3fr)",
      gridTemplateAreas: `
        "hero hero hero"
        "left center right"
      `,
      gap: "var(--space-4)",
    },
    regionPlacement: {
      hero: { gridArea: "hero", hint: "通栏主视觉（★ 默认）" },
      left: { gridArea: "left", hint: "下区左" },
      center: { gridArea: "center", hint: "下区中" },
      right: { gridArea: "right", hint: "下区右" },
      botLeft: { gridArea: "left", hint: "—" },
      botMid: { gridArea: "center", hint: "—" },
      botRight: { gridArea: "right", hint: "—" },
      top: { gridArea: "hero", hint: "—" },
      bottom: { gridArea: "center", hint: "—" },
    },
    primaryChartRegion: "hero",
  },
  {
    id: "main-two-column",
    label: "双列主区",
    description: "仅两列，适合 dashboard；主视觉默认左列。",
    contentZone: {
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      gridTemplateRows: "minmax(0, 1fr)",
      gridTemplateAreas: `"left right"`,
      gap: "var(--space-4)",
    },
    regionPlacement: {
      left: { gridArea: "left", hint: "主列（★ 默认）" },
      right: { gridArea: "right", hint: "次列" },
      center: { gridArea: "left", hint: "与左列同区" },
      hero: { gridArea: "left", hint: "—" },
      botLeft: { gridArea: "left", hint: "—" },
      botMid: { gridArea: "left", hint: "—" },
      botRight: { gridArea: "right", hint: "—" },
      top: { gridArea: "left", hint: "—" },
      bottom: { gridArea: "right", hint: "—" },
    },
    primaryChartRegion: "left",
  },
  {
    id: "main-quad",
    label: "四宫格",
    description: "四象限均分，适合多 KPI 对比或多图并列；主视觉默认左上 botLeft 语义映射为 area `quad-a`。",
    contentZone: {
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
      gridTemplateAreas: `
        "quad-a quad-b"
        "quad-c quad-d"
      `,
      gap: "var(--space-4)",
    },
    regionPlacement: {
      left: { gridArea: "quad-a", hint: "象限 A（★ 默认）" },
      center: { gridArea: "quad-b", hint: "象限 B" },
      right: { gridArea: "quad-d", hint: "象限 D" },
      hero: { gridArea: "quad-a", hint: "—" },
      botLeft: { gridArea: "quad-a", hint: "—" },
      botMid: { gridArea: "quad-c", hint: "象限 C" },
      botRight: { gridArea: "quad-d", hint: "—" },
      top: { gridArea: "quad-a", hint: "—" },
      bottom: { gridArea: "quad-c", hint: "—" },
    },
    primaryChartRegion: "left",
  },
];

const BY_ID = new Map(PRESETS.map((p) => [p.id, p]));

export function listLayoutPresets(): BoardLayoutPreset[] {
  return [...PRESETS];
}

export function getLayoutPreset(id: string | undefined): BoardLayoutPreset {
  const key = id?.trim() || DEFAULT_LAYOUT_PRESET_ID;
  return BY_ID.get(key) ?? BY_ID.get(DEFAULT_LAYOUT_PRESET_ID)!;
}

/** 启动时自检：region 的 gridArea 须出现在 areas 字符串中 */
export function assertLayoutPresetsValid(): void {
  for (const p of PRESETS) {
    const areas = p.contentZone.gridTemplateAreas.replace(/\s+/g, " ");
    for (const [rid, r] of Object.entries(p.regionPlacement)) {
      const token = r.gridArea.trim();
      if (!token) throw new Error(`preset ${p.id} region ${rid} empty gridArea`);
      if (!areas.includes(token)) {
        throw new Error(`preset ${p.id} region ${rid} gridArea "${token}" not in gridTemplateAreas`);
      }
    }
  }
}

assertLayoutPresetsValid();
