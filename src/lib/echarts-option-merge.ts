import type { EChartsOption } from "echarts";

const DEEP_KEYS = new Set([
  "xAxis",
  "yAxis",
  "grid",
  "tooltip",
  "legend",
  "textStyle",
  "axisPointer",
  "dataZoom",
]);

/**
 * 合并内置 option 与用户 echartsOptionOverrides：顶层覆盖；DEEP_KEYS 做一层浅合并；series 整段以 override 为准（若提供）。
 */
export function mergeEChartsOption(base: EChartsOption, patch?: EChartsOption | null): EChartsOption {
  if (!patch) return base;
  const merged: EChartsOption = { ...base };
  for (const key of Object.keys(patch) as (keyof EChartsOption)[]) {
    const pk = patch[key];
    if (pk === undefined) continue;
    const bk = base[key];
    if (key === "series") {
      (merged as Record<string, unknown>).series = pk as unknown;
      continue;
    }
    if (DEEP_KEYS.has(key as string) && pk !== null && typeof pk === "object" && !Array.isArray(pk)) {
      const prev = bk !== null && typeof bk === "object" && !Array.isArray(bk) ? bk : {};
      (merged as Record<string, unknown>)[key as string] = {
        ...(prev as object),
        ...(pk as object),
      };
      continue;
    }
    (merged as Record<string, unknown>)[key as string] = pk as unknown;
  }
  return merged;
}
