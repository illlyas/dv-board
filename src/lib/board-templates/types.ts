import type { DashboardStoreFile } from "@/types/dashboard-store.types";

export type BoardTemplateMeta = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  screenPresetId?: string;
  dashboardFile?: string;
};

export type BoardTemplateListItem = BoardTemplateMeta;

export type BoardTemplateBundle = {
  meta: BoardTemplateMeta;
  viTokensJson: string;
  dashboardJsx: string;
  store: DashboardStoreFile;
};
