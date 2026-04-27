"use client";

import {
  Check,
  ChevronRight,
  LoaderCircle,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { AnalysisReportView } from "@/components/analysis-report-view";
import { DashboardStage } from "@/components/dashboard-stage";
import type { AnalysisReport } from "@/lib/analysis-report";
import { analysisReportSchema } from "@/lib/analysis-report";
import { buildDemoVisdoc, LOCAL_STORAGE_KEY, visdocSchema } from "@/lib/dashboard-schema";
import type { VisdocModel } from "@/lib/dashboard-schema";
import type { PageSkeleton } from "@/lib/page-skeleton";
import { pageSkeletonSchema } from "@/lib/page-skeleton";

// ─── Types ────────────────────────────────────────────────

type PipelineStep = "idle" | "analyzing" | "analyzed" | "structuring" | "structured" | "visualizing" | "done" | "error";

interface PipelineState {
  step: PipelineStep;
  brief: string;
  analysis: AnalysisReport | null;
  skeleton: PageSkeleton | null;
  visdoc: VisdocModel | null;
  activePageId?: string;
  statusText: string;
  errorMsg: string | null;
}

const STEP_LABELS: Record<PipelineStep, string> = {
  idle:         "等待输入",
  analyzing:    "① 分析需求…",
  analyzed:     "需求分析完成",
  structuring:  "② 设计结构…",
  structured:   "结构设计完成",
  visualizing:  "③ 设计视觉…",
  done:         "生成完成",
  error:        "出错了",
};

const STEP_CONFIG = [
  { key: "analyzing",    label: "分析需求",   icon: Sparkles },
  { key: "structuring",  label: "设计结构",   icon: Wand2 },
  { key: "visualizing",  label: "设计视觉",   icon: Wand2 },
];

// ─── Helpers ─────────────────────────────────────────────

function createTextMessage(role: "user" | "assistant", text: string) {
  return {
    id: crypto.randomUUID(),
    role,
    parts: [{ type: "text" as const, text }],
  };
}

/** 调用 pipeline 的某个步骤 API（流式返回纯文本 → 最终解析为 JSON） */
async function callPipelineStep(
  url: string,
  body: Record<string, unknown>,
  onStreamText?: (text: string) => void,
): Promise<{ json: unknown; rawText: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API ${url} returned ${res.status}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No readable stream");

  const decoder = new TextDecoder();
  let raw = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    raw += decoder.decode(value, { stream: true });
    onStreamText?.(raw);
  }

  // 尝试从流式文本中解析 JSON（去除可能的 markdown 围栏）
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/, "");
  }
  const json = JSON.parse(cleaned);
  return { json, rawText: raw };
}

// ══════════════════════════════════════════════════════════
// ─── Main Component ─────────────────────────────────────
// ══════════════════════════════════════════════════════════

