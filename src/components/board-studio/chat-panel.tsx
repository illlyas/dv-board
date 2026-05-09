"use client";

import React, { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/types/pipeline.types";
import type { PipelineStep } from "@/types/pipeline.types";
import { MessageBubble } from "./message-bubble";
import { FormRenderer } from "./form-renderer";
import type { QuestionFormData } from "@/types/board-studio.types";

interface ChatPanelProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onFormSubmit: (answers: Record<string, unknown>) => void;
  isRunning: boolean;
  currentStep: PipelineStep;
  currentForm: QuestionFormData | null;
  onClear: () => void;
  editingFileName?: string;
}

export function ChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  onFormSubmit,
  isRunning,
  currentStep,
  currentForm,
  onClear,
  editingFileName,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  };

  const lastFormMessage = [...messages].reverse().find((m) => m.formData);
  const showForm = !!currentForm && !!lastFormMessage;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {editingFileName && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-600">
            <span>✏️</span>
            <span>仪表盘编辑模式 · 正在编辑 <code className="font-mono bg-blue-100 px-1 rounded">{editingFileName}</code></span>
          </div>
        )}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
              ✨
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">开始创建你的数据看板</p>
              <p className="text-xs text-gray-400 mt-1">描述你的需求，AI 将自动生成完整的看板设计</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            <MessageBubble role={msg.role} content={msg.content} streaming={msg.streaming} />
            {msg.formData && showForm && msg.id === lastFormMessage?.id && (
              <FormRenderer
                key={msg.id}
                form={msg.formData as QuestionFormData}
                onSubmit={onFormSubmit}
                disabled={isRunning}
              />
            )}
          </div>
        ))}

        {currentStep !== "idle" && currentStep !== "done" && currentStep !== "error" && (
          <div className="flex items-center gap-2 pl-1">
            <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
              <span className="w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-xs text-gray-500">处理中...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-gray-100 px-3 py-3 bg-white">
        <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述你的看板需求... (Cmd+Enter 发送)"
            disabled={isRunning}
            rows={3}
            className="flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:border-0 min-h-0 placeholder:text-gray-400 disabled:opacity-50"
          />
          <button
            onClick={onSend}
            disabled={isRunning || !input.trim()}
            title="发送 (Cmd+Enter)"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 mb-0.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-right">
          {isRunning ? (
            <button onClick={onClear} className="text-red-400 hover:text-red-500 transition-colors">
              取消
            </button>
          ) : (
            "Cmd+Enter 发送"
          )}
        </p>
      </div>
    </>
  );
}
