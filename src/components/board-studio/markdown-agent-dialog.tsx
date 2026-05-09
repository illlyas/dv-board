"use client";

import React, { useCallback, useEffect, useState } from "react";

interface MarkdownAgentDialogProps {
  open: boolean;
  selectedText: string;
  isRunning: boolean;
  onClose: () => void;
  onSubmit: (userMessage: string) => void;
}

export function MarkdownAgentDialog({
  open,
  selectedText,
  isRunning,
  onClose,
  onSubmit,
}: MarkdownAgentDialogProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (open) setInput("");
  }, [open, selectedText]);

  const handleSubmit = useCallback(() => {
    const t = input.trim();
    if (!t || isRunning) return;
    onSubmit(t);
    setInput("");
  }, [input, isRunning, onSubmit]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      onClick={(e) => e.target === e.currentTarget && !isRunning && onClose()}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-gray-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800">文档微调（单次）</span>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1">
            ×
          </button>
        </div>
        <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/80">
          <p className="text-xs text-gray-500 mb-1">选中片段</p>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words max-h-32 overflow-y-auto font-mono bg-white border border-gray-100 rounded p-2">
            {selectedText.trim() || "(未选中，将仅按指令与全文修改)"}
          </pre>
        </div>
        <div className="p-4 flex-1 min-h-0 flex flex-col gap-2">
          <label className="text-xs text-gray-500">修改说明</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRunning}
            rows={4}
            placeholder="描述希望如何修改选中区域或全文…"
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 resize-none focus:outline-none focus:border-blue-400 disabled:opacity-50"
          />
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isRunning}
            className="text-sm px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || isRunning}
            className="text-sm px-4 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40"
          >
            {isRunning ? "处理中…" : "发送"}
          </button>
        </div>
      </div>
    </div>
  );
}
