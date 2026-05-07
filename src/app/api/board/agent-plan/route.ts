/**
 * Planner API：根据用户消息和项目状态规划 Agent 任务列表
 *
 * POST /api/board/agent-plan
 *
 * 输入：{ userMessage: string; projectName: string; existingFiles: string[] }
 * 输出：流式文本，最终解析为 JSON：
 *   { tasks: Array<{ skill: string; description: string; inputs: Record<string, unknown> }> }
 *   或 { clarification: string }
 */
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { SKILL_REGISTRY_PROMPT } from "@/lib/agent/skill-registry";

export const maxDuration = 60;

const SYSTEM_PROMPT = `你是一个数据看板 Agent 的任务规划器。

你的任务是根据用户消息和项目当前已有的文件，规划出需要执行的 skill 任务列表。

========================
【可用 Skill 注册表】
========================
${SKILL_REGISTRY_PROMPT}

========================
【文件与 Skill 的对应关系】
========================
以下文件由对应 skill 生成，如果文件已存在，说明该 skill 已经执行过，无需重新规划：

- 数据故事/design-story.md → 由 design-story 生成
- 页面结构/pages-story.md  → 由 design-pages 生成
- 品牌VI/vi-system.md      → 由 design-vi 生成

注意：页面/wireframe.jsx 和 页面/dashboard.jsx 是可以多次生成的（每次生成新编号的文件），
因此即使这些文件已存在，也可以再次规划 generate-jsx 和 apply-vi。

========================
【规划核心原则】
========================
1. 已存在的文件对应的 skill 不需要重新规划，直接复用已有文件
2. 规划时从"第一个尚未完成的步骤"开始，跳过已有文件对应的 skill
3. generate-jsx 和 apply-vi 是绑定关系，必须同时出现且 generate-jsx 在前
4. analyze-brief 和 design-story 是绑定关系，必须同时出现且 analyze-brief 在前
5. 只能使用注册表中存在的 skill 名称
6. 如果无法从用户消息中推断出明确意图，返回 { "clarification": "..." }
7. 输出严格 JSON，不要有 markdown 代码块

========================
【典型场景示例】
========================

场景1：项目已有 design-story.md、pages-story.md、vi-system.md，用户说"生成一个新的看板"
→ 直接规划 generate-jsx + apply-vi（复用已有的页面结构和 VI 系统）

场景2：项目已有 design-story.md，用户说"继续完成看板"
→ 规划 design-pages → design-vi → generate-jsx → apply-vi

场景3：项目已有所有文件，用户说"重新设计数据故事"
→ 规划 analyze-brief → design-story → design-pages → generate-jsx → apply-vi

场景4：项目已有所有文件，用户说"换一套 VI 风格"
→ 规划 design-vi → generate-jsx → apply-vi

========================
【inputs 填充规则】
========================
- analyze-brief：{ "brief": "<用户提供的需求描述>" }
- design-story：{ "brief": "<用户提供的需求描述>" }
- design-pages：{ "designStory": "" }（执行时自动从已有文件读取）
- design-vi：{}
- generate-jsx：{ "pagesStory": "" }（执行时自动从已有文件读取）
- apply-vi：{}

========================
【输出格式】
========================
情况一：能推断出意图
{
  "tasks": [
    { "skill": "generate-jsx", "description": "根据现有页面结构生成线框代码", "inputs": { "pagesStory": "" } },
    { "skill": "apply-vi", "description": "应用品牌 VI 系统生成最终看板", "inputs": {} }
  ]
}

情况二：无法推断意图
{
  "clarification": "请描述您想要创建的看板类型和需要展示的数据指标"
}`;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userMessage?: string;
    projectName?: string;
    existingFiles?: string[];
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  const userMessage = body?.userMessage?.trim();
  const projectName = body?.projectName?.trim();
  const existingFiles = body?.existingFiles ?? [];
  const conversationHistory = body?.conversationHistory ?? [];

  if (!userMessage) {
    return new Response("Missing userMessage", { status: 400 });
  }

  if (!projectName) {
    return new Response("Missing projectName", { status: 400 });
  }

  try {
    const model = createDeepSeekModel();

    const existingFilesInfo =
      existingFiles.length > 0
        ? `\n\n已存在的项目文件：\n${existingFiles.map((f) => `- ${f}`).join("\n")}`
        : "\n\n当前项目为空，没有已存在的文件。";

    const currentPrompt = `项目名称：${projectName}${existingFilesInfo}

用户消息：${userMessage}

请根据用户消息和项目当前状态，规划需要执行的任务列表。`;

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: [
        ...conversationHistory,
        { role: "user", content: currentPrompt },
      ],
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/agent-plan] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
