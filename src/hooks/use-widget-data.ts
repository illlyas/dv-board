/**
 * Widget 数据获取 Hook
 */

import { useState, useEffect, useCallback } from "react";
import type { DataBinding } from "@/types/widget.types";

interface UseWidgetDataOptions extends DataBinding {
  /** 当前 widget 类型，用于判定 mock 数据形状 */
  widgetType?: string;

  /** 是否启用自动加载 */
  enabled?: boolean;

  /** 刷新间隔（毫秒） */
  refreshInterval?: number;
}

interface UseWidgetDataResult<T = any> {
  /** 数据 */
  data: T | null;
  
  /** 加载状态 */
  loading: boolean;
  
  /** 错误 */
  error: Error | null;
  
  /** 刷新数据 */
  refresh: () => void;
}

/**
 * 使用 Widget 数据
 * 
 * 支持三种数据获取方式：
 * 1. dataKey: 从全局数据源获取
 * 2. dataSource: 调用数据源函数
 * 3. query: 根据查询配置获取
 * 4. staticData: 使用静态数据
 */
export function useWidgetData<T = any>(
  options: UseWidgetDataOptions
): UseWidgetDataResult<T> {
  const {
    dataKey,
    dataSource,
    query,
    staticData,
    widgetType,
    enabled = true,
    refreshInterval,
  } = options;

  const [data, setData] = useState<T | null>(() =>
    staticData !== undefined ? (staticData as T) : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    // 静态数据优先：不受 enabled 影响（避免 enableData={false} 时永远不注入）
    if (staticData !== undefined) {
      setData(staticData as T);
      setLoading(false);
      setError(null);
      return;
    }

    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      let result: any = null;

      // 方式1: 通过 dataKey 获取
      if (dataKey) {
        result = await fetchByDataKey(dataKey, widgetType);
      }
      // 方式2: 通过 dataSource 函数获取
      else if (dataSource) {
        result = await fetchByDataSource(dataSource, widgetType);
      }
      // 方式3: 通过 query 配置获取
      else if (query) {
        result = await fetchByQuery(query, widgetType);
      }

      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("[useWidgetData] Error:", error);
    } finally {
      setLoading(false);
    }
  }, [dataKey, dataSource, query, staticData, widgetType, enabled]);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 定时刷新
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    const timer = setInterval(fetchData, refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval, enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}

// ============================================================================
// 数据获取函数
// ============================================================================

/**
 * 通过 dataKey 获取数据
 * 从全局数据源或 API 获取
 */
async function fetchByDataKey(dataKey: string, widgetType?: string): Promise<any> {
  // TODO: 实现从全局数据源获取
  // 目前返回模拟数据
  console.log("[fetchByDataKey]", dataKey, widgetType);

  // 模拟 API 延迟（减少到 100ms）
  await new Promise(resolve => setTimeout(resolve, 100));

  // 返回模拟数据
  return generateMockData(dataKey, widgetType);
}

/**
 * 通过 dataSource 函数获取数据
 */
async function fetchByDataSource(sourceName: string, widgetType?: string): Promise<any> {
  // TODO: 实现调用数据源函数
  console.log("[fetchByDataSource]", sourceName, widgetType);

  await new Promise(resolve => setTimeout(resolve, 100));

  return generateMockData(sourceName, widgetType);
}

/**
 * 通过 query 配置获取数据
 */
async function fetchByQuery(query: any, widgetType?: string): Promise<any> {
  // TODO: 实现查询逻辑
  console.log("[fetchByQuery]", query, widgetType);

  await new Promise(resolve => setTimeout(resolve, 100));

  return generateMockData(query.metric, widgetType);
}

/**
 * 生成模拟数据
 * 优先按 widget type 决定形状，其次才按 key 关键词匹配，确保图表类组件拿到的始终是数组。
 */
