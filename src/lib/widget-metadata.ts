/**
 * Widget 组件元数据系统
 * 用于动态获取已注册组件的信息，供 AI Agent 使用
 */

import type { WidgetType } from "@/types/widget.types";

/**
 * 组件元数据接口
 */
export interface WidgetMetadata {
  /** 组件类型 */
  type: WidgetType;
  
  /** 组件名称 */
  name: string;
  
  /** 组件描述 */
  description: string;
  
  /** 组件分类 */
  category: "data-display" | "chart" | "table" | "filter" | "container" | "other";
  
  /** 使用场景 */
  useCases: string[];
  
  /** 必需的 props */
  requiredProps: string[];
  
  /** 可选的 props */
  optionalProps: string[];
  
  /** 配置示例 */
  example: string;
}

/**
 * 组件元数据注册表
 * 每个组件在注册时应该同时注册元数据
 */
export const widgetMetadataRegistry: Record<string, WidgetMetadata> = {
  KPI: {
    type: "KPI",
    name: "KPI 卡片",
    description: "展示关键指标数值，支持趋势和对比",
    category: "data-display",
    useCases: ["展示核心指标", "显示实时数据", "对比同环比"],
    requiredProps: ["title", "dataKey"],
    optionalProps: ["subtitle", "icon", "presetIconId", "unit", "trend", "comparison", "format", "gradient"],
    example: `{
  type: "KPI",
  props: {
    title: "住院人数",
    subtitle: "当前在院",
    presetIconId: "preset-icon-3",
    icon: "🏥",
    dataKey: "inpatient_count",
    unit: "人",
    trend: true,
    comparison: { type: "yoy", label: "同比" },
    gradient: ["#3b82f6", "#8b5cf6"],
  }
}`,
  },
  
  Metric: {
    type: "Metric",
    name: "指标卡片",
    description: "KPI 的别名，功能相同",
    category: "data-display",
    useCases: ["展示指标数据"],
    requiredProps: ["title", "dataKey"],
    optionalProps: ["subtitle", "icon", "presetIconId", "unit"],
    example: "同 KPI",
  },
  
  StatCard: {
    type: "StatCard",
    name: "统计卡片",
    description: "KPI 的别名，功能相同",
    category: "data-display",
    useCases: ["展示统计数据"],
    requiredProps: ["title", "dataKey"],
    optionalProps: ["subtitle", "icon", "presetIconId", "unit"],
    example: "同 KPI",
  },
  
  LineChart: {
    type: "LineChart",
    name: "折线图",
    description: "展示趋势变化，支持多条线和区域填充",
    category: "chart",
    useCases: ["时间序列分析", "趋势对比", "多指标对比"],
    requiredProps: ["title", "dataKey", "xAxis", "yAxis"],
    optionalProps: ["subtitle", "titleBackdrop", "style", "showLegend", "showGrid", "smooth", "area", "colorScheme", "gridColor", "axisColor", "axisTextColor", "tooltipBackgroundColor", "tooltipTextColor", "echartsOptionOverrides"],
    example: `{
  type: "LineChart",
  props: {
    title: "门诊量趋势",
    dataKey: "outpatient_trend",
    titleBackdrop: true,
    style: {
      border: "var(--dv-chart-panel-border)",
      padding: "var(--dv-chart-panel-padding)",
      borderRadius: "var(--dv-chart-panel-radius)",
      background: "var(--dv-chart-panel-bg)",
    },
    xAxis: { field: "date", label: "日期" },
    yAxis: [
      { field: "outpatient", label: "门诊量", color: "#3b82f6" },
      { field: "emergency", label: "急诊量", color: "#ef4444" },
    ],
    showLegend: true,
    showGrid: true,
    smooth: true,
  }
}`,
  },
  
  BarChart: {
    type: "BarChart",
    name: "柱状图",
    description: "展示分类对比，支持横向和纵向",
    category: "chart",
    useCases: ["分类对比", "排名展示", "目标达成对比"],
    requiredProps: ["title", "dataKey", "xAxis", "yAxis"],
    optionalProps: ["subtitle", "titleBackdrop", "style", "direction", "showTarget", "targetValue", "showLegend", "showGrid", "colorScheme", "gridColor", "axisColor", "axisTextColor", "echartsOptionOverrides"],
    example: `{
  type: "BarChart",
  props: {
    title: "各科室负荷率",
    dataKey: "department_load",
    xAxis: { field: "department", label: "科室" },
    yAxis: { field: "load", label: "负荷率", unit: "%" },
    showTarget: true,
    targetValue: 80,
    showGrid: true,
  }
}`,
  },
  
  PieChart: {
    type: "PieChart",
    name: "饼图",
    description: "展示占比分布",
    category: "chart",
    useCases: ["结构分析", "占比展示", "分类分布"],
    requiredProps: ["title", "dataKey", "nameField", "valueField"],
    optionalProps: ["subtitle", "titleBackdrop", "style", "showPercentage", "showLegend", "legendPosition", "donut", "colorScheme", "innerRadius", "outerRadius", "echartsOptionOverrides"],
    example: `{
  type: "PieChart",
  props: {
    title: "患者类型分布",
    dataKey: "patient_type_distribution",
    nameField: "type",
    valueField: "count",
    showPercentage: true,
    showLegend: true,
    legendPosition: "right",
  }
}`,
  },
  
  DonutChart: {
    type: "DonutChart",
    name: "环形图",
    description: "饼图的环形变体",
    category: "chart",
    useCases: ["结构分析", "占比展示"],
    requiredProps: ["title", "dataKey", "nameField", "valueField"],
    optionalProps: ["subtitle", "titleBackdrop", "style", "showPercentage", "showLegend", "innerRadius", "outerRadius", "colorScheme", "echartsOptionOverrides"],
    example: "同 PieChart，会自动设置 donut: true",
  },
  
  AreaChart: {
    type: "AreaChart",
    name: "面积图",
    description: "折线图的面积填充变体",
    category: "chart",
    useCases: ["趋势分析", "累积展示"],
    requiredProps: ["title", "dataKey", "xAxis", "yAxis"],
    optionalProps: ["subtitle", "titleBackdrop", "style", "showLegend", "showGrid", "smooth", "area", "colorScheme", "echartsOptionOverrides"],
    example: "同 LineChart，会自动设置 area: true",
  },
  
  Table: {
    type: "Table",
    name: "表格",
    description: "展示详细数据列表，支持排序和分页",
    category: "table",
    useCases: ["明细数据展示", "数据列表", "可排序数据"],
    requiredProps: ["title", "dataKey", "columns"],
    optionalProps: ["subtitle", "titleBackdrop", "style", "pagination", "pageSize", "showIndex", "striped", "bordered", "sortable", "backgroundColor"],
    example: `{
  type: "Table",
  props: {
    title: "科室明细",
    dataKey: "department_detail",
    columns: [
      { field: "department", label: "科室", width: 120 },
      { field: "doctors", label: "医生数", width: 80 },
      { field: "patients", label: "患者数", width: 80 },
      { field: "load", label: "负荷率", width: 80, unit: "%", sortable: true },
    ],
    pagination: true,
    pageSize: 10,
    showIndex: true,
    striped: true,
  }
}`,
  },
  
  DateRangePicker: {
    type: "DateRangePicker",
    name: "日期范围选择器",
    description: "选择时间范围的筛选器",
    category: "filter",
    useCases: ["时间筛选", "日期范围选择"],
    requiredProps: [],
    optionalProps: ["label", "defaultValue", "presets", "placeholder"],
    example: `{
  type: "DateRangePicker",
  props: {
    label: "时间范围",
    defaultValue: "last_30_days",
    presets: [
      { label: "今天", value: "today" },
      { label: "最近7天", value: "last_7_days" },
      { label: "最近30天", value: "last_30_days" },
    ],
  }
}`,
  },
  
  Select: {
    type: "Select",
    name: "下拉选择器",
    description: "单选或多选下拉框",
    category: "filter",
    useCases: ["分类筛选", "选项选择"],
    requiredProps: [],
    optionalProps: ["label", "placeholder", "multiple", "options", "dataKey"],
    example: `{
  type: "Select",
  props: {
    label: "科室",
    placeholder: "全部科室",
    multiple: false,
    options: [
      { label: "内科", value: "internal" },
      { label: "外科", value: "surgery" },
    ],
  }
}`,
  },
  
  MultiSelect: {
    type: "MultiSelect",
    name: "多选选择器",
    description: "多选下拉框",
    category: "filter",
    useCases: ["多项筛选"],
    requiredProps: [],
    optionalProps: ["label", "placeholder", "options", "dataKey"],
    example: "同 Select，会自动设置 multiple: true",
  },
};

