/**
 * 浏览器端仪表盘 store 单例缓存：同一 project + dashboardFile 全应用共享一份数据，
 * GET /api/board/dashboard-store 只发起一次网络请求，后续 slot 只读内存。
 * 模板预览使用虚拟 projectName（见 board-templates/template-project-name），走 /api/board-templates/.../dashboard-store。
 */

import { parseBoardTemplateIdFromProjectName } from "@/lib/board-templates/template-project-name";
import type { DashboardStoreFile } from "@/types/dashboard-store.types";

export function dashboardStoreCacheKey(
  projectName: string,
  dashboardFile: string
): string {
  return `${projectName}\0${dashboardFile}`;
}

const cache = new Map<string, DashboardStoreFile>();
const inflight = new Map<string, Promise<DashboardStoreFile>>();

export function getCachedDashboardStore(
  projectName: string,
  dashboardFile: string
): DashboardStoreFile | null {
  return cache.get(dashboardStoreCacheKey(projectName, dashboardFile)) ?? null;
}

/** mock 合并写盘后更新内存中的整份 store，供所有 Widget 立即读到 */
export function replaceCachedDashboardStore(
  projectName: string,
  dashboardFile: string,
  store: DashboardStoreFile
): void {
  cache.set(dashboardStoreCacheKey(projectName, dashboardFile), store);
}

/**
 * 首次加载：网络 GET 一次并写入 cache；同 key 并发合并为同一 Promise；
 * 已缓存则同步返回 resolved Promise，不再发请求。
 */
export function loadDashboardStoreOnce(
  projectName: string,
  dashboardFile: string
): Promise<DashboardStoreFile> {
  const key = dashboardStoreCacheKey(projectName, dashboardFile);
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);

  let p = inflight.get(key);
  if (!p) {
    p = (async () => {
      const templateId = parseBoardTemplateIdFromProjectName(projectName);
      const res = templateId
        ? await fetch(
            `/api/board-templates/${encodeURIComponent(templateId)}/dashboard-store?dashboardFile=${encodeURIComponent(dashboardFile)}`
          )
        : await fetch(
            `/api/board/dashboard-store?projectName=${encodeURIComponent(projectName)}&dashboardFile=${encodeURIComponent(dashboardFile)}`
          );
      if (!res.ok) throw new Error(await res.text());
      const j = (await res.json()) as { store: DashboardStoreFile };
      cache.set(key, j.store);
      return j.store;
    })().finally(() => {
      inflight.delete(key);
    });
    inflight.set(key, p);
  }
  return p;
}

/** 切换项目/仪表盘文件时可清缓存（当前由 key 自然隔离，一般无需调用） */
export function clearDashboardStoreCacheEntry(
  projectName: string,
  dashboardFile: string
): void {
  cache.delete(dashboardStoreCacheKey(projectName, dashboardFile));
}
