"use client";

import React from "react";
import { DashboardGridIcon } from "@/components/board-studio/category-icons";
import type { FileItem } from "@/types/board-studio.types";

interface DashboardToolbarProps {
  projectName: string;
  file: FileItem;
  isEditing: boolean;
  onStartEdit: () => void;
  onExitEdit: () => void;
  /** JSX 编辑模式下的 Tweaks 侧栏 */
  tweaksOpen?: boolean;
  onToggleTweaks?: () => void;
}

export function DashboardToolbar({
  projectName,
  file,
  isEditing,
  onStartEdit,
  onExitEdit,
  tweaksOpen,
  onToggleTweaks,
}: DashboardToolbarProps) {
  const handleToggle = () => {
    if (isEditing) onExitEdit();
    else onStartEdit();
  };

  const openFullscreenTab = () => {
    if (!projectName.trim()) return;
    const url = `/project/${encodeURIComponent(projectName)}/fullscreen?file=${encodeURIComponent(file.name)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="border-b border-gray-100 bg-white px-4 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-1.5">
        <DashboardGridIcon />
        <span className="text-xs text-gray-400">{file.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {isEditing && onToggleTweaks && (
          <button
            type="button"
            onClick={onToggleTweaks}
            title={tweaksOpen ? "收起 Tweaks" : "展开 Tweaks"}
            className={`text-xs px-2 py-1 rounded border shrink-0 transition-colors ${
              tweaksOpen
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tweaksOpen ? "收起 Tweaks" : "Tweaks"}
          </button>
        )}
        <button
          type="button"
          onClick={openFullscreenTab}
          title="在新标签页全屏预览（无工具栏）"
          className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 shrink-0 transition-colors hover:bg-gray-50"
        >
          新标签全屏
        </button>
        <span className="text-xs text-gray-400">{isEditing ? "编辑" : "预览"}</span>
        {/* Switch */}
        <button
          role="switch"
          aria-checked={isEditing}
          onClick={handleToggle}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            isEditing ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
              isEditing ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
