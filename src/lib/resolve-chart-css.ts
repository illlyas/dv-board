"use client";

/**
 * ECharts Canvas 无法直接使用 var(--*)，在挂载容器上用 probe + getComputedStyle 解析为 rgb/rgba。
 */
export type CssProbeProp = "color" | "backgroundColor" | "borderColor";

export function resolveCssForCanvas(
  container: HTMLElement | null,
  value: string | undefined,
  prop: CssProbeProp = "color"
): string {
  if (!container || value == null || value === "") return value ?? "";
  const v = value.trim();
  if (/^#[0-9A-Fa-f]{3,8}$/.test(v)) return v;
  if (!v.includes("var(") && /^(rgb|hsl)a?\(/i.test(v)) return v;

  const probe = document.createElement("span");
  probe.style.cssText = [
    "position:absolute",
    "left:0",
    "top:0",
    "width:0",
    "height:0",
    "overflow:hidden",
    "pointer-events:none",
    "visibility:hidden",
  ].join(";");
  if (prop === "color") probe.style.color = v;
  else if (prop === "backgroundColor") probe.style.backgroundColor = v;
  else probe.style.borderColor = v;

  container.appendChild(probe);
  try {
    const cs = getComputedStyle(probe);
    const out =
      prop === "color"
        ? cs.color
        : prop === "backgroundColor"
          ? cs.backgroundColor
          : cs.borderColor;
    return out && out !== "rgba(0, 0, 0, 0)" ? out : v;
  } finally {
    container.removeChild(probe);
  }
}

export function resolveColorList(container: HTMLElement | null, colors: string[]): string[] {
  return colors.map((c) => resolveCssForCanvas(container, c, "color"));
}
