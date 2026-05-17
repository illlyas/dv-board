"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardPreviewProvider } from "@/contexts/dashboard-preview-context";
import { ScaledBoardPreview } from "@/components/board-studio/preview";
import type { ViTokensJson } from "@/lib/board/vi-tokens-inject";
import { viTokensToInjectStyleVars } from "@/lib/board/vi-tokens-inject";
import { loadDashboardStoreOnce } from "@/lib/dashboard-store-client-cache";
import { readFile } from "@/lib/pipeline/file-operations";
import {
  parseDashboardWidgetsJson,
  type DashboardWidgetsMap,
} from "@/lib/board/load-dashboard-widgets";
import {
  parseChromeFromSlotsSchemaJson,
  resolveDashboardChrome,
} from "@/lib/board/load-dashboard-chrome";
import {
  parsePanelHeadersFromSlotsSchemaJson,
  resolveDashboardPanelHeaders,
  type DashboardPanelHeadersMap,
} from "@/lib/board/load-dashboard-panel-headers";
import type { FooterNavItem } from "@/lib/board/wind-chrome-keys";
import type { VisualAssetsBlock } from "@/lib/visual-assets/types";
import { getScreenPreset } from "@/lib/board/screen-presets";
import type { ProjectConfig } from "@/lib/projects/project-config";

function sanitizeDashboardFilename(name: string | null): string {
  const n = (name ?? "dashboard.jsx").trim();
  if (!/^[a-zA-Z0-9_\-.]+\.jsx$/i.test(n)) return "dashboard.jsx";
  return n;
}

export function FullscreenDashboard() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = typeof params.id === "string" ? params.id : "";
  const fileName = sanitizeDashboardFilename(searchParams.get("file"));

  const [code, setCode] = useState<string | null>(null);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetsMap | null>(null);
  const [dashboardPanelHeaders, setDashboardPanelHeaders] =
    useState<DashboardPanelHeadersMap | null>(null);
  const [dashboardFooterNav, setDashboardFooterNav] = useState<FooterNavItem[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [cssVariables, setCssVariables] = useState<Record<string, string> | undefined>(undefined);
  const [visualAssetsBlock, setVisualAssetsBlock] = useState<VisualAssetsBlock | null>(null);
  const defaultScreen = getScreenPreset(undefined);
  const [boardCanvasWidth, setBoardCanvasWidth] = useState(defaultScreen.width);
  const [boardCanvasHeight, setBoardCanvasHeight] = useState(defaultScreen.height);

  useEffect(() => {
    if (!projectId.trim()) {
      setLoadErr("缺少项目 ID");
      return;
    }

    let cancelled = false;
    setCode(null);
    setLoadErr(null);

    (async () => {
      try {
        const jsxPath = `.dv/${projectId}/页面/${fileName}`;
        const [jsxRaw, tokensRaw, widgetsRaw, slotsSchemaRaw, projRes] = await Promise.all([
          readFile(jsxPath),
          readFile(`.dv/${projectId}/品牌VI/vi-tokens.json`).catch(() => null),
          readFile(`.dv/${projectId}/页面/widgets.json`).catch(() => null),
          readFile(`.dv/${projectId}/页面结构/slots.schema.json`).catch(() => null),
          fetch(`/api/projects/${encodeURIComponent(projectId)}`),
        ]);
        if (cancelled) return;

        setCode(jsxRaw);

        let viDoc: ViTokensJson | null = null;
        if (tokensRaw) {
          try {
            viDoc = JSON.parse(tokensRaw) as ViTokensJson;
            setCssVariables(viTokensToInjectStyleVars(viDoc));
          } catch {
            viDoc = null;
            setCssVariables(undefined);
          }
        } else {
          setCssVariables(undefined);
        }

        setDashboardWidgets(widgetsRaw ? parseDashboardWidgetsJson(widgetsRaw, viDoc) : null);
        const chrome = resolveDashboardChrome(
          slotsSchemaRaw ? parseChromeFromSlotsSchemaJson(slotsSchemaRaw) : null
        );
        setDashboardPanelHeaders(
          resolveDashboardPanelHeaders(
            slotsSchemaRaw ? parsePanelHeadersFromSlotsSchemaJson(slotsSchemaRaw) : null
          )
        );
        setDashboardFooterNav(chrome.footerNav);

        try {
          await loadDashboardStoreOnce(projectId, fileName);
        } catch {
          /* 无 store 时组件可走 mock */
        }

        if (projRes.ok) {
          const d = (await projRes.json()) as { project: ProjectConfig };
          if (!cancelled) {
            setVisualAssetsBlock(d.project.visualAssets ?? null);
            const sp = getScreenPreset(d.project.screenPresetId);
            setBoardCanvasWidth(sp.width);
            setBoardCanvasHeight(sp.height);
          }
        } else if (!cancelled) {
          setVisualAssetsBlock(null);
          setBoardCanvasWidth(defaultScreen.width);
          setBoardCanvasHeight(defaultScreen.height);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadErr(e instanceof Error ? e.message : String(e));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, fileName]);

  if (!projectId.trim()) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-gray-950 px-6 text-center text-sm text-red-300">
        缺少项目 ID
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-gray-950 px-6 text-center text-sm text-red-300">
        {loadErr}
      </div>
    );
  }

  if (code === null) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-gray-950">
        <span className="h-8 w-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-gray-950">
      <DashboardPreviewProvider projectName={projectId} dashboardFile={fileName}>
        <div className="flex min-h-0 flex-1 flex-col">
          <ScaledBoardPreview
            code={code}
            dashboardWidgets={dashboardWidgets}
            dashboardPanelHeaders={dashboardPanelHeaders}
            dashboardFooterNav={dashboardFooterNav}
            cssVariables={cssVariables}
            visualAssetsBlock={visualAssetsBlock}
            canvasWidth={boardCanvasWidth}
            canvasHeight={boardCanvasHeight}
          />
        </div>
      </DashboardPreviewProvider>
    </div>
  );
}
