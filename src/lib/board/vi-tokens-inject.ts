/**
 * 将 vi-tokens.json 解析结果转为画布 style 上可注入的 CSS 变量表（与 FilePanel 原逻辑一致）。
 */

export type ViTokensJson = {
  mode?: "light" | "dark";
  cssVariables?: Record<string, string>;
  chartPalette?: string[];
  [key: string]: unknown;
};

export function viTokensToInjectStyleVars(doc: ViTokensJson | null): Record<string, string> | undefined {
  if (!doc) return undefined;
  const vars: Record<string, string> = {};
  if (doc.cssVariables && typeof doc.cssVariables === "object") {
    for (const [k, v] of Object.entries(doc.cssVariables)) {
      if (typeof v === "string" && v.trim()) {
        const key = k.startsWith("--") ? k : `--${k}`;
        vars[key] = v;
      }
    }
  }
  if (Array.isArray(doc.chartPalette)) {
    doc.chartPalette.forEach((c, i) => {
      if (typeof c === "string" && c.trim()) {
        vars[`--chart-${i + 1}`] = c;
      }
    });
  }
  if (doc.mode === "dark" || doc.mode === "light") {
    vars.colorScheme = doc.mode;
  }
  return Object.keys(vars).length ? vars : undefined;
}
