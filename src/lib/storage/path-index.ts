/**
 * `.dv/.storage-index.json` 索引读写。
 *
 * 形如：
 * {
 *   "version": 1,
 *   "entries": {
 *     ".dv/project-xxx/页面/dashboard.jsx": {
 *       "rootHash": "0x...", "size": 1234, "updatedAt": "..."
 *     }
 *   }
 * }
 *
 * 串行化写入：全进程共享一个 Promise 队列，避免并发覆盖。
 */
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { normalizeLogical } from "./path-utils";

export interface StorageIndexEntry {
  rootHash: string;
  size: number;
  updatedAt: string;
}

interface StorageIndexFile {
  version: 1;
  entries: Record<string, StorageIndexEntry>;
}

const INDEX_REL_PATH = ".dv/.storage-index.json";

function indexAbsPath(cwd: string): string {
  return path.join(cwd, ".dv", ".storage-index.json");
}

async function readIndex(cwd: string): Promise<StorageIndexFile> {
  try {
    const raw = await readFile(indexAbsPath(cwd), "utf-8");
    const parsed = JSON.parse(raw) as Partial<StorageIndexFile>;
    if (parsed?.version === 1 && parsed.entries && typeof parsed.entries === "object") {
      return { version: 1, entries: parsed.entries };
    }
  } catch {
    /* 不存在或坏了，返回空 */
  }
  return { version: 1, entries: {} };
}

async function writeIndex(cwd: string, data: StorageIndexFile): Promise<void> {
  const abs = indexAbsPath(cwd);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, JSON.stringify(data, null, 2), "utf-8");
}

export class PathIndex {
  /** 串行化闸门，任何读-改-写操作排队经过它 */
  private chain: Promise<unknown> = Promise.resolve();

  constructor(private readonly cwd: string) {}

  private runSerial<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.chain.then(fn, fn);
    this.chain = next.catch(() => undefined);
    return next;
  }

  /** 直接读（非串行，只读不会冲突） */
  async getEntry(logicalPath: string): Promise<StorageIndexEntry | null> {
    const p = normalizeLogical(logicalPath);
    const file = await readIndex(this.cwd);
    return file.entries[p] ?? null;
  }

  /** 全量快照；list 操作用 */
  async snapshot(): Promise<Record<string, StorageIndexEntry>> {
    const file = await readIndex(this.cwd);
    return file.entries;
  }

  async upsert(logicalPath: string, entry: StorageIndexEntry): Promise<void> {
    const p = normalizeLogical(logicalPath);
    return this.runSerial(async () => {
      const file = await readIndex(this.cwd);
      file.entries[p] = entry;
      await writeIndex(this.cwd, file);
    });
  }

  async remove(logicalPath: string): Promise<void> {
    const p = normalizeLogical(logicalPath);
    return this.runSerial(async () => {
      const file = await readIndex(this.cwd);
      if (p in file.entries) {
        delete file.entries[p];
        await writeIndex(this.cwd, file);
      }
    });
  }

  /** 删前缀下的所有 entry，返回被删除的路径列表 */
  async removePrefix(prefix: string): Promise<string[]> {
    const p = normalizeLogical(prefix);
    return this.runSerial(async () => {
      const file = await readIndex(this.cwd);
      const hit: string[] = [];
      const prefSlash = p.endsWith("/") ? p : p + "/";
      for (const key of Object.keys(file.entries)) {
        if (key === p || key.startsWith(prefSlash)) {
          hit.push(key);
          delete file.entries[key];
        }
      }
      if (hit.length > 0) {
        await writeIndex(this.cwd, file);
      }
      return hit;
    });
  }
}

export { INDEX_REL_PATH };
