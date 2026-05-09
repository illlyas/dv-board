"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { FileItem, FilesResponse, OpenTab } from "@/types/board-studio.types";
import { listProjectFiles } from "@/lib/pipeline/file-operations";
import { TabBar, FILES_TAB_ID, VISUAL_ASSETS_TAB_ID } from "./tab-bar";
import { FileList } from "./file-list";
import { FileTabContent } from "./file-content";
import { DashboardToolbar } from "./dashboard-toolbar";
import { MarkdownAgentToolbar } from "./markdown-agent-toolbar";
import type { SelectedWidget } from "./editable-preview";
import type { VisualAssetsBlock } from "@/lib/visual-assets/types";
import { VisualAssetsPanel } from "./visual-assets-panel";
import { ViTokensTweaksPanel } from "./vi-tokens-tweaks-panel";

function isMarkdownAgentFile(file: FileItem): boolean {
  return ["design-story.md", "pages-story.md", "vi-system.md"].includes(file.name);
}

/** Tweaks 面板数据（勿含 tweaksOpen，以便展开/收起时不整包换新引用） */
export interface DashboardTweaksPanelData {
  hasTokensFile: boolean;
  workingCssVariables: Record<string, string>;
  onTokenChange: (storageKey: string, value: string) => void;
  isSaving: boolean;
  dirty: boolean;
  saveError: string | null;
  onRetrySave: () => void;
}

interface FilePanelProps {
  projectName: string;
  refreshTrigger: number;
  onFileOpen: (file: FileItem) => void;
  openTabs: OpenTab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
  editingTabId?: string;
  onStartEdit: (file: FileItem) => void;
  onExitEdit: () => void;
  selectedWidgets: SelectedWidget[];
  onSelectionChange: (widgets: SelectedWidget[]) => void;
  onCodeLoad?: (code: string) => void;
  mdAgentTabId: string | null;
  onStartMdAgent: () => void;
  onExitMdAgent: () => void;
  onMdAgentSelectText: (text: string) => void;
  visualAssetsBlock: VisualAssetsBlock | null;
  visualAssetsLoading: boolean;
  visualAssetsFetchError: string | null;
  onRetryVisualAssetsConfig: () => void;
  onVisualAssetsSaved: (next: VisualAssetsBlock) => void;
  /** 画布与 Markdown 演示区注入的 CSS 变量（含 chart、color-scheme） */
  previewCssVariables: Record<string, string> | undefined;
  tweaksOpen: boolean;
  setTweaksOpen: (open: boolean) => void;
  dashboardTweaks: DashboardTweaksPanelData;
}

