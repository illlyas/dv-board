/**
 * mock-slot + store 合并写盘：同一仪表盘同一 slot 并发/重复触发时合并为单次网络请求。
 */

import { replaceCachedDashboardStore } from "@/lib/dashboard-store-client-cache";
import type {
  DashboardStoreBindingSnapshot,
  DashboardStoreComponentRecord,
  DashboardStoreFile,
  DashboardStorePayload,
  DashboardStoreSlotRole,
} from "@/types/dashboard-store.types";

export interface MockSlotPipelineParams {
  projectName: string;
  dashboardFile: string;
  pageIndex: number;
  slotId: string;
  widgetType: string;
  role: DashboardStoreSlotRole;
  binding: DashboardStoreBindingSnapshot;
  propsSnapshot: Record<string, unknown>;
  pagesStoryExcerpt: string;
}

export interface MockSlotPipelineResult {
  payload: DashboardStorePayload;
  store: DashboardStoreFile;
}

function inflightKey(p: MockSlotPipelineParams): string {
  return `${p.projectName}\0${p.dashboardFile}\0${p.pageIndex}\0${p.slotId}`;
}

const inflight = new Map<string, Promise<MockSlotPipelineResult>>();

/**
 * 对同一 slot 的多次并发调用共享同一 Promise；完成后从 inflight 移除以便失败重试。
 */
export function runMockSlotPipelineOnce(
  params: MockSlotPipelineParams
): Promise<MockSlotPipelineResult> {
  const k = inflightKey(params);
  const hit = inflight.get(k);
  if (hit) return hit;

  const promise = (async (): Promise<MockSlotPipelineResult> => {
    const mockRes = await fetch("/api/board/mock-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: params.projectName,
        dashboardFile: params.dashboardFile,
        pageIndex: params.pageIndex,
        slotId: params.slotId,
        widgetType: params.widgetType,
        role: params.role,
        binding: params.binding,
        propsSnapshot: params.propsSnapshot,
        pagesStoryExcerpt: params.pagesStoryExcerpt,
      }),
    });
    if (!mockRes.ok) {
      throw new Error(await mockRes.text());
    }
    const mockJson = (await mockRes.json()) as { payload: DashboardStorePayload };
    const payload = mockJson.payload;

    const record: DashboardStoreComponentRecord = {
      slotId: params.slotId,
      pageIndex: params.pageIndex,
      widgetType: params.widgetType,
      role: params.role,
      binding: params.binding,
      propsSnapshot: params.propsSnapshot,
      payload,
      filledAt: new Date().toISOString(),
      source: "agent",
    };

    const mergeRes = await fetch("/api/board/dashboard-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: params.projectName,
        dashboardFile: params.dashboardFile,
        component: record,
      }),
    });
    if (!mergeRes.ok) {
      throw new Error(await mergeRes.text());
    }
    const mergedJson = (await mergeRes.json()) as { store: DashboardStoreFile };
    replaceCachedDashboardStore(
      params.projectName,
      params.dashboardFile,
      mergedJson.store
    );
    return { payload, store: mergedJson.store };
  })().finally(() => {
    inflight.delete(k);
  });

  inflight.set(k, promise);
  return promise;
}
