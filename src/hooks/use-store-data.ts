/**
 * 读取 dashboard.store.json 中任意槽位原始 payload 数据的 Hook
 *
 * 与 useWidgetData 的差异：
 * - 不走 mock-slot pipeline，仅从内存中的 store 读取
 * - 不依赖 widgetType 形状推断
 * - 适用于纯视图层（JSX）中需要展示已经预先在 store 里准备好的数据（如自定义渲染的 KPI、地图配置数据等）
 */

"use client";

import { useEffect, useState } from "react";
import { useDashboardPreviewOptional } from "@/contexts/dashboard-preview-context";
import {
  findStoredComponent,
  payloadToWidgetData,
  resolvePageIndex,
} from "@/lib/dashboard-store";

/**
 * 从 store 读取指定槽位的原始数据。
 *
 * 用法：
 * ```jsx
 * const provinceData = useStoreData("p0.config.province_data");
 * const powerSeed = useStoreData("p1.chart.power_realtime_seed");
 * ```
 *
 * @param slotId 槽位 id（与 store.json 中 components[].slotId 对齐）
 * @param pageIndex 可选，缺省自动从 slotId 的 p{n}. 前缀解析
 * @returns 该槽位 payload 中的原始 value（kpiValue → 对象；seriesRows / selectOptions → 数组）
 */
export function useStoreData<T = unknown>(
  slotId: string | undefined,
  pageIndex?: number
): T | null {
  const previewCtx = useDashboardPreviewOptional();
  const hydrated = previewCtx?.hydrated ?? false;

  const [data, setData] = useState<T | null>(() =>
    readFromStore<T>(previewCtx, slotId, pageIndex)
  );

  useEffect(() => {
    if (!previewCtx || !slotId) {
      setData(null);
      return;
    }
    if (!hydrated) return;
    setData(readFromStore<T>(previewCtx, slotId, pageIndex));
  }, [previewCtx, hydrated, slotId, pageIndex]);

  return data;
}

function readFromStore<T>(
  previewCtx: ReturnType<typeof useDashboardPreviewOptional>,
  slotId: string | undefined,
  pageIndex?: number
): T | null {
  if (!previewCtx || !slotId) return null;
  const sid = slotId.trim();
  if (!sid) return null;
  const store = previewCtx.getStore();
  if (!store) return null;
  const pi = resolvePageIndex(sid, pageIndex);
  const rec = findStoredComponent(store, pi, sid);
  if (!rec?.payload) return null;
  return payloadToWidgetData(rec.payload) as T;
}
