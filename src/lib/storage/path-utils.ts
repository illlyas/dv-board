/**
 * 逻辑路径工具：始终用正斜杠，不允许 .. 或绝对路径。
 */
import path from "path";

/** 拼接逻辑路径：dvPath("project-xxx", "页面", "dashboard.jsx") → ".dv/project-xxx/页面/dashboard.jsx" */
export function dvPath(projectKey: string, ...segments: string[]): string {
  return [".dv", projectKey, ...segments].join("/");
}

/** 统一为正斜杠、去掉结尾 `/` */
export function normalizeLogical(p: string): string {
  const s = p.replace(/\\/g, "/").replace(/\/+$/, "");
  if (s.startsWith("/")) {
    throw new Error(`logical path cannot be absolute: ${p}`);
  }
  if (s.split("/").some((seg) => seg === "..")) {
    throw new Error(`logical path cannot traverse: ${p}`);
  }
  return s;
}

/** 断言路径是否在 `.dv/` 下（安全闸门） */
export function assertUnderDv(p: string): string {
  const s = normalizeLogical(p);
  if (!s.startsWith(".dv/") && s !== ".dv") {
    throw new Error(`expected path under .dv/, got: ${p}`);
  }
  return s;
}

/** 逻辑路径 → 绝对物理路径（fs 适配器用） */
export function logicalToAbsolute(cwd: string, logicalPath: string): string {
  const normalized = normalizeLogical(logicalPath);
  return path.join(cwd, ...normalized.split("/"));
}

/** 取逻辑路径的父目录；根目录返回 "" */
export function logicalDirname(p: string): string {
  const s = normalizeLogical(p);
  const i = s.lastIndexOf("/");
  return i <= 0 ? "" : s.slice(0, i);
}

/** 取逻辑路径的文件名 */
export function logicalBasename(p: string): string {
  const s = normalizeLogical(p);
  const i = s.lastIndexOf("/");
  return i < 0 ? s : s.slice(i + 1);
}
