"use client";

import React from "react";
import type { AnyWidgetConfig } from "@/types/widget.types";
import { Placeholder } from "./placeholder";
import { getWidget } from "./registry";
import { useWidgetData } from "@/hooks/use-widget-data";

interface WidgetProps {
  /** 组件配置 */
  config: AnyWidgetConfig;
  
  /** 是否启用数据加载 */
  enableData?: boolean;
  
  /** 是否显示占位符（当组件未注册时） */
  showPlaceholder?: boolean;
  
  /** 错误处理 */
  onError?: (error: Error) => void;
}

/**
 * Widget 容器组件
 * 
 * 职责：
 * 1. 根据 config.type 查找对应的组件
 * 2. 根据 config.props 中的数据绑定配置获取数据
 * 3. 渲染真实组件或占位符
 * 4. 处理加载和错误状态
 */
export function Widget({
  config,
  enableData = true,
  showPlaceholder = true,
  onError,
}: WidgetProps) {
  const { type, props } = config;

  // 获取数据
  const { data, loading, error, refresh } = useWidgetData({
    dataKey: props.dataKey,
    dataSource: props.dataSource,
    query: props.query,
    staticData: props.staticData,
    enabled: enableData,
  });

  // 错误处理
  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // 查找组件
  const Component = getWidget(type);

  // 如果组件未注册，显示占位符
  if (!Component) {
    if (showPlaceholder) {
      return <Placeholder config={config} loading={loading} error={error} />;
    }
    return null;
  }

  // 渲染真实组件
  return (
    <Component
      config={config}
      data={data}
      loading={loading}
      error={error}
      onRefresh={refresh}
    />
  );
}

export default Widget;
