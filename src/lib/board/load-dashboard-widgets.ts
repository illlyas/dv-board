import type { ViTokensJson } from "@/lib/board/vi-tokens-inject";
import { resolveDashboardWidgetsMap } from "@/lib/board/resolve-widgets-vi-tokens";

/** 与 board-templates/wind-power-emerald-ops/widgets.json 同结构的平台 Widget 注册表 */
export type DashboardWidgetsMap = Record<
  string,
  { type: string; props: Record<string, unknown> }
>;

export function parseDashboardWidgetsJson(
  raw: string,
  viTokens?: ViTokensJson | null
): DashboardWidgetsMap | null {
  const t = raw?.trim();
  if (!t) return null;
  try {
    const parsed = JSON.parse(t) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const map = parsed as DashboardWidgetsMap;
    return viTokens ? resolveDashboardWidgetsMap(map, viTokens) : map;
  } catch {
    return null;
  }
}
