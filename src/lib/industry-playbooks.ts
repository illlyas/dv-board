export type IndustryTag =
  | "energy"
  | "industrial"
  | "water"
  | "transport"
  | "port"
  | "tourism"
  | "government"
  | "agriculture"
  | "finance"
  | "sports-culture"
  | "campus"
  | "park"
  | "retail"
  | "ops-maintenance"
  | "generic";

type IndustryPlaybook = {
  tag: IndustryTag;
  label: string;
  keywords: string[];
  promptHint: string;
};

const PLAYBOOKS: IndustryPlaybook[] = [
  {
    tag: "energy",
    label: "能源",
    keywords: ["能源", "电力", "光伏", "风电", "储能", "煤电", "燃气", "发电", "售电", "新能源"],
    promptHint: "能源类默认关注供给能力、负荷/发电趋势、设备可用率、成本与能耗、区域站点差异、告警与安全风险。",
  },
  {
    tag: "industrial",
    label: "工业",
    keywords: ["工业", "制造", "工厂", "产线", "车间", "产能", "良率", "设备稼动", "生产"],
    promptHint: "工业类默认关注产能达成、良率与报废、工序瓶颈、设备稼动、班组/产线对比、异常工单与停机原因。",
  },
  {
    tag: "water",
    label: "水利",
    keywords: ["水利", "水务", "供水", "排水", "水库", "泵站", "河道", "流域", "水位", "水资源"],
    promptHint: "水利类默认关注水量水位趋势、供排平衡、区域站点差异、设备运行、预警阈值、异常断面或泵站明细。",
  },
  {
    tag: "transport",
    label: "交通",
    keywords: ["交通", "公交", "地铁", "铁路", "高速", "客流", "路网", "出行", "车流", "运输"],
    promptHint: "交通类默认关注客货运规模、时段趋势、线路/区域拥堵或运力差异、准点率、异常事件与调度优化方向。",
  },
  {
    tag: "port",
    label: "港口",
    keywords: ["港口", "码头", "航运", "吞吐量", "集装箱", "船舶", "泊位", "堆场"],
    promptHint: "港口类默认关注吞吐量、船舶周转、泊位效率、堆场利用率、航线/客户结构、延误与异常作业明细。",
  },
  {
    tag: "tourism",
    label: "文旅",
    keywords: ["文旅", "景区", "旅游", "游客", "票务", "酒店", "客流", "消费", "演艺"],
    promptHint: "文旅类默认关注游客量与收入、渠道来源、时段波峰波谷、景点/项目热度、转化效率、投诉或异常服务点。",
  },
  {
    tag: "government",
    label: "政务",
    keywords: ["政务", "政府", "治理", "民生", "审批", "服务事项", "热线", "监管", "城市运行"],
    promptHint: "政务类默认关注事项规模、办理效率、区域部门对比、热点诉求、风险预警、待办积压和治理成效。",
  },
  {
    tag: "agriculture",
    label: "农业",
    keywords: ["农业", "种植", "养殖", "农田", "作物", "牧场", "农机", "产量", "灌溉"],
    promptHint: "农业类默认关注产量与投入、地块/品类对比、生长或养殖阶段趋势、气象与资源影响、病虫害/异常点明细。",
  },
  {
    tag: "finance",
    label: "金融",
    keywords: ["金融", "银行", "证券", "基金", "保险", "资产", "风控", "授信", "投顾"],
    promptHint: "金融类默认关注资产规模与收益、客户/产品结构、风险敞口、逾期或波动预警、渠道绩效、重点账户明细。",
  },
  {
    tag: "sports-culture",
    label: "文体",
    keywords: ["文体", "体育", "赛事", "场馆", "文化", "活动", "演出", "票房", "会员"],
    promptHint: "文体类默认关注活动规模、票务/收入、场次或项目热度、用户参与、资源利用率、异常场次与服务反馈。",
  },
  {
    tag: "campus",
    label: "校园",
    keywords: ["校园", "学校", "高校", "学生", "教师", "教学", "宿舍", "课堂", "校区"],
    promptHint: "校园类默认关注人员规模、教学/服务运行、院系或校区对比、资源利用率、安全与后勤事件、重点问题清单。",
  },
  {
    tag: "park",
    label: "园区",
    keywords: ["园区", "园区运营", "楼宇", "招商", "入驻", "物业", "空间", "企业服务"],
    promptHint: "园区类默认关注招商与入驻、出租与空间利用、企业服务、楼宇能耗与运维、客户分层、风险事项明细。",
  },
  {
    tag: "retail",
    label: "零售",
    keywords: ["零售", "门店", "商超", "商品", "sku", "会员", "客单", "销售额", "库存"],
    promptHint: "零售类默认关注销售与毛利、门店/品类/SKU 结构、客流转化、库存周转、促销效果、滞销和异常门店清单。",
  },
  {
    tag: "ops-maintenance",
    label: "运维",
    keywords: ["运维", "监控", "故障", "告警", "服务可用性", "工单", "SLA", "巡检", "系统运行"],
    promptHint: "运维类默认关注可用性、告警趋势、故障定位、服务/节点对比、工单闭环、风险等级和异常对象明细。",
  },
];

function normalizeBrief(brief: string) {
  return brief.trim().toLowerCase();
}

export function inferIndustryTag(brief: string): IndustryTag {
  const normalized = normalizeBrief(brief);
  const matched = PLAYBOOKS.find((item) => item.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())));
  return matched?.tag ?? "generic";
}

export function getIndustryPlaybook(tag: IndustryTag) {
  return PLAYBOOKS.find((item) => item.tag === tag);
}

export function buildIndustryPrompt(brief: string) {
  const tag = inferIndustryTag(brief);
  const playbook = getIndustryPlaybook(tag);

  if (!playbook) {
    return {
      tag,
      prompt: "通用行业默认关注结果表现、趋势变化、结构差异、目标偏差、异常对象和下一步行动建议。",
    };
  }

  return {
    tag,
    prompt: `识别行业标签：${playbook.label}（${playbook.tag}）。${playbook.promptHint}`,
  };
}
