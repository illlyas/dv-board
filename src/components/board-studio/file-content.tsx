"use client";

import React, { memo, useEffect, useState } from "react";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import type { FileItem } from "@/types/board-studio.types";
import { ScaledBoardPreview } from "./preview";
import { EditablePreview, type SelectedWidget } from "./editable-preview";
import { readFile } from "@/lib/pipeline/file-operations";

interface FileTabContentProps {
  file: FileItem;
  isEditing?: boolean;
  selectedWidgets?: SelectedWidget[];
  onSelectionChange?: (widgets: SelectedWidget[]) => void;
  onCodeLoad?: (code: string) => void;
}

export const FileTabContent = memo(function FileTabContent({
  file,
  isEditing = false,
  selectedWidgets = [],
  onSelectionChange,
  onCodeLoad,
}: FileTabContentProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isJsx = file.name.endsWith(".jsx");

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
        />
      );
    }
    return <ScaledBoardPreview code={content} />;
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="prose prose-sm max-w-none text-gray-800">
        <Streamdown plugins={{ cjk }}>{content}</Streamdown>
      </div>
    </div>
  );
});
