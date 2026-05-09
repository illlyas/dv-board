import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const svgPath = path.join(root, ".assets", "page", "背景素材2.svg");
const outPath = path.join(root, "src", "components", "dv-assets", "board", "page-background-pattern-href.ts");

const s = fs.readFileSync(svgPath, "utf8");
const m = s.match(/xlink:href="(data:image\/png;base64,[^"]+)"/);
if (!m) {
  console.error("Could not find xlink:href data URL in SVG");
  process.exit(1);
}
const href = m[1];
const body = `/** Auto-generated from .assets/page/背景素材2.svg — PNG data URL for page backdrop pattern. Regenerate: node scripts/gen-page-background-href.mjs */
export const PAGE_BACKGROUND_PATTERN_IMAGE_HREF = ${JSON.stringify(href)} as const;
`;
fs.writeFileSync(outPath, body, "utf8");
console.log("Wrote", outPath, "length", body.length);
