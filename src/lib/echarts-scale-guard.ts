/**
 * 当 widgets.json 中 echartsOptionOverrides 的 yAxis min/max 与真实数据量纲不符时，
 * 去掉固定刻度，避免折线/柱形「有数据但不可见」。
 */
export function guardCartesianScaleOverrides<T extends Record<string, unknown>>(
  overrides: T | null | undefined,
  chartData: Record<string, unknown>[],
  valueFields: string[]
): T | null | undefined {
  if (!overrides || !chartData.length || !valueFields.length) return overrides;

  const nums: number[] = [];
  for (const row of chartData) {
    for (const f of valueFields) {
      const n = Number(row[f]);
      if (Number.isFinite(n)) nums.push(n);
    }
  }
  if (!nums.length) return overrides;

  const dataMax = Math.max(...nums);
  const dataMin = Math.min(...nums);

  const o = structuredClone(overrides) as T & { yAxis?: unknown };
  const ya = o.yAxis;
  if (!ya || typeof ya !== "object" || Array.isArray(ya)) return o;

  const axis = ya as { min?: unknown; max?: unknown; interval?: unknown };
  const max = Number(axis.max);
  const min = Number(axis.min);

  const maxClips =
    Number.isFinite(max) && (max < dataMax * 0.5 || (dataMin >= 0 && max < dataMax));
  const minClips = Number.isFinite(min) && min > dataMin;

  if (maxClips || minClips) {
    delete axis.max;
    delete axis.min;
    delete axis.interval;
  }

  return o;
}
