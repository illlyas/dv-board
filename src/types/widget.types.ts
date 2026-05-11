/**
 * Widget 组件配置类型定义
 */

import type { CSSProperties } from "react";
import type { EChartsOption } from "echarts";

// ============================================================================
// 组件类型枚举
// ============================================================================

export type WidgetType =
  // 数据展示
  | "KPI"
  | "Metric"
  | "StatCard"
  
  // 图表
  | "LineChart"
  | "BarChart"
  | "PieChart"
  | "DonutChart"
  | "AreaChart"
  | "ScatterChart"
  | "RadarChart"
  | "GaugeChart"
  | "FunnelChart"
  
  // 表格和列表
  | "Table"
  | "List"
  | "Timeline"
  
  // 筛选器
  | "DateRangePicker"
  | "Select"
  | "MultiSelect"
  | "SearchInput"
  | "RadioGroup"
  | "CheckboxGroup"
  
  // 容器
  | "Card"
  | "Tabs"
  | "Collapse"
  
  // 其他
  | "Text"
  | "Title"
  | "Divider"
  | "Image"
  | "Map";

// ============================================================================
// 数据查询配置
// ============================================================================

export interface QueryConfig {
  /** 指标名称 */
  metric: string;
  
  /** 维度字段 */
  dimensions?: string[];
  
  /** 过滤条件 */
  filters?: Record<string, any>;
  
  /** 聚合方式 */
  aggregation?: "sum" | "avg" | "count" | "max" | "min";
  
  /** 时间范围 */
  timeRange?: string;
  
  /** 排序 */
  orderBy?: {
    field: string;
    order: "asc" | "desc";
  };
  
  /** 限制数量 */
  limit?: number;
}

// ============================================================================
// 基础 Widget 配置
// ============================================================================

export interface BaseWidgetProps {
  /** 标题 */
  title?: string;
  
  /** 副标题 */
  subtitle?: string;

  /** 是否在标题区背后叠加大屏标题条装饰 SVG（如 VI 演示看板） */
  titleBackdrop?: boolean;
  
  /** 描述 */
  description?: string;
  
  /** 图标 */
  icon?: string;
  
  /** 自定义样式 */
  style?: CSSProperties;
  
  /** 自定义类名 */
  className?: string;
  
  /** 是否显示加载状态 */
  loading?: boolean;
  
  /** 是否显示边框 */
  bordered?: boolean;
  
  /** 是否显示阴影 */
  shadow?: boolean;
  
  // ============ 配色相关 ============
  
  /** 背景颜色 */
  backgroundColor?: string;
  
  /** 背景渐变（优先级高于 backgroundColor） */
  backgroundGradient?: string | [string, string];
  
  /** 文字颜色 */
  textColor?: string;
  
  /** 标题颜色 */
  titleColor?: string;
  
  /** 副标题颜色 */
  subtitleColor?: string;
  
  /** 边框颜色 */
  borderColor?: string;
  
  /** 图标颜色 */
  iconColor?: string;
  
  /** 主题模式（影响默认颜色） */
  theme?: "light" | "dark";

  /** 预览用 store 槽位 id（建议 p{页码}.xxx，全局唯一） */
  dataSlotId?: string;

  /** 所在分页；缺省从 dataSlotId 的 p{n}. 前缀解析 */
  pageIndex?: number;
}

// ============================================================================
// 数据绑定配置
// ============================================================================

export interface DataBinding {
  /** 数据键（从全局数据源获取） */
  dataKey?: string;
  
  /** 数据源函数名 */
  dataSource?: string;
  
  /** 查询配置 */
  query?: QueryConfig;
  
  /** 静态数据 */
  staticData?: any;
}

// ============================================================================
// KPI 组件配置
// ============================================================================

/** L5 微型图（KPI 内 ECharts；数据取自 data[seriesKey]） */
export interface KPIMiniChartConfig {
  seriesKey: string;
  kind?: "line" | "bar";
  xField?: string;
  yField?: string;
  height?: number;
}

