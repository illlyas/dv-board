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
    system: `You are a senior data-visualization document architect.
Generate a Visdoc-style dashboard document as a single raw JSON object.

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON. Start with "{" and end with "}".
- No markdown fences, no code blocks, no explanation, no commentary.
- Every field name MUST be exact (case-sensitive).

REQUIRED TOP-LEVEL FIELDS:
{
  "id": "unique-string",
  "name": "Dashboard Name",
  "viewSize": {"width": 1920, "height": 1080},
  "backgroundColor": "#081121",
  "baseNodeMap": {},
  "nodeMap": { ... },
  "pages": [ ... ],
  "currentPageId": "page-id-must-match-a-page",
  "eventRules": [],
  "usedExtensions": [],
  "showRulers": false,
  "lockGuides": false,
  "variableMap": {},
  "$modelType": "dashboard/VisdocModel"
}

PAGE SCHEMA (2-4 pages):
{
  "id": "unique-string",
  "name": "Page Name",
  "backgroundColor": "#081121",
  "rootNodeId": "must-be-a-group-node-id-in-nodeMap",
  "guideLines": {"horizontal": [], "vertical": []},
  "$modelType": "dashboard/PageModel"
}

GROUP NODE in nodeMap:
{"id": "string", "name": "string", "type": "group", "childrenIds": ["id1","id2"], "$modelType": "dashboard/GroupModel"}

TEXT WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"text","config":{"text":"str","color":"#FFF","fontSize":24,"textAlign":"left","verticalAlign":"top","fontWeight":"bold","fontStyle":"normal"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

IMAGE WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"image","config":{"sourceType":"url","fileKey":"","url":"https://...","fillMode":"cover"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

PIXEL WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"pixel","config":{"title":"str","value":78,"target":100,"pixelsRowCount":10,"pixelsColumnCount":10,"pixelRowGap":4,"pixelColumnGap":4,"fillMode":"adaptive","animationMode":"sequential","borderRadius":10,"showTitle":true,"customColorRanges":false,"customOpacityRanges":false,"customGlobalOpacityRanges":false,"globalOpacityRanges":[{"min":1,"max":78,"opacity":1},{"min":79,"max":100,"opacity":0.24}],"colorRanges":[{"min":1,"max":30,"color":"#ef4444"},{"min":31,"max":60,"color":"#f59e0b"},{"min":61,"max":100,"color":"#10b981"}],"opacityRanges":[{"min":1,"max":3,"opacity":0.35},{"min":4,"max":6,"opacity":0.65},{"min":7,"max":10,"opacity":1}],"autoPlay":true,"playInterval":5000,"playDuration":2000},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

SELECT WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"select","config":{"placeholder":"Select...","options":["opt1","opt2"]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

BAR CHART WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"bar","config":{"theme":"executive","title":"Chart Title","categories":["A","B","C"],"seriesData":[{"name":"Series1","data":[100,200,300],"color":"#f97316"}],"barWidth":"48%"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

LINE CHART WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"line","config":{"theme":"executive","title":"Chart Title","categories":["A","B","C"],"seriesData":[{"name":"S1","data":[10,20,30],"color":"#38bdf8"}],"smooth":true,"areaStyle":false},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

PIE CHART WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"pie","config":{"theme":"executive","title":"Chart Title","data":[{"name":"A","value":30,"color":"#38bdf8"},{"name":"B","value":25,"color":"#14b8a6"},{"name":"C","value":20,"color":"#f97316"},{"name":"D","value":15,"color":"#facc15"}],"radius":["44%","68%"]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

FUNNEL CHART WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"funnel","config":{"theme":"executive","title":"Chart Title","data":[{"name":"A","value":1000,"color":"#38bdf8"},{"name":"B","value":600,"color":"#14b8a6"},{"name":"C","value":300,"color":"#f97316"},{"name":"D","value":150,"color":"#fb7185"}]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}`,
    prompt: `Generate a complete Visdoc dashboard JSON for: ${brief}

REQUIREMENTS:
- 2 to 4 pages, each page has a rootNodeId pointing to a group node
- Each group has childrenIds array of widget/node IDs that all exist in nodeMap
- All IDs are unique strings across the entire document
- currentPageId must be exactly one of the page IDs
- Include at least these widget types across all pages: text(2+), pixel(1+), select(1+), image(1+), bar or line(1+), pie or funnel(1+)
- Position all widgets within 1920x1080 canvas (no overlaps)
- Dark theme backgrounds (#081121 or similar)
- Output ONLY the JSON object, nothing else`,
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
