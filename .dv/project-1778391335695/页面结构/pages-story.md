# 智慧工厂生产运营看板 — 页面结构设计

## 看板概览

- **行业标签**：industrial
- **核心实体**：设备、产线、产品
- **目标受众**：生产厂长、车间主任、设备运维工程师、质量管理人员、能源调度员
- **整体目标**：通过实时可视化监控，提升工厂整体设备效率与产品质量，降低能耗与故障率，实现生产全链路透明化
- **视觉基调**：command
- **推荐主题**：dark-executive（契合深色模式及大屏监控场景）
- **布局密度**：balanced
- **内容重点**：kpi-first（首页以 KPI 为先导，后续页面以图表驱动分析）

## 数据故事线

看板从整体运营概览切入，通过 OEE、产出率与订单完成率呈现工厂“健康度”；当任何指标偏离目标时，引导用户下钻至产线/设备层，结合良品率与故障率定位问题根因；最后通过能耗与自动化控制数据，辅助管理者制定全局节能与设备维护策略，形成“监控→诊断→优化”的闭环叙事。

## 默认分析切片

- **时间维度**：小时、班次（早/中/晚）、日、周、月
- **业务维度1**：产线/工位
- **业务维度2**：设备类型（机器人、数控机床、传送带、AGV）
- **业务维度3**：产品类型 / SKU
- **业务维度4**：车间/厂区
- **业务维度5**：物料批次

## 核心关注点

- 设备综合效率（OEE）是否达到目标（≥85%）
- 生产线产出率是否持续达标
- 产品良品率是否低于预警阈值（95%）
- 设备故障率是否超过 5%（触发维修工单）
- 能耗是否超出行业基准 10%（需调整）
- 订单完成率是否接近截止时间且低于 80%
- 自动化控制率是否稳定

---

## 页面设计

### P1 总览·核心指标

- **故事角色**：总览
- **核心问题**：工厂当前整体运营状态是否健康？哪些核心指标亮红灯？
- **分析目标**：overview
- **分析角度**：整体趋势、达标情况、实时异常
- **必现洞察**：OEE 当前值及与目标差距；产出率是否连续 2 个班次下滑；订单完成率是否低于 80% 且临近截止
- **决策行动**：若 OEE<70% 或故障率>5%，立即触发维修工单；若订单完成率低，调度调整生产顺序
- **核心指标**：m_oee、m_output_rate、m_yield_rate、m_order_completion、m_failure_rate
- **数据维度**：时间、车间/厂区
- **筛选器**：DateRangePicker（日期范围选择器）、Select（班次选择）
- **主视觉组件**：★ 3 LineChart（实时 OEE 与产出率趋势）
- **页面叙事**：页面顶部以 KPI 卡片展示五项核心指标及各自趋势 sparkline，让用户一眼掌握全局健康度；左侧主视觉区域展示 OEE 与产出率随小时滚动的双轴折线图，辅以目标线标注；右下方展示故障率排行榜与订单完成率环形图，快速定位需干预的异常点。

**组件清单**：

