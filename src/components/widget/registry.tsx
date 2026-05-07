/**
 * Widget 组件注册表
 * 将组件类型映射到实际的 React 组件
 */

import type { WidgetRegistry } from "@/types/widget-registry.types";

/**
 * 全局组件注册表
 * 初始为空，后续通过 registerWidget 添加组件
 */
export const widgetRegistry: WidgetRegistry = {
  // 组件将在各自的文件中注册
  // 例如：KPI: KPICard
};

/**
 * 注册 Widget 组件
 */
export function registerWidget(
  type: string,
  component: any
) {
  widgetRegistry[type as keyof WidgetRegistry] = component;
}

/**
 * 获取 Widget 组件
 */
export function getWidget(type: string) {
  return widgetRegistry[type as keyof WidgetRegistry];
}

/**
 * 检查组件是否已注册
 */
export function hasWidget(type: string): boolean {
  return type in widgetRegistry;
}

/**
 * 获取所有已注册的组件类型
 */
export function getRegisteredTypes(): string[] {
  return Object.keys(widgetRegistry);
}
