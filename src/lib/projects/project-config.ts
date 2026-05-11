import path from "path";
import type { VisualAssetsBlock } from "@/lib/visual-assets/types";

export const PROJECT_CONFIG_FILENAME = "project.config.json";

export type ThemeMode = "dark" | "light";

/** 普通看板 dashboard；大屏 wallboard */
export type BoardKind = "dashboard" | "wallboard";

/** 浅色不使用霓虹等强特效；大屏深色默认可 subtle（由 resolveFxPreset 推导） */
export type FxPreset = "none" | "subtle" | "neon";

export interface ProjectConfig {
  /** 1：历史；2：含 visualAssets；3：含 board 场景字段 */
  configVersion: 1 | 2 | 3;
  id: string;
  name: string;
  style: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  visualAssets?: VisualAssetsBlock;

  /** v3+：深浅主题（运行时 / prompt） */
  themeMode?: ThemeMode;
  /** v3+：普通看板或大屏 */
  boardKind?: BoardKind;
  /** v3+：主区布局 preset id（见 board-layout-presets） */
  layoutPresetId?: string;
  /** v3+：素材套件 id（见 asset-kits） */
  assetKitId?: string;
  /** v3+：设计画布像素预设 id（见 screen-presets） */
  screenPresetId?: string;
  /** v3+ 可选：显式特效档位；缺省时由 themeMode+boardKind 推导 */
  fxPreset?: FxPreset;
}

export const PROJECT_CATEGORY_DIRS = ["数据故事", "品牌VI", "页面结构", "页面"] as const;

/** 目录名即 projectKey；仅允许安全片段，防止路径穿越 */
export function isValidProjectKey(key: string): boolean {
  if (!key || key.length > 240) return false;
  if (key.includes("..") || key.includes("/") || key.includes("\\")) return false;
  return /^[a-zA-Z0-9_-]+$/.test(key);
}

export function dvProjectsRoot(cwd: string): string {
  return path.join(cwd, ".dv");
}

export function projectRootDir(cwd: string, projectKey: string): string {
  return path.join(dvProjectsRoot(cwd), projectKey);
}

export function projectConfigPath(cwd: string, projectKey: string): string {
  return path.join(projectRootDir(cwd, projectKey), PROJECT_CONFIG_FILENAME);
}
