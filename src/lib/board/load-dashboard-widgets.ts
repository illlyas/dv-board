/** 与 board-templates/wind-power-emerald-ops/widgets.json 同结构的平台 Widget 注册表 */
export type DashboardWidgetsMap = Record<
  string,
  { type: string; props: Record<string, unknown> }
>;

export function parseDashboardWidgetsJson(raw: string): DashboardWidgetsMap | null {
  const t = raw?.trim();
  if (!t) return null;
  try {
    const parsed = JSON.parse(t) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as DashboardWidgetsMap;
  } catch {
    return null;
  }
}
