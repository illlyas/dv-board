/**
 * 将常见 CSS 颜色串解析为 RGBA，供 Tweaks 取色 + 不透明度滑条使用。
 * 不支持 oklch / lab 等时返回 null，由 UI 退化为纯文本编辑。
 */

export type Rgba = { r: number; g: number; b: number; a: number };

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 1;
  return Math.max(0, Math.min(1, n));
}

/** 是否为可解析为 RGBA 的颜色（hex / rgb / rgba） */
export function isTweakableColor(value: string): boolean {
  return tryParseCssColor(value) !== null;
}

export function tryParseCssColor(raw: string): Rgba | null {
  const s = raw.trim();
  if (!s) return null;

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    if ([r, g, b].some((x) => Number.isNaN(x))) return null;
    return { r: clamp255(r), g: clamp255(g), b: clamp255(b), a: clamp01(a) };
  }

  const rgb =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(s);
  if (rgb) {
    const r = clamp255(parseFloat(rgb[1]));
    const g = clamp255(parseFloat(rgb[2]));
    const b = clamp255(parseFloat(rgb[3]));
    const a = rgb[4] !== undefined ? clamp01(parseFloat(rgb[4])) : 1;
    return { r, g, b, a };
  }

  return null;
}

/** 有透明度时用 rgba，否则用 6 位 hex（与多数 token 文件习惯一致） */
export function rgbaToCssToken({ r, g, b, a }: Rgba): string {
  const A = clamp01(a);
  if (A >= 0.999) {
    const h = (n: number) => clamp255(n).toString(16).padStart(2, "0");
    return `#${h(r)}${h(g)}${h(b)}`;
  }
  let frac = A.toFixed(3).replace(/0+$/, "");
  if (frac.endsWith(".")) frac = frac.slice(0, -1);
  if (frac === "") frac = "0";
  return `rgba(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)}, ${frac})`;
}

export function rgbaToHex6({ r, g, b }: Rgba): string {
  const h = (n: number) => clamp255(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
