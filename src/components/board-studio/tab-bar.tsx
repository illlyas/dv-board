"use client";

import React from "react";
import type { OpenTab } from "@/types/board-studio.types";
import { FileIcon, FolderIcon } from "./category-icons";

export const FILES_TAB_ID = "__files__";

interface TabItem {
  id: string;
  label: string;
  closable: boolean;
}

interface TabBarProps {
  openTabs: OpenTab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
}

export function TabBar({ openTabs, activeTabId, onTabSelect, onTabClose }: TabBarProps) {
  const allTabs: TabItem[] = [
    { id: FILES_TAB_ID, label: "项目文件", closable: false },
    ...openTabs.map((t) => ({ id: t.id, label: t.file.name, closable: true })),
  ];

  return (
    <div className="flex items-end gap-0 border-b border-gray-100 bg-gray-50 shrink-0 overflow-x-auto">
      {allTabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        const isJsx = tab.label.endsWith(".jsx");
        
        return (
          <div
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={`group flex items-center gap-1.5 px-3 py-2 text-xs font-medium cursor-pointer border-r border-gray-100 shrink-0 transition-colors select-none ${
              isActive
                ? "bg-white text-gray-800 border-b-2 border-b-blue-500 -mb-px"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            style={{ borderBottom: isActive ? "2px solid #3b82f6" : undefined }}
          >
            {tab.id === FILES_TAB_ID ? (
              <FolderIcon />
            ) : (
              <FileIcon isJsx={isJsx} />
            )}
            <span className="max-w-[120px] truncate">{tab.label}</span>
            {tab.closable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="flex items-center justify-center w-4 h-4 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all shrink-0"
                title="关闭"
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2" y1="2" x2="8" y2="8" />
                  <line x1="8" y1="2" x2="2" y2="8" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
