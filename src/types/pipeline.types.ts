import type { QuestionForm, FormResponse, SufficientResponse } from "@/lib/board/data-analysis-model";
import type { JSXCode } from "@/lib/board/jsx-output";

export type PipelineStep =
  | "idle"
  | "collecting"
  | "story"
  | "designing"
  | "vi"
  | "generating"
  | "applying-vi"
  | "done"
  | "error";

export interface PipelineState {
  step: PipelineStep;
  brief: string;
  projectName: string;
  currentForm: QuestionForm | null;
  extractedInfo: FormResponse["extractedInfo"] | SufficientResponse["extractedInfo"] | null;
  designStory: string | null;
  pagesStory: string | null;
  viContent: string | null;
  jsxCode: JSXCode | null;
  isLoading: boolean;
  statusText: string;
  errorMsg: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;
  formData?: QuestionForm;
  designStoryData?: string;
  pagesStoryData?: string;
  jsxCodeData?: JSXCode;
}

export interface TaskStepConfig {
  key: PipelineStep;
  label: string;
}

export const TASK_STEPS: TaskStepConfig[] = [
  { key: "collecting", label: "分析需求信息" },
  { key: "story", label: "生成数据故事" },
  { key: "designing", label: "设计页面结构" },
  { key: "vi", label: "加载品牌 VI 系统" },
  { key: "generating", label: "生成线框代码" },
  { key: "applying-vi", label: "应用品牌视觉" },
];

export const STEP_ORDER: PipelineStep[] = [
  "idle",
  "collecting",
  "story",
  "designing",
  "vi",
  "generating",
  "applying-vi",
  "done",
  "error",
];