| 序号 | 主视觉 | 组件标签 | 类型 | 分析角色 | 优先级 | 数据说明 | 设计理由 |
|------|--------|---------|------|---------|--------|---------|---------|
| 1 | | 标题 | text | headline | high | 智慧工厂 · 运营总览 | 页面标题与结论引导 |
| 2 | | OEE 卡片 | pixel | headline | high | metricId=m_oee; layout=header-inline; surface=card; miniChart.seriesKey=spark_oee | 核心 KPI，带 sparkline 展示趋势 |
| 3 | | 产出率卡片 | pixel | headline | high | metricId=m_output_rate; layout=classic; surface=card; miniChart.seriesKey=spark_output | 单位时间产出，同比显示 |
| 4 | | 良品率卡片 | pixel | headline | high | metricId=m_yield_rate; layout=classic; surface=card; miniChart.seriesKey=spark_yield | 质量核心指标，带目标对比 |
| 5 | | 订单完成率卡片 | pixel | headline | high | metricId=m_order_completion; layout=classic; surface=card; miniChart.seriesKey=spark_order | 实时交付监控 |
| 6 | | 故障率卡片 | pixel | headline | high | metricId=m_failure_rate; layout=classic; surface=card; miniChart.seriesKey=spark_failure | 异常预警先行指标 |
| 7 | ★ | OEE & 产出率趋势 | LineChart | evidence | high | x=时间(小时), y1=m_oee, y2=m_output_rate, 叠加目标线 | 主视觉，展示核心指标波动趋势与达标情况 |
| 8 | | 设备故障率 Top5 | BarChart | diagnostic | high | x=设备ID, y=m_failure_rate, 排序 | 快速定位高故障设备 |
| 9 | | 订单完成率分布 | DonutChart | evidence | medium | m_order_completion 完成/未完成比例 | 辅助呈现订单完成情况 |
| 10 | | 实时告警列表 | Table | diagnostic | high | 字段：时间、设备、指标、级别、状态 | 明细告警，支撑决策 |

**说明**：图表/表类组件共 4 个（LineChart、BarChart、DonutChart、Table），外加 5 个 Ki 卡（pixel）和 1 个 text。每页图表/表类至少 5 个的要求：此处 4 个，但加上后续页面可增加。谨慎考虑：本页主表已 4 个，加上“故障率排行榜”也是一个 BarChart（已计）。实际上 7-10 四个图表/表类，满足 ≥5 吗？是 4 个。我们需要增加一个辅助图。建议增加一个“良品率按车间对比”BarChart（左/中栏小图）或“能耗对比”BarChart。但能耗在P3。在总览页增加一个“各车间产出率对比”横向 BarChart。这样图表类达到5个。调整后清单如下（保持序号统一）：

| 序号 | 主视觉 | 组件标签 | 类型 | 分析角色 | 优先级 | 数据说明 | 设计理由 |
|------|--------|---------|------|---------|--------|---------|---------|
| 1 | | 标题 | text | headline | high | 智慧工厂 · 运营总览 | 页面标题与结论引导 |
| 2 | | OEE 卡片 | pixel | headline | high | metricId=m_oee; layout=header-inline; surface=card; miniChart.seriesKey=spark_oee | 核心 KPI，带 sparkline 展示趋势 |
| 3 | | 产出率卡片 | pixel | headline | high | metricId=m_output_rate; layout=classic; surface=card; miniChart.seriesKey=spark_output | 单位时间产出，同比显示 |
| 4 | | 良品率卡片 | pixel | headline | high | metricId=m_yield_rate; layout=classic; surface=card; miniChart.seriesKey=spark_yield | 质量核心指标，带目标对比 |
| 5 | | 订单完成率卡片 | pixel | headline | high | metricId=m_order_completion; layout=classic; surface=card; miniChart.seriesKey=spark_order | 实时交付监控 |
| 6 | | 故障率卡片 | pixel | headline | high | metricId=m_failure_rate; layout=classic; surface=card; miniChart.seriesKey=spark_failure | 异常预警先行指标 |
| 7 | ★ | OEE & 产出率趋势 | LineChart | evidence | high | x=时间(小时), y1=m_oee, y2=m_output_rate, 叠加目标线 | 主视觉，展示核心指标波动趋势与达标情况 |
| 8 | | 设备故障率 Top5 | BarChart | diagnostic | high | x=设备ID, y=m_failure_rate, 排序 | 快速定位高故障设备 |
| 9 | | 订单完成率分布 | DonutChart | evidence | medium | m_order_completion 完成/未完成比例 | 辅助呈现订单完成情况 |
| 10 | | 各车间产出率对比 | BarChart | evidence | medium | x=车间, y=m_output_rate | 横向对比不同车间产出能力 |
| 11 | | 实时告警列表 | Table | diagnostic | high | 字段：时间、设备、指标、级别、状态 | 明细告警，支撑决策 |

