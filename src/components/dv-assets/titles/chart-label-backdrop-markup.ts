import type { SvgMarkupBuilderArgs } from "@/lib/rasterized-svg/svg-markup-types";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** 供 {@link ChartLabelBackdrop} 栅格化：几何与 `.assets/chart-label/分组 22.svg` 一致 */
export function buildChartLabelSvgMarkup({ idPrefix, color }: SvgMarkupBuilderArgs): string {
  const primary = esc(color("--color-primary", "#527df3"));
  const text = esc(color("--color-text-primary", "#192147"));
  const gid = `${idPrefix}-g0`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 558 51" width="558" height="51" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M557 0C557.552 0 558 0.447729 558 1.00001V50C558 50.5523 557.552 51 557 51H0.999936C0.447516 51 0 50.5523 0 50V1.00001C0 0.447729 0.447516 0 0.999936 0H557Z" fill="${text}" fill-opacity="0.4"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M170.012 0L193.557 51H0V0H170.012Z" fill="url(#${gid})"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M62.7754 0L68 4H0V0H62.7754Z" fill="${primary}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M537 0V4H531V0H537Z" fill="${primary}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M548 0V4H542V0H548Z" fill="${primary}"/>
<defs>
<linearGradient id="${gid}" x1="309.664" y1="20.8812" x2="268.38" y2="-91.1126" gradientUnits="userSpaceOnUse">
<stop stop-color="${primary}" stop-opacity="0.85"/>
<stop offset="1" stop-color="${text}"/>
</linearGradient>
</defs>
</svg>`;
}
