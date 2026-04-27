"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 根据 host 容器实际尺寸与画布设计尺寸(viewSize)，计算等比缩放比例。
 * 确保画布始终完整显示在容器内（fit-content）。
 */
export function useCanvasScale(width: number, height: number) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = hostRef.current;
    if (!element || !width || !height) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const nextScale = Math.min(
        entry.contentRect.width / width,
        entry.contentRect.height / height,
      );
      setScale(nextScale > 0 ? nextScale : 1);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [width, height]);

  return { hostRef, scale };
}
