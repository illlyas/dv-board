/**
 * Step 2: 看板故事设计（与 Step 1 并发）
 *
 * POST /api/board/design-story
 *
 * 输入：{ brief: string }
 * 输出：BoardStory（结构化看板故事线）
 */
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { buildIndustryPrompt } from "@/lib/industry-playbooks";
import { boardStorySchemaPrompt } from "@/lib/board/board-story";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = (await request.json()) as { brief?: string };
  const brief = body?.brief?.trim();
  if (!brief) return new Response("Missing brief", { status: 400 });

  try {
    const model = createDeepSeekModel();
    const industryPrompt = buildIndustryPrompt(brief);

    const result = streamText({
      model,
      system: `你是一位资深的数据可视化顾问和业务分析师。
你的职责是深入分析用户的数据看板需求，生成一份结构化的"看板故事"文档。

这份文档定义了：
- 一共需要多少页面，以及页面顺序
- 每个页面在整套叙事中的角色
- 每个页面核心回答什么问题
- 每个页面的关键洞察和必须包含的内容模块
- 观众看完后应采取的判断或动作

这一步不画版、不决定像素位置、不涉及视觉风格。你的任务是定义"讲什么故事"、"怎么排列叙事顺序"。
后续步骤会根据你的故事设计 VI 系统并直接生成 JSX 看板代码。

关键输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾。
- 不要使用 markdown 代码块、代码围栏，JSON 外不要有任何解释文字。
- 不要输出任何像素坐标、尺寸、布局数值、视觉风格细节。
- suggestedWidgets 是该页必须的内容块清单，不是推荐——下一步会直接据此生成代码。
- 如果用户信息模糊，需要先做合理业务假设，再展开专业分析框架。
- 根据主题复杂度规划 2-5 个页面。
- 每个页面必须有清晰独特、不可互相替代的目的。
- 每个页面必须先给出结论目标，再决定展示内容；如果没有 mustInsights，说明分析失败。
- 每个页面至少要有 2 个分析角度。
- dataStory 应是贯穿所有页面的叙事弧线。

输出 JSON Schema：
${boardStorySchemaPrompt}`,
      prompt: `分析以下数据可视化看板需求，生成结构化看板故事：

用户需求：${brief}

行业启发规则：
${industryPrompt.prompt}

请特别注意：
- 先定义页面规划和叙事逻辑，再定义每页必须承接的内容块
- 不要在这一步输出任何布局坐标或视觉样式
- 第二步（VI 设计）和第三步（JSX 生成都将严格依赖你的 pages 和 suggestedWidgets
- 因此输出必须具体可执行，不可空泛`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/design-story] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
