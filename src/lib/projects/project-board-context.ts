import type { BoardKind, FxPreset, ProjectConfig, ThemeMode } from "@/lib/projects/project-config";
import {
  DEFAULT_LAYOUT_PRESET_ID,
  getLayoutPreset,
  type LayoutRegionId,
} from "@/lib/board/board-layout-presets";
import {
  formatPagesStoryDensityHintForScreen,
  getScreenPreset,
  mainVerticalBudgetMulti,
  mainVerticalBudgetSingle,
} from "@/lib/board/screen-presets";

/** 浅色强制不使用霓虹类特效 */
export function resolveFxPreset(cfg: Pick<ProjectConfig, "themeMode" | "boardKind" | "fxPreset">): FxPreset {
  const theme: ThemeMode = cfg.themeMode === "light" ? "light" : "dark";
  if (theme === "light") return "none";
  if (cfg.fxPreset === "neon" || cfg.fxPreset === "subtle" || cfg.fxPreset === "none") {
    return cfg.fxPreset;
  }
  const kind: BoardKind = cfg.boardKind === "wallboard" ? "wallboard" : "dashboard";
  if (kind === "wallboard") return "subtle";
  return "none";
}

export function formatProjectBoardContextBlock(cfg: ProjectConfig): string {
  const presetId = cfg.layoutPresetId?.trim() || DEFAULT_LAYOUT_PRESET_ID;
  const preset = getLayoutPreset(presetId);
  const screen = getScreenPreset(cfg.screenPresetId);
  const fx = resolveFxPreset(cfg);
  const kind = cfg.boardKind === "wallboard" ? "wallboard（大屏）" : "dashboard（普通看板）";
  const pagesDensity = formatPagesStoryDensityHintForScreen(screen);

  const regionLines = Object.entries(preset.regionPlacement)
    .filter(([k]) => ["left", "center", "right", "hero"].includes(k) || k.startsWith("bot"))
    .slice(0, 12)
    .map(([k, v]) => `  - ${k} → grid-area **${v.gridArea}**：${v.hint}`)
    .join("\n");

  const density =
    cfg.boardKind === "wallboard"
      ? "大屏信息密度可更高：每页除 KPI 外图表/表类组件数量偏多、模块更丰富；但仍须可读，避免单页堆砌无叙事。"
      : "普通看板偏克制：每页组件数量适中，优先清晰叙事与留白，不必为凑数堆图。";

  const kpiRules =
    cfg.boardKind === "wallboard"
      ? "**KPI 默认倾向（可被 design-story 覆盖）**：优先 **mode=group + metric-group-inline**，presentation.surface 多为 **none / hairline**；深色且 fx≠none 时 **valueGlow** 可为 inherit；浅色不发霓虹。"
      : "**KPI 默认倾向**：优先 **presentation.surface=card**、layout **classic / header-inline**；大屏式霓虹不作为默认。";

  return `
========================
【项目场景契约（project.config.json）】
========================
- **themeMode**：${cfg.themeMode === "light" ? "light（浅色）" : "dark（深色）"}
- **boardKind**：${kind}
- **screenPresetId**：\`${screen.id}\` — ${screen.label}（**${screen.width}×${screen.height} px**）；所有页面结构、组件排布须按该像素画布设想。
- **pages-story 图表密度**：${pagesDensity}
- **layoutPresetId**：\`${preset.id}\` — ${preset.label}
- **layout 说明**：${preset.description}
- **主内容区 CSS Grid（须与 generate-jsx 一致）**：
  - gridTemplateColumns: \`${preset.contentZone.gridTemplateColumns}\`
  - gridTemplateRows: \`${preset.contentZone.gridTemplateRows}\`
  - gridTemplateAreas: ${preset.contentZone.gridTemplateAreas.trim()}
  - gap: ${preset.contentZone.gap}
- **语义分区（组件分配参考）**：
${regionLines || "  （见 preset）"}
- **主视觉（★）默认对齐 region**：\`${preset.primaryChartRegion}\`（若 Design Story 明确要求其它落点则从其）
- **特效档位（推导）**：\`${fx}\`（浅色固定为 none）
- **组件密度**：${density}
- ${kpiRules}
`.trim();
}

