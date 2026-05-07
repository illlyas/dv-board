"use client";

import React, { useCallback, useRef, useState } from "react";
import type { SelectedWidget } from "./editable-preview";

interface FloatingEditDialogProps {
  selectedWidgets: SelectedWidget[];
  isRunning: boolean;
  onSubmit: (message: string) => void;
  onClearSelection: () => void;
}

export function FloatingEditDialog({
  selectedWidgets,
  isRunning,
  onSubmit,
  onClearSelection,
}: FloatingEditDialogProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isRunning) return;
    onSubmit(trimmed);
    setInput("");
  }, [input, isRunning, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  if (selectedWidgets.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 30,
        width: 280,
      }}
      className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
    >
      {/* 选中元素列表 */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">已选中元素</span>
          <button
            onClick={onClearSelection}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            清除
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {selectedWidgets.map(w => (
            <div key={w.dataKey} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span className="text-xs text-gray-700 font-mono truncate">{w.dataKey}</span>
              <span className="text-xs text-gray-400 shrink-0">({w.type})</span>
            </div>
          ))}
        </div>
      </div>

      {/* 输入区 */}
      <div className="p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="描述你想要的修改..."
          disabled={isRunning}
          rows={3}
          className="w-full text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:border-blue-400 disabled:opacity-50"
        />
        <div className="flex justify-end mt-1.5">
          {isRunning ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
              修改中...
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              发送
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
