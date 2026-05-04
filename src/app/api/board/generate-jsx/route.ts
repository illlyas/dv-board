/**
 * Step 3: JSX 代码生成
 *
 * POST /api/board/generate-jsx
 *
 * 输入：{ brief, viSystem, boardStory }
 * 输出：JSXCode（完整的 .jsx 代码字符串）
 *
 * 这是核心步骤——AI 直接输出可执行的 React 组件代码
 */
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";

export const maxDuration = 300;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    brief?: string;
    viSystem?: unknown;
    boardStory?: unknown;
  };
  const brief = body?.brief?.trim();
  if (!brief) return new Response("Missing brief", { status: 400 });
  if (!body.viSystem) return new Response("Missing viSystem", { status: 400 });
  if (!body.boardStory) return new Response("Missing boardStory", { status: 400 });

  try {
    const model = createDeepSeekModel();
    const viSystemText = typeof body.viSystem === "object"
      ? JSON.stringify(body.viSystem, null, 2)
      : String(body.viSystem ?? "");
    const storyText = typeof body.boardStory === "object"
      ? JSON.stringify(body.boardStory, null, 2)
      : String(body.boardStory ?? "");

    const result = streamText({
      model,
      system: `你是一位资深的数据大屏前端工程师 + 数据可视化专家。
你的任务是根据 VI 系统设计和看板故事，直接输出一段完整可执行的 React 组件 JSX 代码。

⚠️ 关键约束：
1. **使用 React.createElement() 格式**——不要写 JSX 语法（<div>），因为浏览器端无法直接解析 JSX。所有元素必须用 React.createElement() 创建。
2. **纯 Tailwind CSS + inline style**——所有样式通过 className（Tailwind utility）或 style 对象实现
3. **单文件组件**——一个 default export 的函数组件
4. **所有变量和数据必须在函数内部定义**——不要在函数外部定义任何变量、常量或对象
5. **模拟数据内联**——所有图表/表格/KPI 数据直接写在组件函数内部
6. **固定画布**——1920×1080 容器，内部用 absolute 定位 或 CSS Grid/Flexbox 布局
7. **多页面支持**——用 useState 管理当前页面索引，底部显示页码指示器
8. **ECharts 图表**——使用 EChartsWrapper 组件渲染图表，传入 option 配置对象

⚠️ 代码格式要求：
- 所有代码必须在 function 内部
- 不要在 function 外部定义 const、let、var
- 不要在 function 外部定义对象字面量
- 确保代码可以直接通过 new Function() 执行

📊 ECharts 图表使用方法：

环境已注入以下依赖：
- React（包含 useState, useEffect, useMemo, useCallback, useRef）
- echarts（ECharts 库）
- EChartsWrapper（图表包装组件）

渲染图表时使用：
\`\`\`javascript
React.createElement(EChartsWrapper, {
  option: {
    // ECharts 配置对象
    title: { text: '销售趋势' },
    xAxis: { type: 'category', data: ['1月', '2月', '3月'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: [120, 200, 150]
    }]
  },
  style: { width: 400, height: 300 }
})
\`\`\`

⚠️ 重要：不要直接使用 echarts.init()，使用 EChartsWrapper 组件即可。

📐 代码结构模板：

⚠️ 重要：所有变量必须在函数内部定义！

\`\`\`javascript
export default function Dashboard() {
  // ✅ 正确：所有变量在函数内部
  const [page, setPage] = useState(0);
  
  // ✅ 正确：数据在函数内部定义
  const salesData = [120, 200, 150, 180, 220, 250];
  const categories = ['1月', '2月', '3月', '4月', '5月', '6月'];
  
  // ✅ 正确：配置对象在函数内部
  const chartOption = {
    title: { text: 'GMV 趋势' },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: salesData }]
  };

  const pages = [
    // 页面元素数组
    renderPage0(),
    renderPage1(),
  ];

  return React.createElement("div", {
    style: {
      width: 1920,
      height: 1080,
      backgroundColor: "#0a0e1a",
      fontFamily: "Inter, sans-serif",
      position: "relative",
      overflow: "hidden",
    },
  },
    // 渲染当前页
    pages[page],

    // 底部页码指示器
    React.createElement("div", {
      style: {
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
      },
    },
      pages.map((_, i) =>
        React.createElement("button", {
          key: i,
          onClick: () => setPage(i),
          style: {
            width: page === i ? 24 : 8,
            height: 8,
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
            backgroundColor: page === i ? "[VI_ACCENT]" : "[VI_MUTED_FG]",
          },
        })
      )
    ),
  );
}
\`\`\`

🎨 样式规范（必须严格使用传入的 VI Token）：
- 背景色 → viSystem.colors.background
- 文字色 → viSystem.colors.foreground
- 卡片背景 → viSystem.colors.card
- 主色调 → viSystem.colors.primary
- 强调色 → viSystem.colors.accent
- 正向色 → viSystem.colors.success
- 负向色 → viSystem.colors.error
- 警示色 → viSystem.colors.warning
- 图表色板 → viSystem.colors.chartPalette[]
- 字体大小 → viSystem.typography.fontSize.*
- 字体族 → viSystem.typography.fontFamily.*
- 圆角 → viSystem.radius.*
- 阴影 → viSystem.shadow.*
- 间距 → viSystem.spacing.gap.*

📊 组件类型映射：
根据 boardStory.pages[].suggestedWidgets 中的 type 和 role 来决定渲染什么：

- text + headline → 大标题 / 结论文字（h1-h3 尺寸）
- text + annotation → 注释说明文字（small/caption 尺寸）
- pixel / bullet → KPI 指标卡（大数字 + 趋势箭头 + 目标对比）
- rank → 排行榜（水平条形排名列表）
- table → 数据表格（表头 + 行数据 + 高亮异常行）
- bar → 柱状图（ECharts option）
- line → 折线图（ECharts option）
- pie → 饼图/环形图（ECharts option）
- funnel → 漏斗图（ECharts option）
- waterfall → 瀑布图（ECharts option）
- section → 区域分组容器（带标题和边框的 div 区块）
- divider → 分割线

📋 布局原则：
- 信息密度要高但不拥挤（参考 viSystem.themeProfile.density）
- 形成清晰的阅读顺序：标题/结论 → 核心指标 → 主图 → 辅助图 → 明细
- KPI 指标放在顶部或左侧显著位置
- 主图表占据最大空间
- 同类内容归入同一个 section 区域

输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾。
- 不要使用 markdown 代码块、围栏。
- code 字段必须是完整可执行的 JavaScript 代码字符串。
- metadata 字段必须包含所有必需的子字段：
  * componentName: 组件名称（字符串）
  * pageCount: 页面数量（数字，必须 >= 1）
  * canvasSize: { width: 1920, height: 1080 }
  * estimatedComponents: 估算的组件数量（数字，>= 0）
  * chartTypesUsed: 使用的图表类型数组（如 ["bar", "line"]）
  * iconsUsed: 使用的图标数组
- description 字段可选，用于说明设计思路。

输出示例结构：
{
  "code": "export default function Dashboard() { ... }",
  "metadata": {
    "componentName": "SalesDashboard",
    "pageCount": 3,
    "canvasSize": { "width": 1920, "height": 1080 },
    "estimatedComponents": 15,
    "chartTypesUsed": ["bar", "line", "pie"],
    "iconsUsed": ["TrendingUp", "Users", "DollarSign"]
  },
  "description": "三页销售数据看板，包含总览、趋势和明细分析"
}`,
      prompt: `根据以下 VI 系统和看板故事，生成最终的看板 JSX 代码：

用户需求：${brief}

=== VI 系统 Token ===
${viSystemText}

=== 看板故事 ===
${storyText}

要求：
- ⚠️ **所有变量、常量、对象必须在 function Dashboard() 内部定义**
- ⚠️ **不要在 function 外部定义任何 const、let、var**
- 严格按照 VI Token 中的颜色、字号、间距、圆角等值来编写样式
- 根据 story 中每个页面的 suggestedWidgets 和 mustInsights 来设计具体内容布局
- 每个页面都要有明确的叙事逻辑：headline → evidence → diagnostic/detail
- 代码必须完整可执行，不要省略任何部分
- 图表使用合理的模拟数据（数据之间要有洞察支撑，如趋势变化、排名差异、目标偏差）
- 确保代码格式正确，可以通过 new Function() 执行`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/generate-jsx] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
