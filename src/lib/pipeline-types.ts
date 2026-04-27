import type { AnalysisReport } from "@/lib/analysis-report";
import type { PageSkeleton } from "@/lib/page-skeleton";
import type { VisdocModel } from "@/lib/dashboard-schema";

// ─── Pipeline Step ────────────────────────────────────────

export type PipelineStep =
  | "idle"
  | "analyzing"
  | "analyzed"
  | "structuring"
  | "structured"
  | "visualizing"
  | "done"
  | "error";

// ─── Pipeline State ───────────────────────────────────────

export interface PipelineState {
  step: PipelineStep;
  brief: string;
  analysis: AnalysisReport | null;
  skeleton: PageSkeleton | null;
  visdoc: VisdocModel | null;
  activePageId?: string;
  statusText: string;
  errorMsg: string | null;
}

// ─── Constants ────────────────────────────────────────────

export const STEP_LABELS: Record<PipelineStep, string> = {
  idle:        "等待输入",
  analyzing:   "① 分析需求…",
  analyzed:    "需求分析完成",
  structuring: "② 设计结构…",
  structured:  "结构设计完成",
  visualizing: "③ 设计视觉…",
  done:        "生成完成",
  error:       "出错了",
};

export const STEP_CONFIG = [
  { key: "analyzing" as PipelineStep,   label: "分析需求",  icon: "Sparkles" as const },
  { key: "structuring" as PipelineStep, label: "设计结构",  icon: "Wand2" as const },
  { key: "visualizing" as PipelineStep, label: "设计视觉",  icon: "Wand2" as const },
] as const;

/** 正在运行的 step 集合 */
export const RUNNING_STEPS: ReadonlySet<PipelineStep> = new Set([
  "analyzing",
  "structuring",
  "visualizing",
]);
