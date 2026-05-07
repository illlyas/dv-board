"use client";

import React from "react";
import type { FileItem } from "@/types/board-studio.types";

interface DashboardToolbarProps {
  file: FileItem;
  isEditing: boolean;
  onStartEdit: () => void;
  onExitEdit: () => void;
}

function DashboardIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

export function DashboardToolbar({ file, isEditing, onStartEdit, onExitEdit }: DashboardToolbarProps) {
  const handleToggle = () => {
    if (isEditing) onExitEdit();
    else onStartEdit();
  };

  return (
    <div className="border-b border-gray-100 bg-white px-4 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-1.5">
        <DashboardIcon />
        <span className="text-xs text-gray-400">{file.name}</span>
      </div>
      <div className="flex items-center gap-2">
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
