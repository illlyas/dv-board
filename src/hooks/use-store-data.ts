/**
 * 读取 dashboard.store.json 中任意槽位原始 payload 数据的 Hook
 *
 * 与 useWidgetData 的差异：
 * - 默认仅从 store 读取；Config 槽位依赖模板/已写入 payload
 * - 非 Config 且无 payload 时（装配后未落盘业务数据），在预览上下文中走 mock-slot 并回写 store
 */

"use client";

import { useEffect, useState } from "react";
import { useDashboardPreviewOptional } from "@/contexts/dashboard-preview-context";
import {
  findStoredComponent,
  inferMockRole,
  payloadToWidgetData,
  resolvePageIndex,
} from "@/lib/dashboard-store";
import { runMockSlotPipelineOnce } from "@/lib/mock-slot-pipeline";

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
    if (!previewCtx || !slotId?.trim()) {
      setData(null);
      return;
    }
    if (!hydrated) return;

    let cancelled = false;

    const run = async () => {
      const sid = slotId.trim();
      const fromStore = readFromStore<T>(previewCtx, sid, pageIndex);
      if (fromStore != null) {
        if (!cancelled) setData(fromStore);
        return;
      }

      const store = previewCtx.getStore();
      if (!store) {
        if (!cancelled) setData(null);
        return;
      }
      const pi = resolvePageIndex(sid, pageIndex);
      const rec = findStoredComponent(store, pi, sid);
      if (!rec?.payload && rec && rec.widgetType !== "Config") {
        try {
          const role = inferMockRole(rec.widgetType);
          const { payload } = await runMockSlotPipelineOnce({
            projectName: previewCtx.projectName,
            dashboardFile: previewCtx.dashboardFile,
            pageIndex: pi,
            slotId: rec.slotId,
            widgetType: rec.widgetType,
            role,
            binding: rec.binding,
            propsSnapshot: rec.propsSnapshot ?? {},
            pagesStoryExcerpt: previewCtx.getPagesStoryExcerpt(),
          });
          if (!cancelled) setData(payloadToWidgetData(payload) as T);
        } catch (e) {
          console.warn("[useStoreData] mock-slot 失败:", e);
          if (!cancelled) setData(null);
        }
        return;
      }

      if (!cancelled) setData(fromStore);
    };

    void run();
    return () => {
      cancelled = true;
    };
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
