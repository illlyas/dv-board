"use client";

import React from "react";
import type { PipelineStep, AgentTask, AgentTaskStatus } from "@/types/pipeline.types";
import { TASK_STEPS, STEP_ORDER } from "@/types/pipeline.types";

type StepStatus = "done" | "active" | "pending";

function getStepIndex(step: PipelineStep): number {
  return STEP_ORDER.indexOf(step);
}

function getTaskStepStatus(taskKey: PipelineStep, currentStep: PipelineStep): StepStatus {
  if (currentStep === "done") return "done";
  if (currentStep === "error") {
    const taskIdx = getStepIndex(taskKey);
    const currentIdx = getStepIndex(currentStep);
    return taskIdx < currentIdx ? "done" : "pending";
  }
  const taskIdx = getStepIndex(taskKey);
  const currentIdx = getStepIndex(currentStep);
  if (taskIdx < currentIdx) return "done";
  if (taskIdx === currentIdx) return "active";
  return "pending";
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 shrink-0">
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 shrink-0">
        <span className="w-3 h-3 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-200 bg-white shrink-0" />
  );
}

function AgentTaskIcon({ status }: { status: AgentTaskStatus }) {
  if (status === "done") {
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 shrink-0">
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 shrink-0">
        <span className="w-3 h-3 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 shrink-0">
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-500 shrink-0">
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  // pending
  return (
    <span className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-200 bg-white shrink-0" />
  );
}

export function TaskProgress({ currentStep, tasks }: { currentStep: PipelineStep; tasks?: AgentTask[] }) {
  const hasTasks = tasks && tasks.length > 0;
  if (!hasTasks && currentStep === "idle") return null;

  return (
    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
      <p className="text-xs font-medium text-gray-500 mb-2">任务进度</p>
      <div className="space-y-1.5">
        {hasTasks
          ? tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <AgentTaskIcon status={task.status} />
                <span
                  className={
                    task.status === "done" || task.status === "skipped"
                      ? "text-xs text-gray-500 line-through"
                      : task.status === "running"
                      ? "text-xs text-blue-600 font-medium"
                      : task.status === "error"
                      ? "text-xs text-red-500"
                      : "text-xs text-gray-400"
                  }
                >
                  {task.description}
                </span>
              </div>
            ))
          : TASK_STEPS.map((task) => {
              const status = getTaskStepStatus(task.key, currentStep);
              return (
                <div key={task.key} className="flex items-center gap-2">
                  <StepIcon status={status} />
                  <span
                    className={
                      status === "done"
                        ? "text-xs text-gray-500 line-through"
                        : status === "active"
                        ? "text-xs text-blue-600 font-medium"
                        : "text-xs text-gray-400"
                    }
                  >
                    {task.label}
                  </span>
                </div>
              );
            })}
      </div>
    </div>
  );
}
