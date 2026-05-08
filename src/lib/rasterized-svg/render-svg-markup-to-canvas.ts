/**
 * 将内联 SVG 标记光栅化到 canvas（任意拉伸，不保留矢量纵横比）。
 * 使用 Blob URL，避免 data URL 对 `#` 等字符的编码问题。
 */
export function renderSvgMarkupToCanvas(
  svgMarkup: string,
  canvas: HTMLCanvasElement,
  targetPixelW: number,
  targetPixelH: number
): Promise<void> {
  const w = Math.max(1, Math.floor(targetPixelW));
  const h = Math.max(1, Math.floor(targetPixelH));
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context unavailable"));
          return;
        }
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve();
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG raster decode failed"));
    };
    img.src = url;
  });
}
