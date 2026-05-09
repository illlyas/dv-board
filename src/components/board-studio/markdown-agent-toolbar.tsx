"use client";

import React from "react";
import type { FileItem } from "@/types/board-studio.types";

interface MarkdownAgentToolbarProps {
  file: FileItem;
  isAgentMode: boolean;
  onStartAgent: () => void;
  onExitAgent: () => void;
}

function DocIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2.5h5.5L12 5v8.5H4V2.5z" strokeLinejoin="round" />
      <path d="M9.5 2.5V5H12" strokeLinejoin="round" />
    </svg>
  );
}

export function MarkdownAgentToolbar({
  file,
  isAgentMode,
  onStartAgent,
  onExitAgent,
}: MarkdownAgentToolbarProps) {
  return (
    <div className="border-b border-gray-100 bg-white px-4 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <DocIcon />
        <span className="text-xs text-gray-400 truncate">{file.name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-gray-400">{isAgentMode ? "微调" : "预览"}</span>
        <button
          type="button"
          role="switch"
          aria-checked={isAgentMode}
          onClick={() => (isAgentMode ? onExitAgent() : onStartAgent())}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            isAgentMode ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
              isAgentMode ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