export function BoardStudio() {
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; parts: Array<{ type: "text"; text: string }> }>>([]);
  const [state, setState] = useState<PipelineState>({
    step: "idle",
    brief: "",
    analysis: null,
    skeleton: null,
    visdoc: null,
    statusText: "等待生成请求。",
    errorMsg: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);

  // 恢复 localStorage
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = visdocSchema.parse(JSON.parse(raw));
      setState((prev) => ({
        ...prev,
        visdoc: parsed,
        activePageId: parsed.currentPageId,
        step: "done",
        statusText: `已恢复上次保存的看板文档（${parsed.pages.length} 页）`,
      }));
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  /** 运行三步流水线 */
  const runPipeline = useCallback(async (brief: string) => {
    if (isRunningRef.current) return;

    // 清理旧状态
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    isRunningRef.current = true;

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      createTextMessage("user", brief),
      { id: assistantId, role: "assistant", parts: [{ type: "text" as const, text: "开始三阶段流水线…" }] },
    ]);

    const updateAssistant = (text: string) => {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, parts: [{ type: "text" as const, text }] } : m),
      );
    };

    try {
      // ═══ Step 1: Analyze ═══
      setState((s) => ({ ...s, step: "analyzing", brief, statusText: "正在分析用户需求…" }));
      updateAssistant("🔍 步骤 1/3 — 分析需求中…");

      const analyzeRes = await callPipelineStep(
        "/api/board/analyze",
        { brief },
        (streamText) => {
          updateAssistant(`🔍 步骤 1/3 — 分析中…（已收到 ${Math.min(streamText.length / 4, 99)}% 数据）`);
          // 同时尝试增量解析展示报告预览
          try {
            const partial = JSON.parse(streamText.replace(/^```.*\n?/i, "").replace(/\n?```.*/g, ""));
            if (partial.summary || partial.pages) {
              setState((s) => ({
                ...s,
                analysis: analysisReportSchema.safeParse(partial).success ? analysisReportSchema.parse(partial) : s.analysis,
              }));
            }
          } catch { /* 增量解析失败是正常的 */ }
        },
      );
      const analysis = analysisReportSchema.parse(analyzeRes.json);

      setState((s) => ({ ...s, step: "analyzed", analysis, statusText: `✅ 需求分析完成：${analysis.pages.length} 个页面规划` }));

      // ═══ Step 2: Structure ═══
      updateAssistant(`📐 步骤 2/3 — 设计页面结构（${analysis.pages.length} 页）…`);
      setState((s) => ({ ...s, step: "structuring", statusText: "正在设计页面布局结构…" }));

      const structureRes = await callPipelineStep(
        "/api/board/structure",
        { brief, analysis: analyzeRes.json },
        (streamText) => {
          updateAssistant(`📐 步骤 2/3 — 结构设计中…（已接收 ${Math.min(streamText.length / 8, 99)}%）`);
        },
      );
      const skeleton = pageSkeletonSchema.parse(structureRes.json);

      setState((s) => ({ ...s, step: "structured", skeleton, statusText: `✅ 结构设计完成：${Object.keys(skeleton.nodeMap).length} 个节点` }));

      // ═══ Step 3: Visualize ═══
      updateAssistant(`🎨 步骤 3/3 — 设计视觉效果…`);
      setState((s) => ({ ...s, step: "visualizing", statusText: "正在应用视觉风格系统…" }));

      const visualizeRes = await callPipelineStep(
        "/api/board/visualize",
        { brief, analysis: analyzeRes.json, skeleton: structureRes.json },
        (streamText) => {
          updateAssistant(`🎨 步骤 3/3 — 视觉设计中…（已接收 ${Math.min(streamText.length / 10, 99)}%）`);
          // 尝试增量解析最终 visdoc 用于实时预览
          try {
            const partialVis = JSON.parse(streamText.replace(/^```.*\n?/i, "").replace(/\n?```.*/g, ""));
            if (partialVis.nodeMap && Object.keys(partialVis.nodeMap).length > 0) {
              setState((s) => ({
                ...s,
                visdoc: visdocSchema.safeParse(partialVis).success
                  ? visdocSchema.parse(partialVis)
                  : partialVis as unknown as VisdocModel,
              }));
            }
          } catch { /* ok */ }
        },
      );
      const visdoc = visdocSchema.parse(visualizeRes.json);

      // 保存到 localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visdoc));

      setState({
        step: "done",
        brief,
        analysis,
        skeleton,
        visdoc,
        activePageId: visdoc.currentPageId,
        statusText: `✅ 全部完成！${visdoc.pages.length} 页看板已生成`,
        errorMsg: null,
      });
      updateAssistant(`✅ 看板生成完毕！共 ${visdoc.pages.length} 页、${Object.keys(visdoc.nodeMap).length} 个组件。`);

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[pipeline] error:", err);
      setState((s) => ({
        ...s,
        step: s.step === "idle" ? "error" : s.step,
        errorMsg: msg,
        statusText: `❌ 流水线中断: ${msg.slice(0, 120)}`,
      }));
      updateAssistant(`❌ 出错了: ${msg.slice(0, 200)}。请重试。`);

    } finally {
      isRunningRef.current = false;
    }
  }, []);

  /** 中止当前运行 */
  const handleStop = () => {
    abortRef.current?.abort();
    isRunningRef.current = false;
    setState((s) => ({ ...s, statusText: "已中止" }));
  };

  /** 清空 */
  const handleClear = () => {
    handleStop();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setMessages([]);
    setState({ step: "idle", brief: "", analysis: null, skeleton: null, visdoc: null, statusText: "等待生成请求。", errorMsg: null });
  };

  /** 加载示例 */
  const handleLoadDemo = () => {
    const demo = buildDemoVisdoc();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demo));
    setState({
      step: "done",
      brief: "示例数据",
      analysis: null,
      skeleton: null,
      visdoc: demo,
      activePageId: demo.currentPageId,
      statusText: `已加载示例文档（${demo.pages.length} 页）`,
      errorMsg: null,
    });
  };

  /** 切换页面 */
  const handlePageChange = (pageId: string) => {
    if (!state.visdoc) return;
    const nextDoc = { ...state.visdoc, currentPageId: pageId };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextDoc));
    setState((s) => ({ ...s, activePageId: pageId, visdoc: nextDoc }));
  };

  const isRunning = ["analyzing", "structuring", "visualizing"].includes(state.step);

  // ─── Render ──────────────────────────────────────────────

  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col gap-6 px-4 py-4 md:px-6 md:py-6 xl:h-dvh xl:flex-row xl:overflow-hidden">
      {/* ━━ 左侧面板 ━━ */}
      <aside className="panel-surface flex min-h-[32rem] w-full flex-col overflow-hidden p-4 xl:max-w-[26rem] xl:min-h-0 xl:h-full">
        <PromptInputProvider initialInput="生成一套新能源汽车经营分析看板，至少 2 个页面">
          <div className="flex h-full flex-col gap-3">
            {/* 流水线步骤条 */}
            {state.brief && (
              <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                {STEP_CONFIG.map(({ key, label, label: _, icon: Icon }, idx) => {
                  const isActive = [key, (key === "analyzing" ? "analyzed" : ""), (key === "structuring" ? "structured" : "")].includes(state.step)
                    || (key === "visualizing" && state.step === "done");
                  const isCompleted =
                    (key === "analyzing" && ["analyzed", "structuring", "structured", "visualizing", "done"].includes(state.step)) ||
                    (key === "structuring" && ["structured", "visualizing", "done"].includes(state.step)) ||
                    (key === "visualizing" && state.step === "done");
                  return (
                    <span key={key} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition ${
                      isActive ? "bg-[#f97316]/12 text-[#f97316]" :
                      isCompleted ? "text-emerald-400/70" :
                      "text-white/28"
                    }`}>
                      {isCompleted ? <Check className="h-3 w-3" /> : isRunning && isActive ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
                      {idx + 1}.{label}
                      {idx < STEP_CONFIG.length - 1 && <ChevronRight className="ml-0.5 h-3 w-3 text-white/14" />}
                    </span>
                  );
                })}
              </div>
            )}

            {/* 对话区 */}
            <div className="min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/16">
              <Conversation className="h-full">
                <ConversationContent className="gap-4 p-4">
                  {messages.length ? (
                    messages.map((message) => (
                      <Message key={message.id} from={message.role}>
                        <MessageContent className="rounded-2xl bg-transparent text-[15px] leading-7 text-white/92 group-[.is-user]:bg-white/12 group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-white group-[.is-assistant]:px-1">
                          <MessageResponse className="text-white/92 [&_*]:text-inherit">
                            {message.parts.map((p, i) => p.text).join("\n")}
                          </MessageResponse>
                        </MessageContent>
                      </Message>
                    ))
                  ) : (
                    <ConversationEmptyState
                      title="等待第一条看板生成请求"
                      description="AI 将通过「需求分析 → 结构设计 → 视觉设计」三阶段流水线生成专业数据可视化大屏"
                      icon={<Sparkles className="h-5 w-5" />}
                    />
                  )}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>
            </div>

            {/* Step 1 结果展示：Analysis Report */}
            {(state.step === "analyzed" || state.step === "structuring" || state.step === "structured") && state.analysis && (
              <div className="max-h-[40vh] overflow-y-auto rounded-xl border border-[#f97316]/15 bg-[#f97316]/[0.03]">
                <AnalysisReportView report={state.analysis} />
              </div>
            )}

            {/* 输入框 */}
            <PromptInput
              className="shrink-0 rounded-[1.5rem] border border-white/10 bg-[rgba(8,12,24,0.94)] p-2 text-white backdrop-blur-xl"
              onSubmit={({ text }, event) => {
                event.preventDefault();
                runPipeline(text);
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  className="border-none bg-transparent text-white placeholder:text-white/36"
                  placeholder="描述你想要的数据可视化大屏，AI 会分三阶段智能生成…"
                  disabled={isRunning}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputButton
                    type="button" variant="ghost"
                    className="text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={handleLoadDemo}
                  > 示例 </PromptInputButton>
                  <PromptInputButton
                    type="button" variant="ghost"
                    className="text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={handleClear}
                  > 清空 </PromptInputButton>
                </PromptInputTools>
                <div className="flex items-center gap-2">
                  {isRunning ? <LoaderCircle className="h-4 w-4 animate-spin text-white/50" /> : <Wand2 className="h-4 w-4 text-white/50" />}
                  <PromptInputSubmit
                    status={isRunning ? "streaming" : "ready"}
                    onStop={handleStop}
                    className="bg-[#f97316] text-[#140a00] hover:bg-[#fb923c]"
                  />
                </div>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </PromptInputProvider>
      </aside>

      {/* ━━ 右侧看板区域 ━━ */}
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto xl:pr-1">
          <DashboardStage
            board={state.visdoc ?? undefined}
            isLoading={isRunning}
            activePageId={state.activePageId}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
}
