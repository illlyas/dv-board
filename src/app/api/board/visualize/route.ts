import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";

export const maxDuration = 120;

/**
 * 节点 3：视觉设计
 * 输入：brief + analysis + skeleton（节点2的结构骨架）
 * 输出：VisdocModel（完整看板，layoutStyle 含所有视觉属性）
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { brief?: string; analysis?: unknown; skeleton?: unknown };
  const brief = body?.brief?.trim();
  if (!brief) return new Response("Missing brief", { status: 400 });

  try {
    const model = createDeepSeekModel();
    const analysisText = typeof body.analysis === "object" ? JSON.stringify(body.analysis, null, 2) : String(body.analysis ?? "");
    const skeletonText = typeof body.skeleton === "object" ? JSON.stringify(body.skeleton, null, 2) : String(body.skeleton ?? "");

    const result = streamText({
      model,
      system: `You are a senior visual design specialist for data visualization dashboards.
Your job is to take a page structure skeleton and apply a complete visual design system.

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON. Start with "{" and end with "}".
- No markdown fences, no code blocks, no explanation outside JSON.
- Keep ALL structure data from the input skeleton EXACTLY the same (positions, sizes, widget types, configs).
- ONLY ADD visual styling properties to each widget's layoutStyle.

VISUAL PROPERTIES TO ADD (all optional, apply where appropriate):
{
  "borderRadius": number,       // e.g. 8 for subtle rounding, 16 for cards, 0 for sharp
  "borderWidth": number,        // e.g. 1 for subtle borders, 0 for borderless
  "borderColor": "#hex",        // e.g. "rgba(255,255,255,0.08)" for dark themes
  "borderStyle": "solid|dashed|dotted",
  "backgroundColor": "#hex",     // per-widget background (e.g. "rgba(255,255,255,0.04)")
  "boxShadow": "CSS box-shadow string",  // e.g. "0 4px 24px rgba(0,0,0,0.3)"
  "opacity": 0-1               // rarely needed
}

DESIGN GUIDELINES BY THEME:
- dark-tech: Deep navy bg (#0a1628), cyan/orange accents, glowing borders, glass-morphism panels
- dark-business: Dark charcoal (#0f172a), blue/indigo accents, clean lines, minimal decoration
- light-clean: White/light gray bg, subtle shadows, professional blues/grays
- dark-executive: Near-black (#030712), gold/amber highlights, formal structured layout
- dark-data: Deep teal-blue (#081121), vibrant data-colors, high contrast for readability

RULES:
1. Apply a CONSISTENT visual language across all widgets on the same page
2. Charts usually need NO background or very subtle one — let the chart colors speak
3. Text widgets (especially titles) typically have NO background/border
4. Select/filter widgets often get a subtle border + slightly different background
5. Pixel widgets may benefit from a subtle background container
6. The overall dashboard backgroundColor should match the recommended theme
7. Each page can have its own backgroundColor (slight variations within theme)
8. Border radius should be consistent: use 2-4 values max across entire dashboard (e.g. 0 for charts, 12 for filter panels)
9. Do NOT change any position/size/widgetType/config data from the skeleton`,
      prompt: `Apply a complete visual design system to this dashboard skeleton.

USER REQUIREMENT: ${brief}

ANALYSIS REPORT:
${analysisText}

PAGE STRUCTURE SKELETON (preserve ALL structural data exactly, only ADD visual properties):
${skeletonText}`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/visualize] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
