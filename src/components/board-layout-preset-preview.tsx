"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getLayoutPreset } from "@/lib/board/board-layout-presets";

const ZONE_COLORS = [
  "color-mix(in srgb, var(--color-primary) 35%, transparent)",
  "color-mix(in srgb, var(--color-accent) 28%, transparent)",
  "color-mix(in srgb, var(--color-muted) 45%, transparent)",
  "color-mix(in srgb, var(--color-primary) 22%, transparent)",
];

export function BoardLayoutPresetPreview({
  presetId,
  className,
  /** 卡片选择等场景外层已有标题时设为 false */
  showCaption = true,
}: {
  presetId: string;
  className?: string;
  showCaption?: boolean;
}) {
  const preset = useMemo(() => getLayoutPreset(presetId), [presetId]);
  const cz = preset.contentZone;

  const cells = useMemo(() => {
    const seen = new Set<string>();
    const out: { area: string; label: string }[] = [];
    for (const [rid, v] of Object.entries(preset.regionPlacement)) {
      const area = v.gridArea.trim();
      if (!area || seen.has(area)) continue;
      seen.add(area);
      out.push({ area, label: rid });
    }
    return out;
  }, [preset]);

  return (
    <div className={cn("flex flex-col gap-1 rounded-md border border-border bg-muted/20 p-2", className)}>
      <div
        className="rounded-sm px-1 py-0.5 text-[10px] text-muted-foreground"
        style={{
          background: "color-mix(in srgb, var(--color-muted) 50%, transparent)",
        }}
      >
        KPI 横条（示意）
      </div>
      <div
        className="min-h-[72px] overflow-hidden rounded-sm"
        style={{
          display: "grid",
          gridTemplateColumns: cz.gridTemplateColumns,
          gridTemplateRows: cz.gridTemplateRows,
          gridTemplateAreas: cz.gridTemplateAreas,
          gap: 6,
          padding: 6,
          boxSizing: "border-box",
          background: "color-mix(in srgb, var(--color-bg) 92%, transparent)",
        }}
      >
        {cells.map(({ area, label }, i) => (
          <div
            key={area}
            style={{
              gridArea: area,
              background: ZONE_COLORS[i % ZONE_COLORS.length],
              borderRadius: "var(--radius-sm)",
              fontSize: 10,
              padding: 4,
              color: "var(--color-text-primary)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {area}
            <span style={{ opacity: 0.65, marginLeft: 4 }}>({label})</span>
          </div>
        ))}
      </div>
      {showCaption ? (
        <p className="text-[10px] leading-snug text-muted-foreground">{preset.label}</p>
      ) : null}
    </div>
  );
}
