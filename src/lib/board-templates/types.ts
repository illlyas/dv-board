import type { DashboardStoreFile } from "@/types/dashboard-store.types";
export type BoardTemplateMeta = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  screenPresetId?: string;
  dashboardFile?: string;
  /** AI 填空协议（相对模板目录） */
  slotsSchemaFile?: string;
  /** 模板私有组件声明（相对模板目录） */
  widgetsManifestFile?: string;
  /** 平台 Widget 配置（相对模板目录，默认 widgets.json） */
  widgetsConfigFile?: string;
};

export type BoardTemplateListItem = BoardTemplateMeta;

export type BoardTemplateBundle = {
  meta: BoardTemplateMeta;
  viTokensJson: string;
  dashboardJsx: string;
  /** 平台 Widget 配置 JSON 原文 */
  widgetsJson?: string;
  store: DashboardStoreFile;
  /** AI 填空协议 JSON 原文（若 meta.slotsSchemaFile 存在且可读） */
  slotsSchemaJson?: string;
  /** 模板私有组件清单 JSON 原文（若 meta.widgetsManifestFile 存在且可读） */
  widgetsManifestJson?: string;
};
