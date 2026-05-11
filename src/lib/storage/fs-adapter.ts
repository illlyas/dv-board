/**
 * FsStorageAdapter：原始本地文件系统实现。保留与改造前完全一致的行为。
 */
import { mkdir, readFile, readdir, rm, stat, writeFile } from "fs/promises";
import path from "path";
import type { StorageAdapter, StorageChildren, StorageFileInfo } from "./types";
import {
  assertUnderDv,
  logicalToAbsolute,
  normalizeLogical,
} from "./path-utils";

export class FsStorageAdapter implements StorageAdapter {
  constructor(private readonly cwd: string) {}

  async readText(logicalPath: string): Promise<string> {
    const p = assertUnderDv(logicalPath);
    return readFile(logicalToAbsolute(this.cwd, p), "utf-8");
  }

  async tryReadText(logicalPath: string): Promise<string | null> {
    try {
      return await this.readText(logicalPath);
    } catch {
      return null;
    }
  }

  async writeText(logicalPath: string, content: string): Promise<void> {
    const p = assertUnderDv(logicalPath);
    const abs = logicalToAbsolute(this.cwd, p);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, content, "utf-8");
  }

  async exists(logicalPath: string): Promise<boolean> {
    try {
      await stat(logicalToAbsolute(this.cwd, assertUnderDv(logicalPath)));
      return true;
    } catch {
      return false;
    }
  }

  async removeFile(logicalPath: string): Promise<void> {
    const p = assertUnderDv(logicalPath);
    await rm(logicalToAbsolute(this.cwd, p), { force: true });
  }

  async removeDir(prefix: string): Promise<void> {
    const p = assertUnderDv(prefix);
    await rm(logicalToAbsolute(this.cwd, p), { recursive: true, force: true });
  }

  async listChildren(prefix: string): Promise<StorageChildren> {
    const p = assertUnderDv(prefix);
    const abs = logicalToAbsolute(this.cwd, p);
    const files: StorageFileInfo[] = [];
    const dirs: string[] = [];
    let entries: string[] = [];
    try {
      entries = await readdir(abs);
    } catch {
      return { files, dirs };
    }
    for (const name of entries) {
      const entryAbs = path.join(abs, name);
      const st = await stat(entryAbs);
      if (st.isDirectory()) {
        dirs.push(name);
      } else if (st.isFile()) {
        files.push({
          name,
          path: normalizeLogical(`${p}/${name}`),
          updatedAt: st.mtime.toISOString(),
          size: st.size,
        });
      }
    }
    return { files, dirs };
  }

  async listChildrenDirsOnly(prefix: string): Promise<string[]> {
    const { dirs } = await this.listChildren(prefix);
    return dirs;
  }
}

/** 兼容导出（listChildrenDirsOnly 未必用得到，仅 index.ts 需要） */
export type { StorageAdapter } from "./types";
