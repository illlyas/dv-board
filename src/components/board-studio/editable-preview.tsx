"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { JsxRenderer } from "@/components/jsx-renderer";

const CANVAS_W = 1920;
const CANVAS_H = 1080;

export interface SelectedWidget {
  dataKey: string;
  type: string;
}

interface EditablePreviewProps {
  code: string;
  selectedWidgets: SelectedWidget[];
  onSelectionChange: (widgets: SelectedWidget[]) => void;
}

const StableRenderer = memo(function StableRenderer({ code }: { code: string }) {
  return <JsxRenderer code={code} />;
});

export function EditablePreview({ code, selectedWidgets, onSelectionChange }: EditablePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hoverBoxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);

  const selectedRef = useRef(selectedWidgets);
  selectedRef.current = selectedWidgets;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const s = Math.min(width / CANVAS_W, height / CANVAS_H);
      scaleRef.current = s;
      setScale(s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-gray-950 overflow-hidden relative"
    >
      <div
        ref={canvasRef}
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <StableRenderer code={code} />
        <div ref={overlayRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 8 }} />
        <div ref={hoverBoxRef} style={{ display: "none", position: "absolute", pointerEvents: "none" }} />
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
