/**
 * Widget 数据获取 Hook
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { DataBinding } from "@/types/widget.types";
import { useDashboardPreviewOptional } from "@/contexts/dashboard-preview-context";
import {
  buildPropsSnapshotForMock,
  findStoredComponent,
  inferMockRole,
  payloadToWidgetData,
  resolvePageIndex,
} from "@/lib/dashboard-store";
import { runMockSlotPipelineOnce } from "@/lib/mock-slot-pipeline";

interface UseWidgetDataOptions extends DataBinding {
  /** 当前 widget 类型，用于判定 mock 数据形状 */
  widgetType?: string;

  /** 是否启用自动加载 */
  enabled?: boolean;

  /** 刷新间隔（毫秒） */
  refreshInterval?: number;

  /** 看板预览 store 槽位（与 *.store.json 对齐） */
  dataSlotId?: string;

  /** 分页页码；缺省则从 slotId 的 p{n}. 前缀解析 */
  pageIndex?: number;

  /** Select/MultiSelect 等已在 props 中写死 options 时跳过筛选项 agent */
  filterHasStaticOptions?: boolean;

  /** 传给 mock agent 的 props 子集（由 Widget 组装） */
  propsSnapshot?: Record<string, unknown>;
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
function shouldCallMockAgent(o: UseWidgetDataOptions): boolean {
  const role = inferMockRole(o.widgetType || "");
  if (role === "filter-options") {
    return !o.filterHasStaticOptions;
  }
  return !!(o.dataKey || o.query || o.dataSource);
}

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
    dataSlotId,
    pageIndex,
    filterHasStaticOptions,
    propsSnapshot,
  } = options;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const previewCtx = useDashboardPreviewOptional();
  const previewRef = useRef(previewCtx);
  previewRef.current = previewCtx;
  const previewActive = Boolean(previewCtx);
  const storeHydrated = previewCtx?.hydrated ?? false;

  const hasBoundStatic =
    staticData !== undefined && staticData !== null;

  const [data, setData] = useState<T | null>(() =>
    hasBoundStatic ? (staticData as T) : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    // 静态数据优先：不受 enabled 影响（避免 enableData={false} 时永远不注入）
    // null 视为「未绑定静态数据」，仍走下方拉取（避免生成代码误传 staticData: null 导致永无数据）
    if (staticData !== undefined && staticData !== null) {
      setData(staticData as T);
      setLoading(false);
      setError(null);
      return;
    }

    if (!enabled) return;

    const sid = dataSlotId?.trim();
    if (previewRef.current && sid && !storeHydrated) {
      setLoading(true);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result: any = null;

      if (previewRef.current && sid && storeHydrated) {
        const pi = resolvePageIndex(sid, pageIndex);
        const store = previewRef.current.getStore();
        if (store) {
          const rec = findStoredComponent(store, pi, sid);
          if (rec?.payload) {
            result = payloadToWidgetData(rec.payload);
          }
        }

        const o = optionsRef.current;
        if (result == null && shouldCallMockAgent(o)) {
          try {
            const p = previewRef.current;
            if (!p) throw new Error("preview context missing");
            const role = inferMockRole(o.widgetType || "");
            const { payload } = await runMockSlotPipelineOnce({
              projectName: p.projectName,
              dashboardFile: p.dashboardFile,
              pageIndex: pi,
              slotId: sid,
              widgetType: o.widgetType || "Unknown",
              role,
              binding: {
                dataKey: o.dataKey ?? null,
                dataSource: o.dataSource ?? null,
                query: o.query ?? null,
              },
              propsSnapshot: o.propsSnapshot ?? {},
              pagesStoryExcerpt: p.getPagesStoryExcerpt(),
            });
            result = payloadToWidgetData(payload);
          } catch (mockErr) {
            console.warn("[useWidgetData] mock-slot 失败，回退本地 mock:", mockErr);
          }
        }
      }

      const oc = optionsRef.current;
      if (result == null && oc.dataKey) {
        result = await fetchByDataKey(oc.dataKey, oc.widgetType);
      } else if (result == null && oc.dataSource) {
        result = await fetchByDataSource(oc.dataSource, oc.widgetType);
      } else if (result == null && oc.query) {
        result = await fetchByQuery(oc.query, oc.widgetType);
      }

      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("[useWidgetData] Error:", error);
    } finally {
      setLoading(false);
    }
  }, [
    dataKey,
    dataSource,
    query,
    staticData,
    widgetType,
    enabled,
    dataSlotId,
    pageIndex,
    filterHasStaticOptions,
    previewActive,
    storeHydrated,
  ]);

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
    const month = `${date.getMonth() + 1}月`;
    const value = Math.floor(Math.random() * 1000) + 500;
    const outpatient = Math.floor(Math.random() * 800) + 400;
    const emergency = Math.floor(Math.random() * 300) + 100;
    const quality = Math.floor(Math.random() * 15) + 85;
    const yieldVal = Math.floor(Math.random() * 800) + 200;
    return {
      date: dateStr,
      time: dateStr,
      month,
      day: dateStr,
      value,
      yield: yieldVal,
      quality,
      sales: value,
      orders: outpatient,
      outpatient,
      emergency,
      inpatient: Math.floor(Math.random() * 500) + 200,
      surgery: Math.floor(Math.random() * 200) + 50,
    };
  });
}

function buildDistributionArray() {
  const categories = ["类型A", "类型B", "类型C", "类型D", "类型E"];
  return categories.map(name => {
    const value = Math.floor(Math.random() * 100) + 50;
    const pct = Math.floor(Math.random() * 30) + 10;
    return {
      name,
      type: name,
      factor: name,
      category: name,
      value,
      count: value,
      percentage: pct,
    };
  });
}

function buildComparisonArray() {
  return Array.from({ length: 8 }, (_, i) => {
    const name = `项目${String.fromCharCode(65 + i)}`;
    const department = `产线${i + 1}`;
    const device = `设备${i + 1}`;
    const value = Math.floor(Math.random() * 100) + 20;
    const load = Math.floor(Math.random() * 100) + 20;
    const faultMin = Math.floor(Math.random() * 120) + 5;
    return {
      name,
      category: `分类${i + 1}`,
      department,
      device,
      产线: department,
      value,
      load,
      yield: load,
      fault_duration: faultMin,
      newUser: Math.floor(Math.random() * 400) + 100,
      returning: Math.floor(Math.random() * 300) + 80,
      target: 80,
    };
  });
}

function buildTableArray() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `项目${i + 1}`,
    department: `科室${(i % 5) + 1}`,
    metric: ["产量", "良品率", "节拍", "能耗"][i % 4],
    triggered_at: `2024-01-${String((i % 28) + 1).padStart(2, "0")} 08:${String(i % 60).padStart(2, "0")}`,
    trend: i % 3 === 0 ? "上升" : i % 3 === 1 ? "下降" : "持平",
    value: Math.floor(Math.random() * 1000) + 100,
    doctors: Math.floor(Math.random() * 20) + 5,
    patients: Math.floor(Math.random() * 100) + 20,
    load: Math.floor(Math.random() * 100) + 20,
    status: Math.random() > 0.7 ? "异常" : "正常",
    date: `2024-01-${String((i % 30) + 1).padStart(2, "0")}`,
  }));
}