/**
 * 获取所有已注册组件的类型列表
 */
export function getRegisteredWidgetTypes(): WidgetType[] {
  return Object.keys(widgetMetadataRegistry) as WidgetType[];
}

/**
 * 获取组件元数据
 */
export function getWidgetMetadata(type: WidgetType): WidgetMetadata | undefined {
  return widgetMetadataRegistry[type];
}

/**
 * 按分类获取组件
 */
export function getWidgetsByCategory(category: WidgetMetadata["category"]): WidgetMetadata[] {
  return Object.values(widgetMetadataRegistry).filter(meta => meta.category === category);
}

/**
 * 生成组件类型文档（供 AI Agent 使用）
 */
export function generateWidgetTypesDocs(): string {
  const categories = {
    "data-display": "数据展示",
    "chart": "图表",
    "table": "表格",
    "filter": "筛选器",
    "container": "容器",
    "other": "其他",
  };

  let docs = "# 支持的 Widget 组件类型\n\n";

  for (const [categoryKey, categoryName] of Object.entries(categories)) {
    const widgets = getWidgetsByCategory(categoryKey as WidgetMetadata["category"]);
    if (widgets.length === 0) continue;

    docs += `## ${categoryName}\n\n`;

    for (const widget of widgets) {
      docs += `### ${widget.type} - ${widget.name}\n\n`;
      docs += `**描述**: ${widget.description}\n\n`;
      docs += `**使用场景**: ${widget.useCases.join("、")}\n\n`;
      docs += `**必需属性**: ${widget.requiredProps.length > 0 ? widget.requiredProps.join(", ") : "无"}\n\n`;
      docs += `**可选属性**: ${widget.optionalProps.join(", ")}\n\n`;
      docs += `**配置示例**:\n\`\`\`javascript\n${widget.example}\n\`\`\`\n\n`;
    }
  }

  return docs;
}

/**
 * 生成简化的组件类型列表（供 AI Agent 使用）
 */
export function generateWidgetTypesSimple(): string {
  let output = "支持的组件类型：\n\n";

  const byCategory = {
    "data-display": getWidgetsByCategory("data-display"),
    "chart": getWidgetsByCategory("chart"),
    "table": getWidgetsByCategory("table"),
    "filter": getWidgetsByCategory("filter"),
  };

  for (const [category, widgets] of Object.entries(byCategory)) {
    if (widgets.length === 0) continue;
    
    const categoryNames: Record<string, string> = {
      "data-display": "数据展示",
      "chart": "图表",
      "table": "表格",
      "filter": "筛选器",
    };
    
    output += `**${categoryNames[category]}**: `;
    output += widgets.map(w => `${w.type}(${w.name})`).join("、");
    output += "\n\n";
  }

  return output;
}
