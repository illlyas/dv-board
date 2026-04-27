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
      system: `你是一位资深的数据可视化顾问和业务分析师。
你的职责是深入分析用户的数据看板需求，生成结构化的分析报告。

关键输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾。
- 不要使用 markdown 代码块、代码围栏，JSON 外不要有任何解释文字。

输出结构：
{
  "id": "唯一字符串 ID",
  "brief": "用户原始输入",
  "summary": "一句话概括该看板要达成什么目标",
  "dataStory": "阐述数据叙事逻辑——页面为何如此排序、观众从第一页到最后一页会经历怎样的故事线。需详细且有洞察力。",
  "pages": [
    {
      "name": "页面名称（如「销售总览」）",
      "purpose": "该页面的核心目标是什么？回答什么问题？",
      "keyMetrics": ["指标1", "指标2", "维度1"],
      "suggestedWidgets": [
        {
          "type": "text|bar|line|pie|funnel|pixel|select|image",
          "label": "该组件展示什么（如「主标题：公司名称」）",
          "dataDescription": "描述数据内容（如「按区域统计的月度销量，对比实际值与目标值」）"
        }
      ],
      "layoutIdea": "描述该页面的视觉布局思路（如「标题左上角，KPI 指标行在其下方，主图表占据中右区域，筛选条在底部」）"
    }
  ],
  "potentialNeeds": ["用户未提及但可能需要的需求", "..."],
  "recommendedTheme": "dark-tech|dark-business|light-clean|dark-executive|dark-data"
}

分析指南：
- 同时分析用户需求中的显性需求和隐性需求
- 根据主题复杂度规划 2-5 个页面
- 每个页面必须有清晰、独特的目的
- dataStory 应是贯穿所有页面的引人入胜的叙事弧线
- 建议最适合每种信息展示的组件类型
- 识别 2-4 个用户可能未提及的潜在需求`,
      prompt: `分析以下数据可视化看板需求，生成结构化分析报告：

用户需求：${brief}`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/analyze] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
