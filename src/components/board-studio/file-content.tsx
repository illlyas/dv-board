"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import type { FileItem } from "@/types/board-studio.types";
import { DashboardPreviewProvider } from "@/contexts/dashboard-preview-context";
import { parseProjectAndDashboardFromFilePath } from "@/lib/dashboard-store";
import { ScaledBoardPreview } from "./preview";
import { EditablePreview, type SelectedWidget } from "./editable-preview";
import { TokenDemoDashboard } from "./token-demo-dashboard";
import { readFile } from "@/lib/pipeline/file-operations";
import {
  parseDashboardWidgetsJson,
  type DashboardWidgetsMap,
} from "@/lib/board/load-dashboard-widgets";
import {
  parsePanelHeadersFromSlotsSchemaJson,
  resolveDashboardPanelHeaders,
  type DashboardPanelHeadersMap,
} from "@/lib/board/load-dashboard-panel-headers";
import type { VisualAssetsBlock } from "@/lib/visual-assets/types";

/** 与 innerText 一致：去掉 HTML 结构带来的异常符号，便于与 Markdown 原文对照 */
function plainTextFromSelection(sel: Selection): string {
  if (!sel.rangeCount) return "";
  const range = sel.getRangeAt(0);
  const host = document.createElement("div");
  host.appendChild(range.cloneContents());
  return host.innerText.replace(/\r\n/g, "\n").trim();
}

interface FileTabContentProps {
  file: FileItem;
  projectName?: string;
  isEditing?: boolean;
  selectedWidgets?: SelectedWidget[];
  onSelectionChange?: (widgets: SelectedWidget[]) => void;
  onCodeLoad?: (code: string) => void;
  cssVariables?: Record<string, string>;
  /** Markdown 文档微调：开启后可在正文中划选触发回调 */
  mdAgentMode?: boolean;
  onMdAgentSelectText?: (text: string) => void;
  /** dashboard.jsx 预览运行时覆盖 */
  visualAssetsBlock?: VisualAssetsBlock | null;
  /** 与 project screenPreset 一致的设计画布像素，用于等比缩放进预览区 */
  boardCanvasWidth?: number;
  boardCanvasHeight?: number;
}

export const FileTabContent = memo(function FileTabContent({
  file,
  projectName = "",
  isEditing = false,
  selectedWidgets = [],
  onSelectionChange,
  onCodeLoad,
  cssVariables,
  mdAgentMode = false,
  onMdAgentSelectText,
  visualAssetsBlock = null,
  boardCanvasWidth,
  boardCanvasHeight,
}: FileTabContentProps) {
  const [content, setContent] = useState<string | null>(null);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetsMap | null>(null);
  const [dashboardPanelHeaders, setDashboardPanelHeaders] =
    useState<DashboardPanelHeadersMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isJsx = file.name.endsWith(".jsx");
  const isViSystem = file.name === "vi-system.md";
  const mdDocRef = useRef<HTMLDivElement>(null);

  const handleMdMouseUp = useCallback(() => {
    if (!mdAgentMode || !onMdAgentSelectText || !mdDocRef.current) return;
    const sel = window.getSelection();
    if (!sel?.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!mdDocRef.current.contains(range.commonAncestorContainer)) return;
    const text = plainTextFromSelection(sel);
    if (!text) return;
    onMdAgentSelectText(text);
  }, [mdAgentMode, onMdAgentSelectText]);

  useEffect(() => {
    setContent(null);
    setIsLoading(true);
    
    readFile(file.path)
      .then((data) => {
        setContent(data);
        onCodeLoad?.(data);
      })
      .catch((err) => {
        console.error("[FileTabContent] read error:", err);
        setContent("读取文件失败");
      })
      .finally(() => setIsLoading(false));
  }, [file.path, file.updatedAt, onCodeLoad]);

  const dashboardPreview = useMemo(() => {
    if (!isJsx || !projectName.trim()) return null;
    const parsed = parseProjectAndDashboardFromFilePath(file.path);
    if (!parsed || parsed.projectName !== projectName) return null;
    return {
      projectName: parsed.projectName,
      dashboardFile: parsed.dashboardFile,
    };
  }, [isJsx, projectName, file.path]);

  useEffect(() => {
    if (!dashboardPreview) {
      setDashboardWidgets(null);
      setDashboardPanelHeaders(null);
      return;
    }
    const base = `.dv/${dashboardPreview.projectName}/页面`;
    const widgetsPath = `${base}/widgets.json`;
    const slotsSchemaPath = `.dv/${dashboardPreview.projectName}/页面结构/slots.schema.json`;
    readFile(widgetsPath)
      .then((raw) => setDashboardWidgets(parseDashboardWidgetsJson(raw)))
      .catch(() => setDashboardWidgets(null));
    readFile(slotsSchemaPath)
      .then((raw) =>
        setDashboardPanelHeaders(
          resolveDashboardPanelHeaders(parsePanelHeadersFromSlotsSchemaJson(raw))
        )
      )
      .catch(() => setDashboardPanelHeaders(resolveDashboardPanelHeaders(null)));
  }, [dashboardPreview?.projectName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (content === null) return null;

  if (isJsx) {
    const previewBody =
      isEditing && onSelectionChange ? (
        <EditablePreview
          code={content}
          dashboardWidgets={dashboardWidgets}
          dashboardPanelHeaders={dashboardPanelHeaders}
          selectedWidgets={selectedWidgets}
          onSelectionChange={onSelectionChange}
          cssVariables={cssVariables}
          visualAssetsBlock={visualAssetsBlock}
          canvasWidth={boardCanvasWidth}
          canvasHeight={boardCanvasHeight}
        />
      ) : (
        <ScaledBoardPreview
          code={content}
          dashboardWidgets={dashboardWidgets}
          dashboardPanelHeaders={dashboardPanelHeaders}
          cssVariables={cssVariables}
          visualAssetsBlock={visualAssetsBlock}
          canvasWidth={boardCanvasWidth}
          canvasHeight={boardCanvasHeight}
        />
      );

    const jsxShell = <div className="flex h-full min-h-0 w-full flex-1 flex-col">{previewBody}</div>;

    if (dashboardPreview) {
      return (
        <DashboardPreviewProvider
          projectName={dashboardPreview.projectName}
          dashboardFile={dashboardPreview.dashboardFile}
        >
          {jsxShell}
        </DashboardPreviewProvider>
      );
    }
    return jsxShell;
  }

  if (isViSystem) {
    return (
      <div className="h-full w-full flex min-h-0">
        {/* 左侧：使用 CSS Token 渲染的演示看板 */}
        <div className="flex-1 min-w-0 min-h-0 border-r border-gray-200">
          <TokenDemoDashboard cssVariables={cssVariables} />
        </div>
        {/* 右侧：VI 系统说明文档 */}
        <div
          ref={mdDocRef}
          onMouseUp={handleMdMouseUp}
          className={`w-[44%] min-w-[360px] h-full overflow-auto p-6 bg-white ${mdAgentMode ? "select-text" : ""}`}
        >
          <div className="prose prose-sm max-w-none text-gray-800">
            <Streamdown plugins={{ cjk }}>{content}</Streamdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mdDocRef}
      onMouseUp={handleMdMouseUp}
      className={`h-full overflow-auto p-6 ${mdAgentMode ? "select-text" : ""}`}
    >
      <div className="prose prose-sm max-w-none text-gray-800">
        <Streamdown plugins={{ cjk }}>{content}</Streamdown>
      </div>
    </div>
  );
});
