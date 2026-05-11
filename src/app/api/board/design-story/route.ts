/**
 * Step 1b: 生成 Design Story 文档
 *
 * POST /api/board/design-story
 *
 * 输入：{ brief: string, answers?: Record<string, any> }
 * 输出：Markdown 格式的 Design Story 文档（纯文本流）
 *
 * answers 为可选——信息充足时不传，信息不足时传入用户补充的表单答案
 */
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { loadProjectConfigResolved } from "@/lib/projects/load-project-config";
import { formatProjectBoardContextBlock } from "@/lib/projects/project-board-context";

export const maxDuration = 120;

const SYSTEM_PROMPT = `你是一个数据可视化看板设计专家。根据用户的需求描述（以及可能的补充信息），生成一份完整的 Design Story 文档。

========================
【输出格式】
========================
直接输出 Markdown 文档，不要有任何 JSON 包装。

# [看板名称]

## 概述
简洁描述这个看板的核心价值和使用场景（2-3句话）。

## 业务目标
- **核心目标**：[主要业务目标]
- **受众**：[主要使用者]
- **决策支持**：[支持哪些决策]

## 核心指标（含 metricId，供 pages-story 与 JSX 引用）
| 指标名称 | metricId | 类型 | 说明 |
|---------|----------|------|------|
| [中文名] | m_snake_id | KPI/过程/诊断 | [业务口径：聚合维度、时间窗] |

## 指标呈现与数据契约（对齐 StatisticCard 式分区：标题/主值/辅值/趋势/微型证据/脚注）
| metricId | 默认对比 | 呈现 layout | surface | 迷你序列字段名（可选） | 脚注要点（可选） | 向好方向 |
|---------|----------|-------------|---------|------------------------|------------------|----------|
| m_xxx | yoy/mom/target/无 | classic / header-inline / sidebar-stack / pedestal-row / metric-group-inline | card / none / hairline | 如 spark_sales | 口径一句 | 升或降为好 |

**metricId** 全局唯一；**layout=surface=none** 用于顶栏无卡发光字；**metric-group-inline** 表示与其它指标同属一组（pages-story 中用 mode=group 引用）。

## 分析维度
- [维度1]：[说明]
- [维度2]：[说明]

## 对比分析
- [对比方式1]
- [对比方式2]

## 关键决策场景
1. **[场景名称]**：如果 [条件]，则 [动作]
2. **[场景名称]**：如果 [条件]，则 [动作]

## 预警规则
- [预警规则1]（如有则填，没有则省略此节）

## 页面规划建议
建议分为 [N] 个页面：
1. **[页面名]**：[核心内容和目的]
2. **[页面名]**：[核心内容和目的]

## 数据故事线
[用2-4句话描述这个看板的数据叙事逻辑，从整体到细节，从现象到原因]

========================
【写作原则】
========================
- 语言简洁专业，避免废话
- 指标和维度要具体，不要泛泛而谈
- 决策场景必须是"如果...则..."的可执行格式
- 页面规划要有逻辑顺序（总览→详情→诊断）
- 对于用户没有明确提供的信息，根据行业常识合理推断补全
- **指标全链路**：每张 KPI 必须在「指标呈现与数据契约」表中占一行；若顶栏需多种形态（卡片 / 无卡 inline / 指标组），须在此表写清 layout/surface，避免下游只能生成同款卡。
- **补充表单**：用户通过 Tags +「其它」提交的字段中，若以 **「其它：」** 开头表示自定义说明，必须把冒号后的语义写入对应章节（受众、对比方式、决策场景等），不得丢弃或仅写「其它」二字。

========================
【增量修订模式】
========================
若用户提示词中包含「既有 design-story.md」全文或节选，你必须在其基础上做**合并式修订**：
- 保留未被诉求触及的章节与表述，禁止无理由整篇重写为另一套故事；
- 仅新增、删减或改写与用户诉求直接相关的段落（指标、维度、页面规划建议等）；
- 仍然输出**完整**的最终 Markdown（合并后的整篇文档），不要只输出 diff。`;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    brief?: string;
    answers?: Record<string, unknown>;
    existingStory?: string;
    projectKey?: string;
  };

  const brief = body?.brief?.trim();
  if (!brief) {
    return new Response("Missing brief", { status: 400 });
  }

  const existingStory = typeof body.existingStory === "string" ? body.existingStory.trim() : "";

  try {
    const model = createDeepSeekModel();

    let system = SYSTEM_PROMPT;
    const pk = typeof body.projectKey === "string" ? body.projectKey.trim() : "";
    if (pk) {
      const cfg = await loadProjectConfigResolved(process.cwd(), pk);
      if (cfg) {
        system += `\n\n若下列「项目场景契约」与上文默认假设冲突，**以本节为准**。\n\n${formatProjectBoardContextBlock(cfg)}`;
      }
    }

    let prompt = "";

    if (existingStory) {
      prompt += `【既有 design-story.md（须在下列用户需求下增量修订，禁止无理由全盘推翻）】

${existingStory}

---

`;
    }

    prompt += `用户需求与修订说明：${brief}`;

    const answers = body?.answers;
    if (answers && Object.keys(answers).length > 0) {
      const answersText = Object.entries(answers)
        .map(([key, value]) => {
          const v = Array.isArray(value) ? value.join("、") : String(value);
          return `- ${key}: ${v}`;
        })
        .join("\n");
      prompt += `\n\n用户补充信息：\n${answersText}`;
    }

    prompt += existingStory
      ? "\n\n请输出合并后的**完整** Design Story Markdown 文档。"
      : "\n\n请根据以上信息生成完整的 Design Story 文档。";
    const result = streamText({
      model,
      system,
      prompt,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/design-story] error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
