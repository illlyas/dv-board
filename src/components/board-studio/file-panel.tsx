"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { FileItem, FilesResponse, OpenTab } from "@/types/board-studio.types";
import { listProjectFiles, readFile } from "@/lib/pipeline/file-operations";
import { TabBar, FILES_TAB_ID } from "./tab-bar";
import { FileList } from "./file-list";
import { FileTabContent } from "./file-content";
import { DashboardToolbar } from "./dashboard-toolbar";
import type { SelectedWidget } from "./editable-preview";

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
}: FilePanelProps) {
  const [files, setFiles] = useState<FilesResponse["categories"] | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [cssVariables, setCssVariables] = useState<Record<string, string> | undefined>(undefined);

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

  // 加载 vi-tokens.json 中的 cssVariables 供预览画布注入
  // 额外提取 mode（赋给 colorScheme，深/浅模式完全由 token 决定不可切换）
  // 以及 chartPalette（注入为 --chart-1..N 变量，便于演示组件复用）
  const fetchTokens = useCallback(async () => {
    if (!projectName) {
      setCssVariables(undefined);
      return;
    }
    try {
      const raw = await readFile(`.dv/${projectName}/品牌VI/vi-tokens.json`);
      const parsed = JSON.parse(raw) as {
        mode?: "light" | "dark";
        cssVariables?: Record<string, string>;
        chartPalette?: string[];
      };
      const vars: Record<string, string> = {};
      if (parsed.cssVariables) {
        for (const [k, v] of Object.entries(parsed.cssVariables)) {
          if (typeof v === "string" && v.trim()) {
            const key = k.startsWith("--") ? k : `--${k}`;
            vars[key] = v;
          }
        }
      }
      if (Array.isArray(parsed.chartPalette)) {
        parsed.chartPalette.forEach((c, i) => {
          if (typeof c === "string" && c.trim()) {
            vars[`--chart-${i + 1}`] = c;
          }
        });
      }
      // mode 作为 color-scheme 注入（影响 UA 组件、滚动条等默认色），不提供切换入口
      if (parsed.mode === "dark" || parsed.mode === "light") {
        (vars as Record<string, string>).colorScheme = parsed.mode;
      }
      setCssVariables(Object.keys(vars).length ? vars : undefined);
    } catch {
      // 没有 vi-tokens.json 时静默失败
      setCssVariables(undefined);
    }
  }, [projectName]);

  useEffect(() => {
    fetchFiles();
    fetchTokens();
  }, [fetchFiles, fetchTokens, refreshTrigger]);

  const activeTab = openTabs.find(t => t.id === activeTabId);
  const isJsxTab = activeTab?.file.name.endsWith(".jsx") ?? false;

  return (
    <div className="flex flex-col h-full min-w-0">
      <TabBar
        openTabs={openTabs}
        activeTabId={activeTabId}
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />

      {isJsxTab && activeTab && (
        <DashboardToolbar
          file={activeTab.file}
          isEditing={editingTabId === activeTabId}
          onStartEdit={() => onStartEdit(activeTab.file)}
          onExitEdit={onExitEdit}
        />
      )}

      <div className="flex-1 min-h-0 overflow-hidden bg-white">
        {/* 项目文件 tab */}
        <div className={`h-full flex flex-col ${activeTabId === FILES_TAB_ID ? "" : "hidden"}`}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 shrink-0">
            <span className="text-xs text-gray-500">所有生成文件</span>
            <button
              onClick={fetchFiles}
              disabled={isLoadingFiles}
              title="刷新"
              className="flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${isLoadingFiles ? "animate-spin" : ""}`}
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
          <div key={tab.id} className={`h-full ${activeTabId === tab.id ? "" : "hidden"}`}>
            <FileTabContent
              file={tab.file}
              isEditing={editingTabId === tab.id}
              selectedWidgets={editingTabId === tab.id ? selectedWidgets : []}
              onSelectionChange={editingTabId === tab.id ? onSelectionChange : undefined}
              onCodeLoad={editingTabId === tab.id ? onCodeLoad : undefined}
              cssVariables={cssVariables}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
