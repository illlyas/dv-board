import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { visualSystemSchemaPrompt } from "@/lib/visual-system";

export const maxDuration = 120;

/**
 * 节点 3：视觉设计
 * 输入：brief + visualBrief + structureDigest
 * 输出：VisualSystemSpec（短版视觉系统）
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { brief?: string; visualBrief?: unknown; structureDigest?: unknown };
  const brief = body?.brief?.trim();
  if (!brief) return new Response("Missing brief", { status: 400 });

  try {
    const model = createDeepSeekModel();
    const visualBriefText = typeof body.visualBrief === "object" ? JSON.stringify(body.visualBrief, null, 2) : String(body.visualBrief ?? "");
    const structureDigestText = typeof body.structureDigest === "object" ? JSON.stringify(body.structureDigest, null, 2) : String(body.structureDigest ?? "");

    const result = streamText({
      model,
      system: `你是一位资深的数据可视化看板视觉系统设计师。
你的职责不是为每个组件逐一补样式，而是定义一份短小、统一、可执行的视觉系统 spec，供程序自动应用到整套看板。

关键输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾。
- 不要使用 markdown 代码块、代码围栏，JSON 外不要有任何解释文字。
- 输出必须严格符合下方给出的 JSON Schema。
- 输出尽量短，只给视觉决策，不要解释原因。
- spec 必须足够统一，能够覆盖整套看板的所有页面和组件类型。
- 优先定义全局 token 和少量组件规则，而不是写很多局部特例。

主题提示：
- dark-tech：深海军蓝、冷色强调、科技感
- dark-business：深炭灰、商务蓝、克制
- light-clean：浅底、清爽、专业
- dark-executive：近黑背景、琥珀高亮、正式汇报
- dark-data：深蓝绿色、高对比、高信息密度

输出 JSON Schema：
${visualSystemSchemaPrompt}`,
      prompt: `根据以下信息生成一份短版看板视觉系统 spec。

用户需求：${brief}

视觉简报：
${visualBriefText}

结构摘要：
${structureDigestText}

要求：
- themeProfile 必须与 visualBrief.themeHint / tone / densityHint 协调
- token 要能覆盖标题、正文、面板、边框、状态色、图表色板
- token 还要覆盖区域块 section 的背景和边框、divider 分割线颜色，以及图表标题 icon/徽标/底线/高亮背景样式，使页面能形成清晰的分区层级
- chartPalette 需要适合整个看板反复复用，避免只有一两种颜色
- 图表标题头部需要兼顾标题文字、SVG icon、徽标底色、分隔底线，以及与主色调呼应的半透明高亮背景
- componentRules 必须足够少，但能区分标题、区域块、divider 分割线、图表标题头部、KPI 卡片、图表面板、筛选器、注释文本
- 图表标题高亮背景可采用纯色透明底或渐变透明底，但必须克制、统一，并与 accent / chartTitleIcon 呼应
- 如果结构摘要显示页面很多或密度高，优先选择 compact/balanced、subtle-panels 或 transparent-charts
- 不要输出任何页面节点、组件坐标、widget 配置，也不要重复 structureDigest`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/visualize] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
