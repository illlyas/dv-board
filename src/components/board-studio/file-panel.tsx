"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { FileItem, FilesResponse, OpenTab } from "@/types/board-studio.types";
import { listProjectFiles } from "@/lib/pipeline/file-operations";
import { TabBar, FILES_TAB_ID } from "./tab-bar";
import { FileList } from "./file-list";
import { FileTabContent } from "./file-content";

interface FilePanelProps {
  projectName: string;
  refreshTrigger: number;
  onFileOpen: (file: FileItem) => void;
  openTabs: OpenTab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
}

export function FilePanel({
  projectName,
  refreshTrigger,
  onFileOpen,
  openTabs,
  activeTabId,
  onTabSelect,
  onTabClose,
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

  return (
    <div className="flex flex-col h-full min-w-0">
      <TabBar
        openTabs={openTabs}
        activeTabId={activeTabId}
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />

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
            <FileTabContent file={tab.file} />
          </div>
        ))}
      </div>
    </div>
  );
}
