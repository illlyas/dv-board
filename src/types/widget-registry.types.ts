/**
 * Widget 组件注册表类型定义
 */

import type { ComponentType } from "react";
import type { WidgetType, AnyWidgetConfig } from "./widget.types";

// ============================================================================
// Widget 组件接口
// ============================================================================

/**
 * Widget 组件的标准接口
 * 所有注册的组件都应该遵循这个接口
 */
export interface WidgetComponentProps<T = any> {
  /** 组件配置 */
  config: T;
  
  /** 数据（由 Widget 容器提供） */
  data?: any;
  
  /** 加载状态 */
  loading?: boolean;
  
  /** 错误信息 */
  error?: Error | null;
  
  /** 刷新数据 */
  onRefresh?: () => void;

  /** 由 Widget 容器传入；指标组子项各自拉数时为 true */
  enableWidgetData?: boolean;
}

/**
 * Widget 组件类型
 */
export type WidgetComponent<T = any> = ComponentType<WidgetComponentProps<T>>;

// ============================================================================
// 组件注册表
// ============================================================================

/**
 * Widget 组件注册表
 * 将组件类型映射到实际的 React 组件
 */
export type WidgetRegistry = Partial<Record<WidgetType, WidgetComponent>>;

// ============================================================================
// 数据提供者
// ============================================================================

/**
 * 数据提供者接口
 * 负责根据配置获取数据
 */
export interface DataProvider {
  /**
   * 根据 dataKey 获取数据
   */
  getDataByKey: (dataKey: string) => Promise<any> | any;
  
  /**
   * 根据 dataSource 函数名获取数据
   */
  getDataBySource: (sourceName: string, params?: any) => Promise<any> | any;
  
  /**
   * 根据 query 配置查询数据
   */
  getDataByQuery: (query: any) => Promise<any> | any;
}

/**
 * 数据提供者上下文
 */
export interface DataProviderContext {
  /** 数据提供者实例 */
  provider: DataProvider;
  
  /** 全局数据 */
  globalData?: Record<string, any>;
  
  /** 数据源函数映射 */
  dataSources?: Record<string, (...args: any[]) => any>;
}

// ============================================================================
// Widget 容器配置
// ============================================================================

/**
 * Widget 容器的配置
 */
export interface WidgetContainerConfig {
  /** 组件注册表 */
  registry: WidgetRegistry;
  
  /** 数据提供者 */
  dataProvider?: DataProvider;
  
  /** 是否显示调试信息 */
  debug?: boolean;
  
  /** 错误处理 */
  onError?: (error: Error, config: AnyWidgetConfig) => void;
  
  /** 是否启用占位符 */
  enablePlaceholder?: boolean;
}
