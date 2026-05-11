"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { JsxRenderer } from "@/components/jsx-renderer";
import { VisualAssetsProvider } from "@/contexts/visual-assets-context";
import type { VisualAssetsBlock } from "@/lib/visual-assets/types";
import { getScreenPreset } from "@/lib/board/screen-presets";

export function ScaledBoardPreview({
  code,
  cssVariables,
  visualAssetsBlock,
  canvasWidth,
  canvasHeight,
}: {
  code: string;
  cssVariables?: Record<string, string>;
  visualAssetsBlock?: VisualAssetsBlock | null;
  /** 设计画布像素宽，缺省为项目默认 Full HD；实际 JSX 可能更大，以测量为准 */
  canvasWidth?: number;
  /** 设计画布像素高 */
  canvasHeight?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  /** 看板实际占位（≥ 预设），与根节点写死 width/height 或异步出图后尺寸对齐 */
  const [layout, setLayout] = useState<{ w: number; h: number } | null>(null);
  const fallback = useMemo(() => getScreenPreset(undefined), []);
  const cw = canvasWidth ?? fallback.width;
  const ch = canvasHeight ?? fallback.height;
  const lw = layout?.w ?? cw;
  const lh = layout?.h ?? ch;

  useLayoutEffect(() => {
    setLayout(null);
  }, [cw, ch, code]);

  useLayoutEffect(() => {
    const outer = containerRef.current;
    const board = boardRef.current;
    if (!outer || !board) return;

    const sync = () => {
      const bw = Math.max(cw, board.offsetWidth, board.scrollWidth);
      const bh = Math.max(ch, board.offsetHeight, board.scrollHeight);
      const { width: ow, height: oh } = outer.getBoundingClientRect();
      if (ow <= 0 || oh <= 0 || bw <= 0 || bh <= 0) return;
      const s = Math.min(ow / bw, oh / bh);
      setLayout((prev) => (prev && prev.w === bw && prev.h === bh ? prev : { w: bw, h: bh }));
      setScale(s);
    };

    sync();
    const roOuter = new ResizeObserver(sync);
    const roBoard = new ResizeObserver(sync);
    roOuter.observe(outer);
    roBoard.observe(board);
    return () => {
      roOuter.disconnect();
      roBoard.disconnect();
    };
  }, [cw, ch, code]);

  const scaledW = lw * scale;
  const scaledH = lh * scale;

  return (
    <div
      ref={containerRef}
      className="min-h-0 w-full h-full flex flex-1 items-center justify-center bg-gray-950 overflow-hidden"
    >
      {/* 布局尺寸 = 缩放后视觉尺寸，避免 transform 不占布局导致父级裁剪错位 */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ width: scaledW, height: scaledH }}
      >
        <div
          ref={boardRef}
          style={{
            ...(cssVariables as React.CSSProperties | undefined),
            position: "absolute",
            left: 0,
            top: 0,
            minWidth: cw,
            minHeight: ch,
            width: "max-content",
            height: "max-content",
            boxSizing: "border-box",
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          {visualAssetsBlock ? (
            <VisualAssetsProvider block={visualAssetsBlock}>
              <JsxRenderer code={code} />
            </VisualAssetsProvider>
          ) : (
            <JsxRenderer code={code} />
          )}
        </div>
      </div>
    </div>
  );
}
