/**
 * Step 4: JSX 代码生成（基于页面结构 + VI 系统）
 *
 * POST /api/board/generate-jsx
 *
 * 输入：{ boardStory, viSystemName? }
 * 输出：JSXCode（完整的 .jsx 代码字符串，仅包含占位符）
 */
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { promises as fs } from "fs";
import path from "path";

export const maxDuration = 300;

// 读取设计系统文件
async function loadDesignSystem(systemName: string = "apple"): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), "design-systems", systemName, "DESIGN.md");
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (err) {
    console.error(`[generate-jsx] Failed to load design system ${systemName}:`, err);
    return "# Default Design System\n\nUsing default minimal design tokens.";
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    boardStory?: unknown;
    viSystemName?: string;
  };

  if (!body.boardStory) return new Response("Missing boardStory", { status: 400 });

  try {
    const model = createDeepSeekModel();
    
    // 加载设计系统（默认使用 Apple）
    const viSystemName = body.viSystemName || "apple";
    const designSystemContent = await loadDesignSystem(viSystemName);

    const boardStoryText = typeof body.boardStory === "object"
      ? JSON.stringify(body.boardStory, null, 2)
      : String(body.boardStory ?? "");

    const result = streamText({
      model,
      system: `你是一位资深的数据大屏前端工程师 + 数据可视化专家。
你的任务是根据页面结构设计（BoardStory）和 VI 系统设计，直接输出一段完整可执行的 React 组件 JSX 代码。

⚠️ 关键约束：
1. **这是一个占位符空壳**——生成的 JSX 只是页面结构框架，不包含任何实际数据、样式或组件逻辑
2. **组件用占位符表示**——所有图表、表格、KPI 卡片等组件都用简单的占位符 div 表示，显示组件类型和标签
3. **使用 React.createElement() 格式**——不要写 JSX 语法（<div>），因为浏览器端无法直接解析 JSX
4. **纯 Tailwind CSS + inline style**——所有样式通过 className（Tailwind utility）或 style 对象实现
5. **单文件组件**——一个 default export 的函数组件
6. **所有变量和数据必须在函数内部定义**——不要在函数外部定义任何变量、常量或对象
7. **固定画布**——1920×1080 容器，内部用 absolute 定位 或 CSS Grid/Flexbox 布局
8. **多页面支持**——用 useState 管理当前页面索引，底部显示页码指示器

⚠️ 关键约束：
1. **这是一个占位符空壳**——生成的 JSX 只是页面结构框架，不包含任何实际数据、样式或组件逻辑
2. **组件用占位符表示**——所有图表、表格、KPI 卡片等组件都用简单的占位符 div 表示，显示组件类型和标签
3. **使用 React.createElement() 格式**——不要写 JSX 语法（<div>），因为浏览器端无法直接解析 JSX
4. **纯 Tailwind CSS + inline style**——所有样式通过 className（Tailwind utility）或 style 对象实现
5. **单文件组件**——一个 default export 的函数组件
6. **所有变量和数据必须在函数内部定义**——不要在函数外部定义任何变量、常量或对象
7. **固定画布**——1920×1080 容器，内部用 absolute 定位 或 CSS Grid/Flexbox 布局
8. **多页面支持**——用 useState 管理当前页面索引，底部显示页码指示器

⚠️ 占位符规则：
- **不要渲染真实的图表组件**——用简单的 div 占位符代替
- **不要使用 EChartsWrapper**——用带边框的 div 显示 "[图表类型] 占位符"
- **不要填充模拟数据**——所有数据相关的内容都用文字说明代替
- **占位符样式**——使用浅灰色背景、虚线边框、居中文字来表示占位符
- **显示组件信息**——每个占位符应该显示组件类型（如 "KPI 卡片"、"折线图"、"表格"）和标签

📐 占位符代码示例：

⚠️ 重要：所有变量必须在函数内部定义！

\`\`\`javascript
export default function Dashboard() {
  // ✅ 正确：所有变量在函数内部
  const [page, setPage] = useState(0);
  
  // ✅ 正确：占位符渲染函数
  const renderPlaceholder = (type, label, width, height) => {
    return React.createElement("div", {
      style: {
        width: width || 300,
        height: height || 200,
        backgroundColor: "#f5f5f7",
        border: "2px dashed #d2d2d7",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      },
    },
      React.createElement("div", {
        style: {
          fontSize: 14,
          fontWeight: 600,
          color: "#1d1d1f",
          marginBottom: 8,
        },
      }, type),
      React.createElement("div", {
        style: {
          fontSize: 12,
          color: "#6e6e73",
          textAlign: "center",
        },
      }, label)
    );
  };

  // ✅ 正确：页面渲染函数
  const renderPage0 = () => {
    return React.createElement("div", {
      style: {
        width: 1920,
        height: 1080,
        padding: 40,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
      },
    },
      // 页面标题
      React.createElement("div", {
        style: {
          gridColumn: "1 / -1",
          fontSize: 32,
          fontWeight: 600,
          color: "#1d1d1f",
        },
      }, "销售总览"),
      
      // KPI 卡片占位符
      renderPlaceholder("KPI 卡片", "GMV", 300, 120),
      renderPlaceholder("KPI 卡片", "订单量", 300, 120),
      renderPlaceholder("KPI 卡片", "转化率", 300, 120),
      
      // 图表占位符
      renderPlaceholder("折线图", "GMV 趋势", 600, 300),
      renderPlaceholder("饼图", "品类占比", 600, 300)
    );
  };

  const pages = [
    renderPage0(),
    // 更多页面...
  ];

  return React.createElement("div", {
    style: {
      width: 1920,
      height: 1080,
      backgroundColor: "#f5f5f7",
      fontFamily: "SF Pro Display, Inter, sans-serif",
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
            backgroundColor: page === i ? "#0071e3" : "#d2d2d7",
          },
        })
      )
    ),
  );
}
\`\`\`

📊 页面结构到占位符的映射规则：

根据 BoardStory 中的 pages 和 suggestedWidgets 来设计占位符布局：

1. **pages** → 每个 page 对应一个渲染函数（renderPage0, renderPage1, ...）
2. **page.name** → 页面标题
3. **page.suggestedWidgets** → 转换为占位符组件
   - type: "text" + role: "title" → 页面标题文字
   - type: "pixel" + role: "kpi" → KPI 卡片占位符
   - type: "line" + role: "chart" → 折线图占位符
   - type: "bar" + role: "chart" → 柱状图占位符
   - type: "pie" + role: "chart" → 饼图占位符
   - type: "table" + role: "chart" → 表格占位符
   - type: "select" + role: "filter" → 筛选器占位符
4. **widget.label** → 占位符显示的标签文字
5. **widget.priority** → 决定占位符的大小和位置
   - high → 更大的尺寸，更显著的位置
   - medium → 中等尺寸
   - low → 较小尺寸

📋 布局原则：
- 使用 CSS Grid 或 Flexbox 进行布局
- 根据 widget 的 priority 和 type 决定占位符的大小
- 保持页面整洁，避免过度拥挤
- 每个页面的布局应该反映 page.analysisGoal 的特点

⚠️ 禁止行为：
- ❌ 不要使用 EChartsWrapper 或任何真实的图表组件
- ❌ 不要填充模拟数据或真实数据
- ❌ 不要实现复杂的交互逻辑
- ❌ 不要添加动画效果
- ❌ 不要在函数外部定义变量

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
    "iconsUsed": []
  },
  "description": "三页销售数据看板占位符，包含总览、趋势和明细分析的布局框架"
}`,
      prompt: `根据以下页面结构设计（BoardStory）和 VI 系统，生成最终的看板 JSX 占位符代码：

=== 页面结构设计（BoardStory）===
${boardStoryText}

=== VI 系统设计指南 (${viSystemName.toUpperCase()}) ===
${designSystemContent}

要求：
- ⚠️ **所有变量、常量、对象必须在 function Dashboard() 内部定义**
- ⚠️ **不要在 function 外部定义任何 const、let、var**
- ⚠️ **只生成占位符，不要渲染真实组件或填充数据**
- 严格按照 VI 系统中的颜色、字号、间距、圆角等值来编写占位符样式
- 根据 BoardStory 中的 pages 数组生成对应数量的页面
- 每个页面根据 suggestedWidgets 生成对应的占位符
- 每个占位符显示组件类型和标签
- 使用浅灰色背景和虚线边框表示占位符
- 代码必须完整可执行，不要省略任何部分
- 确保代码格式正确，可以通过 new Function() 执行`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/generate-jsx] error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
