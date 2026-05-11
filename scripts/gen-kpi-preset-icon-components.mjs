/**
 * 从 .assets/icon/1.svg … 6.svg 生成独立 React 组件（内联 SVG JSX），
 * defs id 用 useId() 前缀避免同页多实例冲突；色值使用 var(--asset-icon-*)。
 *
 * 运行：npm run gen:kpi-icons
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const iconDir = path.join(root, ".assets", "icon");
const outDir = path.join(
  root,
  "src",
  "components",
  "dv-assets",
  "kpi-preset-icons",
  "icons"
);

const FILE_META = [
  ["1", "kpi-sync-refresh", "KpiIconSyncRefresh"],
  ["2", "kpi-analytics-bars", "KpiIconAnalyticsBars"],
  ["3", "kpi-insight-badge", "KpiIconInsightBadge"],
  ["4", "kpi-capsule", "KpiIconCapsule"],
  ["5", "kpi-pharmacy", "KpiIconPharmacy"],
  ["6", "kpi-package", "KpiIconPackage"],
];

function collectIds(svg) {
  const ids = new Set();
  const re = /\bid="([^"]+)"/g;
  let m;
  while ((m = re.exec(svg))) ids.add(m[1]);
  return [...ids];
}

function replaceColorsWithTokens(svg) {
  let s = svg;
  const pairs = [
    ['stop-color="rgba(87, 87, 87, 1)"', 'stopColor="var(--asset-icon-stop-shade-mid)"'],
    ['stop-color="rgba(21, 21, 21, 1)"', 'stopColor="var(--asset-icon-stop-shade-deep)"'],
    ['stop-color="rgba(227, 227, 229, 0.6)"', 'stopColor="var(--asset-icon-stop-frost-from)"'],
    ['stop-color="rgba(187, 187, 192, 0.6)"', 'stopColor="var(--asset-icon-stop-frost-to)"'],
    ['stop-color="rgba(255, 255, 255, 1)"', 'stopColor="var(--asset-icon-stop-highlight)"'],
    ['fill="#FFF"', 'fill="var(--asset-icon-mask-bg)"'],
    ['fill="#000"', 'fill="var(--asset-icon-mask-cutout)"'],
  ];
  for (const [a, b] of pairs) s = s.split(a).join(b);
  return s;
}

function normalizeSvgRoot(svg) {
  return svg.replace(
    /<svg\s+width="24px"\s+height="24px"/i,
    '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet"'
  );
}

/** 长 id → i0, i1 …（同文件内唯一） */
function remapToShortIds(svg) {
  const longIds = collectIds(svg).sort((a, b) => b.length - a.length);
  const map = new Map();
  longIds.forEach((id, i) => map.set(id, `i${i}`));
  let out = svg;
  for (const [old, short] of map) {
    out = out.split(`id="${old}"`).join(`id="${short}"`);
    out = out.split(`url(#${old})`).join(`url(#${short})`);
  }
  return out;
}

function svgInnerToJsx(inner) {
  let s = inner.trim();

  // url(#ix) 引用 → JSX 表达式（先于 id= 处理）
  s = s.replace(/([\w-]+)="url\(#(i\d+)\)"/g, (_, rawAttr, idShort) => {
    const camel =
      rawAttr === "clip-path"
        ? "clipPath"
        : rawAttr === "fill-rule"
          ? "fillRule"
          : rawAttr === "clip-rule"
            ? "clipRule"
            : rawAttr === "stop-color"
              ? "stopColor"
              : rawAttr === "stop-opacity"
                ? "stopOpacity"
                : rawAttr === "class"
                  ? "className"
                  : rawAttr.includes("-")
                    ? rawAttr.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
                    : rawAttr;
    return `${camel}={\`url(#\${I("${idShort}")})\`}`;
  });

  s = s.replace(/\bid="(i\d+)"/g, 'id={I("$1")}');

  s = s.replace(/\sclass="/g, ' className="');
  s = s.replace(/\bclip-path="/g, 'clipPath="');
  s = s.replace(/\bfill-rule="/g, 'fillRule="');
  s = s.replace(/\bclip-rule="/g, 'clipRule="');
  s = s.replace(/\bstop-color="/g, 'stopColor="');
  s = s.replace(/\bstop-opacity="/g, 'stopOpacity="');

  return s;
}

function writeBarrel() {
  const lines = FILE_META.map(
    ([, semanticId, componentName]) =>
      `export { ${componentName} } from "./${semanticId}";`
  );
  const barrelPath = path.join(outDir, "index.ts");
  fs.writeFileSync(barrelPath, `${lines.join("\n")}\n`, "utf8");
  console.log("Wrote", path.relative(root, barrelPath));
}

function extractSvgInner(svg) {
  const m = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/i);
  if (!m) throw new Error("parse svg inner failed");
  return m[1];
}

function buildTsx(componentName, innerJsx) {
  return `"use client";

import React, { useId } from "react";
import {
  kpiPresetIconCssVars,
  type KpiPresetIconSvgProps,
} from "../kpi-preset-icon-shared";

/** KPI 预设矢量：${componentName}（内联 SVG，取色见 --asset-icon-*） */
export function ${componentName}(props: KpiPresetIconSvgProps) {
  const p = useId().replace(/:/g, "");
  const I = (s: string) => \`\${p}-\${s}\`;
  return (
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      style={{ ...kpiPresetIconCssVars(), ...props.style }}
      aria-hidden
    >
${innerJsx
  .split("\n")
  .map((line) => "      " + line)
  .join("\n")}
    </svg>
  );
}
`;
}

fs.mkdirSync(outDir, { recursive: true });

for (const [num, semanticId, componentName] of FILE_META) {
  const svgPath = path.join(iconDir, `${num}.svg`);
  if (!fs.existsSync(svgPath)) {
    console.error("Missing:", svgPath);
    process.exit(1);
  }
  let raw = fs.readFileSync(svgPath, "utf8");
  raw = normalizeSvgRoot(raw);
  raw = replaceColorsWithTokens(raw);
  raw = remapToShortIds(raw);
  const inner = extractSvgInner(raw);
  const jsxBody = svgInnerToJsx(inner);
  const tsx = buildTsx(componentName, jsxBody);
  const outPath = path.join(outDir, `${semanticId}.tsx`);
  fs.writeFileSync(outPath, tsx, "utf8");
  console.log("Wrote", path.relative(root, outPath));
}

writeBarrel();
