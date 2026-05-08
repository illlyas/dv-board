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

图表组件（LineChart/BarChart/PieChart/AreaChart/DonutChart 等）的 colorScheme 属性必须用上面的 chartPalette 数组或从中挑选颜色。

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
      title: "销售额",
      dataKey: "sales_total",
      // KPI 组件已有独立深色 Token 体系（--kpi-bg-from/to/--kpi-text-*），
      // **不要**给 KPI 传 backgroundColor / gradient / titleColor / textColor，
      // 否则会破坏"深色卡 + 浅色字"的跨模式一致性。
      // 可选：icon、format、trend、trendDirection、trendValue、comparison、unit、prefix、suffix
      format: "currency",
      trend: true,
      trendDirection: "up",
      trendValue: "+12.5%",
    }
  },
  chart1: {
    type: "LineChart",
    props: {
      title: "趋势",
      dataKey: "trend_30d",
      xAxis: { field: "date", label: "日期" },
      yAxis: [{ field: "value", label: "数值" }],
      colorScheme: ${JSON.stringify(palette.length > 0 ? palette.slice(0, 4) : ["var(--color-primary)", "var(--color-accent)"])},
      backgroundColor: "var(--color-surface)",
      gridColor: "var(--color-grid)",
      axisColor: "var(--color-border)",
      axisTextColor: "var(--color-text-secondary)",
      legendTextColor: "var(--color-text-secondary)",
      titleColor: "var(--color-text-primary)",
      textColor: "var(--color-text-secondary)",
    }
  }
};
<Widget config={widgets.kpi1} />
\`\`\`

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
   - background: "var(--color-bg)"
   - color: "var(--color-text-primary)"
   - fontFamily: "var(--font-body)"
5. **卡片/容器**：背景 var(--color-surface)，边框 1px solid var(--color-border)，圆角 var(--radius-lg)，阴影 var(--shadow-md)。
6. **标题/副标题/文本**：按层级使用 var(--font-size-*) + var(--font-weight-*) + var(--color-text-*)。
7. **Widget 配色属性**（backgroundColor、titleColor、textColor、gridColor、axisTextColor、legendTextColor、tooltipBackgroundColor 等）必须填 var(--...) 字符串。
8. **容器高度控制**：每个包裹 Widget 的 div 必须设置固定高度（具体 px），防止内容撑大布局。

========================
【布局重叠防护规则（强制，违反即错）】
========================
卡片重叠的本质是**子项实际高度 > 父容器分配高度**或**子项缺少收缩约束**。严格遵守以下 9 条：
1. **外层画布** width:1920, height:1080 必须 \`overflow: "hidden"\` + \`boxSizing: "border-box"\`；flexDirection: "column"。
2. **main 区域**（header 下方）必须同时声明 \`flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden", boxSizing: "border-box"\`。缺 \`minHeight: 0\` 会导致 flex 子项按内容自然高度展开撑破画布。
3. **所有 grid / flex 容器**必须 \`overflow: "hidden"\`；凡声明 \`flex: 1\` 或 \`flex: "1 1 0"\` 的子项必须**同时**声明 \`minHeight: 0\` 和 \`minWidth: 0\`。
4. **gridTemplateColumns** 一律使用 \`repeat(N, minmax(0, 1fr))\`，严禁使用裸 \`repeat(N, 1fr)\` 或 \`1fr 1fr\`（无 \`minmax(0,…)\` 会被内容撑开）。
5. **gridTemplateRows** 只允许具体 px 或 \`minmax(0, 1fr)\` 的组合；**禁止混用 \`auto\` 与 \`1fr\`**，禁止使用 \`auto\` 行（auto 行会被图表 SVG 无限撑大）。
6. **每行总高度** = header + main 的 gridTemplateRows 像素总和 + gap 总和 + padding 总和 **必须 ≤ 1080**，留 8~16px 余量；超出即溢出。
7. **包裹 \`<Widget>\` 的 div** 必须位于已定义固定 px 高度的 grid cell 中，**禁止 \`height: "auto"\`**；若需继承 cell 高度，写 \`height: "100%", minHeight: 0, overflow: "hidden"\`。
8. **cardStyle 合并**：每处 \`...cardStyle\` 解构之后必须追加 \`minHeight: 0, minWidth: 0, overflow: "hidden"\`，否则 card 内部的图表 ResponsiveContainer 会反向撑破 card。
9. **Recharts/ECharts 等图表**放入 Widget 内部时，外层 card 必须给一个**具体 px 高度**（或在 grid cell 里 height:100% + minHeight:0），**禁止让图表容器自身决定父高度**。

========================
【多分页规则（重要）】
========================
1. 若 boardStory 中的页面数 ≥ 2，必须定义多个页面组件（Page1, Page2, ...），并在最终 return 的**外层容器顶部**（header 内或 header 下方）渲染一组页面切换 tab 按钮。
2. 切换按钮规范：
   - 按钮与所属页面是双向绑定（点击后 currentPage = i，选中态 currentPage === i）；
   - 选中态样式：背景 var(--color-primary)，文字 var(--color-text-inverse)；
   - 未选中样式：背景 var(--color-surface-2) 或 transparent，文字 var(--color-text-secondary)，边框 1px solid var(--color-border)；
   - 圆角 var(--radius-md) 或 var(--radius-pill)，水平 padding 使用 var(--space-4) 或 var(--space-5)，高度固定 40px~48px。
   - 按钮文字 type="button"，cursor: "pointer"。
   - 按钮组容器用 display: flex, gap: var(--space-2)。
3. 最终 return 时，根据 currentPage 渲染对应的 Page 组件，**但页面切换 tab 栏始终展示**（常见做法：外层包一层 1920x1080 容器，tab 栏在顶部固定，下方内容区根据 currentPage 切换）。
4. 若只有 1 页，不要渲染 tab 按钮。
5. **禁止用任何标签充当主题切换按钮**（因为深色/浅色模式不可切换）；tab 只用于多个内容页面的切换。

========================
【代码结构模板】
========================
以下模板展示多分页（2 页）的"防重叠黄金姿态"布局，若只有 1 页请去掉 tabs 区域，其他防重叠约束**一字不差**保留。
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
        height: 44,
        padding: "0 var(--space-5)",
        borderRadius: "var(--radius-md)",
        border: currentPage === i ? "none" : "1px solid var(--color-border)",
        background: currentPage === i ? "var(--color-primary)" : "var(--color-surface-2)",
        color: currentPage === i ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-semibold)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  // ⚠ 防重叠黄金姿态：main 同时给 flex:1 / minHeight:0 / minWidth:0 / overflow:hidden
  //   gridTemplateRows 全部固定 px 且行高总和 + gap + padding ≤ 1080 - 72(header)
  //   gridTemplateColumns 用 repeat(N, minmax(0, 1fr)) 而不是 1fr
  //   每个包裹 <Widget> 的 div 用 ...cardStyle 后追加 minHeight:0 / minWidth:0 / overflow:hidden
  const Page1 = () => (
    <main style={{
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      display: "grid",
      gridTemplateRows: "140px 420px 380px", // 140+420+380 + 2*16(gap) + 2*24(padding) = 992 ≤ 1008
      gap: "var(--space-4)",
      padding: "var(--space-4)",
    }}>
      {/* KPI 行 */}
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
      {/* 主图表行 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr minmax(0, 1fr)",
        gap: "var(--space-4)",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
      }}>
        <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
          <Widget config={widgets.chart1} />
        </div>
        <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
          <Widget config={widgets.chart2} />
        </div>
      </div>
      {/* 次图表行 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "var(--space-4)",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
      }}>
        <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
          <Widget config={widgets.chart3} />
        </div>
        <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
          <Widget config={widgets.chart4} />
        </div>
        <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
          <Widget config={widgets.table1} />
        </div>
      </div>
    </main>
  );

  const Page2 = () => (
    <main style={{
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      display: "grid",
      gridTemplateRows: "480px 480px",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
    }}>
      {/* ...第二页内容，同样遵守 minmax(0,1fr) + minHeight:0 + overflow:hidden 原则 */}
    </main>
  );

  const pageRenders = [<Page1 key="p1" />, <Page2 key="p2" />];

  return (
    <div style={{
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
      <header style={{
        height: 72,
        padding: "0 var(--space-6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <h1
          data-widget-key="title"
          data-widget-type="Title"
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-bold)",
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          看板标题
        </h1>
        {/* 多分页时渲染 tab 按钮组；单页时移除整个 tab 区域 */}
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {pageDefs.map((p, i) => tabButton(i, p.title))}
        </div>
      </header>
      {pageRenders[currentPage]}
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
- 禁止写 import 语句（React、Widget 已注入）
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

    console.log(
      "[generate-jsx] System prompt length:",
      systemPrompt.length,
      "board story length:",
      boardStoryText.length,
      "css variables count:",
      Object.keys(tokens.cssVariables ?? {}).length
    );

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `根据以下页面结构设计文档和上方的 CSS Tokens，生成最终的 React 看板 JSX 代码。

