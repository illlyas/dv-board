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

function mergeSeriesByIndex(
  baseSeries: unknown[] | undefined,
  patchSeries: unknown[] | undefined
): unknown[] | undefined {
  if (!patchSeries) return baseSeries;
  if (!Array.isArray(baseSeries) || baseSeries.length === 0) return patchSeries;
  const max = Math.max(baseSeries.length, patchSeries.length);
  const out: unknown[] = [];
  for (let i = 0; i < max; i++) {
    const b = baseSeries[i];
    const p = patchSeries[i];
    if (p === undefined) {
      if (b !== undefined) out.push(b);
      continue;
    }
    if (b === undefined || typeof b !== "object" || b === null || Array.isArray(b)) {
      out.push(p);
      continue;
    }
    if (typeof p !== "object" || p === null || Array.isArray(p)) {
      out.push(p);
      continue;
    }
    out.push({ ...(b as object), ...(p as object) });
  }
  return out;
}

/**
 * 合并内置 option 与用户 echartsOptionOverrides：顶层覆盖；DEEP_KEYS 做一层浅合并；
 * `series` 若为数组则按索引与内置 series 浅合并（保留内置 `data` 等），以便 overrides 只补样式/markLine。
 */
export function mergeEChartsOption(base: EChartsOption, patch?: EChartsOption | null): EChartsOption {
  if (!patch) return base;
  const merged: EChartsOption = { ...base };
  for (const key of Object.keys(patch) as (keyof EChartsOption)[]) {
    const pk = patch[key];
    if (pk === undefined) continue;
    const bk = base[key];
    if (key === "series") {
      if (Array.isArray(pk) && Array.isArray(base.series)) {
        (merged as Record<string, unknown>).series = mergeSeriesByIndex(base.series as unknown[], pk as unknown[]);
      } else {
        (merged as Record<string, unknown>).series = pk as unknown;
      }
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