export function FilePanel({
  projectName,
  refreshTrigger,
  onFileOpen,
  openTabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  editingTabId,
  onStartEdit,
  onExitEdit,
  selectedWidgets,
  onSelectionChange,
  onCodeLoad,
  mdAgentTabId,
  onStartMdAgent,
  onExitMdAgent,
  onMdAgentSelectText,
  visualAssetsBlock,
  visualAssetsLoading,
  visualAssetsFetchError,
  onRetryVisualAssetsConfig,
  onVisualAssetsSaved,
  previewCssVariables,
  tweaksOpen,
  setTweaksOpen,
  dashboardTweaks,
}: FilePanelProps) {
  const [files, setFiles] = useState<FilesResponse["categories"] | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!projectName) return;
    setIsLoadingFiles(true);
    try {
      const data: FilesResponse = await listProjectFiles(projectName);
      setFiles(data.categories);
    } catch (err) {
      console.error("[FilePanel] fetchFiles error:", err);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [projectName]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  const activeTab = openTabs.find(t => t.id === activeTabId);
  const isVisualAssetsTab = activeTabId === VISUAL_ASSETS_TAB_ID;
  const isJsxTab = activeTab?.file.name.endsWith(".jsx") ?? false;
  const isMdAgentTarget = activeTab ? isMarkdownAgentFile(activeTab.file) : false;
  const mdAgentOn = Boolean(
    activeTab && mdAgentTabId === activeTabId && isMdAgentTarget && !isVisualAssetsTab
  );
  const jsxToolbar = isJsxTab && activeTab && !isVisualAssetsTab && (
    <DashboardToolbar
      file={activeTab.file}
      isEditing={editingTabId === activeTabId}
      onStartEdit={() => onStartEdit(activeTab.file)}
      onExitEdit={onExitEdit}
      tweaksOpen={tweaksOpen}
      onToggleTweaks={() => setTweaksOpen(!tweaksOpen)}
    />
  );

  const renderFileTabBody = (tab: OpenTab) => {
    const editingThis = editingTabId === tab.id;
    const jsxThis = tab.file.name.endsWith(".jsx");
    const useTweaksShell = Boolean(jsxThis && editingThis);

    const content = (
      <FileTabContent
        file={tab.file}
        projectName={projectName}
        isEditing={editingThis}
        selectedWidgets={editingThis ? selectedWidgets : []}
        onSelectionChange={editingThis ? onSelectionChange : undefined}
        onCodeLoad={editingThis ? onCodeLoad : undefined}
        cssVariables={previewCssVariables}
        mdAgentMode={mdAgentTabId === tab.id && isMarkdownAgentFile(tab.file)}
        onMdAgentSelectText={
          mdAgentTabId === tab.id && isMarkdownAgentFile(tab.file) ? onMdAgentSelectText : undefined
        }
        visualAssetsBlock={visualAssetsBlock}
      />
    );

    if (!useTweaksShell) {
      return content;
    }

    return (
      <div className="relative h-full min-h-0 w-full">
        <div className="h-full min-h-0 w-full">{content}</div>
        {tweaksOpen &&
          (dashboardTweaks.hasTokensFile ? (
            <ViTokensTweaksPanel
              cssVariables={dashboardTweaks.workingCssVariables}
              onTokenChange={dashboardTweaks.onTokenChange}
              onClose={() => setTweaksOpen(false)}
              isSaving={dashboardTweaks.isSaving}
              dirty={dashboardTweaks.dirty}
              saveError={dashboardTweaks.saveError}
              onRetrySave={dashboardTweaks.onRetrySave}
            />
          ) : (
            <aside className="pointer-events-auto absolute inset-y-0 right-0 z-[35] flex w-[min(26rem,calc(100vw-2rem))] flex-col border-l border-gray-300/90 bg-white/95 shadow-[-16px_0_48px_rgba(15,23,42,0.18)] backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <span className="text-base font-semibold text-gray-900">Tweaks</span>
                <button
                  type="button"
                  onClick={() => setTweaksOpen(false)}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  title="收起"
                >
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <p className="px-4 py-6 text-center text-sm leading-relaxed text-gray-600">
                暂无 vi-tokens.json，无法微调 CSS 变量。
              </p>
            </aside>
          ))}
      </div>
    );
  };

  return (
    <div className="flex h-full min-w-0 flex-col">
      <TabBar
        openTabs={openTabs}
        activeTabId={activeTabId}
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />

      {jsxToolbar}

      {isMdAgentTarget && activeTab && !isVisualAssetsTab && (
        <MarkdownAgentToolbar
          file={activeTab.file}
          isAgentMode={mdAgentOn}
          onStartAgent={onStartMdAgent}
          onExitAgent={onExitMdAgent}
        />
      )}

      <div className="min-h-0 flex-1 overflow-hidden bg-white">
        {/* 视觉素材 */}
        <div className={`flex h-full min-h-0 flex-col ${isVisualAssetsTab ? "" : "hidden"}`}>
          {visualAssetsFetchError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="break-words text-xs whitespace-pre-wrap text-red-700">
                无法加载项目配置：{visualAssetsFetchError}
              </p>
              <button
                type="button"
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                onClick={onRetryVisualAssetsConfig}
              >
                重试
              </button>
            </div>
          ) : visualAssetsLoading ? (
            <div className="flex flex-1 items-center justify-center text-xs text-gray-400">加载项目配置…</div>
          ) : visualAssetsBlock ? (
            <VisualAssetsPanel
              projectId={projectName}
              block={visualAssetsBlock}
              cssVariables={previewCssVariables}
              onSaved={onVisualAssetsSaved}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs text-gray-400">暂无视觉素材配置</div>
          )}
        </div>

        {/* 项目文件 tab */}
        <div className={`flex h-full flex-col ${activeTabId === FILES_TAB_ID ? "" : "hidden"}`}>
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <span className="text-xs text-gray-500">所有生成文件</span>
            <button
              onClick={fetchFiles}
              disabled={isLoadingFiles}
              title="刷新"
              className="flex h-6 w-6 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <svg
                className={`h-3.5 w-3.5 ${isLoadingFiles ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          <FileList files={files} onFileOpen={onFileOpen} />
        </div>

        {/* 文件预览 tabs */}
        {openTabs.map((tab) => (
          <div key={tab.id} className={`h-full min-h-0 ${activeTabId === tab.id ? "" : "hidden"}`}>
            {renderFileTabBody(tab)}
          </div>
        ))}
      </div>
    </div>
  );
}
