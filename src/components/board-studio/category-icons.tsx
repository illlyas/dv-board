import React from "react";
import type { CategoryKey } from "@/types/board-studio.types";

export const CATEGORY_ICONS: Record<CategoryKey, React.ReactNode> = {
  "数据故事": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="9" width="3" height="6" rx="0.5" />
      <rect x="6" y="5" width="3" height="10" rx="0.5" />
      <rect x="11" y="1" width="3" height="14" rx="0.5" />
    </svg>
  ),
  "品牌VI": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="5" r="2.5" />
      <circle cx="11" cy="5" r="2.5" />
      <circle cx="5" cy="11" r="2.5" />
      <circle cx="11" cy="11" r="2.5" />
    </svg>
  ),
  "页面结构": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="14" height="14" rx="1.5" />
      <line x1="1" y1="5" x2="15" y2="5" />
      <line x1="7" y1="5" x2="7" y2="15" />
    </svg>
  ),
  "页面": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9A1.5 1.5 0 0014 13.5V6L9 1z" />
      <polyline points="9,1 9,6 14,6" />
      <line x1="5" y1="9" x2="11" y2="9" />
      <line x1="5" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export function FileIcon({ isJsx }: { isJsx: boolean }) {
  if (isJsx) {
    return (
      <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5,4 1,8 5,12" />
        <polyline points="11,4 15,8 11,12" />
        <line x1="9" y1="2" x2="7" y2="14" />
      </svg>
    );
  }
  
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
      <path d="M9 1H4a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6l-5-5z" />
      <path d="M9 1v4a1 1 0 001 1h4" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function FolderIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4a1 1 0 011-1h3.586a1 1 0 01.707.293L8.707 4.707A1 1 0 009.414 5H13a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
    </svg>
  );
}
