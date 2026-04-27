"use client";

import { LoaderCircle, Sparkles, Wand2 } from "lucide-react";

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
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { AnalysisReportView } from "@/components/analysis-report-view";
import { PipelineStepsBar } from "@/components/dashboard/pipeline-steps-bar";
import { DashboardStage } from "@/components/dashboard-stage";
import { usePipeline } from "@/hooks/use-pipeline";

// ══════════════════════════════════════════════════════════
// ─── Main Component ─────────────────────────────────────
// ══════════════════════════════════════════════════════════

export function BoardStudio() {
  const { state, messages, isRunning, runPipeline, stop, clear, changePage } = usePipeline();

  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col gap-6 px-4 py-4 md:px-6 md:py-6 xl:h-dvh xl:flex-row xl:overflow-hidden">
      {/* ━━ 左侧面板 ━━ */}
      <aside className="panel-surface flex min-h-[32rem] w-full flex-col overflow-hidden p-4 xl:max-w-[26rem] xl:min-h-0 xl:h-full">
        <div className="flex h-full flex-col gap-3">
            {/* 流水线步骤条 */}
            <PipelineStepsBar step={state.step} brief={state.brief} />

            {/* 对话区 */}
            <div className="min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/16">
              <Conversation className="h-full">
                <ConversationContent className="gap-4 p-4">
                  {messages.length ? (
                    messages.map((message) => (
                      <Message key={message.id} from={message.role}>
                        <MessageContent className="rounded-2xl bg-transparent text-[15px] leading-7 text-white/92 group-[.is-user]:bg-white/12 group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-white group-[.is-assistant]:px-1">
                          <MessageResponse className="text-white/92 [&_*]:text-inherit">
                            {message.parts.map((p) => p.text).join("\n")}
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
                  defaultValue="生成一套新能源汽车经营分析看板，至少 2 个页面"
                  placeholder="描述你想要的数据可视化大屏，AI 会分三阶段智能生成…"
                  disabled={isRunning}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputButton
                    type="button" variant="ghost"
                    className="text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={clear}
                  > 清空 </PromptInputButton>
                </PromptInputTools>
                <div className="flex items-center gap-2">
                  {isRunning ? <LoaderCircle className="h-4 w-4 animate-spin text-white/50" /> : <Wand2 className="h-4 w-4 text-white/50" />}
                  <PromptInputSubmit
                    status={isRunning ? "streaming" : "ready"}
                    onStop={stop}
                    className="bg-[#f97316] text-[#140a00] hover:bg-[#fb923c]"
                  />
                </div>
              </PromptInputFooter>
            </PromptInput>
          </div>
      </aside>

      {/* ━━ 右侧看板区域 ━━ */}
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto xl:pr-1">
          <DashboardStage
            board={state.visdoc ?? undefined}
            isLoading={isRunning}
            activePageId={state.activePageId}
            onPageChange={changePage}
          />
        </div>
      </main>
    </div>
  );
}
