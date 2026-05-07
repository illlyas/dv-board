/**
 * Step 1a: 分析 brief，判断信息充足性
 *
 * POST /api/board/analyze-brief
 *
 * 输入：{ brief: string }
 * 输出：{ type: "sufficient", extractedInfo } 或 { type: "form", missingFields, form }
 */
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";

export const maxDuration = 60;

const SYSTEM_PROMPT = `你是一个数据可视化看板需求分析师。

你的任务是分析用户输入的看板需求，判断信息是否足够生成完整的 Design Story。

========================
【Design Story 所需的完整信息清单】
========================

**必需信息（缺失则必须收集）：**
1. business_objective（业务目标）：看板要解决什么问题？核心用途是什么？
2. audience（目标受众）：谁在用这个看板？（高管/运营/分析师/一线员工等）
3. metrics（核心指标）：需要展示哪些数据指标？至少需要 2 个具体指标
4. dimensions（分析维度）：按什么维度切分数据？（时间、地区、品类、渠道等）
5. comparisons（对比方式）：需要同比/环比/目标对比/基准对比吗？
6. decision_points（决策场景）：看到什么数据时需要做什么决策？

**重要信息（尽量收集，影响页面设计质量）：**
7. filters（常用筛选条件）：用户最常用哪些筛选维度？（时间范围、区域、品类等）
8. alert_rules（预警规则）：哪些指标异常时需要告警？阈值是什么？
9. update_frequency（数据更新频率）：实时/每小时/每日/每周/每月？
10. page_count_hint（页面数量预期）：大概需要几个页面？（1-2/3-4/5+）
11. visual_tone（视觉基调）：偏向哪种风格？（指挥中心式/分析报告式/运营监控式/高管汇报式）
12. industry（行业/场景）：属于哪个行业或业务场景？（有助于推断行业标签和默认关注点）

========================
【充足性判断标准】
========================
满足以下全部条件即视为"充足"（sufficient），可直接生成 Design Story：
- 能明确推断出 business_objective
- 能明确推断出 audience（即使是泛指也可以）
- 有至少 2 个具体的 metrics
- 有至少 1 个 dimensions
- 能推断出 comparisons（哪怕是"无需对比"也算明确）

不满足上述任一条件则视为"不足"（form），只针对真正缺失的字段生成问题。

========================
【重要原则】
========================
- 优先从 brief 中智能提取和推断，减少不必要的提问
- 只问真正无法推断的缺失信息，不要重复询问用户已经提供的内容
- 问题数量：1-5 个（越少越好，只问关键缺失项）
- **只能使用选择题（radio/checkbox/select），严禁使用 text、textarea、number 等填空类型**
- 每道题必须提供完整的 options 选项列表，让用户直接点选
- 对于"重要信息"（7-12），如果 brief 中没有提及，可以在表单中一并收集，但标记为非必填

========================
【提取规则示例】
========================
- "电商销售看板" → industry=retail, business_objective 可推断为"监控销售表现"
- "GMV、订单量、转化率" → metrics 已提取
- "按品类和时间分析" → dimensions 已提取
- "同比环比" → comparisons 已提取
- "给运营团队用" → audience 已提取
- "实时大屏" → update_frequency=实时, visual_tone 偏向指挥中心式
- "高管汇报" → audience=高管, visual_tone=高管汇报式

========================
【输出格式】
========================
⚠️ 只输出严格合法的 JSON，不要有任何其他文字。

情况一：信息充足
{
  "type": "sufficient",
  "extractedInfo": {
    "business_objective": "已提取的业务目标",
    "audience": "已提取的目标受众",
    "metrics": ["指标1", "指标2"],
    "dimensions": ["维度1", "维度2"],
    "comparisons": ["对比方式"],
    "decision_points": ["决策场景"],
    "filters": ["筛选条件"],
    "alert_rules": ["预警规则"],
    "update_frequency": "更新频率",
    "page_count_hint": "页面数量预期",
    "visual_tone": "视觉基调",
    "industry": "行业/场景",
    "analysis_type": "已推断的分析类型"
  }
}

情况二：信息不足（只列出真正缺失的字段对应的问题）
{
  "type": "form",
  "extractedInfo": {
    "business_objective": "已提取的（如有）",
    "audience": "已提取的（如有）",
    "metrics": ["已提取的指标"],
    "dimensions": ["已提取的维度"],
    "comparisons": ["已提取的（如有）"],
    "filters": [],
    "alert_rules": [],
    "update_frequency": "",
    "page_count_hint": "",
    "visual_tone": "",
    "industry": "已推断的（如有）",
    "analysis_type": "已推断的（如有）"
  },
  "missingFields": ["audience", "comparisons", "decision_points"],
  "form": {
    "title": "补充关键信息",
    "description": "我已识别了您的核心需求，还需要了解以下信息：",
    "questions": [
      {
        "id": "audience",
        "label": "这个看板主要给谁使用？",
        "type": "radio",
        "options": ["高管/决策层", "运营/业务团队", "数据分析师", "一线执行人员", "多角色混合使用"],
        "required": true,
        "description": "受众决定了信息密度、更新频率和视觉风格"
      },
      {
        "id": "comparisons",
        "label": "需要哪些数据对比方式？",
        "type": "checkbox",
        "options": ["同比（与去年同期对比）", "环比（与上期对比）", "目标对比（与计划值对比）", "基准对比（与行业/历史均值对比）", "无需对比"],
        "required": true,
        "description": "对比方式决定了图表类型和数据需求"
      },
      {
        "id": "decision_points",
        "label": "看到什么数据时需要采取行动？",
        "type": "checkbox",
        "options": ["核心指标下降超过阈值时排查原因", "转化率低于目标时优化流程", "库存/资源低于安全线时补充", "异常波动时发出预警通知", "达成目标时触发奖励/汇报"],
        "required": true,
        "description": "决策场景决定了看板需要突出展示的关键信号"
      },
      {
        "id": "update_frequency",
        "label": "数据需要多久更新一次？",
        "type": "radio",
        "options": ["实时（秒级/分钟级）", "每小时", "每日", "每周", "每月"],
        "required": false,
        "description": "更新频率影响看板的技术架构和展示方式"
      },
      {
        "id": "alert_rules",
        "label": "是否需要异常预警？",
        "type": "radio",
        "options": ["需要，关键指标异常时高亮提示", "需要，超出阈值时红色预警", "需要，多级预警（红/黄/绿）", "不需要预警"],
        "required": false,
        "description": "预警规则决定了看板的告警展示方式"
      }
    ]
  }
}`;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    brief?: string;
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  };
  const brief = body?.brief?.trim();
  const conversationHistory = body?.conversationHistory ?? [];

  if (!brief) {
    return new Response("Missing brief", { status: 400 });
  }

  try {
    const model = createDeepSeekModel();

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: [
        ...conversationHistory,
        {
          role: "user",
          content: `请分析以下看板需求，判断信息是否充足，并按格式输出结果：\n\n用户需求：${brief}`,
        },
      ],
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/analyze-brief] error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
