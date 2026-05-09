/**
 * Step 2: 页面结构设计（Markdown 输入 → Markdown 输出）
 *
 * POST /api/board/design-pages
 *
 * 输入：{ designStory: string }
 * 输出：Markdown 格式的多页面看板结构文档
 */
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { generateWidgetTypesSimple, getWidgetsByCategory } from "@/lib/widget-metadata";

export const maxDuration = 120;

// 动态生成系统提示词，包含最新的组件类型信息
function generateSystemPrompt(): string {
  try {
    const widgetTypesInfo = generateWidgetTypesSimple();
    console.log('[design-pages] Widget types info generated, length:', widgetTypesInfo.length);
    
    // 获取各类组件的详细信息
    const dataDisplayWidgets = getWidgetsByCategory("data-display");
    const chartWidgets = getWidgetsByCategory("chart");
    const tableWidgets = getWidgetsByCategory("table");
    const filterWidgets = getWidgetsByCategory("filter");
    
    return `你是一个数据可视化看板结构设计专家。你会收到一份 Design Story 文档，需要基于它设计一套完整的多页面看板结构，并以 Markdown 格式输出。

========================
【页面数量规划】
========================
根据业务目标决定页面数量：
- 实时监控场景：1-2 页（总览 + 明细）
- 分析趋势场景：3-4 页（总览 + 多维度分析 + 明细）
- 复杂决策场景：5-7 页（总览 + 专题分析 + 诊断 + 明细）
- 最多不超过 8 页

页面角色分配：
- P1（首页）：必须是"总览"，展示最关键的 KPI 和整体趋势
- 中间页：按分析维度或业务主题拆分，每页聚焦一个核心问题
- 末页：通常是"明细数据"或"诊断工具"

========================
【组件类型说明】
========================

${widgetTypesInfo}

**组件类型映射**：
- text → Text（标题、说明文字）
- pixel → KPI/Metric/StatCard（KPI 数值卡片）
- bullet → BarChart with target（目标达成进度）
- rank → Table with sorting（排行榜）
- table → Table（数据明细表格）
- select → Select/MultiSelect（筛选器）
- bar → BarChart（柱状图）
- line → LineChart（折线图）
- pie → PieChart/DonutChart（饼图）
- funnel → FunnelChart（漏斗图）
- waterfall → BarChart（瀑布图）

组件分析角色（analyticRole）：
- headline：核心结论/标题（每页必须有）
- evidence：主图表/主要证据（每页必须有）
- diagnostic：诊断图/归因分析
- detail：明细表/清单
- filter：筛选条件
- annotation：注释/说明

组件优先级（priority）：high / medium / low

========================
【输出格式】
========================
直接输出 Markdown 文档，结构如下：

# [看板名称] — 页面结构设计

## 看板概览

- **行业标签**：[energy/industrial/water/transport/port/tourism/government/agriculture/finance/sports-culture/campus/park/retail/ops-maintenance/generic 中选一个]
- **核心实体**：[业务核心对象，如"订单"、"设备"、"用户"]
- **目标受众**：[主要使用者]
- **整体目标**：[一句话说明]
- **视觉基调**：[executive/operational/analytical/command 中选一个]
- **推荐主题**：[dark-tech/dark-business/light-clean/dark-executive/dark-data 中选一个]
- **布局密度**：[compact/balanced/spacious 中选一个]
- **内容重点**：[kpi-first/chart-first/narrative-first 中选一个]

## 数据故事线

[2-4 句话描述整体叙事逻辑，从总览到细节，从现象到原因，体现页面间的递进关系]

## 默认分析切片

[时间维度]、[业务维度1]、[业务维度2]、...（3-8 个）

## 核心关注点

[关注点1]、[关注点2]、[关注点3]、...（3-8 个）

---

## 页面设计

### P1 [页面名称]

- **故事角色**：总览
- **核心问题**：[用户看这个页面时心中的核心问题]
- **分析目标**：[overview/trend/comparison/composition/target-gap/ranking/diagnostic/risk 中选一个]
- **分析角度**：[角度1]、[角度2]、[角度3]（2-4 个）
- **必现洞察**：[洞察1]；[洞察2]；[洞察3]（2-3 个）
- **决策行动**：[基于本页数据，用户应采取的行动]
- **核心指标**：[指标1]、[指标2]、...
- **数据维度**：[维度1]、[维度2]、...
- **筛选器**：[筛选器1]、[筛选器2]（没有则填"无"）
- **主视觉组件**：[与本页组件清单表格中**恰好一行**对应：写明 **序号 + 组件标签**；该行类型必须为大图类（line/bar/area/pie/donut/funnel/waterfall/bullet 等），**禁止**将 pixel（KPI 卡）、text、select 作为主视觉。下游 generate-jsx 将把该组件放在页面 **三栏布局的中栏**。]

**页面叙事**：[2-3 句话描述这个页面的数据叙事逻辑]

**组件清单**：

| 序号 | 主视觉 | 组件标签 | 类型 | 分析角色 | 优先级 | 数据说明 | 设计理由 |
|------|--------|---------|------|---------|--------|---------|---------|
| 1 | | [标签] | text | headline | high | [数据说明] | [设计理由] |
| 2 | | [标签] | pixel | headline | high | [数据说明] | [设计理由] |
| 3 | ★ | [标签] | line | evidence | high | [数据说明] | [设计理由] |
| ... | | | | | | | |

**主视觉列**：每页**恰好一行**填 **★**（ASCII 星号），其余行留空；★ 所在行必须与上文「主视觉组件」描述的序号、标签一致。

**数量下限（硬性）**：每页组件清单中，除类型为 **pixel**（KPI 指标卡）及 **text/select** 外，属于 **图表或表格类**的条目（line、bar、area、pie、donut、funnel、waterfall、bullet、table、rank 等）**至少 5 个**。不足时须增加辅助对比图、分布图、明细表或下钻图等合理模块以达标，不得用空洞 text 充数。

---

### P2 [页面名称]

[同上格式]

---

[继续其他页面...]

---

## 潜在扩展需求

- [可能需要添加的功能或页面1]
- [可能需要添加的功能或页面2]

========================
【设计原则】
========================
1. 从 Design Story 的"业务目标"推断页面数量和角色
2. 从"核心指标"推断每个页面的 keyMetrics
3. 从"分析维度"推断页面的拆解方式
4. 从"关键决策场景"推断每个页面的 decisionAction
5. 从"对比分析"推断组件类型（同比/环比 → 折线图；目标对比 → bullet 图）
6. 页面之间必须有逻辑递进关系（总览 → 分析 → 诊断）
7. 每个页面聚焦一个核心问题，叙事主轴落实在 **主视觉**（大图）上，其余图表环绕补充；主视觉必须在文案与表格「主视觉」列中显式标出，供代码生成定位到中栏
8. **图表密度**：除 KPI（pixel）外每页至少 **5** 个图表/表类组件；宁可增加有意义的二级图、结构图、明细表，也不要少于 5 个导致版面空洞

========================
【增量修订模式】
========================
若用户提示词中包含「既有 pages-story.md」全文或节选，你必须在其基础上做**合并式修订**：
- **默认保留**已有页面数量、页面顺序与各页组件分区，除非 Design Story 或用户诉求明确要求增删页或重排；
- 保留未被触及的组件清单与 analyticRole，仅调整与叙事变更相关的部分；
- 增量修订后每一页仍须满足：**主视觉组件**字段 + 表格「主视觉」列唯一 ★ + 非 KPI 图表/表类 **≥5**；
- 仍然输出**完整**的最终页面结构 Markdown（合并后的整篇文档）。`;
  } catch (error) {
    console.error('[design-pages] Error generating system prompt:', error);
    // 如果生成文档失败，返回一个简化版本的提示词
    return `你是一个数据可视化看板结构设计专家。

根据 Design Story 文档，设计完整的多页面看板结构，以 Markdown 格式输出。

支持的组件类型：text、pixel、bar、line、pie、table、select

每页须有明确 **主视觉组件**（大图类，写入「主视觉组件」行；组件表「主视觉」列恰一行 ★）。除 KPI（pixel）外图表/表类组件至少 5 个。须有 headline 与 evidence（主视觉应对应 evidence/high）。

========================
【增量修订模式】
========================
若用户提示词中包含「既有 pages-story.md」全文或节选，你必须在其基础上做**合并式修订**：
- **默认保留**已有页面数量、页面顺序与各页组件分区，除非 Design Story 或用户诉求明确要求增删页或重排；
- 保留未被触及的组件清单与 analyticRole，仅调整与叙事变更相关的部分；
- 增量修订后每一页仍须满足：**主视觉组件**字段 + 表格「主视觉」列唯一 ★ + 非 KPI 图表/表类 **≥5**；
- 仍然输出**完整**的最终页面结构 Markdown（合并后的整篇文档）。`;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    designStory?: string;
    existingPages?: string;
  };

  const designStory = body?.designStory?.trim();
  const existingPages = typeof body.existingPages === "string" ? body.existingPages.trim() : "";

  if (!designStory) {
    return new Response("Missing designStory", { status: 400 });
  }

  try {
    console.log("[design-pages] Received designStory, length:", designStory.length);

    const model = createDeepSeekModel();

    // 动态生成系统提示词
    const systemPrompt = generateSystemPrompt();

    let userPrompt = "";
    if (existingPages) {
      userPrompt += `【既有 pages-story.md（须在下列 Design Story 约束下增量修订，默认保留页面骨架）】

${existingPages}

---

`;
    }
    userPrompt += `以下是 Design Story 文档：

${designStory}

请基于这份文档，输出**完整**的多页面看板结构 Markdown（若在增量模式下则必须与既有 pages-story 合并演进）。`;

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/design-pages] error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
