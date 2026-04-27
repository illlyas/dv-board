import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";

export const maxDuration = 60;

/**
 * 节点 1：需求分析
 * 输入：用户 brief
 * 输出：AnalysisReport（结构化分析报告）
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { brief?: string };
  const brief = body?.brief?.trim();
  if (!brief) return new Response("Missing brief", { status: 400 });

  try {
    const model = createDeepSeekModel();
    const result = streamText({
      model,
      system: `You are a senior data-visualization consultant and business analyst.
Your job is to deeply analyze the user's dashboard requirement and produce a structured analysis report.

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON. Start with "{" and end with "}".
- No markdown fences, no code blocks, no explanation outside JSON.

OUTPUT SCHEMA:
{
  "id": "unique-string-id",
  "brief": "the original user input",
  "summary": "one-line summary of what this dashboard should achieve",
  "dataStory": "Explain the data narrative logic — why pages are ordered this way, what story the viewer walks through from page 1 to last page. Be detailed and insightful.",
  "pages": [
    {
      "name": "Page Name (e.g. 'Sales Overview')",
      "purpose": "What is the core goal of this page? What question does it answer?",
      "keyMetrics": ["metric1", "metric2", "dimension1"],
      "suggestedWidgets": [
        {
          "type": "text|bar|line|pie|funnel|pixel|select|image",
          "label": "what this widget shows (e.g. 'Main title: company name')",
          "dataDescription": "describe the data content (e.g. 'Monthly sales by region, comparing actual vs target')"
        }
      ],
      "layoutIdea": "Describe the visual layout concept for this page (e.g. 'Title at top-left, KPI row below, main chart takes center-right, filter bar at bottom')"
    }
  ],
  "potentialNeeds": ["need that user didn't mention but would likely want", "..."],
  "recommendedTheme": "dark-tech|dark-business|light-clean|dark-executive|dark-data"
}

GUIDELINES:
- Analyze BOTH explicit and implicit needs in the brief
- Plan 2-5 pages depending on complexity of the topic
- Each page must have a clear, distinct purpose
- The dataStory should be a compelling narrative arc across all pages
- Suggest widget types that best represent each piece of information
- Identify 2-4 potential needs the user may not have mentioned`,
      prompt: `Analyze the following data visualization dashboard requirement and produce a structured analysis report:

USER REQUIREMENT: ${brief}`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/analyze] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
