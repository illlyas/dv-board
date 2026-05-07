/**
 * Widget 组件配置类型定义
 */

import type { CSSProperties } from "react";

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

export interface KPIProps extends BaseWidgetProps, DataBinding {
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
  
  /** 是否显示工具提示 */
  showTooltip?: boolean;
  
  /** 颜色方案 */
  colorScheme?: string[];
  
  /** 是否平滑曲线 */
  smooth?: boolean;
  
  /** 是否堆叠 */
  stack?: boolean;
  
  /** 是否显示数据标签 */
  showDataLabels?: boolean;
}

// ============================================================================
// 折线图配置
// ============================================================================

export interface LineChartProps extends ChartCommonProps {
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
  
  /** 是否环形图 */
  donut?: boolean;
  
  /** 内半径（环形图） */
  innerRadius?: number;
  
  /** 外半径 */
  outerRadius?: number;
  
  /** 颜色方案 */
  colorScheme?: string[];
}

// ============================================================================
// 表格配置
// ============================================================================

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
  
  /** 是否可选择行 */
  selectable?: boolean;
  
  /** 是否显示边框 */
  bordered?: boolean;
  
  /** 表格大小 */
  size?: "small" | "medium" | "large";
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
