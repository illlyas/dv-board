/**
 * 存储单例入口：业务代码只从这里 import。
 *
 * 用法：
 *   import { storage, dvPath } from "@/lib/storage";
 *   await storage.writeText(dvPath("project-xxx", "页面", "dashboard.jsx"), code);
 *
 * 后端根据 ZEROG_ENABLED 决定选择 fs 还是 0G 适配器；默认 fs 兼容旧行为。
 */
import { FsStorageAdapter } from "./fs-adapter";
import { ZeroGStorageAdapter } from "./zerog-adapter";
import type { StorageAdapter } from "./types";

export type { StorageAdapter, StorageFileInfo, StorageChildren } from "./types";
export { dvPath, normalizeLogical, assertUnderDv, logicalDirname, logicalBasename } from "./path-utils";

let instance: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!instance) {
    const enabled = (process.env.ZEROG_ENABLED ?? "false").toLowerCase();
    const useZeroG = enabled === "true" || enabled === "1" || enabled === "yes";
    instance = useZeroG
      ? new ZeroGStorageAdapter(process.cwd())
      : new FsStorageAdapter(process.cwd());
  }
  return instance;
}

/** 懒初始化单例的语法糖，方便解构 */
export const storage: StorageAdapter = new Proxy({} as StorageAdapter, {
  get(_t, prop) {
    const s = getStorage() as unknown as Record<string | symbol, unknown>;
    const v = s[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(s) : v;
  },
});
