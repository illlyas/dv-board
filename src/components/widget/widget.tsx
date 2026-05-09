"use client";

import React, { useMemo } from "react";
import type { AnyWidgetConfig } from "@/types/widget.types";
import { Placeholder } from "./placeholder";
import { getWidget } from "./registry";
import { useWidgetData } from "@/hooks/use-widget-data";
import { buildPropsSnapshotForMock } from "@/lib/dashboard-store";
import { useVisualAssetsOptional } from "@/contexts/visual-assets-context";

const CHART_TITLE_BACKDROP_TYPES = new Set([
  "LineChart",
  "BarChart",
  "PieChart",
  "DonutChart",
  "AreaChart",
  "Table",
]);

interface WidgetProps {
  /** 组件配置 */
  config: AnyWidgetConfig;
  
  /** 是否启用数据加载 */
  enableData?: boolean;
  
  /** 是否显示占位符（当组件未注册时） */
  showPlaceholder?: boolean;
  
  /** 错误处理 */
  onError?: (error: Error) => void;

  /** 看板 store 槽位 id（全局唯一，建议 p{页码}.xxx） */
  dataSlotId?: string;

  /** 所在分页索引；缺省则从 dataSlotId 前缀解析 */
  pageIndex?: number;
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
  dataSlotId,
  pageIndex,
}: WidgetProps) {
  const { type, props } = config;
  const va = useVisualAssetsOptional();
  const chartTitleOn = va?.isChartTitleBackdropEnabled() ?? true;

  const resolvedConfig = useMemo(() => {
    if (!CHART_TITLE_BACKDROP_TYPES.has(type)) return config;
    const p = { ...(props as Record<string, unknown>) };
    if (typeof p.titleBackdrop === "boolean") {
      p.titleBackdrop = p.titleBackdrop && chartTitleOn;
    }
    return { ...config, props: p } as AnyWidgetConfig;
  }, [config, type, props, chartTitleOn]);

  const resolvedSlotId =
    dataSlotId ?? (props as { dataSlotId?: string }).dataSlotId;
  const resolvedPageIndex =
    pageIndex ?? (props as { pageIndex?: number }).pageIndex;

  const filterHasStaticOptions =
    (type === "Select" || type === "MultiSelect") &&
    Array.isArray((props as { options?: unknown[] }).options) &&
    ((props as { options?: unknown[] }).options?.length ?? 0) > 0;

  const propsSnapshot = buildPropsSnapshotForMock(
    type,
    props as Record<string, unknown>
  );

  // 获取数据（将 widget type 一并传入，以便根据 type 生成正确形状的 mock 数据）
  const { data, loading, error, refresh } = useWidgetData({
    dataKey: props.dataKey,
    dataSource: props.dataSource,
    query: props.query,
    staticData: props.staticData,
    widgetType: type,
    enabled: enableData,
    dataSlotId: resolvedSlotId,
    pageIndex: resolvedPageIndex,
    filterHasStaticOptions,
    propsSnapshot,
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
      return <Placeholder config={resolvedConfig} loading={loading} error={error} />;
    }
    return null;
  }

  // 渲染真实组件
  return (
    <div
      data-widget-key={props.dataKey ?? resolvedSlotId}
      data-widget-type={type}
      data-widget-slot={resolvedSlotId}
      style={{ width: "100%", height: "100%", minHeight: 0 }}
    >
      <Component
        config={resolvedConfig}
        data={data}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
    </div>
  );
}

export default Widget;
