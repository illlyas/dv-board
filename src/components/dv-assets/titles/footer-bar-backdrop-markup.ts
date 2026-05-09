import type { SvgMarkupBuilderArgs } from "@/lib/rasterized-svg/svg-markup-types";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * 底栏分页条装饰（1920×60）。几何与 `.assets/footer/footer1.svg` 一致；
 * 金色/高光停色改为读取 CSS 变量（与 hero-title-backdrop 同源策略）。
 */
export function buildFooterBarSvgMarkup({ idPrefix, color }: SvgMarkupBuilderArgs): string {
  const p = idPrefix;
  const accent = esc(color("--color-accent", "#f59e0b"));
  const primary = esc(color("--color-primary", "#3b82f6"));
  const chartHi = esc(color("--chart-3", "#22d3ee"));
  const chartWarm = esc(color("--chart-5", "#f0dbaf"));
  const hiLite = esc(color("--color-text-inverse", "#ffffff"));

  const radialStops = `
<stop stop-color="${hiLite}"/>
<stop offset="0.1375" stop-color="${accent}"/>
<stop offset="0.28" stop-color="${accent}" stop-opacity="0.85"/>
<stop offset="0.45" stop-color="${primary}" stop-opacity="0.65"/>
<stop offset="0.72" stop-color="${primary}" stop-opacity="0.35"/>
<stop offset="1" stop-color="${primary}" stop-opacity="0.08"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="60" viewBox="0 0 1920 60" fill="none">
<g style="mix-blend-mode:screen" clip-path="url(#${p}-clip0)">
<path d="M232 19.25C232 19.8015 204.24 20.25 170 20.25C135.76 20.25 108 19.8015 108 19.25C108 18.6985 135.76 18.25 170 18.25C204.24 18.25 232 18.6985 232 19.25Z" fill="url(#${p}-paint0_radial)"/>
</g>
<g style="mix-blend-mode:screen" clip-path="url(#${p}-clip1)">
<path d="M647 57.25C647 58.3531 557.452 59.25 447 59.25C336.548 59.25 247 58.3531 247 57.25C247 56.1469 336.548 55.25 447 55.25C557.452 55.25 647 56.1469 647 57.25Z" fill="url(#${p}-paint1_radial)"/>
</g>
<g style="mix-blend-mode:screen" clip-path="url(#${p}-clip2)">
<path d="M1310 57.25C1310 58.3531 1399.55 59.25 1510 59.25C1620.45 59.25 1710 58.3531 1710 57.25C1710 56.1469 1620.45 55.25 1510 55.25C1399.55 55.25 1310 56.1469 1310 57.25Z" fill="url(#${p}-paint2_radial)"/>
</g>
<path d="M0 18.25H867L884 35.25H960" stroke="url(#${p}-paint3_linear)" stroke-width="2"/>
<path d="M1920 18.25H1053L1036 35.25H960" stroke="url(#${p}-paint4_linear)" stroke-width="2"/>
<path d="M0 8.25H867L884 25.25H960" stroke="url(#${p}-paint5_linear)" stroke-opacity="0.32" stroke-width="2"/>
<path d="M1920 8.25H1053L1036 25.25H960" stroke="url(#${p}-paint6_linear)" stroke-opacity="0.32" stroke-width="2"/>
<g style="mix-blend-mode:screen" clip-path="url(#${p}-clip3)">
<path d="M1690 19.25C1690 19.8015 1662.24 20.25 1628 20.25C1593.76 20.25 1566 19.8015 1566 19.25C1566 18.6985 1593.76 18.25 1628 18.25C1662.24 18.25 1690 18.6985 1690 19.25Z" fill="url(#${p}-paint7_radial)"/>
</g>
<g filter="url(#${p}-filter0_d)">
<path d="M960 14.25L953.072 6L966.928 6L960 14.25Z" fill="${chartWarm}"/>
</g>
<defs>
<filter id="${p}-filter0_d" x="947.072" y="0" width="25.8555" height="20.25" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="3"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.85 0 0 0 0 0.25 0 0 0 0.55 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
</filter>
<radialGradient id="${p}-paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(170 19.2495) scale(61.991 0.999613)">
${radialStops}
</radialGradient>
<radialGradient id="${p}-paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(446.999 57.2489) scale(199.971 1.99923)">
${radialStops}
</radialGradient>
<radialGradient id="${p}-paint2_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1510 57.2489) rotate(180) scale(199.971 1.99923)">
${radialStops}
</radialGradient>
<radialGradient id="${p}-paint7_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1628 19.2495) scale(61.991 0.999613)">
${radialStops}
</radialGradient>
<linearGradient id="${p}-paint3_linear" x1="867" y1="19.2459" x2="0" y2="19.2459" gradientUnits="userSpaceOnUse">
<stop stop-color="${accent}"/>
<stop offset="1" stop-color="${accent}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="${p}-paint4_linear" x1="1053" y1="19.2459" x2="1920" y2="19.2459" gradientUnits="userSpaceOnUse">
<stop stop-color="${accent}"/>
<stop offset="1" stop-color="${accent}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="${p}-paint5_linear" x1="867" y1="9.24591" x2="0" y2="9.24591" gradientUnits="userSpaceOnUse">
<stop stop-color="${chartHi}"/>
<stop offset="1" stop-color="${chartHi}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="${p}-paint6_linear" x1="1053" y1="9.24591" x2="1920" y2="9.24591" gradientUnits="userSpaceOnUse">
<stop stop-color="${chartHi}"/>
<stop offset="1" stop-color="${chartHi}" stop-opacity="0"/>
</linearGradient>
<clipPath id="${p}-clip0">
<rect width="124" height="2" fill="white" transform="translate(108 18.25)"/>
</clipPath>
<clipPath id="${p}-clip1">
<rect width="400" height="4" fill="white" transform="translate(247 55.25)"/>
</clipPath>
<clipPath id="${p}-clip2">
<rect width="400" height="4" fill="white" transform="matrix(-1 0 0 1 1710 55.25)"/>
</clipPath>
<clipPath id="${p}-clip3">
<rect width="124" height="2" fill="white" transform="translate(1566 18.25)"/>
</clipPath>
</defs>
</svg>`;
}
