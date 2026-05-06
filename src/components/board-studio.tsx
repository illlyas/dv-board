"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { usePipeline } from "@/hooks/use-pipeline";
import type { PipelineStep } from "@/hooks/use-pipeline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { JsxRenderer } from "@/components/jsx-renderer";

// ─── Types ────────────────────────────────────────────────

interface BoardStudioProps {
  projectName?: string;
}

interface FileItem {
  name: string;
  path: string;
  updatedAt: string;
}

interface FilesResponse {
  categories: {
    "数据故事": FileItem[];
    "品牌VI": FileItem[];
    "页面结构": FileItem[];
    "页面": FileItem[];
  };
}

type CategoryKey = "数据故事" | "品牌VI" | "页面结构" | "页面";

const CATEGORY_ORDER: CategoryKey[] = ["数据故事", "品牌VI", "页面结构", "页面"];

// ─── ScaledBoardPreview ───────────────────────────────────

function ScaledBoardPreview({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const CANVAS_W = 1920;
  const CANVAS_H = 1080;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / CANVAS_W, height / CANVAS_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-gray-950 overflow-hidden"
    >
      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
        }}
      >
        <JsxRenderer code={code} />
      </div>
    </div>
  );
}

// ─── FileTabContent ───────────────────────────────────────

