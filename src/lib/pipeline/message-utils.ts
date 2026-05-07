/**
 * 消息创建和管理工具
 */

import type { ChatMessage } from "@/types/pipeline.types";
import type { QuestionForm } from "@/lib/board/data-analysis-model";
import type { JSXCode } from "@/lib/board/jsx-output";

export function createMessage(
  role: "user" | "assistant" | "system",
  content: string,
  extra?: {
    formData?: QuestionForm;
    designStoryData?: string;
    pagesStoryData?: string;
    jsxCodeData?: JSXCode;
  }
): ChatMessage {
  return { id: crypto.randomUUID(), role, content, ...extra };
}

export function createUserMessage(content: string): ChatMessage {
  return createMessage("user", content);
}

export function createAssistantMessage(content: string, extra?: Parameters<typeof createMessage>[2]): ChatMessage {
  return createMessage("assistant", content, extra);
}

export function createSystemMessage(content: string): ChatMessage {
  return createMessage("system", content);
}

export function createStreamingMessage(id: string, content: string): ChatMessage {
  return { id, role: "assistant", content, streaming: true };
}

export function updateStreamingMessage(msg: ChatMessage, content: string, streaming = true): ChatMessage {
  return { ...msg, content, streaming };
}

export function finalizeStreamingMessage(msg: ChatMessage, content: string, extra?: Parameters<typeof createMessage>[2]): ChatMessage {
  return { ...msg, content, streaming: false, ...extra };
}
