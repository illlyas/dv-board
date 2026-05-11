"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DashboardPreviewProvider } from "@/contexts/dashboard-preview-context";
import { ScaledBoardPreview } from "@/components/board-studio/preview";
import type { ViTokensJson } from "@/lib/board/vi-tokens-inject";
import { viTokensToInjectStyleVars } from "@/lib/board/vi-tokens-inject";
import { getScreenPreset } from "@/lib/board/screen-presets";
import type { BoardTemplateBundle } from "@/lib/board-templates/types";
import { encodeBoardTemplateProjectName } from "@/lib/board-templates/template-project-name";

function defaultDashboardFile(meta: BoardTemplateBundle["meta"]): string {
  const n = (meta.dashboardFile ?? "dashboard.jsx").trim();
  if (!/^[a-zA-Z0-9_\-.]+\.jsx$/i.test(n)) return "dashboard.jsx";
  return n;
}

export function TemplatePreviewBody({ id }: { id: string }) {
  const [bundle, setBundle] = useState<BoardTemplateBundle | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBundle(null);
    setErr(null);
    (async () => {
      try {
        const res = await fetch(`/api/board-templates/${encodeURIComponent(id)}`);
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as BoardTemplateBundle;
        if (!cancelled) setBundle(data);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : String(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const cssVariables = useMemo(() => {
    if (!bundle) return undefined;
    try {
      const doc = JSON.parse(bundle.viTokensJson) as ViTokensJson;
      return viTokensToInjectStyleVars(doc);
    } catch {
      return undefined;
    }
  }, [bundle]);

  const screen = useMemo(() => {
    if (!bundle) return getScreenPreset(undefined);
    return getScreenPreset(bundle.meta.screenPresetId);
  }, [bundle]);

  const dashboardFile = bundle ? defaultDashboardFile(bundle.meta) : "dashboard.jsx";
  const virtualProject = encodeBoardTemplateProjectName(id);

  if (err) {
    return (
      <div className="flex h-dvh flex-col bg-gray-950 text-sm text-red-300">
        <header className="shrink-0 border-b border-white/10 px-4 py-3 flex items-center gap-4">
          <Link
            href="/templates"
            className="text-cyan-400/90 hover:text-cyan-300 text-xs font-medium"
          >
            ← 模板市场
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 text-center">{err}</div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="flex h-dvh flex-col bg-gray-950">
        <header className="shrink-0 border-b border-white/10 px-4 py-3 flex items-center gap-4">
          <Link
            href="/templates"
            className="text-cyan-400/90 hover:text-cyan-300 text-xs font-medium"
          >
            ← 模板市场
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <span className="h-8 w-8 border-2 border-gray-700 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-gray-950">
      <header className="shrink-0 z-10 border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 bg-gray-950/95 backdrop-blur-sm">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/templates"
            className="shrink-0 text-cyan-400/90 hover:text-cyan-300 text-xs font-medium"
          >
            ← 模板市场
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-100 truncate">{bundle.meta.title}</h1>
            {bundle.meta.description ? (
              <p className="text-[11px] text-slate-500 truncate max-w-[min(560px,50vw)]">
                {bundle.meta.description}
              </p>
            ) : null}
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-slate-500 tabular-nums">
          {screen.width}×{screen.height}
        </span>
      </header>
      <DashboardPreviewProvider projectName={virtualProject} dashboardFile={dashboardFile}>
        <div className="flex min-h-0 flex-1 flex-col">
          <ScaledBoardPreview
            code={bundle.dashboardJsx}
            cssVariables={cssVariables}
            visualAssetsBlock={null}
            canvasWidth={screen.width}
            canvasHeight={screen.height}
          />
        </div>
      </DashboardPreviewProvider>
    </div>
  );
}
