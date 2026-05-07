"use client";

import React from "react";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;
}

export function MessageBubble({ role, content, streaming }: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-500 px-3.5 py-2.5 text-sm text-white shadow-sm">
          <pre className="whitespace-pre-wrap break-words text-sm font-sans">{content}</pre>
        </div>
      </div>
    );
  }

  if (role === "system") {
    return (
      <div className="flex justify-center">
        <div className="max-w-[90%] rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
          <pre className="whitespace-pre-wrap break-words text-xs font-sans">{content}</pre>
        </div>
      </div>
    );
  }

  // assistant
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-3.5 py-2.5 text-sm text-gray-800 shadow-sm">
        <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
          <Streamdown plugins={{ cjk }}>{content}</Streamdown>
        </div>
        {streaming && (
          <span
            style={{ display: "inline-block", width: "2px", marginLeft: "1px" }}
            className="animate-pulse bg-gray-500 h-3 align-middle"
          >
            |
          </span>
        )}
      </div>
    </div>
  );
}