=== 页面结构设计 ===
${boardStoryText}

=== 强制要求 ===
1. 不写 import 语句。
2. 必须使用 Widget 组件并定义 widgets 配置对象；组件的视觉属性必须用 var(--...)。
3. 所有颜色/字体/间距/圆角/阴影必须用 var(--xxx)；禁止 hex/rgba 具体色值（chart colorScheme 除外）。
4. 外层容器背景 var(--color-bg)、文本 var(--color-text-primary)、字体 var(--font-body)。
5. 非 Widget 的可编辑元素必须加 data-widget-key 与 data-widget-type。
6. **多分页必须**：若 boardStory 页面数 ≥ 2，必须在 header 内或顶部渲染 tab 按钮组并与 currentPage 双向绑定；若单页则不渲染 tab。
7. **不允许**在页面内出现深浅色模式切换按钮（mode 已由 token 固定）。
8. 输出严格 JSON：{ code, metadata, description }，不要 markdown 围栏。
9. **防重叠强制三件套（违反即错）**：所有 grid / flex 容器必须声明 \`overflow: "hidden"\`；所有 \`flex: 1\` 子项必须**同时**声明 \`minHeight: 0\` 和 \`minWidth: 0\`；外层画布与 main 必须 \`boxSizing: "border-box"\`。
10. **Grid 强制规范**：\`gridTemplateColumns\` 一律写 \`repeat(N, minmax(0, 1fr))\`（不得裸 1fr）；\`gridTemplateRows\` 只允许具体 px 或 \`minmax(0, 1fr)\`，**禁止使用 \`auto\` 或与 1fr 混用**；所有行高总和 + gap + padding 必须 ≤ 1008（1080 - header 72）。
11. **Widget 容器强制规范**：包裹 \`<Widget>\` 的 div 必须位于固定 px 高度的 grid cell 中，**禁止 \`height: "auto"\`**；每处 \`...cardStyle\` 解构后必须追加 \`minHeight: 0, minWidth: 0, overflow: "hidden"\`。
12. **KPI 组件专属规则**：KPI 组件已有独立深色 Token 体系，**不要**给 KPI 传 \`backgroundColor / gradient / titleColor / textColor\` 属性；只需配 \`title / dataKey / format / trend / trendDirection / trendValue / icon / unit / prefix / suffix / comparison\` 等业务属性。`,
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
