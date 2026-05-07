"use client";

import React, { useEffect, useState } from "react";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import type { FileItem } from "@/types/board-studio.types";
import { ScaledBoardPreview } from "./preview";
import { readFile } from "@/lib/pipeline/file-operations";

export function FileTabContent({ file }: { file: FileItem }) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isJsx = file.name.endsWith(".jsx");

  useEffect(() => {
    setContent(null);
    setIsLoading(true);
    
    readFile(file.path)
      .then((data) => setContent(data))
      .catch((err) => {
        console.error("[FileTabContent] read error:", err);
        setContent("读取文件失败");
      })
      .finally(() => setIsLoading(false));
  }, [file.path]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (content === null) return null;

  if (isJsx) {
    return <ScaledBoardPreview code={content} />;
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="prose prose-sm max-w-none text-gray-800">
        <Streamdown plugins={{ cjk }}>{content}</Streamdown>
      </div>
    </div>
  );
}
