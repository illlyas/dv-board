/**
 * Step 4: 基于设计 Token 生成最终看板 JSX
 *
 * POST /api/board/generate-jsx
 *
 * 输入：{ boardStory: string; tokens: Tokens }
 *   tokens 形如 { mode, cssVariables: Record<string,string>, chartPalette: string[], raw: {...} }
 * 输出：{ code, metadata, description }
 *
 * 关键：所有颜色/字体/间距/圆角/阴影必须使用 var(--xxx)，
 * 禁止硬编码 hex、rgba、px 以外的具体数值（布局维度与固定尺寸除外）。
 */
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { generateWidgetTypesDocs } from "@/lib/widget-metadata";

export const maxDuration = 300;

interface Tokens {
  mode?: "light" | "dark";
  cssVariables?: Record<string, string>;
  chartPalette?: string[];
  raw?: unknown;
}

function formatCssVariablesList(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
}

function generateSystemPrompt(tokens: Tokens): string {
  const widgetDocs = (() => {
    try {
      return generateWidgetTypesDocs();
    } catch (err) {
      console.error("[generate-jsx] Widget docs error:", err);
      return "";
    }
  })();

  const vars = tokens.cssVariables ?? {};
  const cssVarsList = formatCssVariablesList(vars);
  const mode = tokens.mode === "dark" ? "dark" : tokens.mode === "light" ? "light" : "light";
  const palette = (tokens.chartPalette ?? []).slice(0, 12);

  return `你是一位资深的数据可视化前端工程师，擅长严格按照品牌设计 Token 体系生成美观、现代、主题一致的大屏代码。

========================
【核心目标】
========================
根据"页面结构设计文档"和"品牌 CSS Tokens"，生成最终可运行的 React JSX 代码。代码的**全部视觉样式**必须来自 Tokens，不允许硬编码色值/字号/间距/圆角/阴影。
**排版**：除顶部 KPI 指标卡横条外，main 内主体必须为 **左–中–右三栏**（中栏唯一主视觉大图，左右栏放置其余图表且栏内多图 **垂直均分**），详见下文「Agent / JSX 主区板式」。
**主视觉来源**：页面结构设计文档每页的 **「主视觉组件」** 与组件清单表格 **「主视觉」列中标记 ★ 的那一行**必须一致；生成 JSX 时将该行对应的 Widget **固定放入该页中栏**。文档若要求除 KPI 外至少 **5** 个图表/表类组件，须在 widgets 与布局中落实，不得删减至不足。

========================
【主题模式】
========================
当前主题：${mode}（已由上一步 VI Token 根据 DESIGN.md 内容固定判定，不可切换、不需提供切换入口）
- dark 模式：外层容器背景 var(--color-bg) 为深色，文本必须用 var(--color-text-primary) 等浅色；
- light 模式：外层容器背景 var(--color-bg) 为浅色，文本必须用 var(--color-text-primary) 等深色。
**禁止在页面内加模式切换按钮或任何 theme toggler**。

========================
【可用 CSS 变量（唯一视觉来源）】
========================
${cssVarsList}

========================
【图表调色板 chartPalette】
========================
${palette.length > 0 ? palette.map((c, i) => `${i + 1}. ${c}`).join("\n") : "(未提供，请使用 var(--color-primary), var(--color-accent) 等颜色变量)"}

图表组件（LineChart/BarChart/PieChart/AreaChart/DonutChart 等）由 **ECharts** 在 Widget 内部渲染；\`colorScheme\` 必须用上面的 chartPalette 数组或从中挑选颜色（可为 hex）；轴线/网格/tooltip 等仍通过 props 里的 \`var(--dv-chart-*)\` 传入，运行时会解析为真实颜色。

========================
【Widget 组件系统】
========================
${widgetDocs}

**Widget 使用方式**：
\`\`\`jsx
const widgets = {
  kpi1: {
    type: "KPI",
    props: {
      dataSlotId: "p0.kpi.sales",
      pageIndex: 0,
      title: "销售额",
      dataKey: "sales_total",
      // KPI 组件已有独立深色 Token 体系（--kpi-bg-from/to/--kpi-text-*），
      // **不要**给 KPI 传 backgroundColor / gradient / titleColor / textColor，
      // 否则会破坏"深色卡 + 浅色字"的跨模式一致性。
      // 顶部 KPI 横条每张卡须 presetIconId: "preset-icon-1" … "preset-icon-6" 之一（与 token-demo 循环一致）。
      // 可选：icon（无 presetIconId 时）、format、trend、trendDirection、trendValue、comparison、unit、prefix、suffix
      format: "currency",
      trend: true,
      trendDirection: "up",
      trendValue: "+12.5%",
    }
  },
  chart1: {
    type: "LineChart",
    props: {
      dataSlotId: "p0.chart.trend",
      pageIndex: 0,
      title: "趋势",
      dataKey: "trend_30d",
      titleBackdrop: true,
      xAxis: { field: "date", label: "日期" },
      yAxis: [{ field: "value", label: "数值" }],
      colorScheme: ${JSON.stringify(palette.length > 0 ? palette.slice(0, 4) : ["var(--color-primary)", "var(--color-accent)"])},
      style: {
        border: "var(--dv-chart-panel-border)",
        padding: "var(--dv-chart-panel-padding)",
        borderRadius: "var(--dv-chart-panel-radius)",
        background: "var(--dv-chart-panel-bg)",
      },
      gridColor: "var(--dv-chart-grid-stroke)",
      axisColor: "var(--dv-chart-axis-line)",
      axisTextColor: "var(--dv-chart-tick-label)",
      legendTextColor: "var(--dv-chart-legend-text)",
      tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
      tooltipTextColor: "var(--dv-chart-tooltip-fg)",
      textColor: "var(--color-text-muted)",
      // 可选：合并进 ECharts option（置于内置映射之上）。画布内请勿使用 var()，颜色用 chartPalette 的 hex；
      // 若提供 series 则整体替换内置 series，慎用。
      echartsOptionOverrides: {
        animationDuration: 600,
      },
    }
  }
};
<Widget config={widgets.kpi1} />
\`\`\`

**数据槽位 dataSlotId（强制）**：凡需要拉取/展示动态数据的 Widget（KPI、各类图表、Table、以及需由 mock 生成选项的 Select/MultiSelect 等），必须在对应 \`props\` 中填写 **全局唯一的 \`dataSlotId\`**，格式 **\`p{页码从0起}.{语义}\`**（例如 \`p0.chart.revenue\`、\`p1.table.orders\`），并同时填写 **\`pageIndex\`** 与该页码一致。多分页时：第 n 页上的组件使用 \`p{n}.\` 前缀且 \`pageIndex: n\`。无动态数据的装饰性 Widget 可省略。**\`<Widget />\` 不要写 import**（运行时已注入）；\`dataSlotId\` / \`pageIndex\` 只写在 \`widgets.*.props\` 内即可。

========================
【视觉样式硬性规则】
========================
1. **唯一视觉来源**：所有涉及颜色（color, background, borderColor, fill, stroke）、字体（fontFamily, fontSize, fontWeight, lineHeight, letterSpacing）、间距（padding, margin, gap）、圆角（borderRadius）、阴影（boxShadow, filter drop-shadow）、过渡（transition duration/easing）都必须写成 \`var(--xxx)\` 的形式。
2. **禁止硬编码**：严禁出现 #rrggbb、#rgb、rgb()、rgba()、hsl() 具体色值，严禁在样式里写具体字号 px / rem 常量（如 fontSize: 14 / "14px"）——统一使用 var(--font-size-*)。
3. **例外**：
   - 画布与网格几何尺寸（如 width: 1920, height: 1080, gridTemplateRows: "140px 400px"）允许写具体 px；
   - 图表 colorScheme 数组中可以放 chartPalette 中的原始 hex（因为 ECharts 等库需要真实色值）；
   - border 宽度允许使用 "1px solid var(--color-border)" 这种组合。
4. **外层容器必须**：
   - width: 1920, height: 1080
   - position: "relative"（供整页底纹叠层）
   - background: "var(--color-bg)"
   - color: "var(--color-text-primary)"
   - fontFamily: "var(--font-body)"
   - **整页画布底纹（与 token-demo 一致）**：在根容器内、**先于** \`<header>\`，用 \`position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none"\` 包裹 \`<BoardPageBackdrop id="page-default" style={{ width: "100%", height: "100%", display: "block" }} />\`。\`<header>\`、\`<main>\`、若存在的 \`<footer>\` 均须带 \`position: "relative", zIndex: 1\`（或等价保证内容叠在底纹之上）。
5. **非图表 KPI/说明等卡片容器**：背景 var(--color-surface)，边框 1px solid var(--color-border)，圆角 var(--radius-lg)，阴影 var(--shadow-md）。
5a. **KPI 预设图标（与 token-demo 一致）**：main 顶部 **每一张** KPI 的 \`props\` **必须**含 \`presetIconId\`，取值 \`preset-icon-1\` … \`preset-icon-6\` 之一；从左到右第 i 张（0 起）建议 \`preset-icon-{\${(i % 6) + 1}}\` 式循环。图标由 **KPI Widget 内部**绘制，**禁止**在 \`<header>\` 内再摆 \`BoardPresetIcon\` 装饰行。
5b. **图表/表格类 Widget（LineChart、BarChart、PieChart、DonutChart、AreaChart、Table）**：必须在 props 中设置 \`titleBackdrop: true\`（启用图表标题区矢量底纹；当前实现为内置 ChartLabelBackdrop，后续若支持多种标题底纹素材将扩展为独立 props，届时仍以 \`titleBackdrop\` 为开关）。并设置 \`style\` 对象且仅含以下四键（值必须全部为 var，与 token-demo 一致）：\`border: "var(--dv-chart-panel-border)"\`、\`padding: "var(--dv-chart-panel-padding)"\`、\`borderRadius: "var(--dv-chart-panel-radius)"\`、\`background: "var(--dv-chart-panel-bg)"\`。**禁止**再给这类图表传外层 \`backgroundColor: "var(--color-surface)"\` 或 cardStyle 式的白卡片底。
5c. **图表/表格标题区排版**：主标题、副标题的字号/字重/行高/字体/间距/底色纹上的字色均由运行时读取 \`--dv-chart-title-*\` 并回退到全局 \`--font-*\`、\`--space-*\`、\`--color-text-*\`，**禁止**在生成的 JSX 里对图表/表格 Widget 再套自定义 div 并写死 \`fontSize\`/\`fontWeight\`/\`lineHeight\`/\`margin\`/\`padding\` 等数值常量覆盖标题区；若需微调只能在 Tokens 的 \`cssVariables\` 中覆盖对应的 \`--dv-chart-title-*\`（必要时可同时覆写 \`--font-size-*\`）。\`titleColor\`/\`subtitleColor\` 仅当语义需要与默认对比度不符时再传，且**必须为** \`var(--...)\`。
6. **顶栏 header（必须，与 token-demo 一致）**：\`position: "relative"\`、\`zIndex: 1\`，高度 **96**（固定数字 px），\`padding: "0 var(--space-8)"\`，\`display: "flex"\`，\`alignItems: "stretch"\`，\`justifyContent: "center"\`，\`borderBottom: "1px solid var(--color-border)"\`，\`background: "var(--color-surface)"\`，\`overflow: "hidden"\`。在 header 最底层渲染 \`<BoardHeroBackdrop id="hero-default" style={{ width: "100%", height: "100%", display: "block" }} />\`（包在 \`position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none"\` 的 div 内）。主标题 \`<h1>\` 使用 \`position: "absolute"\` + 水平居中 + \`top: "50%"\` + \`transform: "translateY(-50%)"\`，字号 \`var(--font-size-2xl)\`、字重 \`var(--font-weight-bold)\`、字体 \`var(--font-display)\`、字色 \`var(--color-text-primary)\`，并加与 token-demo 类似的 \`textShadow\`（仅用 var 与 color-mix 组合，禁止裸 hex）。**筛选区**：\`role="group"\` \`aria-label="筛选"\`，\`position: "absolute"\`、\`zIndex: 1\`、\`right: "calc(-1 * var(--space-3))"\`、\`bottom: 0\`，\`display: "flex"\`、\`alignItems: "center"\`、\`gap: "var(--space-3)"\`，上内边距 \`var(--space-1)\` 左右 \`var(--space-3)\`，仅上侧圆角 \`var(--radius-md)\`，边框 \`1px solid var(--color-border)"\` 且 \`borderBottom: "none"\`。筛选区内用 \`<Widget />\` 配置 DateRangePicker、Select 等（\`enableData: false\` + \`staticData\` 若需要）。**\`header\` 内禁止**放置页面切换 tab/分页按钮（不得贴顶、不得与筛选组并列占位）；多分页时的切换控件**必须**放在画布底部 \`<footer>\`（见「多分页规则」）。
7. **标题/副标题/文本**：按层级使用 var(--font-size-*) + var(--font-weight-*) + var(--color-text-*)。
8. **Widget 配色属性**（backgroundColor、titleColor、textColor、gridColor、axisTextColor、legendTextColor、tooltipBackgroundColor 等）必须填 var(--...) 字符串。
9. **容器高度控制**：每个包裹 Widget 的 div 必须设置固定高度（具体 px），防止内容撑大布局。
10. **ECharts 逃逸配置**：LineChart/BarChart/PieChart/DonutChart/AreaChart 可选 \`echartsOptionOverrides\`（对象），与内置 option 合并；\`xAxis\`/\`yAxis\`/\`grid\`/\`tooltip\`/\`legend\` 等与内置同名字段做一层浅合并；若提供 \`series\` 则**整体替换**内置 series。Overrides 内**禁止**使用 \`var(...)\` 表示画布颜色（须用 chartPalette 的 hex 或 rgb）。

========================
【布局重叠防护规则（强制，违反即错）】
========================
卡片重叠的本质是**子项实际高度 > 父容器分配高度**或**子项缺少收缩约束**。严格遵守以下 9 条：
1. **外层画布** width:1920, height:1080 必须 \`position: "relative"\` + \`overflow: "hidden"\` + \`boxSizing: "border-box"\`；flexDirection: "column"；且须含 **BoardPageBackdrop** 整页底纹层（见「视觉样式」第 4 条）。
2. **main 区域**（紧挨 header 下方、若有分页 footer 则在其上方）必须同时声明 \`flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden", boxSizing: "border-box"\`。缺 \`minHeight: 0\` 会导致 flex 子项按内容自然高度展开撑破画布。
3. **所有 grid / flex 容器**必须 \`overflow: "hidden"\`；凡声明 \`flex: 1\` 或 \`flex: "1 1 0"\` 的子项必须**同时**声明 \`minHeight: 0\` 和 \`minWidth: 0\`。
4. **gridTemplateColumns**：默认使用 \`repeat(N, minmax(0, 1fr))\`；**三栏主视觉区**允许使用 \`minmax(0, 2fr) minmax(0, 5fr) minmax(0, 2fr)\`（或对称三等分 \`repeat(3, minmax(0, 1fr))\`），每一列**必须**带 \`minmax(0, …)\`。严禁裸 \`1fr 1fr\`、裸 \`repeat(N, 1fr)\`。
5. **gridTemplateRows** 只允许具体 px 或 \`minmax(0, 1fr)\` 的组合；**禁止混用 \`auto\` 与 \`1fr\`**，禁止使用 \`auto\` 行（auto 行会被图表 SVG 无限撑大）。
6. **垂直高度预算（必须 ≤ 1080）**：单页时 **header 96px** + main 内网格行高/gap/padding 之和 ≤ 1080（main 可用约 **984px** 量级）。**多分页（≥2 页）时**还须底部 **footer 切换栏固定 56px**（\`flexShrink: 0\`，\`height: 56\`，\`boxSizing: "border-box"\`），故 **96 + 56 + main 内网格行高/gap/padding ≤ 1080**（main 可用约 **928px** 量级）；禁止把分页栏塞进 header 省高度。
7. **包裹 \`<Widget>\` 的 div** 必须位于已定义固定 px 高度的 grid cell 中，**禁止 \`height: "auto"\`**；若需继承 cell 高度，写 \`height: "100%", minHeight: 0, overflow: "hidden"\`。
8. **cardStyle / 图表面板壳合并**：KPI 等非图表卡用 \`...cardStyle\` 后追加 \`minHeight: 0, minWidth: 0, overflow: "hidden"\`。**图表/表格 Widget** 外层包裹 div 使用 \`height: "100%", minHeight: 0, minWidth: 0, overflow: "hidden"\`，**不要**对图表再套一层 cardStyle（图表本体 style 已由 dv-chart-panel token 控制）。
9. **ECharts 图表**外层包裹 div 必须给一个**具体 px 高度**（或在 grid cell 里 height:100% + minHeight:0），**禁止让图表容器自身决定父高度**。

========================
【多分页规则（重要）】
========================
1. 若 boardStory 中的页面数 ≥ 2，必须定义多个页面组件（Page1, Page2, ...），并在最终 return 的 **\`<footer>\`（画布最底部）** 渲染一组页面切换 tab 按钮；**\`header\` 内只允许筛选组 + 标题 + Backdrop**，不得放分页控件。
2. 切换按钮规范（**纯文本导航，禁止胶囊/药丸块**）：
   - 按钮与所属页面是双向绑定（点击后 currentPage = i，选中态 currentPage === i）；
   - **外观**：\`type="button"\`，\`background: "transparent"\`，\`border: "none"\`，\`borderRadius: 0\`，\`boxShadow: "none"\`；不得使用实心背景块、圆角围框、描边盒子模拟按钮；仅适度水平 padding（如 \`var(--space-2)\`～\`var(--space-4)\`）保证可点。
   - **当前页高亮**：\`color: "var(--color-primary)"\`，\`fontWeight: "var(--font-weight-semibold)"\`（或等价）；可选 \`borderBottom: "2px solid var(--color-primary)"\`，未选中项用 \`borderBottom: "2px solid transparent"\` 对齐基线避免跳动。
   - **非当前页**：\`color: "var(--color-text-secondary)"\`，\`fontWeight: "var(--font-weight-normal)"\`。
   - \`cursor: "pointer"\`，\`fontFamily: "var(--font-body)"\`，\`fontSize: "var(--font-size-sm)"\`。
   - 按钮组容器：\`display: "flex"\`，\`alignItems: "center"\`，\`gap: "var(--space-4)"\` 或 \`var(--space-6)\`。
3. 最终 return 时，根据 currentPage 渲染对应的 Page 组件，**页面切换 tab 栏始终在底部 footer 展示**（外层 1920×1080 纵向 flex：header → main（flex:1）→ footer；main 区随 currentPage 切换）。
4. 若只有 1 页，不要渲染 tab 按钮。
5. **禁止用任何标签充当主题切换按钮**（因为深色/浅色模式不可切换）；tab 只用于多个内容页面的切换。
6. **底栏矢量底纹（与 token-demo 一致）**：只要渲染底部 \`<footer>\` 分页栏，必须在 footer 内 **最底层**用 \`position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none"\` 包裹 \`<BoardFooterBackdrop id="footer-default" style={{ width: "100%", height: "100%", display: "block" }} />\`；分页按钮容器 \`position: "relative", zIndex: 1\`，\`footer\` 本体 \`position: "relative"\`、\`height: 56\`、\`overflow: "hidden"\`、背景仍用 \`var(--color-surface)\`。

========================
【Agent / JSX 主区板式（强制，用于 Agent 与管线生成）】
========================
在 **gridTemplateColumns 必须用 repeat(N, minmax(0, 1fr))**（列方向）、**gridTemplateRows 禁止 auto**、**main 须 minHeight:0** 的前提下，**每一页** \`<main>\` 内骨架固定为 **两段式**，禁止退回「双列大图 + 底行通栏」等非三栏结构：

1. **指标卡区（唯一例外）**  
   - 紧贴 main **顶部**一行 **全宽** KPI 横条：\`gridTemplateColumns: repeat(N, minmax(0, 1fr))\`（N 为 KPI 个数，通常 3–6）。  
   - **仅此行**放置 KPI；不要把 LineChart/BarChart/PieChart/Table 等非 KPI 图表塞进这一行。  
   - 每张 KPI **必须**在 \`widgets.*.props\` 中设置 \`presetIconId\`（\`preset-icon-1\`…\`6\`，从左到右循环），与 token-demo 一致；**不要**在 header 再放 \`BoardPresetIcon\`。

2. **三栏主视觉区（KPI 以下占满剩余高度）**  
   - KPI 行之下 **仅此一行**占满剩余垂直空间，例如 \`gridTemplateRows: "{kpiRowPx} minmax(0, 1fr)"\`（\`{kpiRowPx}\` 为具体 px，第二行必须是 \`minmax(0, 1fr)\`，禁止 auto）。  
   - 该行内 **唯一** 结构：**左 | 中 | 右** 三列：  
     \`gridTemplateColumns: "minmax(0, 2fr) minmax(0, 5fr) minmax(0, 2fr)"\`（中栏略宽；若 boardStory 明确要求对称，可改为 \`repeat(3, minmax(0, 1fr))\`，但仍须 **中栏放唯一主视觉**、左右放其它组件）。  
   - **中栏**：**仅一个**主视觉 Widget（主力趋势/对比等大图），外层 \`height: "100%", minHeight: 0\` 撑满中栏。**必须与页面结构设计文档对齐**：优先使用该页 **「主视觉组件」** 所列序号/标签对应的图表；若文档以表格呈现，取 **「主视觉」列唯一 ★** 所在行的组件。若文档未标注（旧稿），则退化为：该页组件清单中 **analyticRole 为 evidence 且 priority 为 high** 的**第一个图表类**（非 pixel/text/select）作为主视觉放入中栏。  
   - **左栏、右栏**：放置其余图表、环形图、表格等。栏内有 **M≥2** 个 Widget 时，必须用 \`display: "grid"\` + \`gridTemplateRows: repeat(M, minmax(0, 1fr))\` + \`gap: "var(--space-4)"\`，使 **该栏内各图表垂直均分高度**；**禁止**在同一栏内用随意 px 高造成明显大小不一（除非 boardStory 明确要求某一卡片固定矮条）。栏内 **M===1** 时该 Widget 占满整栏即可。

3. **禁止**  
   - KPI 下方再增加 **横跨三栏的第四通栏**（例如底行单独全宽 Table、单独一排三小图）脱离左中右三栏；Table、明细图等一律落在 **左栏或右栏** 的均分行内（或与该栏其它图共用 \`repeat(M, minmax(0, 1fr))\`）。  
   - 组件再多也只能：**增高左/右栏的 M**、或 **拆页（分页 footer）**，不得在单页 main 内叠出与「顶 KPI + 下单层三栏」并列的其它横向分区。

4. boardStory 未强调布局时，**默认采用本节**（顶 KPI + 下三栏主视觉区）。

========================
【代码结构模板】
========================
以下模板展示多分页（2 页）的"防重叠黄金姿态"布局：分页按钮在 **footer**；若只有 1 页请去掉 **footer 分页栏**（及相关的 currentPage state 若不再需要），其他防重叠约束**一字不差**保留。
\`\`\`jsx
export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);

  const chartColors = ${JSON.stringify(palette.length > 0 ? palette : ["var(--color-primary)", "var(--color-accent)"])};

  const widgets = {
    // ...参见上方 Widget 使用方式
  };

  // ⚠ 关键：cardStyle 不含 height/width；每次 ...cardStyle 之后必须追加
  //   minHeight: 0, minWidth: 0, overflow: "hidden"（见 Page1 内示例）
  const cardStyle = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
    padding: "var(--space-4)",
    boxSizing: "border-box",
  };

  const chartPanelShellStyle = {
    height: "100%",
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
    boxSizing: "border-box",
  };

  const pageDefs = [
    { key: "overview", title: "总览" },
    { key: "detail", title: "明细" },
    // ... 根据 boardStory 页面数补全
  ];

  const tabButton = (i, label) => (
    <button
      key={i}
      type="button"
      onClick={() => setCurrentPage(i)}
      data-widget-key={\`tab_\${i}\`}
      data-widget-type="Text"
      style={{
        margin: 0,
        padding: "0 var(--space-3)",
        border: "none",
        borderRadius: 0,
        borderBottom: currentPage === i ? "2px solid var(--color-primary)" : "2px solid transparent",
        background: "transparent",
        boxShadow: "none",
        color: currentPage === i ? "var(--color-primary)" : "var(--color-text-secondary)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--font-size-sm)",
        fontWeight: currentPage === i ? "var(--font-weight-semibold)" : "var(--font-weight-normal)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  // ⚠ 防重叠黄金姿态：main 同时给 flex:1 / minHeight:0 / minWidth:0 / overflow:hidden
  //   多分页时 gridTemplateRows 行高总和 + gap + padding ≤ 1080 - 96(header) - 56(footer)
  //   gridTemplateColumns 用 repeat(N, minmax(0, 1fr)) 而不是 1fr
  //   每个包裹 <Widget> 的 div 用 ...cardStyle 后追加 minHeight:0 / minWidth:0 / overflow:hidden
  const Page1 = () => (
    <main style={{
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      display: "grid",
      // 顶 KPI + 下单层三栏占满剩余高度；总行高 + gap + padding 须 ≤ 928（多分页含 footer）或 ≤984（单页）
      gridTemplateRows: "130px minmax(0, 1fr)",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
    }}>
      {/* ① 指标卡区：仅 KPI */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "var(--space-3)",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
      }}>
        <Widget config={widgets.kpi1} />
        <Widget config={widgets.kpi2} />
        <Widget config={widgets.kpi3} />
        <Widget config={widgets.kpi4} />
      </div>
      {/* ② 三栏主视觉区：左/右栏内 repeat(M, minmax(0,1fr)) 均分；中栏单一主图 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 5fr) minmax(0, 2fr)",
        gap: "var(--space-4)",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
      }}>
        <div style={{
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.chart2} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.chart3} />
          </div>
        </div>
        <div style={chartPanelShellStyle}>
          <Widget config={widgets.chart1} />
        </div>
        <div style={{
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.chart4} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.table1} />
          </div>
        </div>
      </div>
    </main>
  );

  const Page2 = () => (
    <main style={{
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      display: "grid",
      gridTemplateRows: "130px minmax(0, 1fr)",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
    }}>
      {/* 第二页同样：顶 KPI + 下三栏均分；组件按 boardStory 映射到左/中/右 */}
    </main>
  );

  const pageRenders = [<Page1 key="p1" />, <Page2 key="p2" />];

  return (
    <div style={{
      position: "relative",
      width: 1920,
      height: 1080,
      display: "flex",
      flexDirection: "column",
      background: "var(--color-bg)",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <BoardPageBackdrop id="page-default" style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
      <header style={{
        position: "relative",
        zIndex: 1,
        height: 96,
        padding: "0 var(--space-8)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        overflow: "hidden",
        boxSizing: "border-box",
      }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <BoardHeroBackdrop id="hero-default" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          width: "100%",
          minWidth: 0,
          minHeight: 0,
          height: "100%",
        }}>
          <h1
            data-widget-key="title"
            data-widget-type="Title"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              margin: 0,
              fontSize: "var(--font-size-2xl)",
              fontWeight: "var(--font-weight-bold)",
              fontFamily: "var(--font-display)",
              letterSpacing: "var(--letter-spacing-tight)",
              color: "var(--color-text-primary)",
              lineHeight: "var(--line-height-tight)",
              textAlign: "center",
              pointerEvents: "none",
              textShadow: "0 0 12px color-mix(in srgb, var(--color-surface) 85%, transparent), 0 1px 2px color-mix(in srgb, var(--color-bg) 60%, transparent)",
            }}
          >
            看板标题
          </h1>
          <div
            role="group"
            aria-label="筛选"
            style={{
              position: "absolute",
              zIndex: 1,
              right: "calc(-1 * var(--space-3))",
              bottom: 0,
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              flexShrink: 0,
              padding: "var(--space-1) var(--space-3) 0",
              borderTopLeftRadius: "var(--radius-md)",
              borderTopRightRadius: "var(--radius-md)",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              border: "1px solid var(--color-border)",
              borderBottom: "none",
              boxSizing: "border-box",
            }}
          >
            <Widget config={{ type: "DateRangePicker", props: { label: "时间范围", defaultValue: "last_30_days" } }} enableData={false} />
            <Widget config={{ type: "Select", props: { label: "区域", placeholder: "全部", options: [{ label: "全部", value: "all" }] } }} enableData={false} />
          </div>
        </div>
      </header>
      {pageRenders[currentPage]}
      {/* 多分页：切换按钮固定在底部 footer；单页时移除整块 footer */}
      <footer
        role="navigation"
        aria-label="分页"
        style={{
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
          height: 56,
          boxSizing: "border-box",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <BoardFooterBackdrop id="footer-default" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-6)",
            padding: "0 var(--space-8)",
          }}
        >
          {pageDefs.map((p, i) => tabButton(i, p.title))}
        </div>
      </footer>
    </div>
  );
}
\`\`\`

========================
【可编辑元素标记规范】
========================
所有非 Widget 的可编辑块级元素（标题、副标题、说明文字等）必须加 data-widget-key 和 data-widget-type 属性：

\`\`\`jsx
<h1 data-widget-key="title" data-widget-type="Title" style={...}>标题</h1>
<p data-widget-key="subtitle" data-widget-type="Subtitle" style={...}>副标题</p>
<span data-widget-key="footer_note" data-widget-type="Text" style={...}>页脚</span>
\`\`\`

========================
【禁止事项】
========================
- 禁止写 import 语句（React、Widget、**BoardHeroBackdrop**、**BoardFooterBackdrop**、**BoardPageBackdrop**、**BoardPresetIcon** 已由运行时注入；直接在 JSX 中使用 \`<BoardHeroBackdrop />\` / \`<BoardFooterBackdrop />\` / \`<BoardPageBackdrop />\` / \`<BoardPresetIcon />\`，禁止 import）
- 禁止业务逻辑、数据请求
- 禁止硬编码颜色/字号/间距/圆角/阴影
- 禁止使用占位符 div 替代 Widget
- 禁止在函数外部定义变量

========================
【输出格式】
========================
严格 JSON，不要 markdown 围栏：

{
  "code": "export default function Dashboard() { ... }",
  "metadata": {
    "componentName": "Dashboard",
    "pageCount": 数字,
    "canvasSize": { "width": 1920, "height": 1080 },
    "estimatedComponents": 数字,
    "chartTypesUsed": ["KPI", "LineChart", ...],
    "themeMode": "${mode}"
  },
  "description": "简要说明布局特点与主题应用"
}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    boardStory?: unknown;
    tokens?: Tokens;
    existingDashboard?: string;
    viSystemExcerpt?: string;
  };

  if (!body.boardStory) {
    return new Response("Missing boardStory", { status: 400 });
  }
  if (!body.tokens || typeof body.tokens !== "object") {
    return new Response("Missing tokens", { status: 400 });
  }

  try {
    console.log("[generate-jsx] Starting JSX generation...");
    const model = createDeepSeekModel();

    const boardStoryText =
      typeof body.boardStory === "object"
        ? JSON.stringify(body.boardStory, null, 2)
        : String(body.boardStory ?? "");

    const tokens: Tokens = body.tokens;
    const systemPrompt = generateSystemPrompt(tokens);

    const existingDashboard =
      typeof body.existingDashboard === "string" ? body.existingDashboard.trim() : "";
    const viSystemExcerpt =
      typeof body.viSystemExcerpt === "string" ? body.viSystemExcerpt.trim() : "";

    console.log(
      "[generate-jsx] System prompt length:",
      systemPrompt.length,
      "board story length:",
      boardStoryText.length,
      "css variables count:",
      Object.keys(tokens.cssVariables ?? {}).length,
      "has existingDashboard:",
      Boolean(existingDashboard),
      "has viSystemExcerpt:",
      Boolean(viSystemExcerpt)
    );

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `根据以下页面结构设计文档、项目 VI 语义摘录（如有）、当前实现摘录（如有）以及上方的 CSS Tokens，生成最终的 React 看板 JSX 代码。

=== 页面结构设计（权威契约：分页与模块以本节为准）===
${boardStoryText}

=== 品牌 VI 文档摘录（vi-system.md，用于语义与设计意图对齐；具体颜色/字号等仍以 tokens JSON / cssVariables 为准）===
${viSystemExcerpt || "(未提供)"}

=== 当前 dashboard.jsx 摘录（项目的代码层记忆；若提供则须连贯演进）===
${existingDashboard || "(未提供 — 仅依据页面结构设计生成)"}

=== 强制要求 ===
1. 不写 import 语句。
2. 必须使用 Widget 组件并定义 widgets 配置对象；组件的视觉属性必须用 var(--...)。
3. 所有颜色/字体/间距/圆角/阴影必须用 var(--xxx)；禁止 hex/rgba 具体色值（chart colorScheme 除外）。
4. 外层容器 \`position: "relative"\`、背景 var(--color-bg)、文本 var(--color-text-primary)、字体 var(--font-body)；根内须含 **BoardPageBackdrop** 整页底纹（与 token-demo 一致），且 header/main/footer 叠在其上。
5. 非 Widget 的可编辑元素必须加 data-widget-key 与 data-widget-type。
6. **多分页必须**：若 boardStory 页面数 ≥ 2，必须在画布底部 \`<footer>\`（非 header）渲染页面切换控件并与 currentPage 双向绑定，footer 固定 **56px** 高；切换项须为**纯文本导航**（无胶囊背景块），**当前页**用 \`var(--color-primary)\` 等明显高亮（见系统提示「多分页规则」）；若单页则不渲染该 footer 分页栏。
7. **不允许**在页面内出现深浅色模式切换按钮（mode 已由 token 固定）。
8. 输出严格 JSON：{ code, metadata, description }，不要 markdown 围栏。
9. **防重叠强制三件套（违反即错）**：所有 grid / flex 容器必须声明 \`overflow: "hidden"\`；所有 \`flex: 1\` 子项必须**同时**声明 \`minHeight: 0\` 和 \`minWidth: 0\`；外层画布与 main 必须 \`boxSizing: "border-box"\`。
10. **Grid 强制规范**：\`gridTemplateColumns\` 默认为 \`repeat(N, minmax(0, 1fr))\`；**三栏主区**可用 \`minmax(0, 2fr) minmax(0, 5fr) minmax(0, 2fr)\`（每列必有 minmax(0,…)）。\`gridTemplateRows\` 只允许具体 px 或 \`minmax(0, 1fr)\`，**禁止使用 \`auto\` 或与 1fr 混用**；单页时 main 内行高 + gap + padding ≤ **984**（1080 − **96**）；**多分页**时另减 footer **56**，main 预算 ≤ **928**。
11. **Widget 容器强制规范**：包裹 \`<Widget>\` 的 div 必须位于固定 px 高度的 grid cell 中，**禁止 \`height: "auto"\`**；每处 \`...cardStyle\` 解构后必须追加 \`minHeight: 0, minWidth: 0, overflow: "hidden"\`。
12. **KPI 组件专属规则**：KPI 组件已有独立深色 Token 体系，**不要**给 KPI 传 \`backgroundColor / gradient / titleColor / textColor\` 属性；须配 \`presetIconId\`（\`preset-icon-1\`…\`6\`，见上文第 5a 条）以及 \`title / dataKey / format / trend / trendDirection / trendValue / icon / unit / prefix / suffix / comparison\` 等业务属性（\`icon\` 仅当不设 \`presetIconId\` 时作为 emoji 兜底）。
13. **顶栏与图表外观**：根容器须含 **BoardPageBackdrop**（整页弱纹理底，与 token-demo 一致）。header 必须按系统提示中的 token-demo 结构（96px 高、BoardHeroBackdrop、居中主标题 textShadow、右下角筛选条），**header 内不放分页切换**；多分页切换仅在底部 footer，且 footer 须含 **BoardFooterBackdrop**（见「多分页规则」第 6 条）。所有 LineChart/BarChart/PieChart/DonutChart/AreaChart/Table 的 Widget 必须 \`titleBackdrop: true\` 且 props.style 含四键 \`--dv-chart-panel-*\`；标题区视觉跟随 \`--dv-chart-title-*\` / \`--font-*\`，勿写死标题 typography。图表由 **ECharts** 渲染；外层**不要**再用 cardStyle 包图表。可选 \`echartsOptionOverrides\` 增强动效与 series 样式（遵守画布内禁用 var() 色值）。
14. **视觉素材（运行时）**：项目 \`project.config.json\` 中的 \`visualAssets\` 可在**预览/运行时**覆盖主标题底纹、**整页画布底纹**、**底栏分页条底纹**与图表标题底纹的显示，**不要求**为覆盖而改写本 JSX；仍按约定写默认 \`BoardPageBackdrop id\`、\`BoardHeroBackdrop id\`、多页时 \`BoardFooterBackdrop id\` 与 \`titleBackdrop: true\` 即可。
15. **连贯演进（长期记忆）**：若「当前 dashboard.jsx 摘录」非空，必须在 **分页（footer）、header 筛选区、main 网格骨架、widgets 对象命名习惯** 等方面优先继承现有实现，只按页面结构设计文档做必要的 Widget 增删与配置调整；**禁止**在无文档明确要求时整体推翻重写另一套布局。若摘录为空，则从零生成但仍须严格服从页面结构设计。
16. **Agent 三栏主区（强制）**：每一页 \`<main>\` 在 KPI 指标卡横条之下，**仅允许一层**左·中·右三栏主视觉区（中栏唯一主图、左右栏其余图表）；左右栏内多图须 \`gridTemplateRows: repeat(M, minmax(0, 1fr))\` **垂直均分**。禁止 KPI 下再增加脱离三栏的通栏底带。细则见系统提示「Agent / JSX 主区板式」。
17. **主视觉与中栏绑定**：每一页中栏放置的 Widget **必须**与页面结构设计中的 **主视觉组件（或表格 ★ 行）**一致；其余图表/表格按文档语义分配到左栏、右栏并满足「除 KPI 外图表表类 ≥5」时的组件数量，勿随意合并删减导致不足。`,
    });

    console.log("[generate-jsx] Stream created, returning response...");
    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/generate-jsx] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
