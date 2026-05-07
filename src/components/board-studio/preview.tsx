"use client";

import React, { useEffect, useRef, useState } from "react";
import { JsxRenderer } from "@/components/jsx-renderer";

const CANVAS_W = 1920;
const CANVAS_H = 1080;

export function ScaledBoardPreview({ code }: { code: string }) {
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
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
        }}
      >
        <JsxRenderer code={code} />
      </div>
    </div>
  );
}
