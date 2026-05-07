"use client";

import React from "react";
import type { FileItem, CategoryKey, FilesResponse } from "@/types/board-studio.types";
import { CATEGORY_ORDER } from "@/types/board-studio.types";
import { CATEGORY_ICONS, FileIcon } from "./category-icons";

interface FileListProps {
  files: FilesResponse["categories"] | null;
  onFileOpen: (file: FileItem) => void;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

export function FileList({ files, onFileOpen }: FileListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      {CATEGORY_ORDER.map((category: CategoryKey) => {
        const categoryFiles = files?.[category] ?? [];
        return (
          <div key={category}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-gray-500">{CATEGORY_ICONS[category]}</span>
              <span className="text-xs font-semibold text-gray-600">{category}</span>
              {categoryFiles.length > 0 && (
                <span className="ml-auto text-xs text-gray-400">{categoryFiles.length}</span>
              )}
            </div>
            {categoryFiles.length === 0 ? (
              <p className="text-xs text-gray-400 pl-6 py-1">暂无文件</p>
            ) : (
              <div className="space-y-1 pl-1">
                {categoryFiles.map((file) => {
                  const isJsx = file.name.endsWith(".jsx");
                  return (
                    <div
                      key={file.path}
                      onClick={() => onFileOpen(file)}
                      className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileIcon isJsx={isJsx} />
                        <span className="text-xs text-gray-700 truncate">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                        {formatDate(file.updatedAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