export interface KPIProps extends BaseWidgetProps, DataBinding {
  /**
   * 看板预设矢量图标（与 `BoardPresetIcon`、`src/components/dv-assets/kpi-preset-icons` 内联 SVG 一致）。
   * 优先使用语义 id：`kpi-sync-refresh`、`kpi-analytics-bars`、`kpi-insight-badge`、`kpi-capsule`、`kpi-pharmacy`、`kpi-package`；
   * 仍兼容旧值 `preset-icon-1` … `preset-icon-6`。
   * 若设置则显示在卡片右上角；与 `icon` 字符串并存时 **以此为准**。
   */
  presetIconId?:
    | "kpi-sync-refresh"
    | "kpi-analytics-bars"
    | "kpi-insight-badge"
    | "kpi-capsule"
    | "kpi-pharmacy"
    | "kpi-package"
    | "preset-icon-1"
    | "preset-icon-2"
    | "preset-icon-3"
    | "preset-icon-4"
    | "preset-icon-5"
    | "preset-icon-6"
    | (string & {});

  /** 数值字段 */
  valueKey?: string;
  
  /** 单位 */
  unit?: string;
  
  /** 前缀 */
  prefix?: string;
  
  /** 后缀 */
  suffix?: string;
  
  /** 是否显示趋势 */
  trend?: boolean;
  
  /** 趋势方向 */
  trendDirection?: "up" | "down" | "flat";
  
  /** 趋势值 */
  trendValue?: string | number;
  
  /** 对比配置 */
  comparison?: {
    type: "yoy" | "mom" | "wow" | "target";
    label?: string;
    value?: string | number;
  };
  
  /** 数值格式化 */
  format?: "number" | "currency" | "percentage" | "decimal";
  
  /** 小数位数 */
  precision?: number;
  
  /** 颜色 */
  color?: string;
  
  /** 背景渐变 */
  gradient?: [string, string];

  /**
   * 呈现：表面形态与布局；主数值发光跟随主题 `--kpi-glow-base`（颜色），可用 valueGlow: off 关闭。
   */
  presentation?: {
    surface?: "none" | "card" | "hairline";
    layout?:
      | "classic"
      | "header-inline"
      | "sidebar-stack"
      | "pedestal-row"
      | "metric-group-inline";
    valueGlow?: "inherit" | "off";
  };

  /** 脚注文案；可被 data.footerText 覆盖 */
  footer?: string;

  /** 并列第二指标（数据取自 data[valueKey] 或 comparison） */
  secondaryStatistic?: {
    label: string;
    valueKey?: string;
    format?: "number" | "currency" | "percentage" | "decimal";
    precision?: number;
    prefix?: string;
    suffix?: string;
  };

  /** L5 微型序列（ECharts）；序列数据在 data[miniChart.seriesKey] */
  miniChart?: KPIMiniChartConfig;

  /**
   * 指标组：每项独立拉取数据（预览 mock 槽位为 `props.dataSlotId` + `.__` + `item.id`）；
   * 渲染仍按各条目的 valueKey 从对应 data 取值。
   */
  groupItems?: KPIWidgetGroupItem[];
}

/** 指标组内单项（与 KPIProps 配合；presetIconId 与 KPI 一致） */
export interface KPIWidgetGroupItem {
  id: string;
  title: string;
  subtitle?: string;
  valueKey: string;
  unit?: string;
  prefix?: string;
  suffix?: string;
  format?: "number" | "currency" | "percentage" | "decimal";
  precision?: number;
  presetIconId?: KPIProps["presetIconId"];
  trend?: boolean;
  trendDirection?: "up" | "down" | "flat";
  trendValue?: string | number;
  trendValueKey?: string;
  comparison?: {
    type: "yoy" | "mom" | "wow" | "target";
    label?: string;
    value?: string | number;
    valueKey?: string;
  };
  miniChart?: KPIMiniChartConfig;
}

// ============================================================================
// 图表通用配置
// ============================================================================

export interface ChartAxisConfig {
  /** 字段名 */
  field: string;
  
  /** 显示标签 */
  label?: string;
  
  /** 单位 */
  unit?: string;
  
  /** 格式化函数 */
  format?: string;
  
  /** 颜色 */
  color?: string;
}

export interface ChartCommonProps extends BaseWidgetProps, DataBinding {
  /** X 轴配置 */
  xAxis?: ChartAxisConfig | string;
  
  /** Y 轴配置 */
  yAxis?: ChartAxisConfig | ChartAxisConfig[] | string | string[];
  
