/**
 * 存储层统一抽象
 * ---
 * 所有 `.dv/` 下的「业务文本文件」（md / jsx / json）读写都走这一层。
 * 逻辑路径（logicalPath）统一为正斜杠、不带前导斜杠、以 `.dv/` 开头：
 *   .dv/{projectKey}/页面/dashboard.jsx
 *   .dv/{projectKey}/品牌VI/vi-system.md
 *
 * 后端有两种实现：
 *   1) FsStorageAdapter   —— 原行为：直接读写项目根 `.dv/...`
 *   2) ZeroGStorageAdapter —— 文件内容存 0G Storage，路径↔rootHash 索引写本地 `.dv/.storage-index.json`
 *
 * 非 `.dv/` 的静态内容（design-systems/*.md、board-templates/*、.assets/**）不经过本层，
 * 仍用 fs 直接访问。
 */

export interface StorageFileInfo {
  /** 不含目录的文件名，例如 "dashboard.jsx" */
  name: string;
  /** 逻辑路径，例如 ".dv/xxx/页面/dashboard.jsx" */
  path: string;
  /** ISO 时间戳 */
  updatedAt: string;
  /** 字节数；0G 下基于上传内容长度 */
  size: number;
}

export interface StorageChildren {
  files: StorageFileInfo[];
  /** 直接子目录名（不含路径） */
  dirs: string[];
}

export interface StorageAdapter {
  /** 读文本；不存在则抛 */
  readText(logicalPath: string): Promise<string>;
  /** 读文本；不存在返回 null（不抛） */
  tryReadText(logicalPath: string): Promise<string | null>;
  /** 写文本（覆盖），自动确保父「目录」存在 */
  writeText(logicalPath: string, content: string): Promise<void>;
  /** 文件是否存在 */
  exists(logicalPath: string): Promise<boolean>;
  /** 删除单个文件；在 0G 适配器里实为从索引摘除 */
  removeFile(logicalPath: string): Promise<void>;
  /** 递归删除「目录」前缀下的所有文件；在 0G 里同为索引摘除 */
  removeDir(prefix: string): Promise<void>;
  /** 列出前缀下的直接子项（一层，不递归） */
  listChildren(prefix: string): Promise<StorageChildren>;
}
