/**
 * 从 dashboard.jsx 源码扫描主标题 / 底栏 backdrop id 与是否使用图表 titleBackdrop。
 */
const HERO_ID_RE = /<BoardHeroBackdrop[^>]*\bid=["']([^"']+)["']/i;
const FOOTER_ID_RE = /<BoardFooterBackdrop[^>]*\bid=["']([^"']+)["']/i;
const PAGE_ID_RE = /<BoardPageBackdrop[^>]*\bid=["']([^"']+)["']/i;
const TITLE_BACKDROP_TRUE_RE = /titleBackdrop:\s*true\b/;

export type DashboardVisualScanResult = {
  heroImplementationIds: string[];
  footerImplementationIds: string[];
  pageImplementationIds: string[];
  chartTitleBackdropUsed: boolean;
};

export function scanDashboardJsxForVisualAssets(source: string): DashboardVisualScanResult {
  const heroImplementationIds: string[] = [];
  const footerImplementationIds: string[] = [];
  const pageImplementationIds: string[] = [];
  const hm = source.match(HERO_ID_RE);
  if (hm?.[1]) heroImplementationIds.push(hm[1]);
  const fm = source.match(FOOTER_ID_RE);
  if (fm?.[1]) footerImplementationIds.push(fm[1]);
  const pm = source.match(PAGE_ID_RE);
  if (pm?.[1]) pageImplementationIds.push(pm[1]);
  const chartTitleBackdropUsed = TITLE_BACKDROP_TRUE_RE.test(source);
  return { heroImplementationIds, footerImplementationIds, pageImplementationIds, chartTitleBackdropUsed };
}
