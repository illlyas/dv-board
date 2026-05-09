"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BoardFooterBackdrop, BoardHeroBackdrop, BoardPageBackdrop, ChartLabelBackdrop } from "@/components/dv-assets";
import { VisualAssetsProvider } from "@/contexts/visual-assets-context";
import type { VisualAssetItem, VisualAssetsBlock } from "@/lib/visual-assets/types";
import {
  ITEM_KEY_CHART_TITLE_GLOBAL,
  ITEM_KEY_FOOTER_MAIN,
  ITEM_KEY_HERO_MAIN,
  ITEM_KEY_PAGE_MAIN,
} from "@/lib/visual-assets/types";
import { createDefaultVisualAssetsBlock } from "@/lib/visual-assets/defaults";
import type { VisualAssetRoleDefinition } from "@/lib/visual-assets/registry-static";

type RegistryPayload = { roles: Record<string, VisualAssetRoleDefinition> };

function cloneBlock(b: VisualAssetsBlock): VisualAssetsBlock {
  return JSON.parse(JSON.stringify(b)) as VisualAssetsBlock;
}

export function VisualAssetsPanel({
  projectId,
  block,
  cssVariables,
  onSaved,
}: {
  projectId: string;
  block: VisualAssetsBlock;
  cssVariables?: Record<string, string>;
  onSaved: (next: VisualAssetsBlock) => void;
}) {
  const [draft, setDraft] = useState(() => cloneBlock(block));
  const [registry, setRegistry] = useState<RegistryPayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState<string | null>(null);

  useEffect(() => {
    setDraft(cloneBlock(block));
  }, [block]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/visual-assets/registry")
      .then((r) => r.json())
      .then((d: RegistryPayload) => {
        if (!cancelled) setRegistry(d);
      })
      .catch(() => {
        if (!cancelled) setRegistry(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateItem = useCallback((itemKey: string, patch: Partial<VisualAssetItem>) => {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.itemKey === itemKey ? { ...it, ...patch } : it)),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setScanNote(null);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visualAssets: draft }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { project: { visualAssets?: VisualAssetsBlock } };
      const next = data.project.visualAssets;
      if (next) {
        setDraft(cloneBlock(next));
        onSaved(next);
      }
    } catch (e) {
      console.error("[VisualAssetsPanel] save", e);
      alert(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }, [draft, onSaved, projectId]);

  const handleScan = useCallback(async () => {
    setScanning(true);
    setScanNote(null);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/visual-assets/scan`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        suggestedVisualAssets: VisualAssetsBlock;
        detected: {
          heroImplementationIds: string[];
          footerImplementationIds: string[];
          pageImplementationIds: string[];
          chartTitleBackdropUsed: boolean;
        };
        dashboardPath: string;
      };
      setDraft(cloneBlock(data.suggestedVisualAssets));
      setScanNote(
        `已根据 ${data.dashboardPath} 合并：主标题 id ${JSON.stringify(data.detected.heroImplementationIds)}；整页底 id ${JSON.stringify(data.detected.pageImplementationIds)}；底栏 id ${JSON.stringify(data.detected.footerImplementationIds)}；图表 titleBackdrop: ${data.detected.chartTitleBackdropUsed ? "有" : "无"}。请确认后点保存。`
      );
    } catch (e) {
      console.error("[VisualAssetsPanel] scan", e);
      alert("扫描失败");
    } finally {
      setScanning(false);
    }
  }, [projectId]);

  const handleReset = useCallback(() => {
    setDraft(createDefaultVisualAssetsBlock());
    setScanNote(null);
  }, []);

  const heroPreviewId =
    draft.items.find((i) => i.itemKey === ITEM_KEY_HERO_MAIN)?.implementationId ?? "hero-default";
  const footerPreviewId =
    draft.items.find((i) => i.itemKey === ITEM_KEY_FOOTER_MAIN)?.implementationId ?? "footer-default";
  const pagePreviewId =
    draft.items.find((i) => i.itemKey === ITEM_KEY_PAGE_MAIN)?.implementationId ?? "page-default";

  const grouped = useMemo(() => {
    const map = new Map<string, VisualAssetItem[]>();
    for (const it of draft.items) {
      const def = registry?.roles[it.role];
      const g = def?.displayGroup ?? "其他";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    return Array.from(map.entries());
  }, [draft.items, registry]);

  return (
    <div className="flex h-full min-h-0 w-full bg-white">
      <div
        className="flex-1 min-w-0 border-r border-gray-200 flex flex-col bg-gray-950 p-4 gap-4 overflow-auto"
        style={(cssVariables ?? {}) as React.CSSProperties}
      >
        <p className="text-xs text-gray-400 shrink-0">预览（未保存的草稿也会反映在此）</p>
        <VisualAssetsProvider block={draft}>
          <div className="rounded-lg border border-gray-700 overflow-hidden shrink-0 bg-gray-900 max-w-md">
            <div className="text-[10px] text-gray-500 px-2 py-1 border-b border-gray-800">整页画布（1920×1080 纹理预览）</div>
            <div className="relative aspect-video w-full max-h-40 overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none">
                <BoardPageBackdrop id={pagePreviewId} style={{ width: "100%", height: "100%", display: "block" }} />
              </div>
              <div className="relative z-10 flex items-center justify-center h-full min-h-[72px]">
                <span className="text-[10px] text-gray-500 px-2">弱纹理叠于 var(--color-bg) 上</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-700 overflow-hidden shrink-0 bg-gray-900">
            <div className="text-[10px] text-gray-500 px-2 py-1 border-b border-gray-800">主标题区（约 96px）</div>
            <div className="relative h-24 overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none">
                <BoardHeroBackdrop id={heroPreviewId} style={{ width: "100%", height: "100%", display: "block" }} />
              </div>
              <div className="relative z-10 flex items-center justify-center h-full">
                <span className="text-sm font-semibold text-gray-100 drop-shadow">示例主标题</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-700 overflow-hidden shrink-0 bg-gray-900">
            <div className="text-[10px] text-gray-500 px-2 py-1 border-b border-gray-800">底栏分页条（约 56px）</div>
            <div className="relative h-14 overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none">
                <BoardFooterBackdrop id={footerPreviewId} style={{ width: "100%", height: "100%", display: "block" }} />
              </div>
              <div className="relative z-10 flex items-center justify-center gap-2 h-full">
                <span className="text-[10px] px-2 py-1 rounded-md bg-blue-600 text-white">页签 A</span>
                <span className="text-[10px] px-2 py-1 rounded-md border border-gray-600 text-gray-400">页签 B</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-700 overflow-hidden shrink-0 bg-gray-900 p-3 max-w-md">
            <div className="text-[10px] text-gray-500 mb-2">图表标题条</div>
            <div
              style={{
                position: "relative",
                padding: "10px 12px 12px",
                overflow: "hidden",
                borderRadius: 8,
                border: "1px solid var(--dv-chart-panel-border, rgba(255,255,255,0.08))",
              }}
            >
              {draft.items.find((i) => i.itemKey === ITEM_KEY_CHART_TITLE_GLOBAL)?.enabled !== false ? (
                <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
                  <ChartLabelBackdrop style={{ width: "100%", height: "100%", display: "block" }} />
                </div>
              ) : null}
              <div className="relative z-10 text-sm font-semibold text-gray-100">示例图表标题</div>
            </div>
          </div>
        </VisualAssetsProvider>
      </div>

      <div className="w-[min(480px,44%)] min-w-[320px] flex flex-col border-l border-gray-100 bg-gray-50/50">
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-semibold text-gray-800">视觉素材配置</h2>
          <p className="text-xs text-gray-500 mt-1">
            运行时覆盖 dashboard.jsx 中的默认表现（方案 A）。详见仓库 <code className="text-[10px]">docs/visual-assets.md</code>
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {!registry && <p className="text-xs text-gray-400">加载注册表…</p>}
          {grouped.map(([group, items]) => (
            <div key={group}>
              <div className="text-xs font-semibold text-gray-600 mb-2">{group}</div>
              <div className="space-y-3">
                {items.map((it) => {
                  const def = registry?.roles[it.role];
                  const ids = def?.allowedImplementationIds ?? [];
                  return (
                    <div key={it.itemKey} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-gray-800">{it.label ?? it.role}</span>
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                          <input
                            type="checkbox"
                            checked={it.enabled}
                            onChange={(e) => updateItem(it.itemKey, { enabled: e.target.checked })}
                          />
                          启用
                        </label>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug">{it.description}</p>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500">实现 id</span>
                        <select
                          className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white"
                          value={it.implementationId}
                          onChange={(e) => updateItem(it.itemKey, { implementationId: e.target.value })}
                        >
                          {ids.map((id) => (
                            <option key={id} value={id}>
                              {def?.implementations[id]?.title ?? id}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">itemKey: {it.itemKey}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {scanNote && <div className="px-4 py-2 text-[11px] text-amber-800 bg-amber-50 border-t border-amber-100">{scanNote}</div>}
        <div className="shrink-0 px-4 py-3 border-t border-gray-100 flex flex-wrap gap-2 bg-white">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存"}
          </button>
          <button
            type="button"
            onClick={() => void handleScan()}
            disabled={scanning}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {scanning ? "扫描中…" : "从 dashboard 同步"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            重置默认
          </button>
        </div>
      </div>
    </div>
  );
}
