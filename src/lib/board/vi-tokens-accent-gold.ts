/** 与 board-templates/wind-power-emerald-ops 中 useBoardViPalette.defaults.accentGold 一致 */
export const COLOR_ACCENT_GOLD_KEY = "--color-accent-gold" as const;

export const DEFAULT_COLOR_ACCENT_GOLD = "#D4B86A" as const;

/** 若模型未产出该键，补默认金属强调色，避免大屏中 var(--color-accent-gold) 失效 */
export function mergeAccentGold(cssVariables: Record<string, string>): Record<string, string> {
  const v = cssVariables[COLOR_ACCENT_GOLD_KEY]?.trim();
  if (v) return cssVariables;
  return { ...cssVariables, [COLOR_ACCENT_GOLD_KEY]: DEFAULT_COLOR_ACCENT_GOLD };
}
