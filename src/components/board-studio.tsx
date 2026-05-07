"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePipeline } from "@/hooks/use-pipeline";
import { TaskProgress } from "./board-studio/task-progress";
import { ChatPanel } from "./board-studio/chat-panel";
import { FilePanel } from "./board-studio/file-panel";
import { useTabManager } from "./board-studio/use-tab-manager";
import type { PipelineStep } from "@/types/pipeline.types";

interface BoardStudioProps {
  projectName?: string;
}

export function BoardStudio({ projectName = "" }: BoardStudioProps) {
  const { state, messages, isRunning, runPipeline, submitFormAnswers, clear } = usePipeline();
  const [input, setInput] = useState("");
  
  // Tab management
  const { openTabs, activeTabId, setActiveTabId, handleFileOpen, handleTabClose } = useTabManager();

  // Track step changes to trigger file refresh
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);
  const prevStepRef = useRef<PipelineStep>(state.step);

  useEffect(() => {
    if (prevStepRef.current !== state.step) {
      prevStepRef.current = state.step;
      setFileRefreshTrigger((n) => n + 1);
    }
  }, [state.step]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isRunning) return;
    setInput("");
    runPipeline(trimmed, projectName);
  }, [input, isRunning, runPipeline, projectName]);

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden bg-white">
      {/* Left: Chatbot */}
      <div
        className="flex flex-col border-r border-gray-100 min-h-0"
        style={{ width: "480px", minWidth: "400px", maxWidth: "560px" }}
      >
        <TaskProgress currentStep={state.step} />
        <ChatPanel
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onFormSubmit={submitFormAnswers}
          isRunning={isRunning}
          currentStep={state.step}
          currentForm={state.currentForm}
          onClear={clear}
        />
      </div>

      {/* Right: File panel */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <FilePanel
          projectName={projectName}
          refreshTrigger={fileRefreshTrigger}
          onFileOpen={handleFileOpen}
          openTabs={openTabs}
          activeTabId={activeTabId}
          onTabSelect={setActiveTabId}
          onTabClose={handleTabClose}
        />
      </div>
    </div>
  );
}
