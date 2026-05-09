"use client";

import React, { useMemo, useState } from "react";
import { RgbaColorPicker } from "react-colorful";
import { isTweakableColor, rgbaToCssToken, tryParseCssColor, type Rgba } from "@/lib/board/css-color-tweak";

function displayName(storageKey: string): string {
  return storageKey.replace(/^\-\-/, "").replace(/-/g, " ");
}

function groupForKey(storageKey: string): string {
  const k = storageKey.replace(/^\-\-/, "");
  const i = k.indexOf("-");
  if (i === -1) return "其它";
  return k.slice(0, i) || "其它";
}

const CHECKER_BG =
  "repeating-conic-gradient(#d4d4d8 0% 25%, #fafafa 0% 50%) 50% / 12px 12px";

function ColorTokenRow({
  storageKey,
  value,
  onTokenChange,
}: {
  storageKey: string;
  value: string;
  onTokenChange: (key: string, v: string) => void;
}) {
  const parsed = tryParseCssColor(value)!;

  const apply = (next: Rgba) => {
    onTokenChange(storageKey, rgbaToCssToken(next));
  };

  const pickerColor = {
    r: parsed.r,
    g: parsed.g,
    b: parsed.b,
    a: parsed.a,
  };

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className="relative mx-auto h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-300 shadow-inner sm:mx-0 sm:mt-0.5"
          style={{ background: CHECKER_BG }}
          title="预览（含透明度）"
        >
          <div className="absolute inset-0" style={{ backgroundColor: rgbaToCssToken(parsed) }} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <label className="block text-sm font-medium text-gray-800" title={storageKey}>
            {displayName(storageKey)}
          </label>
          <div className="w-full max-w-[280px]">
            <RgbaColorPicker
              color={pickerColor}
              onChange={(c) =>
                apply({
                  r: Math.round(Math.max(0, Math.min(255, c.r))),
                  g: Math.round(Math.max(0, Math.min(255, c.g))),
                  b: Math.round(Math.max(0, Math.min(255, c.b))),
                  a: Math.max(0, Math.min(1, c.a)),
                })
              }
              style={{ width: "100%", maxWidth: "280px", height: "220px" }}
            />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onTokenChange(storageKey, e.target.value)}
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 font-mono text-sm text-gray-900"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

function PlainTokenRow({
  storageKey,
  value,
  onTokenChange,
}: {
  storageKey: string;
  value: string;
  onTokenChange: (key: string, v: string) => void;
}) {
  return (
    <div className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <label className="block text-sm font-medium text-gray-800" title={storageKey}>
        {displayName(storageKey)}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onTokenChange(storageKey, e.target.value)}
        className="w-full rounded-md border border-gray-200 px-2 py-2 font-mono text-sm text-gray-900"
        spellCheck={false}
      />
    </div>
  );
}

interface ViTokensTweaksPanelProps {
  cssVariables: Record<string, string>;
  onTokenChange: (storageKey: string, value: string) => void;
  onClose: () => void;
  isSaving: boolean;
  dirty: boolean;
  saveError: string | null;
  onRetrySave: () => void;
}

export function ViTokensTweaksPanel({
  cssVariables,
  onTokenChange,
  onClose,
  isSaving,
  dirty,
  saveError,
  onRetrySave,
}: ViTokensTweaksPanelProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const grouped = useMemo(() => {
    const entries = Object.entries(cssVariables).filter(([k, v]) => typeof v === "string");
    const filtered = q
      ? entries.filter(
          ([k, v]) =>
            k.toLowerCase().includes(q) ||
            displayName(k).toLowerCase().includes(q) ||
            v.toLowerCase().includes(q)
        )
      : entries;
    const map = new Map<string, [string, string][]>();
    for (const row of filtered.sort(([a], [b]) => a.localeCompare(b))) {
      const g = groupForKey(row[0]);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(row);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [cssVariables, q]);

  return (
    <aside
      className="pointer-events-auto absolute inset-y-0 right-0 z-[35] flex w-[min(26rem,calc(100vw-2rem))] min-w-0 flex-col border-l border-gray-300/90 bg-white/95 shadow-[-16px_0_48px_rgba(15,23,42,0.18)] backdrop-blur-md"
      aria-label="Tweaks 变量"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
        <span className="text-base font-semibold text-gray-900">Tweaks</span>
        <div className="flex items-center gap-2">
          {isSaving && <span className="text-sm text-gray-500">保存中…</span>}
          {!isSaving && !saveError && dirty && <span className="text-sm text-amber-600">待保存</span>}
          {!isSaving && !saveError && !dirty && <span className="text-sm text-emerald-600">已同步</span>}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            title="收起"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="shrink-0 border-b border-gray-200 px-4 py-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索变量…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {saveError && (
        <div className="mx-4 mt-3 shrink-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          <div className="whitespace-pre-wrap break-words">{saveError}</div>
          <button type="button" className="mt-2 font-medium text-red-700 underline" onClick={onRetrySave}>
            重试保存
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {grouped.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">无匹配项</p>
        ) : (
          <div className="space-y-8">
            {grouped.map(([groupName, rows]) => (
              <section key={groupName}>
                <h3 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {groupName}
                  <span className="ml-2 font-normal normal-case text-gray-400">({rows.length})</span>
                </h3>
                <div className="space-y-3">
                  {rows.map(([storageKey, value]) =>
                    isTweakableColor(value) ? (
                      <ColorTokenRow
                        key={storageKey}
                        storageKey={storageKey}
                        value={value}
                        onTokenChange={onTokenChange}
                      />
                    ) : (
                      <PlainTokenRow
                        key={storageKey}
                        storageKey={storageKey}
                        value={value}
                        onTokenChange={onTokenChange}
                      />
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
