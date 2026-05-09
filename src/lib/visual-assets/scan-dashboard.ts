/**
 * 从 dashboard.jsx 源码扫描主标题 backdrop id 与是否使用图表 titleBackdrop。
 */
const HERO_ID_RE = /<BoardHeroBackdrop[^>]*\bid=["']([^"']+)["']/i;
const TITLE_BACKDROP_TRUE_RE = /titleBackdrop:\s*true\b/;

export type DashboardVisualScanResult = {
  heroImplementationIds: string[];
  chartTitleBackdropUsed: boolean;
};

export function scanDashboardJsxForVisualAssets(source: string): DashboardVisualScanResult {
  const heroImplementationIds: string[] = [];
  const m = source.match(HERO_ID_RE);
  if (m?.[1]) heroImplementationIds.push(m[1]);
  const chartTitleBackdropUsed = TITLE_BACKDROP_TRUE_RE.test(source);
  return { heroImplementationIds, chartTitleBackdropUsed };
}
