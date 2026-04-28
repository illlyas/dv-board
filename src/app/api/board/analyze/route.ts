import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { buildIndustryPrompt } from "@/lib/industry-playbooks";

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
    const industryPrompt = buildIndustryPrompt(brief);
    const result = streamText({
      model,
      system: `你是一位资深的数据可视化顾问和业务分析师。
你的职责是深入分析用户的数据看板需求，生成一份能直接交给“页面结构设计师”继续工作的结构化页面简报。
这份简报必须像专业分析师写的报告提纲，而不是图表清单。

这一步不是画版，也不是决定像素位置。你的任务是先定义：
- 一共需要多少页面，以及页面顺序
- 每个页面在整套叙事中的角色
- 每个页面核心回答什么问题
- 每个页面属于哪种分析动作
- 如果用户信息模糊，你需要先做合理业务假设，再展开专业分析框架
- 每个页面必须讲清哪些关键洞察
- 观众看完该页后应做什么判断或动作
- 每个页面必须承接哪些数据内容
- 每个页面需要哪些内容块，第二步才能据此落成具体图表和版式

关键输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾。
- 不要使用 markdown 代码块、代码围栏，JSON 外不要有任何解释文字。
- 不要输出任何像素坐标、尺寸、布局数值、视觉风格细节。
- suggestedWidgets 不是“随便推荐几个组件”，而是这个页面必须包含的内容块清单，第二步会直接据此设计具体结构。

输出结构：
{
  "id": "唯一字符串 ID",
  "brief": "用户原始输入",
  "summary": "一句话概括该看板要达成什么目标",
  "audience": "这套看板主要给谁看（如管理层、运营团队、销售负责人）",
  "overallGoal": "这套看板最终帮助用户完成什么决策、汇报或监控目标",
  "inferredContext": {
    "industryTag": "energy|industrial|water|transport|port|tourism|government|agriculture|finance|sports-culture|campus|park|retail|ops-maintenance|generic",
    "industryHypothesis": "根据 brief 推断出的行业或业务场景；若用户未明确，需要主动合理补全",
    "businessModelGuess": "对该业务如何增长、成交、运营或履约的合理推断",
    "coreEntity": "本看板分析围绕的核心对象，如订单、客户、门店、渠道、项目、设备",
    "defaultSlices": ["时间", "区域", "渠道"],
    "defaultConcerns": ["增长是否健康", "哪里表现异常", "该优先处理什么"]
  },
  "visualBrief": {
    "audience": "与上方 audience 一致，但用更短、更适合视觉设计判断的表述",
    "overallGoal": "与上方 overallGoal 一致，但用更短、更适合视觉设计判断的表述",
    "tone": "executive|operational|analytical|command",
    "themeHint": "dark-tech|dark-business|light-clean|dark-executive|dark-data",
    "densityHint": "compact|balanced|spacious",
    "emphasis": "kpi-first|chart-first|narrative-first"
  },
  "dataStory": "阐述数据叙事逻辑——页面为何如此排序、观众从第一页到最后一页会经历怎样的故事线。需详细且有洞察力。",
  "pages": [
    {
      "name": "页面名称（如「销售总览」）",
      "storyRole": "该页在整体叙事中的角色（如封面总览、趋势诊断、渠道拆解、风险预警、行动建议）",
      "purpose": "该页面的核心目标是什么？回答什么问题？",
      "keyQuestion": "该页重点回答的一个核心业务问题",
      "analysisGoal": "overview|trend|comparison|composition|target-gap|ranking|diagnostic|risk",
      "analysisAngles": ["本页需要展开的分析角度1", "本页需要展开的分析角度2"],
      "mustInsights": ["本页必须讲清的洞察1", "本页必须讲清的洞察2"],
      "decisionAction": "观众看完本页后应采取的判断、动作或追问",
      "narrative": "该页应该向观众讲述的内容推进逻辑",
      "keyMetrics": ["指标1", "指标2", "维度1"],
      "primaryData": ["本页主要承接的数据主题1", "本页主要承接的数据主题2"],
      "filters": ["本页建议提供的筛选维度，如时间、区域、渠道；没有则输出空数组"],
      "suggestedWidgets": [
        {
          "type": "text|bar|line|pie|funnel|pixel|bullet|rank|table|waterfall|select|image",
          "role": "title|kpi|chart|filter|annotation|media",
          "analyticRole": "headline|evidence|diagnostic|detail|filter|annotation",
          "priority": "high|medium|low",
          "label": "该组件展示什么（如「主标题：公司名称」）",
          "dataDescription": "描述数据内容（如「按区域统计的月度销量，对比实际值与目标值」）",
          "rationale": "说明为什么这个内容块对本页是必要的"
        }
      ],
      "layoutIdea": "可选；仅在有明显信息层级需要提示时给出一句短描述"
    }
  ],
  "potentialNeeds": ["用户未提及但可能需要的需求", "..."],
  "recommendedTheme": "dark-tech|dark-business|light-clean|dark-executive|dark-data"
}

分析指南：
- 同时分析用户需求中的显性需求和隐性需求
- 当用户只给出大概方向时，主动补全该行业最常见的经营目标、分析维度、风险点、异常排查路径
- inferredContext.defaultSlices 和 inferredContext.defaultConcerns 都至少给出 3 项，宁可通用也不要过少
- 可以做合理假设，但必须保持通用、稳健、可复用，不要虚构特别具体的公司私有事实
- 根据主题复杂度规划 2-5 个页面
- 第一页只负责宏观规划，不负责具体坐标和最终视觉
- 每个页面必须有清晰、独特、不可互相替代的目的
- 每个页面必须明确“要回答什么问题”，而不仅是列出几个图表名
- 每个页面必须先给出结论目标，再决定图表；如果没有 mustInsights，说明分析失败
- 每个页面至少要有 2 个分析角度，例如“趋势变化 + 结构拆解”或“结果表现 + 原因诊断”
- 优先把页面组织成“结论 headline -> 主证据 evidence -> 诊断/明细 diagnostic/detail -> 动作建议”结构
- dataStory 应是贯穿所有页面的叙事弧线，让第二步能理解为什么是这个顺序
- suggestedWidgets 必须覆盖本页所有必要内容块，高优先级内容块在第二步必须被落实成具体组件
- 当页面目标是 target-gap 时优先考虑 bullet；ranking 时优先考虑 rank；diagnostic / contribution 时优先考虑 waterfall；异常明细或问题清单时优先考虑 table
- 除非“占比结构”本身是核心问题，否则不要优先使用 pie
- 对于“总览页”，不要只放 1-2 个图；至少同时覆盖结果、趋势、结构或风险中的 3 类内容
- 对于“诊断页”，不要只停留在现象，必须继续下钻到渠道、区域、产品、人群、阶段等切片
- visualBrief 必须足够短，专门服务第三步视觉系统设计，不要写成长段解释
- 不要让 pages 之间信息重复；如果某页只是前一页的重复表达，就说明规划失败
- 识别 2-4 个用户可能未提及的潜在需求`,
      prompt: `分析以下数据可视化看板需求，生成结构化分析报告：

用户需求：${brief}

行业启发规则：
${industryPrompt.prompt}

请特别注意：
- 先定义页面规划，再定义每页必须承接的内容块
- 不要在这一步输出“页面上半部分/左侧 300px”之类的落版细节
- 先想“要得出什么判断”，再想“用什么组件表达”
- 如果 brief 很短，优先补全“行业分析框架”，而不是保守地少做内容
- 第二步将严格依赖你的 pages 和 suggestedWidgets 继续设计结构，因此输出必须可执行、不可空泛`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/analyze] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