  /** 是否显示图例 */
  showLegend?: boolean;
  
  /** 图例位置 */
  legendPosition?: "top" | "bottom" | "left" | "right";
  
  /** 是否显示网格 */
  showGrid?: boolean;
  
  /** 网格颜色 */
  gridColor?: string;
  
  /** 是否显示工具提示 */
  showTooltip?: boolean;
  
  /** 工具提示背景色 */
  tooltipBackgroundColor?: string;
  
  /** 工具提示文字颜色 */
  tooltipTextColor?: string;
  
  /** 颜色方案（图表系列颜色数组） */
  colorScheme?: string[];
  
  /** 单一颜色（所有系列使用同一颜色） */
  color?: string;
  
  /** 渐变配置（应用到图表系列） */
  gradient?: [string, string];
  
  /** 坐标轴颜色 */
  axisColor?: string;
  
  /** 坐标轴文字颜色 */
  axisTextColor?: string;
  
  /** 图例文字颜色 */
  legendTextColor?: string;
  
  /** 是否平滑曲线 */
  smooth?: boolean;
  
  /** 是否堆叠 */
  stack?: boolean;
  
  /** 是否显示数据标签 */
  showDataLabels?: boolean;
  
  /** 数据标签颜色 */
  dataLabelColor?: string;

  /**
   * 合并进 ECharts option（置于内置映射之后）；`series` 若为数组则按索引与内置 series 合并（保留内置 `data`）。
   * 画布内颜色请用 hex/rgb（可与 colorScheme 一致），勿写 var()。
   */
  echartsOptionOverrides?: EChartsOption;
}

// ============================================================================
// 折线图配置
// ============================================================================

export interface LineChartProps extends ChartCommonProps {
  /**
   * 多条 `yAxis` 配置时使用多个 ECharts 数值轴（如左右 Y 轴、不同量纲）。
   * 未设置时：若 `echartsOptionOverrides.series` 中某条含 `yAxisIndex >= 1` 也会自动启用。
   */
  dualYAxis?: boolean;

  /** 是否填充区域 */
  area?: boolean;
  
  /** 线条宽度 */
  lineWidth?: number;
  
  /** 点的大小 */
  pointSize?: number;
  
  /** 是否显示点 */
  showPoints?: boolean;
}

// ============================================================================
// 柱状图配置
// ============================================================================

export interface BarChartProps extends ChartCommonProps {
  /** 方向 */
  direction?: "vertical" | "horizontal";
  
  /** 柱子宽度 */
  barWidth?: number;
  
  /** 柱子间距 */
  barGap?: number;
  
  /** 是否显示目标线 */
  showTarget?: boolean;
  
  /** 目标值 */
  targetValue?: number;
  
  /** 目标线标签 */
  targetLabel?: string;
}

// ============================================================================
// 饼图配置
// ============================================================================

export interface PieChartProps extends BaseWidgetProps, DataBinding {
  /** 名称字段 */
  nameField: string;
  
  /** 数值字段 */
  valueField: string;
  
  /** 是否显示百分比 */
  showPercentage?: boolean;
  
  /** 是否显示图例 */
  showLegend?: boolean;
  
  /** 图例位置 */
  legendPosition?: "top" | "bottom" | "left" | "right";
  
  /** 图例文字颜色 */
  legendTextColor?: string;
  
  /** 是否环形图 */
  donut?: boolean;
  
  /** 内半径（环形图） */
  innerRadius?: number;
  
  /** 外半径 */
  outerRadius?: number;
  
  /** 颜色方案（扇区颜色数组） */
  colorScheme?: string[];
  
  /** 标签颜色 */
  labelColor?: string;
  
  /** 百分比文字颜色 */
  percentageColor?: string;

  /** 同 ChartCommonProps：合并进 ECharts pie option */
  echartsOptionOverrides?: EChartsOption;
}

// ============================================================================
// 表格配置
// ============================================================================

/** 表格单元格展示类型（除 text 外需在 Table 组件内实现对应渲染） */
export type TableCellType = "text" | "tag" | "progress";

export interface TableColumn {
  /** 字段名 */
  field: string;
  
  /** 列标题 */
  label: string;
  
  /** 列宽 */
  width?: number | string;
  
