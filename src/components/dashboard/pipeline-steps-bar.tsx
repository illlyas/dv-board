"use client";

import { Check, ChevronRight, LoaderCircle, Sparkles, Wand2 } from "lucide-react";

import { RUNNING_STEPS } from "@/lib/pipeline-types";
import type { PipelineStep } from "@/lib/pipeline-types";

const STEPS = [
  { key: "analyzing" as PipelineStep,   label: "分析需求",  icon: Sparkles },
  { key: "structuring" as PipelineStep, label: "设计结构",  icon: Wand2 },
  { key: "visualizing" as PipelineStep, label: "设计视觉",  icon: Wand2 },
];

export function PipelineStepsBar({ step, brief }: { step: PipelineStep; brief: string }) {
  if (!brief) return null;

  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      {STEPS.map(({ key, label, icon: Icon }, idx) => {
        const isActive = [key, (key === "analyzing" ? "analyzed" : ""), (key === "structuring" ? "structured" : "")].includes(step)
          || (key === "visualizing" && step === "done");
        const isCompleted =
          (key === "analyzing" && ["analyzed", "structuring", "structured", "visualizing", "done"].includes(step)) ||
          (key === "structuring" && ["structured", "visualizing", "done"].includes(step)) ||
          (key === "visualizing" && step === "done");

        return (
          <span key={key} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition ${
            isActive ? "bg-[#f97316]/12 text-[#f97316]" :
            isCompleted ? "text-emerald-400/70" :
            "text-white/28"
          }`}>
            {isCompleted ? <Check className="h-3 w-3" /> : RUNNING_STEPS.has(step) && isActive ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
            {idx + 1}.{label}
            {idx < STEPS.length - 1 && <ChevronRight className="ml-0.5 h-3 w-3 text-white/14" />}
          </span>
        );
      })}
    </div>
  );
}