function FileTabContent({ file }: { file: FileItem }) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isJsx = file.name.endsWith(".jsx");

  useEffect(() => {
    setContent(null);
    setIsLoading(true);
    fetch(`/api/files/read?path=${encodeURIComponent(file.path)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to read file");
        return res.json() as Promise<{ content: string }>;
      })
      .then((data) => setContent(data.content))
      .catch((err) => {
        console.error("[FileTabContent] read error:", err);
        setContent("读取文件失败");
      })
      .finally(() => setIsLoading(false));
  }, [file.path]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (content === null) return null;

  if (isJsx) {
    return <ScaledBoardPreview code={content} />;
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="prose prose-sm max-w-none text-gray-800">
        <Streamdown plugins={{ cjk }}>{content}</Streamdown>
      </div>
    </div>
  );
}

// ─── RightPanel (Tab system) ──────────────────────────────

const FILES_TAB_ID = "__files__";

interface OpenTab {
  id: string;       // file.path 作为唯一 id
  file: FileItem;
}

function RightPanel({
  projectName,
  refreshTrigger,
  onFileOpen,
  openTabs,
  activeTabId,
  onTabSelect,
  onTabClose,
}: {
  projectName: string;
  refreshTrigger: number;
  onFileOpen: (file: FileItem) => void;
  openTabs: OpenTab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
}) {
  const [files, setFiles] = useState<FilesResponse["categories"] | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!projectName) return;
    setIsLoadingFiles(true);
    try {
      const res = await fetch(`/api/files/list?projectName=${encodeURIComponent(projectName)}`);
      if (res.ok) {
        const data: FilesResponse = await res.json();
        setFiles(data.categories);
      }
    } catch (err) {
      console.error("[RightPanel] fetchFiles error:", err);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [projectName]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch { return dateStr; }
  };

  const allTabs = [
    { id: FILES_TAB_ID, label: "项目文件", closable: false },
    ...openTabs.map((t) => ({ id: t.id, label: t.file.name, closable: true })),
  ];

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* ── Tab bar ── */}
      <div className="flex items-end gap-0 border-b border-gray-100 bg-gray-50 shrink-0 overflow-x-auto">
        {allTabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          const isJsx = tab.label.endsWith(".jsx");
          return (
            <div
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className={`group flex items-center gap-1.5 px-3 py-2 text-xs font-medium cursor-pointer border-r border-gray-100 shrink-0 transition-colors select-none ${
                isActive
                  ? "bg-white text-gray-800 border-b-2 border-b-blue-500 -mb-px"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              style={{ borderBottom: isActive ? "2px solid #3b82f6" : undefined }}
            >
              {tab.id === FILES_TAB_ID ? (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4a1 1 0 011-1h3.586a1 1 0 01.707.293L8.707 4.707A1 1 0 009.414 5H13a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
                </svg>
              ) : isJsx ? (
                <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5,4 1,8 5,12" /><polyline points="11,4 15,8 11,12" /><line x1="9" y1="2" x2="7" y2="14" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M9 1H4a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6l-5-5z" />
                  <path d="M9 1v4a1 1 0 001 1h4" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              )}
              <span className="max-w-[120px] truncate">{tab.label}</span>
              {tab.closable && (
                <button
                  onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}
                  className="flex items-center justify-center w-4 h-4 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all shrink-0"
                  title="关闭"
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="2" y1="2" x2="8" y2="8" /><line x1="8" y1="2" x2="2" y2="8" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white">
        {/* 项目文件 tab */}
        <div className={`h-full flex flex-col ${activeTabId === FILES_TAB_ID ? "" : "hidden"}`}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 shrink-0">
            <span className="text-xs text-gray-500">所有生成文件</span>
            <button
              onClick={fetchFiles}
              disabled={isLoadingFiles}
              title="刷新"
              className="flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <svg className={`w-3.5 h-3.5 ${isLoadingFiles ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {CATEGORY_ORDER.map((category) => {
              const categoryFiles = files?.[category] ?? [];
              return (
                <div key={category}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-gray-500">{CATEGORY_ICONS[category]}</span>
                    <span className="text-xs font-semibold text-gray-600">{category}</span>
                    {categoryFiles.length > 0 && (
                      <span className="ml-auto text-xs text-gray-400">{categoryFiles.length}</span>
                    )}
                  </div>
                  {categoryFiles.length === 0 ? (
                    <p className="text-xs text-gray-400 pl-6 py-1">暂无文件</p>
                  ) : (
                    <div className="space-y-1 pl-1">
                      {categoryFiles.map((file) => {
                        const isJsx = file.name.endsWith(".jsx");
                        return (
                          <div
                            key={file.path}
                            onClick={() => onFileOpen(file)}
                            className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isJsx ? (
                                <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="5,4 1,8 5,12" /><polyline points="11,4 15,8 11,12" /><line x1="9" y1="2" x2="7" y2="14" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M9 1H4a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6l-5-5z" />
                                  <path d="M9 1v4a1 1 0 001 1h4" fill="none" stroke="currentColor" strokeWidth="1" />
                                </svg>
                              )}
                              <span className="text-xs text-gray-700 truncate">{file.name}</span>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{formatDate(file.updatedAt)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 文件预览 tabs */}
        {openTabs.map((tab) => (
          <div key={tab.id} className={`h-full ${activeTabId === tab.id ? "" : "hidden"}`}>
            <FileTabContent file={tab.file} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Category Icons ───────────────────────────────────────

const CATEGORY_ICONS: Record<CategoryKey, React.ReactNode> = {
  "数据故事": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="9" width="3" height="6" rx="0.5" />
      <rect x="6" y="5" width="3" height="10" rx="0.5" />
      <rect x="11" y="1" width="3" height="14" rx="0.5" />
    </svg>
  ),
  "品牌VI": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="5" r="2.5" />
      <circle cx="11" cy="5" r="2.5" />
      <circle cx="5" cy="11" r="2.5" />
      <circle cx="11" cy="11" r="2.5" />
    </svg>
  ),
  "页面结构": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="14" height="14" rx="1.5" />
      <line x1="1" y1="5" x2="15" y2="5" />
      <line x1="7" y1="5" x2="7" y2="15" />
    </svg>
  ),
  "页面": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9A1.5 1.5 0 0014 13.5V6L9 1z" />
      <polyline points="9,1 9,6 14,6" />
      <line x1="5" y1="9" x2="11" y2="9" />
      <line x1="5" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

// ─── Task Step Config ─────────────────────────────────────

interface TaskStepConfig {
  key: PipelineStep;
  label: string;
}

const TASK_STEPS: TaskStepConfig[] = [
  { key: "collecting", label: "分析需求信息" },
  { key: "story", label: "生成数据故事" },
  { key: "designing", label: "设计页面结构" },
  { key: "vi", label: "加载品牌 VI 系统" },
  { key: "generating", label: "生成页面代码" },
];

const STEP_ORDER: PipelineStep[] = [
  "idle",
  "collecting",
  "story",
  "designing",
  "vi",
  "generating",
  "done",
  "error",
];

function getStepIndex(step: PipelineStep): number {
  return STEP_ORDER.indexOf(step);
}

type StepStatus = "done" | "active" | "pending";

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


// ─── Sub-components ───────────────────────────────────────

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

function TaskList({ currentStep }: { currentStep: PipelineStep }) {
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


// ─── Form Renderer ────────────────────────────────────────

interface FormQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "radio" | "checkbox" | "select";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

interface QuestionFormData {
  questions: FormQuestion[];
}

interface FormRendererProps {
  form: QuestionFormData;
  onSubmit: (answers: Record<string, unknown>) => void;
  disabled?: boolean;
}

function FormRenderer({ form, onSubmit, disabled }: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  const handleChange = (id: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, option: string, checked: boolean) => {
    setValues((prev) => {
      const current = (prev[id] as string[]) ?? [];
      if (checked) return { ...prev, [id]: [...current, option] };
      return { ...prev, [id]: current.filter((v) => v !== option) };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
      {form.questions.map((q) => (
        <div key={q.id} className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            {q.label}
            {q.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {q.type === "text" && (
            <Input
              value={(values[q.id] as string) ?? ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder={q.placeholder}
              disabled={disabled}
              className="bg-white"
            />
          )}

          {q.type === "textarea" && (
            <Textarea
              value={(values[q.id] as string) ?? ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder={q.placeholder}
              disabled={disabled}
              className="bg-white min-h-20 resize-none"
            />
          )}

          {q.type === "number" && (
            <Input
              type="number"
              value={(values[q.id] as string) ?? ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder={q.placeholder}
              disabled={disabled}
              className="bg-white"
            />
          )}

          {q.type === "radio" && q.options && (
            <div className="space-y-1">
              {q.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={(values[q.id] as string) === opt}
                    onChange={() => handleChange(q.id, opt)}
                    disabled={disabled}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === "checkbox" && q.options && (
            <div className="space-y-1">
              {q.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={((values[q.id] as string[]) ?? []).includes(opt)}
                    onChange={(e) => handleCheckboxChange(q.id, opt, e.target.checked)}
                    disabled={disabled}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === "select" && q.options && (
            <select
              value={(values[q.id] as string) ?? ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              disabled={disabled}
              className="w-full h-8 rounded-lg border border-input bg-white px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <option value="">请选择...</option>
              {q.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>
      ))}

      <Button type="submit" disabled={disabled} className="w-full">
        提交
      </Button>
    </form>
  );
}


// ─── Message Bubble ───────────────────────────────────────

function MessageBubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;
}) {
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


// ─── Main Component ───────────────────────────────────────

export function BoardStudio({ projectName = "" }: BoardStudioProps) {
  const { state, messages, isRunning, runPipeline, submitFormAnswers, clear } = usePipeline();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Tab state ──
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>(FILES_TAB_ID);

  const handleFileOpen = useCallback((file: FileItem) => {
    const id = file.path;
    setOpenTabs((prev) => {
      if (prev.find((t) => t.id === id)) return prev; // already open
      return [...prev, { id, file }];
    });
    setActiveTabId(id);
  }, []);

  const handleTabClose = useCallback((id: string) => {
    setOpenTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      // if closing active tab, switch to previous or files
      if (activeTabId === id) {
        const newActive = next[idx - 1]?.id ?? next[0]?.id ?? FILES_TAB_ID;
        setActiveTabId(newActive);
      }
      return next;
    });
  }, [activeTabId]);

  // Track step changes to trigger file refresh
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);
  const prevStepRef = useRef<PipelineStep>(state.step);

  useEffect(() => {
    if (prevStepRef.current !== state.step) {
      prevStepRef.current = state.step;
      setFileRefreshTrigger((n) => n + 1);
    }
  }, [state.step]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, state.isLoading]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isRunning) return;
    setInput("");
    runPipeline(trimmed, projectName);
  }, [input, isRunning, runPipeline, projectName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const lastFormMessage = [...messages].reverse().find((m) => m.formData);
  const showForm = !!state.currentForm && !!lastFormMessage;

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden bg-white">
      {/* ── Left: Chatbot ── */}
      <div className="flex flex-col border-r border-gray-100 min-h-0" style={{ width: "480px", minWidth: "400px", maxWidth: "560px" }}>
        <TaskList currentStep={state.step} />

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">✨</div>
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
                  form={msg.formData as QuestionFormData}
                  onSubmit={submitFormAnswers}
                  disabled={isRunning}
                />
              )}
            </div>
          ))}

          {state.isLoading && (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                <span className="w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-xs text-gray-500">{state.statusText}</span>
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
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述你的看板需求... (Cmd+Enter 发送)"
              disabled={isRunning}
              rows={3}
              className="flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:border-0 min-h-0 placeholder:text-gray-400 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
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
              <button onClick={clear} className="text-red-400 hover:text-red-500 transition-colors">取消</button>
            ) : (
              "Cmd+Enter 发送"
            )}
          </p>
        </div>
      </div>

      {/* ── Right: Tab panel ── */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <RightPanel
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

