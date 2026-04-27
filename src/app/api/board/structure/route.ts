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
      system: `You are a senior dashboard information architect.
Your job is to convert an analyzed dashboard requirement into a precise page STRUCTURE SKELETON.

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON. Start with "{" and end with "}".
- No markdown fences, no code blocks, no explanation outside JSON.
- Every field name MUST be exact (case-sensitive).
- This step produces LAYOUT only — NO visual styling (no border radius, colors, shadows).

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

PAGE SCHEMA:
{
  "id": "unique-string", "name": "Page Name",
  "backgroundColor": "#081121",
  "rootNodeId": "must-be-a-group-node-id-in-nodeMap",
  "guideLines": {"horizontal": [], "vertical": []},
  "$modelType": "dashboard/PageModel"
}

GROUP NODE:
{"id":"str","name":"str","type":"group","childrenIds":["id1","id2"],"$modelType":"dashboard/GroupModel"}

LAYOUT STYLE (SKELETON — position/size ONLY, no visual properties):
{"position":[x,y],"rotation":0,"width":W,"height":H}
IMPORTANT: Do NOT include borderRadius, borderWidth, borderColor, borderStyle, backgroundColor, boxShadow, or opacity in any layoutStyle at this stage.

TEXT WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"text","config":{"text":"str","color":"#FFF","fontSize":24,"textAlign":"left","verticalAlign":"top","fontWeight":"bold","fontStyle":"normal"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

IMAGE WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"image","config":{"sourceType":"url","fileKey":"","url":"https://...","fillMode":"cover"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

PIXEL WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"pixel","config":{"title":"str","value":78,"target":100,"pixelsRowCount":10,"pixelsColumnCount":10,"pixelRowGap":4,"pixelColumnGap":4,"fillMode":"adaptive","animationMode":"sequential","borderRadius":6,"showTitle":true,"customColorRanges":false,"customOpacityRanges":false,"customGlobalOpacityRanges":false,"globalOpacityRanges":[{"min":1,"max":78,"opacity":1},{"min":79,"max":100,"opacity":0.24}],"colorRanges":[{"min":1,"max":30,"color":"#ef4444"},{"min":31,"max":60,"color":"#f59e0b"},{"min":61,"max":100,"color":"#10b981"}],"opacityRanges":[{"min":1,"max":3,"opacity":0.35},{"min":4,"max":6,"opacity":0.65},{"min":7,"max":10,"opacity":1}],"autoPlay":true,"playInterval":5000,"playDuration":2000},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

SELECT WIDGET:
{"id":"str","name":"str","type":"widget","widgetType":"select","config":{"placeholder":"Select...","options":["opt1","opt2"]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

BAR CHART:
{"id":"str","name":"str","type":"widget","widgetType":"bar","config":{"theme":"executive","title":"Chart Title","categories":["A","B","C"],"seriesData":[{"name":"Series1","data":[100,200,300],"color":"#f97316"}],"barWidth":"48%"},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

LINE CHART:
{"id":"str","name":"str","type":"widget","widgetType":"line","config":{"theme":"executive","title":"Chart Title","categories":["A","B","C"],"seriesData":[{"name":"S1","data":[10,20,30],"color":"#38bdf8"}],"smooth":true,"areaStyle":false},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

PIE CHART:
{"id":"str","name":"str","type":"widget","widgetType":"pie","config":{"theme":"executive","title":"Chart Title","data":[{"name":"A","value":30,"color":"#38bdf8"},{"name":"B","value":25,"color":"#14b8a6"},{"name":"C","value":20,"color":"#f97316"},{"name":"D","value":15,"color":"#facc15"}],"radius":["44%","68%"]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}

FUNNEL CHART:
{"id":"str","name":"str","type":"widget","widgetType":"funnel","config":{"theme":"executive","title":"Chart Title","data":[{"name":"A","value":1000,"color":"#38bdf8"},{"name":"B","value":600,"color":"#14b8a6"},{"name":"C","value":300,"color":"#f97316"},{"name":"D","value":150,"color":"#fb7185"}]},"layoutStyle":{"position":[x,y],"rotation":0,"width":W,"height":H},"$modelType":"dashboard/WidgetModel"}`,
      prompt: `Based on the following requirement analysis, produce a COMPLETE page structure skeleton (layout coordinates and widget types, but NO visual styling like borders/colors/shadows).

USER REQUIREMENT: ${brief}

ANALYSIS REPORT FROM STEP 1:
${analysisText}

REQUIREMENTS:
- Produce exactly the number of pages specified in the analysis report
- Each page's widgets should match the suggestedWidgets from the analysis
- Position ALL widgets within the 1920x1080 canvas with NO overlaps
- Use the layoutIdea hints to arrange components sensibly
- All IDs must be unique strings across the entire document
- currentPageId must match one of the page IDs
- Include realistic sample data in chart configs
- Output ONLY the JSON object, nothing else`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/structure] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