图表/表类：7(L)、8(B)、9(D)、10(B)、11(T) → 5个，满足。

---

### P2 详情·产线与质量

- **故事角色**：分析
- **核心问题**：哪些产线或工位是效率瓶颈？哪些产品类型良品率最低？
- **分析目标**：composition / ranking
- **分析角度**：产线产出对比、工位瓶颈、产品质量分布、设备故障分组
- **必现洞察**：产出率最低的产线与工位；良品率低于95%的产品类型；故障率最高的10台设备
- **决策行动**：调度 IE 工程师分析瓶颈工位，调整节拍；锁止低良品率产品批次发起质量追溯
- **核心指标**：m_output_rate、m_yield_rate、m_failure_rate
- **数据维度**：产线/工位、产品类型、设备类型
- **筛选器**：Select（产线选择）、MultiSelect（产品类型）、DateRangePicker
- **主视觉组件**：★ 8 BarChart（各产线产出率排名）
- **页面叙事**：左侧核心区域展示各产线的产出率横向柱状图，直观比较效率高低；中栏使用堆积柱状图展示各产线下工位的良品率构成，辅以目标线；右栏展示设备故障率排行榜（按产线分组）与产品类型良品率散点图，帮助快速锁定质量薄弱环节。

**组件清单**：

| 序号 | 主视觉 | 组件标签 | 类型 | 分析角色 | 优先级 | 数据说明 | 设计理由 |
|------|--------|---------|------|---------|--------|---------|---------|
| 1 | | 标题 | text | headline | high | 产线与质量分析 | 页面标题 |
| 2 | | 产出率卡片 | pixel | headline | high | metricId=m_output_rate; layout=classic; surface=card; miniChart.seriesKey=spark_output | 页面上方展示整体产出率 |
| 3 | | 良品率卡片 | pixel | headline | high | metricId=m_yield_rate; layout=classic; surface=card; miniChart.seriesKey=spark_yield | 页面上方展示整体良品率 |
| 4 | | 故障率卡片 | pixel | headline | high | metricId=m_failure_rate; layout=classic; surface=card; miniChart.seriesKey=spark_failure | 页面上方展示整体故障率 |
| 5 | | 产线选择 | Select | filter | high | 选项：所有产线（默认） | 筛选特定产线下钻 |
| 6 | | 产品类型多选 | MultiSelect | filter | medium | 选项：所有产品类型 | 筛选产品类型对比 |
| 7 | | 各工位产出率分布 | BarChart | evidence | high | x=工位ID, y=m_output_rate, 分组=产线 | 展示工位级别产出效率差异 |
| 8 | ★ | 各产线产出率排名 | BarChart | evidence | high | x=产线名, y=m_output_rate, 排序降序 | 主视觉，突出效率高低 |
| 9 | | 良品率 vs 产出率散点图 | BarChart（散点） | diagnostic | medium | x=m_output_rate, y=m_yield_rate, 分组=产线 | 识别高产出低良品率的异常产线 |
| 10 | | 设备故障率排行榜 | BarChart | diagnostic | high | x=设备ID, y=m_failure_rate, 排序降序 | 快速定位高故障设备 |
| 11 | | 产品类型良品率对比 | BarChart | evidence | high | x=产品类型, y=m_yield_rate, 含目标线 | 展示不同产品良品率差异 |
| 12 | | 物料批次质量明细 | Table | detail | medium | 字段：批次号、产品类型、产线、良品率、时间 | 支撑质量追溯 |

图表/表类：序号7(B)、8★(B)、9(B)、10(B)、11(B)、12(T) → 6个，满足。

---

### P3 诊断·能耗与设备运维

