/**
 * ZeroGStorageAdapter：文件内容存 0G，路径→rootHash 映射存 `.dv/.storage-index.json`。
 *
 * 一次"写"流程：
 *   1. 计算新内容的 rootHash（不联网）
 *   2. 若索引里该 logicalPath 已指向同 rootHash，直接更新 updatedAt 返回（零上链）
 *   3. 否则调用 indexer.upload 上链，再把新 entry 写进索引
 *
 * 一次"读"流程：
 *   1. 从索引查 logicalPath → rootHash
 *   2. 用内存缓存避免重复下载（同一份内容的 rootHash 不会变）
 *   3. 调用 indexer.download 取回 Buffer，按 utf-8 解码
 */
import type { StorageAdapter, StorageChildren, StorageFileInfo } from "./types";
import { assertUnderDv, normalizeLogical } from "./path-utils";
import { PathIndex } from "./path-index";
import {
  zgComputeRootHash,
  zgDownloadBytes,
  zgUploadBytes,
} from "./zerog-client";

/** LRU-lite：按 rootHash 缓存下载到的文本，上限控制避免内存膨胀 */
class TextCache {
  private readonly max: number;
  private readonly map = new Map<string, string>();
  constructor(max = 64) {
    this.max = max;
  }
  get(key: string): string | undefined {
    const v = this.map.get(key);
    if (v === undefined) return undefined;
    // 命中就刷到最近
    this.map.delete(key);
    this.map.set(key, v);
    return v;
  }
  set(key: string, val: string): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, val);
    while (this.map.size > this.max) {
      const oldest = this.map.keys().next().value;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }
  delete(key: string): void {
    this.map.delete(key);
  }
}

export class ZeroGStorageAdapter implements StorageAdapter {
  private readonly index: PathIndex;
  private readonly cache = new TextCache(64);

  constructor(cwd: string) {
    this.index = new PathIndex(cwd);
  }

  async readText(logicalPath: string): Promise<string> {
    const p = assertUnderDv(logicalPath);
    const entry = await this.index.getEntry(p);
    if (!entry) {
      const err: NodeJS.ErrnoException = Object.assign(
        new Error(`ENOENT: ${p}`),
        { code: "ENOENT" as const }
      );
      throw err;
    }
    const cached = this.cache.get(entry.rootHash);
    if (cached !== undefined) return cached;
    const buf = await zgDownloadBytes(entry.rootHash);
    const text = buf.toString("utf-8");
    this.cache.set(entry.rootHash, text);
    return text;
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
    const bytes = new TextEncoder().encode(content);

    // 空文件 workaround：0G 无法存 0 字节，退化成一个固定占位字节
    // 实际上 `.dv/` 下的文本配置极少会空，空内容我们走"等效不上传"的路径
    if (bytes.length === 0) {
      // 相当于占位空节点：索引里存一个哨兵 rootHash
      await this.index.upsert(p, {
        rootHash: "0x0",
        size: 0,
        updatedAt: new Date().toISOString(),
      });
      this.cache.set("0x0", "");
      return;
    }

    // 写前去重：内容相同就不上链
    const newRoot = await zgComputeRootHash(bytes);
    const cur = await this.index.getEntry(p);
    if (cur && cur.rootHash === newRoot) {
      await this.index.upsert(p, {
        rootHash: newRoot,
        size: bytes.length,
        updatedAt: new Date().toISOString(),
      });
      this.cache.set(newRoot, content);
      return;
    }

    const root = await zgUploadBytes(bytes);
    await this.index.upsert(p, {
      rootHash: root,
      size: bytes.length,
      updatedAt: new Date().toISOString(),
    });
    this.cache.set(root, content);
  }

  async exists(logicalPath: string): Promise<boolean> {
    const p = assertUnderDv(logicalPath);
    return (await this.index.getEntry(p)) !== null;
  }

  async removeFile(logicalPath: string): Promise<void> {
    const p = assertUnderDv(logicalPath);
    // 注：0G 上的数据删不掉，只摘除索引
    const entry = await this.index.getEntry(p);
    if (entry) this.cache.delete(entry.rootHash);
    await this.index.remove(p);
  }

  async removeDir(prefix: string): Promise<void> {
    const p = assertUnderDv(prefix);
    const removed = await this.index.removePrefix(p);
    // 清理缓存（按路径→rootHash 映射，需要先拿 rootHash 再删；removePrefix 已经把 entry 摘了，直接跳过也没关系）
    for (const key of removed) void key;
  }

  async listChildren(prefix: string): Promise<StorageChildren> {
    const p = assertUnderDv(prefix);
    const snap = await this.index.snapshot();
    const prefSlash = p.endsWith("/") ? p : p + "/";

    const files: StorageFileInfo[] = [];
    const dirs = new Set<string>();

    for (const [key, entry] of Object.entries(snap)) {
      if (!key.startsWith(prefSlash)) continue;
      const rest = key.slice(prefSlash.length);
      if (!rest) continue;
      const slash = rest.indexOf("/");
      if (slash < 0) {
        // 直接子文件
        files.push({
          name: rest,
          path: normalizeLogical(`${p}/${rest}`),
          updatedAt: entry.updatedAt,
          size: entry.size,
        });
      } else {
        dirs.add(rest.slice(0, slash));
      }
    }

    return { files, dirs: Array.from(dirs) };
  }
}