function generateMockData(key: string, widgetType?: string): any {
  console.log("[generateMockData] key=", key, "type=", widgetType);

  const typeLc = (widgetType || "").toLowerCase();

  // ========= 按 widget type 优先判断 =========
  // KPI / Metric / StatCard → 单个指标对象
  if (["kpi", "metric", "statcard"].includes(typeLc)) {
    return buildKpiObject();
  }
  // 时序图：LineChart / AreaChart
  if (["linechart", "areachart", "timeseries"].includes(typeLc)) {
    return buildTimeSeriesArray();
  }
  // 分布/占比：PieChart / DonutChart / Funnel
  if (["piechart", "donutchart", "funnel"].includes(typeLc)) {
    return buildDistributionArray();
  }
  // 分类对比：BarChart / ColumnChart / RadarChart / HeatmapChart
  if (["barchart", "columnchart", "radarchart", "heatmapchart"].includes(typeLc)) {
    return buildComparisonArray();
  }
  // 表格 / 列表
  if (["table", "list", "datatable"].includes(typeLc)) {
    return buildTableArray();
  }

  // ========= 回退：按 key 关键词 =========
  if (key.includes("count") || key.includes("kpi") || key.includes("total") || key.includes("rate")) {
    return buildKpiObject();
  }
  if (key.includes("trend") || key.includes("line") || key.includes("time_series")) {
    return buildTimeSeriesArray();
  }
  if (key.includes("distribution") || key.includes("pie") || key.includes("donut") || key.includes("type")) {
    return buildDistributionArray();
  }
  if (key.includes("comparison") || key.includes("bar") || key.includes("rank") || key.includes("load") || key.includes("department")) {
    return buildComparisonArray();
  }
  if (key.includes("table") || key.includes("list") || key.includes("detail")) {
    return buildTableArray();
  }

  // 默认通用数组
  console.warn("[generateMockData] No specific pattern matched for key:", key, "type:", widgetType, "- returning generic array");
  return Array.from({ length: 10 }, (_, i) => ({
    name: `项目${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20,
    date: `2024-01-${String((i % 30) + 1).padStart(2, "0")}`,
  }));
}

function buildKpiObject() {
  const value = Math.floor(Math.random() * 10000) + 1000;
  const trendDirection = Math.random() > 0.5 ? "up" : "down";
  const trendValue = (Math.random() * 20 + 5).toFixed(1);
  return {
    value,
    trend: trendDirection,
    trendValue: `${trendValue}%`,
    comparison: { value: `${trendValue}%`, label: "同比" },
  };
}

function buildTimeSeriesArray() {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2024, 0, i + 1);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    return {
      date: dateStr,
      value: Math.floor(Math.random() * 1000) + 500,
      outpatient: Math.floor(Math.random() * 800) + 400,
      emergency: Math.floor(Math.random() * 300) + 100,
      inpatient: Math.floor(Math.random() * 500) + 200,
      surgery: Math.floor(Math.random() * 200) + 50,
    };
  });
}

function buildDistributionArray() {
  const categories = ["类型A", "类型B", "类型C", "类型D", "类型E"];
  return categories.map(name => ({
    name,
    type: name,
    value: Math.floor(Math.random() * 100) + 50,
    count: Math.floor(Math.random() * 100) + 50,
  }));
}

function buildComparisonArray() {
  return Array.from({ length: 8 }, (_, i) => ({
    name: `项目${String.fromCharCode(65 + i)}`,
    category: `分类${i + 1}`,
    department: `科室${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20,
    load: Math.floor(Math.random() * 100) + 20,
    target: 80,
  }));
}

function buildTableArray() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `项目${i + 1}`,
    department: `科室${(i % 5) + 1}`,
    value: Math.floor(Math.random() * 1000) + 100,
    doctors: Math.floor(Math.random() * 20) + 5,
    patients: Math.floor(Math.random() * 100) + 20,
    load: Math.floor(Math.random() * 100) + 20,
    status: Math.random() > 0.7 ? "异常" : "正常",
    date: `2024-01-${String((i % 30) + 1).padStart(2, "0")}`,
  }));
}

