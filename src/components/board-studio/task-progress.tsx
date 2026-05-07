"use client";

import React from "react";
import type { PipelineStep } from "@/types/pipeline.types";
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

export function TaskProgress({ currentStep }: { currentStep: PipelineStep }) {
  if (currentStep === "idle") return null;
  
  return (
    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
      <p className="text-xs font-medium text-gray-500 mb-2">任务进度</p>
      <div className="space-y-1.5">
        {TASK_STEPS.map((task) => {
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
