import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { boardStructureSchemaPrompt } from "@/lib/structure-schema";

export const maxDuration = 120;

/**
 * 节点 2：页面结构
 * 输入：brief + AnalysisReport（节点1的分析结果）
 * 输出：BoardStructure（完整布局坐标，但 layoutStyle 不含视觉属性）
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { brief?: string; analysis?: unknown };
  const brief = body?.brief?.trim();
  const analysis = body?.analysis;

  if (!brief) return new Response("Missing brief", { status: 400 });

  try {
    const model = createDeepSeekModel();
    const analysisText = typeof analysis === "object" ? JSON.stringify(analysis, null, 2) : String(analysis ?? "");
    const outputSchemaText = boardStructureSchemaPrompt;

    const result = streamText({
      model,
      system: `你是一位资深看板信息架构师。
你的职责是把第一页输出的“页面简报”翻译成真正可渲染的页面结构。
最终产物必须更像专业数据报告页，而不是平均分配空间的图表拼盘。
你必须先完成页面分区，再在每个分区里布置组件。

承接原则：
- 第一页负责定义页面顺序、页面目的、关键问题、主要数据内容和必须出现的内容块
- 你负责把这些内容块落成具体组件、分组结构和页面布局
- 你不能跳过第一页的意图直接自由发挥，也不能把第一页的宏观规划原样抄一遍了事
- 每个页面都必须围绕该页的 keyQuestion / narrative / primaryData 来组织结构
- 每个页面都必须把 mustInsights 和 decisionAction 落成可见内容，而不是只画图不下判断
- 如果分析报告里已有 inferredContext.industryTag，优先按该行业常见汇报逻辑组织页面结构
- 页面中的 section 组件表示“区域块/内容分区”，负责划出空间、建立层级、承接二级标题
- 页面中的 divider 组件表示“分割线/分隔带”，用于大区块边界、面板标题与内容之间的层次分隔、左右区域之间的视觉断开

关键输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾。
- 不要使用 markdown 代码块、代码围栏，JSON 外不要有任何解释文字。
- 输出必须严格符合下方给出的 JSON Schema。
- 本步骤仅生成布局结构——不包含任何视觉样式（无圆角、颜色、阴影）。
- 只输出当前结构阶段真正需要的字段，不要添加额外元数据。
- 不要在 layoutStyle 中包含 borderRadius、borderWidth、borderColor、borderStyle、backgroundColor、boxShadow 或 opacity。

输出 JSON Schema：
${outputSchemaText}`,
      prompt: `根据以下需求分析，生成完整的页面结构（布局坐标和组件类型，但不包含边框/颜色/阴影等视觉样式）。

用户需求：${brief}

第一步分析报告：
${analysisText}

要求：
- 页面数量必须与分析报告中的规划完全一致
- 页面顺序、页面名称、页面 purpose 必须与分析报告一致
- 每个页面都必须首先理解该页的 storyRole、keyQuestion、analysisGoal、analysisAngles、mustInsights、decisionAction、narrative、primaryData，再决定具体组件组合
- 先划分 2-5 个区域块 section，再决定每个区域块里放哪些组件；不要先想组件，再随手平铺
- 需要时主动加入 divider；不要把所有层次都依赖留白或面板边框来表达
- 每个页面的组件应与该页的 suggestedWidgets 一一对应；high 优先级内容块必须全部落地，medium/low 可在不影响叙事的前提下合并或从简
- 如果第一页给出了 filters，则应优先将其落成 select 组件或对应的筛选控件
- 不要只凭 widget type 堆组件；每个组件都必须服务于该页的业务问题和叙事顺序
- 所有图表组件（bar/line/pie/funnel/waterfall）都必须提供明确的 title；title 需要直接说明图表在看什么，不能只是“趋势图”“分析图”“占比图”
- 所有图表组件都必须提供 iconHint，用于表达行业或指标语义，例如“销售额”“客流”“能耗”“告警”“产能”“吞吐量”“风险敞口”
- 每个页面必须至少包含 1 个 headline 文本组件，用一句话明确结论或观察，不允许只有标题没有判断
- 每个页面必须形成“headline -> evidence -> diagnostic/detail”阅读链路；如果只有同层级图表并排，说明设计失败
- 每个页面默认应达到“丰富但可读”的信息密度：通常不少于 4 个组件；总览/诊断页通常不少于 6 个组件，除非分析报告明确是 single-focus 页面
- 如果用户 brief 很模糊，优先依据 inferredContext.defaultSlices 和 defaultConcerns 扩展页面内容，而不是缩减内容
- analysisAngles 中的每个角度都应被至少一个组件承接；不能只写在分析报告里不落地
- 相同主题或同一指标族的组件应优先归入同一个 section，例如“销售额相关”“利润与成本相关”“设备告警相关”
- section 必须拥有明确的空间边界，且应优先作为背景层节点出现在同区域内容组件之前
- divider 可以是 horizontal 或 vertical；当区域之间需要明显边界、标题下方需要层次分隔、主次信息需要断开时应优先使用
- section 可以采用多种空间组织方式，例如 L 型、中心主舞台 + 两侧辅区、左上摘要 + 右侧主图 + 底部诊断、双岛布局、非对称拼接；不要默认使用从左到右从上到下的 Z 字排布
- 页面应有明确主舞台：最关键的指标或主证据图通常占据中央、偏右中或视觉焦点区域，其余组件围绕其组织
- 同一页面中的不同 section 尺寸不必平均，必须依据重要性分配空间
- KPI 若出现，优先使用 bullet 或 pixel，并且必须体现至少一种对比基准：目标、上期、同比、排名之一
- 若 analysisGoal 是 ranking，优先使用 rank；若是 target-gap，优先使用 bullet；若是 diagnostic，优先使用 waterfall 或 table；若是 risk，必须出现异常明细或风险清单
- table 应承接异常明细、TOP 问题项、待跟进对象；waterfall 应承接驱动拆解、贡献度变化、增减原因
- 除非 keyQuestion 真的是看占比结构，否则不要用 pie 充当主图
- 图表标题应与所在 section 的主题一致；如果 section 在讲“销售额相关”，图表标题就应具体到“销售额月度趋势”“销售额区域对比”“销售额驱动拆解”
- 当页面是总览页时，优先覆盖“结果现状 + 趋势变化 + 结构切片 + 风险提示”中的至少 3 类
- 当页面是诊断页时，优先覆盖“现象 + 原因拆解 + 异常明细/对象清单”三层
- 能源/工业/运维类页面优先补充设备、站点、告警、效率与异常对象
- 交通/港口/水利类页面优先补充区域、线路/站点、时段、调度/吞吐/水位与异常点
- 文旅/零售/文体类页面优先补充客流、收入、渠道、项目/品类热度与异常清单
- 政务/校园/园区类页面优先补充部门/校区/楼宇对比、服务效率、积压问题与待办对象
- 金融/农业类页面优先补充客户/产品/地块结构、收益或产量驱动、风险点与重点对象明细
- 所有组件必须在 1920x1080 画布内排列，不得重叠
- 参考 layoutIdea 提示合理布局各组件，但如果 layoutIdea 与 keyQuestion/narrative 冲突，应优先保证信息层级清晰
- 页面内部应有明确阅读顺序：标题/结论 -> 核心指标 -> 主图 -> 辅助图/解释/筛选
- section 通常应覆盖一个完整内容区域，可包含：二级标题、摘要指标、主图、辅助图、明细表中的一种或多种
- 每个页面至少应有 2 个以上 section；复杂页面通常 3-4 个 section 更合理
- 当一个 section 内部同时有“二级标题 + 多个内容组件”时，可在标题下方加入一条 horizontal divider
- 当左右两块内容并列且主题差异明显时，可在中间加入 vertical divider 增强区域感
- 所有 ID 在整个文档内必须唯一
- currentPageId 必须是某个页面的 ID
- 图表配置中需包含合理的模拟数据，而且数据之间要能支撑洞察，例如目标差值、排名变化、拆解贡献、异常行
- 不要输出 baseNodeMap、eventRules、usedExtensions、showRulers、lockGuides、variableMap、guideLines 等无关字段
- 仅输出 JSON 对象，不要输出任何其他内容`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/structure] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
