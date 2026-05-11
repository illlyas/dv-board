"use client";

import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { JsxRenderer } from "@/components/jsx-renderer";
import { VisualAssetsProvider } from "@/contexts/visual-assets-context";
import type { VisualAssetsBlock } from "@/lib/visual-assets/types";
import { getScreenPreset } from "@/lib/board/screen-presets";

export interface SelectedWidget {
  dataKey: string;
  type: string;
}

interface EditablePreviewProps {
  code: string;
  selectedWidgets: SelectedWidget[];
  onSelectionChange: (widgets: SelectedWidget[]) => void;
  cssVariables?: Record<string, string>;
  visualAssetsBlock?: VisualAssetsBlock | null;
  canvasWidth?: number;
  canvasHeight?: number;
}

const StableRenderer = memo(function StableRenderer({
  code,
  visualAssetsBlock,
}: {
  code: string;
  visualAssetsBlock?: VisualAssetsBlock | null;
}) {
  const jsx = <JsxRenderer code={code} />;
  if (!visualAssetsBlock) return jsx;
  return <VisualAssetsProvider block={visualAssetsBlock}>{jsx}</VisualAssetsProvider>;
});

export function EditablePreview({
  code,
  selectedWidgets,
  onSelectionChange,
  cssVariables,
  visualAssetsBlock,
  canvasWidth,
  canvasHeight,
}: EditablePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hoverBoxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const fallback = useMemo(() => getScreenPreset(undefined), []);
  const cw = canvasWidth ?? fallback.width;
  const ch = canvasHeight ?? fallback.height;

  const selectedRef = useRef(selectedWidgets);
  selectedRef.current = selectedWidgets;

  const [boardLayout, setBoardLayout] = useState({ w: cw, h: ch });

  useLayoutEffect(() => {
    setBoardLayout({ w: cw, h: ch });
  }, [cw, ch, code]);

  useLayoutEffect(() => {
    const outer = containerRef.current;
    const board = canvasRef.current;
    if (!outer || !board) return;
    const sync = () => {
      const bw = Math.max(cw, board.offsetWidth, board.scrollWidth);
      const bh = Math.max(ch, board.offsetHeight, board.scrollHeight);
      const { width: ow, height: oh } = outer.getBoundingClientRect();
      if (ow <= 0 || oh <= 0 || bw <= 0 || bh <= 0) return;
      const s = Math.min(ow / bw, oh / bh);
      scaleRef.current = s;
      setScale(s);
      setBoardLayout((prev) => (prev.w === bw && prev.h === bh ? prev : { w: bw, h: bh }));
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

  const updateSelectionBoxes = useCallback(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    overlay.querySelectorAll("[data-selection-box]").forEach(el => el.remove());

    const canvasRect = canvas.getBoundingClientRect();
    const s = scaleRef.current;

    for (const { dataKey } of selectedRef.current) {
      const widgetEl = canvas.querySelector(`[data-widget-key="${dataKey}"]`);
      if (!widgetEl) continue;
      const r = widgetEl.getBoundingClientRect();

      const box = document.createElement("div");
      box.setAttribute("data-selection-box", dataKey);
      box.style.cssText = `
        position: absolute;
        top: ${(r.top - canvasRect.top) / s}px;
        left: ${(r.left - canvasRect.left) / s}px;
        width: ${r.width / s}px;
        height: ${r.height / s}px;
        border: 2px solid #3b82f6;
        box-sizing: border-box;
        pointer-events: none;
        z-index: 10;
      `;
      overlay.appendChild(box);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateSelectionBoxes, 50);
    return () => clearTimeout(timer);
  }, [selectedWidgets, scale, updateSelectionBoxes, code]);

  const findWidgetFromPoint = useCallback((clientX: number, clientY: number): SelectedWidget | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const overlayEl = canvas.parentElement?.querySelector("[data-overlay]") as HTMLElement | null;
    if (overlayEl) overlayEl.style.pointerEvents = "none";
    const el = document.elementFromPoint(clientX, clientY);
    if (overlayEl) overlayEl.style.pointerEvents = "all";

    if (!el) return null;

    // 向上找最近的 data-widget-key 节点（Widget 组件和带标记的 HTML 元素统一识别）
    let node: Element | null = el;
    while (node && node !== canvas) {
      const key = node.getAttribute("data-widget-key");
      const type = node.getAttribute("data-widget-type");
      if (key) return { dataKey: key, type: type ?? "" };
      node = node.parentElement;
    }
    return null;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const hoverBox = hoverBoxRef.current;
    const canvas = canvasRef.current;
    if (!hoverBox || !canvas) return;

    const widget = findWidgetFromPoint(e.clientX, e.clientY);

    if (!widget || selectedRef.current.some(w => w.dataKey === widget.dataKey)) {
      hoverBox.style.display = "none";
      return;
    }

    const widgetEl = canvas.querySelector(`[data-widget-key="${widget.dataKey}"]`);
    if (!widgetEl) { hoverBox.style.display = "none"; return; }

    const canvasRect = canvas.getBoundingClientRect();
    const r = widgetEl.getBoundingClientRect();
    const s = scaleRef.current;

    hoverBox.style.cssText = `
      display: block;
      position: absolute;
      top: ${(r.top - canvasRect.top) / s}px;
      left: ${(r.left - canvasRect.left) / s}px;
      width: ${r.width / s}px;
      height: ${r.height / s}px;
      border: 1px dashed #93c5fd;
      box-sizing: border-box;
      pointer-events: none;
      z-index: 9;
    `;
  }, [findWidgetFromPoint]);

  const handleMouseLeave = useCallback(() => {
    if (hoverBoxRef.current) hoverBoxRef.current.style.display = "none";
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const widget = findWidgetFromPoint(e.clientX, e.clientY);

    if (!widget) {
      onSelectionChange([]);
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      const current = selectedRef.current;
      const exists = current.some(w => w.dataKey === widget.dataKey);
      onSelectionChange(
        exists
          ? current.filter(w => w.dataKey !== widget.dataKey)
          : [...current, widget]
      );
    } else {
      onSelectionChange([widget]);
    }
  }, [findWidgetFromPoint, onSelectionChange]);

  const scaledW = boardLayout.w * scale;
  const scaledH = boardLayout.h * scale;

  return (
    <div
      ref={containerRef}
      className="min-h-0 w-full h-full flex flex-1 items-center justify-center bg-gray-950 overflow-hidden relative"
    >
      <div className="relative shrink-0 overflow-hidden" style={{ width: scaledW, height: scaledH }}>
        <div
          ref={canvasRef}
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
          <StableRenderer code={code} visualAssetsBlock={visualAssetsBlock} />
          <div ref={overlayRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 8 }} />
          <div ref={hoverBoxRef} style={{ display: "none", position: "absolute", pointerEvents: "none" }} />
        </div>
      </div>

      <div
        data-overlay
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ position: "absolute", inset: 0, cursor: "crosshair", zIndex: 20 }}
      />
    </div>
  );
}
