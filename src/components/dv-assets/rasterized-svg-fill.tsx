"use client";

import React, { useCallback, useEffect, useId, useRef } from "react";
import { renderSvgMarkupToCanvas } from "@/lib/rasterized-svg/render-svg-markup-to-canvas";
import type { SvgMarkupBuilderArgs } from "@/lib/rasterized-svg/svg-markup-types";

export type { SvgMarkupBuilderArgs } from "@/lib/rasterized-svg/svg-markup-types";

export type RasterizedSvgFillProps = {
  className?: string;
  style?: React.CSSProperties;
  /** 生成完整 `<svg ...>...</svg>` 片段（须含 xmlns 与 viewBox） */
  buildSvgMarkup: (args: SvgMarkupBuilderArgs) => string;
  /**
   * 解析 token 时使用的 DOM 节点；默认用本组件容器（可读到祖先注入的 CSS 变量）。
   * 若变量挂在更外层，可传入对应 ref。
   */
  colorSourceRef?: React.RefObject<Element | null>;
  /** 父级在 token 变化时递增，强制重绘 */
  redrawToken?: number | string;
  "aria-hidden"?: boolean | "true" | "false";
};

const MAX_DPR = 3;

/**
 * 将「含设计几何的 SVG 标记」在运行时注入 token 色值后栅格到 canvas，CSS 100% 铺满容器（可非等比拉伸）。
 * 之后新增大屏 SVG 底纹：实现 `buildSvgMarkup` + 本组件即可。
 */
export function RasterizedSvgFill({
  className,
  style,
  buildSvgMarkup,
  colorSourceRef,
  redrawToken,
  "aria-hidden": ariaHidden = true,
}: RasterizedSvgFillProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idPrefix = `rsf-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const rafRef = useRef<number>(0);
  const paintQueueRef = useRef(Promise.resolve());

  const paint = useCallback(async () => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const source = colorSourceRef?.current ?? wrap;
    let computed: CSSStyleDeclaration;
    try {
      computed = getComputedStyle(source);
    } catch {
      computed = getComputedStyle(document.documentElement);
    }

    const color = (cssVarName: string, fallback: string) => {
      const raw = computed.getPropertyValue(cssVarName).trim();
      return raw || fallback;
    };

    const w = Math.max(1, Math.round(wrap.clientWidth));
    const h = Math.max(1, Math.round(wrap.clientHeight));
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, MAX_DPR);
    const pw = Math.max(1, Math.floor(w * dpr));
    const ph = Math.max(1, Math.floor(h * dpr));

    const svg = buildSvgMarkup({ idPrefix, color });
    try {
      await renderSvgMarkupToCanvas(svg, canvas, pw, ph);
    } catch {
      /* 解码失败时保持上一帧 */
    }
  }, [buildSvgMarkup, colorSourceRef, idPrefix, redrawToken]);

  const schedulePaint = useCallback(() => {
    if (typeof window === "undefined") return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      paintQueueRef.current = paintQueueRef.current
        .then(() => paint())
        .catch(() => undefined);
    });
  }, [paint]);

  useEffect(() => {
    schedulePaint();
  }, [schedulePaint]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => schedulePaint());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [schedulePaint]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
      aria-hidden={ariaHidden === true || ariaHidden === "true" ? true : ariaHidden === false ? false : undefined}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          verticalAlign: "top",
        }}
      />
    </div>
  );
}
