/**
 * 仪表盘数据 store（与 *.jsx 同名的 *.store.json）
 */

export type DashboardStorePayloadKind =
  | "seriesRows"
  | "tableRows"
  | "kpiValue"
  | "selectOptions";

export interface DashboardStorePayload {
  kind: DashboardStorePayloadKind;
  value: unknown;
}

export type DashboardStoreSlotRole = "data" | "filter-options";

export type DashboardStoreSource = "agent" | "user";

export interface DashboardStoreBindingSnapshot {
  dataKey?: string | null;
  dataSource?: string | null;
  query?: unknown | null;
}

export interface DashboardStoreComponentRecord {
  slotId: string;
  pageIndex: number;
  widgetType: string;
  role: DashboardStoreSlotRole;
  binding: DashboardStoreBindingSnapshot;
  propsSnapshot: Record<string, unknown>;
  payload: DashboardStorePayload;
  filledAt: string;
  source: DashboardStoreSource;
}

export interface DashboardStorePageRecord {
  pageIndex: number;
  components: DashboardStoreComponentRecord[];
}

export interface DashboardStoreFile {
  version: 1;
  dashboardFile: string;
  updatedAt: string;
  /** 下标与 pageIndex 一致：pages[0] 表示第 0 页 */
  pages: DashboardStorePageRecord[];
}