- **故事角色**：诊断
- **核心问题**：能耗是否异常？自动化控制率是否稳定？设备健康度如何？
- **分析目标**：target-gap / trend / diagnostic
- **分析角度**：能耗趋势与基准对比、自动化率变化、设备健康评分、物料批次追溯
- **必现洞察**：单位能耗是否超过行业基准10%；自动化控制率环比下滑；设备健康度评分低于60分的设备清单
- **决策行动**：若能耗超标启动节能策略（调整自动启停）；自动生成预防性维护工单；锁止低良品率物料批次
- **核心指标**：m_energy、m_auto_control、m_failure_rate
- **数据维度**：车间/厂区、设备类型、物料批次、班次
- **筛选器**：Select（车间选择）、DateRangePicker、Select（设备类型）
- **主视觉组件**：★ 7 AreaChart（能耗趋势与基准对比）
- **页面叙事**：左侧核心区域展示能耗按车间/班次的面积图，叠加行业基准线，清晰反映超标时段；中栏展示自动化控制率折线图与设备健康度评分排行榜；右栏提供物料批次质量追溯表，便于追溯不良品源头，形成诊断闭环。

**组件清单**：

| 序号 | 主视觉 | 组件标签 | 类型 | 分析角色 | 优先级 | 数据说明 | 设计理由 |
|------|--------|---------|------|---------|--------|---------|---------|
| 1 | | 标题 | text | headline | high | 能耗与设备运维诊断 | 页面标题 |
| 2 | | 能耗卡片 | pixel | headline | high | metricId=m_energy; layout=classic; surface=card; miniChart.seriesKey=spark_energy | 展示当前能耗值及趋势 |
| 3 | | 自动化控制率卡片 | pixel | headline | high | metricId=m_auto_control; layout=header-inline; surface=card; miniChart.seriesKey=spark_auto | 自动化水平概览 |
| 4 | | 故障率卡片 | pixel | headline | high | metricId=m_failure_rate; layout=classic; surface=card; miniChart.seriesKey=spark_failure | 设备故障整体情况 |
| 5 | | 车间选择 | Select | filter | high | 选项：所有车间（默认） | 筛选车间数据 |
| 6 | | 设备类型选择 | Select | filter | medium | 选项：机器人、数控机床、传送带、AGV | 按设备类型下钻 |
| 7 | ★ | 能耗按车间趋势与基准 | AreaChart | evidence | high | x=时间(日), y=m_energy, 分组=车间, 叠加基准线 | 主视觉，展示能耗波动与超标情况 |
| 8 | | 自动化控制率趋势 | LineChart | evidence | medium | x=时间(日), y=m_auto_control, 含目标线 | 监控自动化稳定性 |
| 9 | | 设备健康度评分排行榜 | BarChart | diagnostic | high | x=设备ID, y=健康评分(0-100), 排序升序 | 快速定位需维护的设备 |
| 10 | | 单位能耗环比下降率 | BarChart | evidence | medium | x=车间, y=环比变化率, 正负区分 | 识别节能改进效果 |
| 11 | | 物料批次质量追溯表 | Table | detail | high | 字段：批次号、产品类型、产线、良品率、故障记录、时间 | 支持质量回溯 |

图表/表类：7★(A)、8(L)、9(B)、10(B)、11(T) → 5个，满足。

---

## 潜在扩展需求

- **设备实时拓扑图**：在已实现总览中，可替代或补充“实时告警列表”位置，展示产线设备状态（绿/黄/红）及连接关系，增强监控直观性。
- **订单生产进度甘特图**：在详情页增加按订单维度的生产进度甘特图，支撑交期调整决策。
- **移动端/平板适配简报**：当前设计针对 2560×1080 带鱼屏，未来可考虑生成精简版移动看板，仅展示关键 KPI 与告警。
- **语音播报告警**：集成语音合成功能，在触发关键告警（如 OEE<60%）时自动播报，提升响应速度。
- **AI 智能诊断**：在诊断页集成机器学习模型，自动给出故障根因推荐（如“产线 A 工位 X 刀具磨损导致故障率上升”）。