export function formatGenerateJsxLayoutDirective(cfg: ProjectConfig): string {
  const preset = getLayoutPreset(cfg.layoutPresetId);
  const fx = resolveFxPreset(cfg);
  const primary = preset.primaryChartRegion as LayoutRegionId;

  return `
========================
【当前项目：主区布局 preset（强制与同构）】
========================
本项目 **layoutPresetId=\`${preset.id}\`**。每一页 \`<main>\` 在 **顶 KPI 横条之下**，主体容器必须使用下列 **content 区** grid（数值一字不差采用；允许额外 minHeight:0、overflow:hidden、padding/gap 与文档一致）：
- display: "grid"
- gridTemplateColumns: "${preset.contentZone.gridTemplateColumns}"
- gridTemplateRows: "${preset.contentZone.gridTemplateRows}"
- gridTemplateAreas: \`${preset.contentZone.gridTemplateAreas.trim().replace(/\n/g, " ")}\`
- gap: "${preset.contentZone.gap}"

将 Widget 放入对应 **gridArea** 名称的容器（与 regionPlacement 一致）。**主视觉（★）**图表必须落在 **grid-area: ${preset.regionPlacement[primary]?.gridArea ?? "center"}**（除非 pages-story 明确要求其它分区）。

**主区高度链（与本 preset 同时强制）**：承载本 grid 的 DOM 节点（\`<main>\` 内、KPI 横条之下的**那一层** content 容器）除 \`flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden"\` 外，必须再写 **\`height: "100%", width: "100%", boxSizing: "border-box"\`**；其下每个 **grid-area** 根 \`<div>\` 必须 **\`minHeight: 0, minWidth: 0, overflow: "hidden"\`**；图表面板壳 **\`height: "100%"\`**。缺 **height:100%** 时 \`fr\` / \`minmax(0,1fr)\` 轨无法吃满剩余高度，会出现**主图区塌成一条线、下方大片「空底」**的灾难排版。**禁止**在 \`gridTemplateRows\` 里写 **百分比**（如 \`40%\`、\`minmax(0,35%)\`）；**只用** px 与 \`fr\` / \`minmax(0,1fr)\`。

**boardKind**：${cfg.boardKind === "wallboard" ? "wallboard — 大屏默认倾向 group KPI / 发光 token；浅色不发霓虹" : "dashboard — 默认 KPI 卡片 surface=card"}
**themeMode**：${cfg.themeMode === "light" ? "light" : "dark"}
**fxPreset（推导）**：${fx} — 浅色下 KPI 勿使用强 text-shadow 霓虹；深色 wallboard 可用 subtle。
`.trim();
}

/** generate-jsx：画布像素与垂直预算（覆盖系统提示中写死的 1920×1080 / 984 / 928） */
export function formatGenerateJsxScreenCanvasBlock(cfg: ProjectConfig): string {
  const sp = getScreenPreset(cfg.screenPresetId);
  const single = mainVerticalBudgetSingle(sp.height);
  const multi = mainVerticalBudgetMulti(sp.height);
  /** main 内「仅 KPI」首行下限：约为画布高度 14%，避免 metric-group / 多行文案在缩放预览时被压叠 */
  const kpiStripRowMinPx = Math.max(148, Math.round(sp.height * 0.14));
  const kpiStripRowHeavyPx = Math.max(kpiStripRowMinPx + 56, Math.round(sp.height * 0.17));
  return `
========================
【当前项目：画布像素尺寸（最高优先级）】
========================
- 根容器（最外层看画布）必须使用 **width: ${sp.width}**, **height: ${sp.height}**（数字 px）；**禁止**默认写死 1920×1080 除非本预设即 1920×1080。
- **metadata.canvasSize** 必须为 \`{ "width": ${sp.width}, "height": ${sp.height} }\`。
- **垂直预算**：header 固定 **96** px；单页时 main（flex:1）内 **grid 行高 + gap + padding** 总和须落在高度 **${sp.height} − 96** 以内（约 **${single}** px 量级可用）；**多分页**时另减底部 footer **56** px，main 内总和须 ≤ **${sp.height} − 152**（约 **${multi}** px 量级可用）。
- 画布标签：**${sp.tag}**（${sp.width}×${sp.height}）；${sp.description}

**KPI 横条防挤压（与本画布绑定，生成 JSX 时必须落实）**
- main 内 **仅放 KPI 的那一行** \`gridTemplateRows\` **首段高度**须为 **≥ ${kpiStripRowMinPx}** px 的**纯数字**（禁止用该行吸收剩余高度代替固定下限）。若该页存在 **metric-group-inline** 且 **groupItems ≥ 5**、或组内多项带 **miniChart / footer / 趋势** 等「高卡」，首行须 **≥ ${kpiStripRowHeavyPx}** px，或拆成 **两个 KPI Widget** 分两列、或 **两行 KPI**（两行均用具体 px，例如 \`"${kpiStripRowMinPx}px ${kpiStripRowMinPx}px minmax(0,1fr)"\`，**禁止** KPI 行用 \`minmax(0,1fr)\` 当首行）。
- **禁止**把 KPI / pixel 指标塞进 **header**（顶栏固定 96px，只容标题与筛选）。
- 包裹 **\`<Widget type=KPI />\`** 的外层 div：**不要**套用与图表相同的 \`minHeight: 0\`「收缩壳」；在 KPI 行高已给足的前提下用 \`height: "100%", minWidth: 0, overflow: "hidden"\` 即可；**避免**再叠一层过矮的 \`maxHeight\`。
- **metric-group-inline**：同一 Widget 内 **groupItems 列并列**建议 **≤4**；更多指标请拆成多个 KPI 或改 **sidebar-stack** / 第二行 KPI。
- 若该页任一 KPI 的 props 含 **miniChart**（内嵌趋势/柱条），KPI 横条首行高度建议在上述下限基础上 **再增加 ≥40px**，避免运行时迷你图被压成一条线。
`.trim();
}
