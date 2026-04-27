import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";

export const maxDuration = 120;

/**
 * 节点 2：页面结构骨架
 * 输入：brief + AnalysisReport（节点1的分析结果）
 * 输出：PageSkeleton（完整布局坐标，但 layoutStyle 不含视觉属性）
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { brief?: string; analysis?: unknown };
  const brief = body?.brief?.trim();
  const analysis = body?.analysis;

  if (!brief) return new Response("Missing brief", { status: 400 });

  try {
    const model = createDeepSeekModel();
    const analysisText = typeof analysis === "object" ? JSON.stringify(analysis, null, 2) : String(analysis ?? "");

    const result = streamText({
      model,
      system: `你是一位资深看板信息架构师。
你的职责是将分析后的看板需求转换为精确的页面结构骨架。

关键输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾。
- 不要使用 markdown 代码块、代码围栏，JSON 外不要有任何解释文字。
- 所有字段名必须精确匹配（区分大小写）。
- 本步骤仅生成布局结构——不包含任何视觉样式（无圆角、颜色、阴影）。

必要顶层字段：
{
  "id": "唯一字符串",
  "name": "看板名称",
  "viewSize": {"width": 1920, "height": 1080},
  "backgroundColor": "#081121",
  "baseNodeMap": {},
  "nodeMap": { ... },
  "pages": [ ... ],
  "currentPageId": "必须是某个页面的 ID",
  "eventRules": [],
  "usedExtensions": [],
  "showRulers": false,
  "lockGuides": false,
  "variableMap": {},
  "$modelType": "dashboard/VisdocModel"
}

页面结构：
{
  "id": "唯一字符串", "name": "页面名称",
  "backgroundColor": "#081121",
  "rootNodeId": "必须是 nodeMap 中的分组节点 ID",
  "guideLines": {"horizontal": [], "vertical": []},
  "$modelType": "dashboard/PageModel"
}

分组节点：
{"id":"str","name":"str","type":"group","childrenIds":["id1","id2"],"$modelType":"dashboard/GroupModel"}

布局样式（骨架——仅包含位置和尺寸，不含视觉属性）：
{"position":[x,y],"rotation":0,"width":W,"height":H}
注意：此阶段不要在 layoutStyle 中包含 borderRadius、borderWidth、borderColor、borderStyle、backgroundColor、boxShadow 或 opacity。

文本组件：
{"id":"str","name":"str","type":"widget","widgetType":"text","config":{"text":"str","color":"#FFF","fontSize":24,"textAlign":"left","verticalAlign":"top","fontWeight":"bold","fontStyle":"normal"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

图片组件：
{"id":"str","name":"str","type":"widget","widgetType":"image","config":{"sourceType":"url","fileKey":"","url":"https://...","fillMode":"cover"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

像素进度组件：
{"id":"str","name":"str","type":"widget","widgetType":"pixel","config":{"title":"str","value":78,"target":100,"pixelsRowCount":10,"pixelsColumnCount":10,"pixelRowGap":4,"pixelColumnGap":4,"fillMode":"adaptive","animationMode":"sequential","borderRadius":6,"showTitle":true,"customColorRanges":false,"customOpacityRanges":false,"customGlobalOpacityRanges":false,"globalOpacityRanges":[{"min":1,"max":78,"opacity":1},{"min":79,"max":100,"opacity":0.24}],"colorRanges":[{"min":1,"max":30,"color":"#ef4444"},{"min":31,"max":60,"color":"#f59e0b"},{"min":61,"max":100,"color":"#10b981"}],"opacityRanges":[{"min":1,"max":3,"opacity":0.35},{"min":4,"max":6,"opacity":0.65},{"min":7,"max":10,"opacity":1}],"autoPlay":true,"playInterval":5000,"playDuration":2000},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

下拉筛选组件：
{"id":"str","name":"str","type":"widget","widgetType":"select","config":{"placeholder":"请选择...","options":["选项1","选项2"]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

柱状图：
{"id":"str","name":"str","type":"widget","widgetType":"bar","config":{"theme":"executive","title":"图表标题","categories":["A","B","C"],"seriesData":[{"name":"系列1","data":[100,200,300],"color":"#f97316"}],"barWidth":"48%"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

折线图：
{"id":"str","name":"str","type":"widget","widgetType":"line","config":{"theme":"executive","title":"图表标题","categories":["A","B","C"],"seriesData":[{"name":"系列1","data":[10,20,30],"color":"#38bdf8"}],"smooth":true,"areaStyle":false},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

饼图：
{"id":"str","name":"str","type":"widget","widgetType":"pie","config":{"theme":"executive","title":"图表标题","data":[{"name":"A","value":30,"color":"#38bdf8"},{"name":"B","value":25,"color":"#14b8a6"},{"name":"C","value":20,"color":"#f97316"},{"name":"D","value":15,"color":"#facc15"}],"radius":["44%","68%"]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

漏斗图：
{"id":"str","name":"str","type":"widget","widgetType":"funnel","config":{"theme":"executive","title":"图表标题","data":[{"name":"A","value":1000,"color":"#38bdf8"},{"name":"B","value":600,"color":"#14b8a6"},{"name":"C","value":300,"color":"#f97316"},{"name":"D","value":150,"color":"#fb7185"}]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}`,
      prompt: `根据以下需求分析，生成完整的页面结构骨架（布局坐标和组件类型，但不包含边框/颜色/阴影等视觉样式）。

用户需求：${brief}

第一步分析报告：
${analysisText}

要求：
- 页面数量必须与分析报告中的规划完全一致
- 每个页面的组件应与分析报告中的 suggestedWidgets 对应
- 所有组件必须在 1920x1080 画布内排列，不得重叠
- 参考 layoutIdea 提示合理布局各组件
- 所有 ID 在整个文档内必须唯一
- currentPageId 必须是某个页面的 ID
- 图表配置中需包含合理的模拟数据
- 仅输出 JSON 对象，不要输出任何其他内容`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/structure] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
