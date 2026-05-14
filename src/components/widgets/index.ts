/**
 * Widget 组件导出
 * 导入此文件会自动注册所有组件
 */

// 导入组件（会自动注册）
import "./kpi-card";
import "./line-chart";
import "./bar-chart";
import "./pie-chart";
import "./table";
import "./filters/date-range-picker";
import "./filters/select";
import "./geo-map";

// 导出组件（可选）
export { default as KPICard } from "./kpi-card";
export { default as LineChartWidget } from "./line-chart";
export { default as BarChartWidget } from "./bar-chart";
export { default as PieChartWidget } from "./pie-chart";
export { default as TableWidget } from "./table";
export { default as DateRangePickerWidget } from "./filters/date-range-picker";
export { default as SelectWidget } from "./filters/select";
