/**
 * 仪表盘编辑模式 Hook（单次请求，无历史上下文）
 */
"use client";

import { useCallback, useRef, useState } from "react";
import type { FileItem } from "@/types/board-studio.types";
import type { SelectedWidget } from "@/components/board-studio/editable-preview";

export type EditStatus = "idle" | "running" | "done" | "error";

export function useDashboardEditor(onFileUpdated?: (file: FileItem) => void) {
  const [status, setStatus] = useState<EditStatus>("idle");
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startEditing = useCallback((file: FileItem) => {
    setEditingFile(file);
    setStatus("idle");
  }, []);

  /** 从 JSX 源码中提取指定 dataKey 的代码片段 */
  const extractSnippet = useCallback((code: string, dataKey: string): string => {
    // Widget 配置对象：提取 dataKey: { ... } 代码块
    const keyPattern = new RegExp(`(${dataKey}\\s*:\\s*\\{)`);
    const match = keyPattern.exec(code);
    if (match) {
      let depth = 0;
      let end = match.index;
      for (let i = match.index; i < code.length; i++) {
        if (code[i] === "{") depth++;
        else if (code[i] === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
      }
      return code.slice(match.index, end);
    }

    // HTML 元素（带 data-widget-key 属性）：提取对应的 JSX 标签片段
    const attrPattern = new RegExp(`<(\\w+)[^>]*data-widget-key=["']${dataKey}["'][^>]*>[\\s\\S]*?<\\/\\1>`);
    const attrMatch = attrPattern.exec(code);
    if (attrMatch) return attrMatch[0];

    return "";
  }, []);

  const runEdit = useCallback(
    async (userMessage: string, projectName: string, selectedWidgets: SelectedWidget[], currentCode: string) => {
      if (status === "running") return;
      const trimmed = userMessage.trim();
      if (!trimmed || !editingFile) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setStatus("running");

      try {
        const prefix = `.dv/${projectName}/`;
        const filePath = editingFile.path.startsWith(prefix)
          ? editingFile.path.slice(prefix.length)
          : editingFile.path;

        const selectedElements = selectedWidgets.map(w => ({
          dataKey: w.dataKey,
          type: w.type,
          codeSnippet: extractSnippet(currentCode, w.dataKey),
        }));

        const res = await fetch("/api/board/edit-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMessage: trimmed, projectName, filePath, selectedElements }),
          signal: ac.signal,
        });

        if (!res.ok) {
          const err = await res.json() as { error?: string };
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }

        setStatus("done");

        const updatedFile: FileItem = {
          name: editingFile.name,
          path: editingFile.path,
          updatedAt: new Date().toISOString(),
        };
        setEditingFile(updatedFile);
        onFileUpdated?.(updatedFile);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("idle");
        } else {
          console.error("[useDashboardEditor]", err);
          setStatus("error");
        }
      }
    },
    [status, editingFile, extractSnippet, onFileUpdated]
  );

  const stopEditing = useCallback(() => {
    abortRef.current?.abort();
    setEditingFile(null);
    setStatus("idle");
  }, []);

  return {
    status,
    isRunning: status === "running",
    editingFile,
    startEditing,
    runEdit,
    stopEditing,
  };
}
