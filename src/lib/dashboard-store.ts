import type {
  DashboardStoreComponentRecord,
  DashboardStoreFile,
  DashboardStorePayload,
  DashboardStoreSlotRole,
} from "@/types/dashboard-store.types";

/** dashboard.jsx → dashboard.store.json */
export function dashboardStoreFilename(dashboardJsxName: string): string {
  const base = dashboardJsxName.trim().replace(/\.jsx$/i, "");
  return `${base}.store.json`;
}

export function createEmptyDashboardStore(dashboardFile: string): DashboardStoreFile {
  return {
    version: 1 as const,
    dashboardFile,
    updatedAt: new Date().toISOString(),
    pages: [],
  };
}

/** 从 `.dv/{project}/页面/foo.jsx` 解析 projectName 与仪表盘文件名 */
export function parseProjectAndDashboardFromFilePath(filePath: string): {
  projectName: string;
  dashboardFile: string;
} | null {
  const normalized = filePath.replace(/\\/g, "/");
  const m = normalized.match(/^\.dv\/([^/]+)\/页面\/([^/]+\.jsx)$/i);
  if (!m) return null;
  return { projectName: m[1], dashboardFile: m[2] };
}

/** 优先显式 pageIndex；否则解析 slotId 前缀 p{n}. */
export function resolvePageIndex(
  slotId: string | undefined,
  explicitPageIndex?: number
): number {
  if (typeof explicitPageIndex === "number" && !Number.isNaN(explicitPageIndex) && explicitPageIndex >= 0) {
    return explicitPageIndex;
  }
  if (!slotId?.trim()) return 0;
  const m = /^p(\d+)\./i.exec(slotId.trim());
  if (m) return parseInt(m[1], 10);
  return 0;
}

export function findStoredComponent(
  store: DashboardStoreFile,
  pageIndex: number,
  slotId: string
): DashboardStoreComponentRecord | undefined {
  const page = store.pages[pageIndex];
  return page?.components.find((c) => c.slotId === slotId);
}

export function mergeComponentIntoStore(
  store: DashboardStoreFile,
  comp: DashboardStoreComponentRecord
): DashboardStoreFile {
  const pageIndex = comp.pageIndex;
  const pages = store.pages.map((p) => ({
    pageIndex: p.pageIndex,
    components: [...p.components],
  }));

  while (pages.length <= pageIndex) {
    const idx = pages.length;
    pages.push({ pageIndex: idx, components: [] });
  }

  const page = pages[pageIndex];
  const idx = page.components.findIndex((c) => c.slotId === comp.slotId);
  if (idx >= 0) page.components[idx] = comp;
  else page.components.push(comp);

  return {
    ...store,
    pages,
    updatedAt: new Date().toISOString(),
  };
}

export function inferMockRole(widgetType: string): DashboardStoreSlotRole {
  const t = widgetType.trim();
  if (
    t === "Select" ||
    t === "MultiSelect" ||
    t === "RadioGroup" ||
    t === "CheckboxGroup"
  ) {
    return "filter-options";
  }
  return "data";
}

/** 将 store 中的 payload 转为 Widget 收到的 data 形状 */
export function payloadToWidgetData(payload: DashboardStorePayload): unknown {
  if (payload.kind === "selectOptions") {
    return Array.isArray(payload.value) ? payload.value : [];
  }
  return payload.value;
}

const MOCK_SNAPSHOT_KEYS = new Set([
  "title",
  "subtitle",
  "xAxis",
  "yAxis",
  "columns",
  "format",
  "label",
  "placeholder",
  "query",
  "dataKey",
  "dataSlotId",
  "pageIndex",
  "valueKey",
  "precision",
  "unit",
  "multiple",
  "showLegend",
  "legendPosition",
]);

export function buildPropsSnapshotForMock(
  widgetType: string,
  props: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { widgetType: widgetType || "Unknown" };
  for (const key of MOCK_SNAPSHOT_KEYS) {
    if (key in props && props[key] !== undefined) {
      out[key] = props[key];
    }
  }
  return out;
}
