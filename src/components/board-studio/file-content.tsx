"use client";

import React, { memo, useEffect, useState } from "react";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import type { FileItem } from "@/types/board-studio.types";
import { ScaledBoardPreview } from "./preview";
import { EditablePreview, type SelectedWidget } from "./editable-preview";
import { TokenDemoDashboard } from "./token-demo-dashboard";
import { readFile } from "@/lib/pipeline/file-operations";

interface FileTabContentProps {
  file: FileItem;
  isEditing?: boolean;
  selectedWidgets?: SelectedWidget[];
  onSelectionChange?: (widgets: SelectedWidget[]) => void;
  onCodeLoad?: (code: string) => void;
  cssVariables?: Record<string, string>;
}

export const FileTabContent = memo(function FileTabContent({
  file,
  isEditing = false,
  selectedWidgets = [],
  onSelectionChange,
  onCodeLoad,
  cssVariables,
}: FileTabContentProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isJsx = file.name.endsWith(".jsx");
  const isViSystem = file.name === "vi-system.md";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (content === null) return null;

  if (isJsx) {
    if (isEditing && onSelectionChange) {
      return (
        <EditablePreview
          code={content}
          selectedWidgets={selectedWidgets}
          onSelectionChange={onSelectionChange}
          cssVariables={cssVariables}
        />
      );
    }
    return <ScaledBoardPreview code={content} cssVariables={cssVariables} />;
  }

  if (isViSystem) {
    return (
      <div className="h-full w-full flex min-h-0">
        {/* 左侧：使用 CSS Token 渲染的演示看板 */}
        <div className="flex-1 min-w-0 min-h-0 border-r border-gray-200">
          <TokenDemoDashboard cssVariables={cssVariables} />
        </div>
        {/* 右侧：VI 系统说明文档 */}
        <div className="w-[44%] min-w-[360px] h-full overflow-auto p-6 bg-white">
          <div className="prose prose-sm max-w-none text-gray-800">
            <Streamdown plugins={{ cjk }}>{content}</Streamdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="prose prose-sm max-w-none text-gray-800">
        <Streamdown plugins={{ cjk }}>{content}</Streamdown>
      </div>
    </div>
  );
});
