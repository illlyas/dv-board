"use client";

import React, { useEffect, useRef, useState } from "react";
import { JsxRenderer } from "@/components/jsx-renderer";
import { VisualAssetsProvider } from "@/contexts/visual-assets-context";
import type { VisualAssetsBlock } from "@/lib/visual-assets/types";

const CANVAS_W = 1920;
const CANVAS_H = 1080;

export function ScaledBoardPreview({
  code,
  cssVariables,
  visualAssetsBlock,
}: {
  code: string;
  cssVariables?: Record<string, string>;
  visualAssetsBlock?: VisualAssetsBlock | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / CANVAS_W, height / CANVAS_H));
    };
    
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-gray-950 overflow-hidden"
    >
      <div
        style={{
          ...(cssVariables as React.CSSProperties | undefined),
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
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
  );
}
