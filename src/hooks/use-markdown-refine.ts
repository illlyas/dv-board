"use client";

import { useCallback, useRef, useState } from "react";
import type { FileItem } from "@/types/board-studio.types";

export type MarkdownRefineStatus = "idle" | "running" | "done" | "error";

function agentUrlForMarkdownFile(file: FileItem): string {
  switch (file.name) {
    case "design-story.md":
      return "/api/board/agent-edit-design-story";
    case "pages-story.md":
      return "/api/board/agent-edit-pages-story";
    case "vi-system.md":
      return "/api/board/agent-edit-vi-system";
    default:
      throw new Error(`不支持的 Markdown 微调类型: ${file.name}`);
  }
}

export function useMarkdownRefine(onFileUpdated?: (file: FileItem) => void) {
  const [status, setStatus] = useState<MarkdownRefineStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runRefine = useCallback(
    async (params: {
      projectName: string;
      file: FileItem;
      selectedText: string;
      userMessage: string;
    }) => {
      const { projectName, file, selectedText, userMessage } = params;
      const trimmed = userMessage.trim();
      if (!trimmed || !projectName) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLastError(null);
      setStatus("running");

      try {
        const url = agentUrlForMarkdownFile(file);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName,
            selectedText,
            userMessage: trimmed,
          }),
          signal: ac.signal,
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          errors?: string[];
          description?: string;
        };
        if (!res.ok) {
          const lines = [data.error].filter(Boolean) as string[];
          if (Array.isArray(data.errors) && data.errors.length) lines.push(...data.errors);
          throw new Error(lines.join("\n") || `HTTP ${res.status}`);
        }
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          throw new Error(
            [data.description, data.error, ...data.errors].filter(Boolean).join("\n")
          );
        }
        setStatus("done");
        onFileUpdated?.({
          name: file.name,
          path: file.path,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("idle");
          return;
        }
        console.error("[useMarkdownRefine]", err);
        const msg = err instanceof Error ? err.message : String(err);
        setLastError(msg);
        setStatus("error");
        throw err;
      }
    },
    [onFileUpdated]
  );

  const resetStatus = useCallback(() => {
    setStatus("idle");
    setLastError(null);
  }, []);

  return {
    status,
    isRunning: status === "running",
    lastError,
    runRefine,
    resetStatus,
  };
}
