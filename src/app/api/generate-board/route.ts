import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";

export const maxDuration = 60;

const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";

/**
 * API Route: /api/generate-board
 *
 * 前端使用 experimental_useObject（来自 @ai-sdk/react），其内部实现：
 *   1. POST 该接口
 *   2. 通过 TextDecoderStream 读取 response.body 作为原始文本流
 *   3. 逐块累积文本，调用 parsePartialJson() 解析部分 JSON
 *   4. 流结束后用 safeValidateTypes 校验 Zod schema
 *
 * 因此本接口必须返回：Content-Type: text/plain 的原始 JSON 文本流。
 * 不能使用 AI SDK data-stream 格式（0:"..." 前缀块）。
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { brief?: string };
  const brief = body?.brief?.trim();

  if (!brief) {
    return new Response("Missing brief", { status: 400 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseURL = process.env.DEEPSEEK_BASE_URL ?? DEFAULT_DEEPSEEK_BASE_URL;
  const modelName = process.env.DEEPSEEK_MODEL ?? DEFAULT_DEEPSEEK_MODEL;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing DEEPSEEK_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const deepseek = createOpenAICompatible({
    name: "deepseek",
    apiKey,
    baseURL,
  });

  // 使用 streamText 生成纯文本，然后以原始文本流返回给前端 useObject。
  // useObject 会自行累积文本并用 parsePartialJson 解析。
  const result = streamText({
    model: deepseek(modelName),
    system: `你是一位资深的数据可视化文档架构师。
生成一个 Visdoc 风格的看板文档，以单个原始 JSON 对象输出。

关键输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾。
- 不要使用 markdown 代码块、代码围栏，不要输出任何解释或评论。
- 所有字段名必须精确匹配（区分大小写）。

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

页面结构（2-4 个页面）：
{
  "id": "唯一字符串",
  "name": "页面名称",
  "backgroundColor": "#081121",
  "rootNodeId": "必须是 nodeMap 中的分组节点 ID",
  "guideLines": {"horizontal": [], "vertical": []},
  "$modelType": "dashboard/PageModel"
}

nodeMap 中的分组节点：
{"id": "字符串", "name": "字符串", "type": "group", "childrenIds": ["id1","id2"], "$modelType": "dashboard/GroupModel"}

文本组件：
{"id":"str","name":"str","type":"widget","widgetType":"text","config":{"text":"str","color":"#FFF","fontSize":24,"textAlign":"left","verticalAlign":"top","fontWeight":"bold","fontStyle":"normal"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

图片组件：
{"id":"str","name":"str","type":"widget","widgetType":"image","config":{"sourceType":"url","fileKey":"","url":"https://...","fillMode":"cover"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

像素进度组件：
{"id":"str","name":"str","type":"widget","widgetType":"pixel","config":{"title":"str","value":78,"target":100,"pixelsRowCount":10,"pixelsColumnCount":10,"pixelRowGap":4,"pixelColumnGap":4,"fillMode":"adaptive","animationMode":"sequential","borderRadius":10,"showTitle":true,"customColorRanges":false,"customOpacityRanges":false,"customGlobalOpacityRanges":false,"globalOpacityRanges":[{"min":1,"max":78,"opacity":1},{"min":79,"max":100,"opacity":0.24}],"colorRanges":[{"min":1,"max":30,"color":"#ef4444"},{"min":31,"max":60,"color":"#f59e0b"},{"min":61,"max":100,"color":"#10b981"}],"opacityRanges":[{"min":1,"max":3,"opacity":0.35},{"min":4,"max":6,"opacity":0.65},{"min":7,"max":10,"opacity":1}],"autoPlay":true,"playInterval":5000,"playDuration":2000},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

下拉筛选组件：
{"id":"str","name":"str","type":"widget","widgetType":"select","config":{"placeholder":"请选择...","options":["选项1","选项2"]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

柱状图组件：
{"id":"str","name":"str","type":"widget","widgetType":"bar","config":{"theme":"executive","title":"图表标题","categories":["A","B","C"],"seriesData":[{"name":"系列1","data":[100,200,300],"color":"#f97316"}],"barWidth":"48%"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

折线图组件：
{"id":"str","name":"str","type":"widget","widgetType":"line","config":{"theme":"executive","title":"图表标题","categories":["A","B","C"],"seriesData":[{"name":"系列1","data":[10,20,30],"color":"#38bdf8"}],"smooth":true,"areaStyle":false},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

饼图组件：
{"id":"str","name":"str","type":"widget","widgetType":"pie","config":{"theme":"executive","title":"图表标题","data":[{"name":"A","value":30,"color":"#38bdf8"},{"name":"B","value":25,"color":"#14b8a6"},{"name":"C","value":20,"color":"#f97316"},{"name":"D","value":15,"color":"#facc15"}],"radius":["44%","68%"]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

漏斗图组件：
{"id":"str","name":"str","type":"widget","widgetType":"funnel","config":{"theme":"executive","title":"图表标题","data":[{"name":"A","value":1000,"color":"#38bdf8"},{"name":"B","value":600,"color":"#14b8a6"},{"name":"C","value":300,"color":"#f97316"},{"name":"D","value":150,"color":"#fb7185"}]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}`,
    prompt: `生成完整的 Visdoc 看板 JSON，主题为：${brief}

要求：
- 2 到 4 个页面，每个页面有 rootNodeId 指向一个分组节点
- 每个分组的 childrenIds 数组中的组件/节点 ID 必须都存在于 nodeMap 中
- 所有 ID 在整个文档内必须唯一
- currentPageId 必须是某个页面的 ID
- 所有页面中至少包含以下组件类型：文本(2+)、像素进度(1+)、下拉筛选(1+)、图片(1+)、柱状图或折线图(1+)、饼图或漏斗图(1+)
- 所有组件在 1920x1080 画布内排列，不得重叠
- 暗色主题背景（#081121 或类似色值）
- 仅输出 JSON 对象，不要输出任何其他内容`,
  });

  // 直接将 streamText 的 textStream 以纯文本形式返回给前端。
  // useObject 内部通过 TextDecoderStream + parsePartialJson 消费此流。
  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = result.textStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(encoder.encode(value));
        }
        controller.close();
      } catch (err) {
        console.error("[generate-board] textStream read error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
