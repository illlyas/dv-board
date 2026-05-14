/**
 * 将未知数据规范为可安全作为 React 文本子节点渲染的值，
 * 避免 store / AI 配置把 object 填进 title、value 等字段触发运行时错误。
 */
export function asScalarReactText(v: unknown): string | number {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return v;
  if (typeof v === "boolean" || typeof v === "bigint") return String(v);
  return "";
}

/** 用于替代 `v && …`：在 JS 中空对象 / 数组也为 truthy，不能直接用来决定是否渲染文本 */
export function hasScalarContent(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.length > 0;
  if (typeof v === "number") return !Number.isNaN(v);
  if (typeof v === "boolean" || typeof v === "bigint") return true;
  return false;
}
