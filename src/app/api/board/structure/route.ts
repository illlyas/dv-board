import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { boardStructureSchemaPrompt } from "@/lib/structure-schema";

export const maxDuration = 120;

/**
 * 节点 2：页面结构
 * 输入：brief + AnalysisReport（节点1的分析结果）
 * 输出：BoardStructure（完整布局坐标，但 layoutStyle 不含视觉属性）
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { brief?: string; analysis?: unknown };
  const brief = body?.brief?.trim();
  const analysis = body?.analysis;

  if (!brief) return new Response("Missing brief", { status: 400 });

  try {
    const model = createDeepSeekModel();
    const analysisText = typeof analysis === "object" ? JSON.stringify(analysis, null, 2) : String(analysis ?? "");
    const outputSchemaText = boardStructureSchemaPrompt;

    const result = streamText({
      model,
      system: `你是一位资深看板信息架构师。
你的职责是把第一页输出的“页面简报”翻译成真正可渲染的页面结构。

承接原则：
- 第一页负责定义页面顺序、页面目的、关键问题、主要数据内容和必须出现的内容块
- 你负责把这些内容块落成具体组件、分组结构和页面布局
- 你不能跳过第一页的意图直接自由发挥，也不能把第一页的宏观规划原样抄一遍了事
- 每个页面都必须围绕该页的 keyQuestion / narrative / primaryData 来组织结构

关键输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾。
- 不要使用 markdown 代码块、代码围栏，JSON 外不要有任何解释文字。
- 输出必须严格符合下方给出的 JSON Schema。
- 本步骤仅生成布局结构——不包含任何视觉样式（无圆角、颜色、阴影）。
- 只输出当前结构阶段真正需要的字段，不要添加额外元数据。
- 不要在 layoutStyle 中包含 borderRadius、borderWidth、borderColor、borderStyle、backgroundColor、boxShadow 或 opacity。

输出 JSON Schema：
${outputSchemaText}`,
      prompt: `根据以下需求分析，生成完整的页面结构（布局坐标和组件类型，但不包含边框/颜色/阴影等视觉样式）。

用户需求：${brief}

第一步分析报告：
${analysisText}

要求：
- 页面数量必须与分析报告中的规划完全一致
- 页面顺序、页面名称、页面 purpose 必须与分析报告一致
- 每个页面都必须首先理解该页的 storyRole、keyQuestion、narrative、primaryData，再决定具体组件组合
- 每个页面的组件应与该页的 suggestedWidgets 一一对应；high 优先级内容块必须全部落地，medium/low 可在不影响叙事的前提下合并或从简
- 如果第一页给出了 filters，则应优先将其落成 select 组件或对应的筛选控件
- 不要只凭 widget type 堆组件；每个组件都必须服务于该页的业务问题和叙事顺序
- 所有组件必须在 1920x1080 画布内排列，不得重叠
- 参考 layoutIdea 提示合理布局各组件，但如果 layoutIdea 与 keyQuestion/narrative 冲突，应优先保证信息层级清晰
- 页面内部应有明确阅读顺序：标题/结论 -> 核心指标 -> 主图 -> 辅助图/解释/筛选
- 所有 ID 在整个文档内必须唯一
- currentPageId 必须是某个页面的 ID
- 图表配置中需包含合理的模拟数据
- 不要输出 baseNodeMap、eventRules、usedExtensions、showRulers、lockGuides、variableMap、guideLines 等无关字段
- 仅输出 JSON 对象，不要输出任何其他内容`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/structure] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
