/**
 * Step 4: 纯视图层 JSX 代码生成
 *
 * POST /api/board/generate-jsx
 *
 * 输入：{ boardStory: string }
 * 输出：JSXCode（纯视图层的 React 组件代码）
 */
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { generateWidgetTypesDocs } from "@/lib/widget-metadata";

export const maxDuration = 300;

// 动态生成系统提示词，包含最新的组件类型信息
function generateSystemPrompt(): string {
  try {
    const widgetDocs = generateWidgetTypesDocs();
    console.log('[generate-jsx] Widget docs generated, length:', widgetDocs.length);
    
    return `你是一位专业的数据可视化前端工程师，擅长设计美观、现代化的数据大屏界面。

========================
【核心目标】
========================
根据页面结构设计文档，生成一个**基于组件配置**的 React 代码，使用 Widget 组件系统渲染真实的图表和卡片。

⚠️ 关键原则：
1. **组件配置驱动**：生成 widgets 配置对象，而不是直接渲染占位符
2. **使用 Widget 组件**：通过 <Widget config={widgets.xxx} /> 渲染组件
3. **纯视图层**：只包含布局和配置，不包含业务逻辑
4. **现代化设计**：使用渐变、阴影、毛玻璃效果等现代 UI 元素

========================
【Widget 组件系统】
========================

${widgetDocs}

**Widget 使用方式**：
\`\`\`jsx
// 1. 定义组件配置
const widgets = {
  kpi1: {
    type: "KPI",
    props: {
      title: "住院人数",
      subtitle: "当前在院",
      icon: "🏥",
      dataKey: "inpatient_count",
      unit: "人",
      trend: true,
      comparison: { type: "yoy", label: "同比" },
    }
  },
  chart1: {
    type: "LineChart",
    props: {
      title: "门诊量趋势",
      dataKey: "outpatient_trend",
      xAxis: { field: "date", label: "日期" },
      yAxis: [
        { field: "outpatient", label: "门诊量", color: "#3b82f6" },
        { field: "emergency", label: "急诊量", color: "#ef4444" },
      ],
      showLegend: true,
      showGrid: true,
      smooth: true,
    }
  },
};

// 2. 使用 Widget 组件渲染
<Widget config={widgets.kpi1} />
<Widget config={widgets.chart1} />
\`\`\`

========================
【数据绑定】
========================

每个组件通过 \`dataKey\` 绑定数据：

\`\`\`javascript
// dataKey 命名规范：使用下划线分隔，语义化
{
  dataKey: "inpatient_count",        // KPI 数据
  dataKey: "outpatient_trend",       // 趋势数据
  dataKey: "department_comparison",  // 对比数据
  dataKey: "patient_distribution",   // 分布数据
  dataKey: "department_detail",      // 明细数据
}
\`\`\`

========================
【代码结构模板】
========================

\`\`\`jsx
export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);

  // ===== 组件配置区 =====
  const widgets = {
    // KPI 卡片
    kpi_inpatient: {
      type: "KPI",
      props: {
        title: "住院人数",
        subtitle: "当前在院",
        icon: "🏥",
        dataKey: "inpatient_count",
        unit: "人",
        trend: true,
        comparison: { type: "yoy", label: "同比" },
        gradient: ["#3b82f6", "#8b5cf6"],
      }
    },
    
    kpi_outpatient: {
      type: "KPI",
      props: {
        title: "门诊量",
        subtitle: "今日累计",
        icon: "👥",
        dataKey: "outpatient_count",
        unit: "人次",
        trend: true,
        gradient: ["#8b5cf6", "#ec4899"],
      }
    },
    
    // 折线图
    chart_trend: {
      type: "LineChart",
      props: {
        title: "门诊量趋势",
        subtitle: "近30天数据",
        dataKey: "outpatient_trend",
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "outpatient", label: "门诊量", color: "#3b82f6" },
          { field: "emergency", label: "急诊量", color: "#ef4444" },
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
      }
    },
    
    // 柱状图
    chart_department: {
      type: "BarChart",
      props: {
        title: "各科室负荷率",
        dataKey: "department_load",
        xAxis: { field: "department", label: "科室" },
        yAxis: { field: "load", label: "负荷率", unit: "%" },
        showTarget: true,
        targetValue: 80,
        targetLabel: "目标负荷",
        showGrid: true,
      }
    },
    
    // 饼图
    chart_patient_type: {
      type: "PieChart",
      props: {
        title: "患者类型分布",
        dataKey: "patient_type_distribution",
        nameField: "type",
        valueField: "count",
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
      }
    },
  };

  // ===== 页面布局区 =====
  const Page1 = () => (
    <div style={{
      width: 1920,
      height: 1080,
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <header style={{
        height: 72,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
      }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#ffffff",
          margin: 0,
        }}>智慧医院运营总览</h1>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateRows: "140px 1fr",
        gap: 24,
        padding: 24,
      }}>
        {/* KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}>
          <Widget config={widgets.kpi_inpatient} />
          <Widget config={widgets.kpi_outpatient} />
          <Widget config={widgets.kpi_surgery} />
          <Widget config={widgets.kpi_satisfaction} />
        </div>

        {/* Charts */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}>
          <Widget config={widgets.chart_trend} />
          
          <div style={{
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            gap: 24,
          }}>
            <Widget config={widgets.chart_patient_type} />
            <Widget config={widgets.chart_department} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}>
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            style={{
              width: currentPage === i ? 32 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              background: currentPage === i 
                ? "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"
                : "rgba(255,255,255,0.2)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        ))}
      </footer>
    </div>
  );

  const pages = [<Page1 key="page1" />];
  return pages[currentPage];
}
\`\`\`

========================
【设计风格指南】
========================

**配色方案**：
- 深色背景：linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)
- 强调色：蓝色 #3b82f6、紫色 #8b5cf6、粉色 #ec4899
- 卡片背景：rgba(255,255,255,0.03) + backdrop-filter: blur(10px)
- 边框：rgba(255,255,255,0.08)

**布局原则**：
- 使用 CSS Grid 创建灵活布局
- 间距：16px-24px
- 圆角：12px-16px
- 标题栏：72px
- 底部导航：48px

========================
【禁止事项】
========================
- ❌ 不要写任何 import 语句（React、Widget 已注入）
- ❌ 不要包含业务逻辑和数据请求
- ❌ 不要使用占位符 div，必须使用 Widget 组件
- ❌ 不要在函数外部定义变量

========================
【输出格式】
========================
输出合法 JSON，不要有 markdown 代码块：

{
  "code": "export default function Dashboard() { ... }",
  "metadata": {
    "componentName": "Dashboard",
    "pageCount": 3,
    "canvasSize": { "width": 1920, "height": 1080 },
    "estimatedComponents": 15,
    "chartTypesUsed": ["KPI", "LineChart", "BarChart", "PieChart"],
    "designStyle": "modern-gradient"
  },
  "description": "简要说明布局特点"
}`;
  } catch (error) {
    console.error('[generate-jsx] Error generating system prompt:', error);
    // 如果生成文档失败，返回一个简化版本的提示词
    return `你是一位专业的数据可视化前端工程师，擅长设计美观、现代化的数据大屏界面。

根据页面结构设计文档，生成基于 Widget 组件系统的 JSX 代码。

支持的组件类型：KPI、LineChart、BarChart、PieChart、Table、DateRangePicker、Select

输出格式：
{
  "code": "export default function Dashboard() { ... }",
  "metadata": { ... },
  "description": "简要说明"
}`;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    boardStory?: unknown;
  };

  if (!body.boardStory) return new Response("Missing boardStory", { status: 400 });

  try {
    console.log('[generate-jsx] Starting JSX generation...');
    
    const model = createDeepSeekModel();

    const boardStoryText = typeof body.boardStory === "object"
      ? JSON.stringify(body.boardStory, null, 2)
      : String(body.boardStory ?? "");

    console.log('[generate-jsx] Board story length:', boardStoryText.length);

    // 动态生成系统提示词
    const systemPrompt = generateSystemPrompt();
    console.log('[generate-jsx] System prompt generated, length:', systemPrompt.length);

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `根据以下页面结构设计文档，生成基于 Widget 组件系统的 JSX 代码：

=== 页面结构设计 ===
${boardStoryText}

要求：
1. ⚠️ **严禁写任何 import 语句**（React、useState、Widget 已注入）
2. ⚠️ **必须使用 Widget 组件**：通过 <Widget config={widgets.xxx} /> 渲染
3. ⚠️ **必须定义 widgets 配置对象**：包含所有组件的配置
4. ⚠️ **使用 JSX 语法**：清晰易读，不要用 React.createElement
5. ⚠️ **dataKey 命名规范**：使用下划线分隔，语义化（如 inpatient_count, outpatient_trend）
6. 根据页面结构文档生成对应的组件配置
7. 每个组件配置要完整，包含 type 和 props
8. 布局要使用 CSS Grid 和 Flexbox
9. 添加适当的过渡动画和悬停效果
10. 代码必须完整可执行，可以通过 new Function() 执行

请生成美观、现代化、基于组件配置的数据大屏界面代码。`,
    });

    console.log('[generate-jsx] Stream created, returning response...');
    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/generate-jsx] error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
