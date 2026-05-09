import path from "path";
import type { VisualAssetsBlock } from "@/lib/visual-assets/types";

export const PROJECT_CONFIG_FILENAME = "project.config.json";

export interface ProjectConfig {
  /** 1：历史；2：含 visualAssets */
  configVersion: 1 | 2;
  id: string;
  name: string;
  style: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  visualAssets?: VisualAssetsBlock;
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