  /** 对齐方式 */
  align?: "left" | "center" | "right";
  
  /** 单位 */
  unit?: string;
  
  /** 格式化 */
  format?: "number" | "currency" | "percentage" | "date" | "datetime";
  
  /** 是否可排序 */
  sortable?: boolean;
  
  /** 是否固定列 */
  fixed?: "left" | "right";
  
  /** 自定义渲染 */
  render?: string;

  /** 单元格展示类型，默认 text */
  cellType?: TableCellType;

  /** cellType 为 tag 时：单元格原始值到语义变体的映射（未命中为 default） */
  tagVariantMap?: Record<string, "default" | "success" | "warning" | "danger" | "info">;

  /** cellType 为 progress 时：满刻度值，默认 100 */
  progressMax?: number;

  /** cellType 为 progress 时：是否在条旁显示数值/百分比文案 */
  progressShowLabel?: boolean;
}

export interface TableProps extends BaseWidgetProps, DataBinding {
  /** 列配置 */
  columns: TableColumn[];
  
  /** 是否显示分页 */
  pagination?: boolean;
  
  /** 每页数量 */
  pageSize?: number;
  
  /** 是否显示序号 */
  showIndex?: boolean;
  
  /** 是否斑马纹 */
  striped?: boolean;
  
  /** 斑马纹颜色 */
  stripedColor?: string;
  
  /** 是否可选择行 */
  selectable?: boolean;
  
  /** 是否显示边框 */
  bordered?: boolean;
  
  /** 表格大小 */
  size?: "small" | "medium" | "large";
  
  /** 表头背景色 */
  headerBackgroundColor?: string;
  
  /** 表头文字颜色 */
  headerTextColor?: string;
  
  /** 行背景色 */
  rowBackgroundColor?: string;
  
  /** 行文字颜色 */
  rowTextColor?: string;
  
  /** 悬停行背景色 */
  hoverBackgroundColor?: string;
  
  /** 边框颜色 */
  borderColor?: string;
}

// ============================================================================
// 筛选器配置
// ============================================================================

export interface DateRangePickerProps extends BaseWidgetProps {
  /** 标签 */
  label?: string;
  
  /** 默认值 */
  defaultValue?: string;
  
  /** 预设选项 */
  presets?: Array<{
    label: string;
    value: string;
  }>;
  
  /** 格式 */
  format?: string;
  
  /** 占位符 */
  placeholder?: string;
  
  /** 变化回调 */
  onChange?: string;
}

export interface SelectProps extends BaseWidgetProps, DataBinding {
  /** 标签 */
  label?: string;
  
  /** 占位符 */
  placeholder?: string;
  
  /** 是否多选 */
  multiple?: boolean;
  
  /** 是否可搜索 */
  searchable?: boolean;
  
  /** 是否可清空 */
  clearable?: boolean;
  
  /** 选项 */
  options?: Array<{
    label: string;
    value: string | number;
  }>;
  
  /** 变化回调 */
  onChange?: string;
}

// ============================================================================
// Widget 配置（联合类型）
// ============================================================================

export interface WidgetConfig<T = any> {
  /** 组件类型 */
  type: WidgetType;
  
  /** 组件属性 */
  props: T;
}

// 具体的 Widget 配置类型
export type KPIWidgetConfig = WidgetConfig<KPIProps>;
export type LineChartWidgetConfig = WidgetConfig<LineChartProps>;
export type BarChartWidgetConfig = WidgetConfig<BarChartProps>;
export type PieChartWidgetConfig = WidgetConfig<PieChartProps>;
export type TableWidgetConfig = WidgetConfig<TableProps>;
export type DateRangePickerWidgetConfig = WidgetConfig<DateRangePickerProps>;
export type SelectWidgetConfig = WidgetConfig<SelectProps>;

// 所有 Widget 配置的联合类型
export type AnyWidgetConfig =
  | KPIWidgetConfig
  | LineChartWidgetConfig
  | BarChartWidgetConfig
  | PieChartWidgetConfig
  | TableWidgetConfig
  | DateRangePickerWidgetConfig
  | SelectWidgetConfig
  | WidgetConfig<any>;

// ============================================================================
// Widgets 集合
// ============================================================================

export type WidgetsCollection = Record<string, AnyWidgetConfig>;
