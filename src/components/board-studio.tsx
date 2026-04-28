"use client";

import { LoaderCircle, RefreshCw, Wand2 } from "lucide-react";

import {
  Conversation,
  ConversationContent,
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
import { DashboardStage } from "@/components/dashboard-stage";
import { usePipeline } from "@/hooks/use-pipeline";
import type { AnalysisReport, PagePlan, SuggestedWidget } from "@/lib/analysis-report";
import type { PipelineState } from "@/lib/pipeline-types";
import type { BoardStructure } from "@/lib/structure-schema";
import type { VisualSystemSpec } from "@/lib/visual-system";

function extractColors(text: string) {
  return Array.from(new Set(text.match(/#[0-9a-fA-F]{6}/g) ?? [])).slice(0, 12);
}

function PalettePreview({ text }: { text: string }) {
  const colors = extractColors(text);
  if (!colors.length) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {colors.map((color) => (
        <span
          key={color}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2.5 text-xs font-medium text-white/72"
        >
          <span
            className="h-5 w-5 rounded-full border border-white/20 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.22)]"
            style={{ backgroundColor: color }}
          />
          {color}
        </span>
      ))}
    </div>
  );
}

function WidgetRolePill({ widget }: { widget: SuggestedWidget }) {
  const tone =
    widget.priority === "high"
      ? "border-orange-300/20 bg-orange-300/[0.08] text-orange-100"
      : widget.priority === "medium"
        ? "border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-100"
        : "border-white/10 bg-white/[0.04] text-white/64";

  return (
    <div className={`rounded-xl border px-3 py-2 ${tone}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-black/20 px-2 py-0.5 text-[11px] uppercase tracking-wide">{widget.type}</span>
        <span className="text-xs font-semibold">{widget.label}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-xs leading-5 opacity-75">{widget.rationale}</p>
    </div>
  );
}

function PagePlanCard({ page, index }: { page: PagePlan; index: number }) {
  return (
    <article className="rounded-xl border border-white/8 bg-black/18 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/38">页面 {index + 1}</div>
          <h3 className="mt-1 text-sm font-semibold text-white">{page.name}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-white/62">
          {page.analysisGoal}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-white/76">{page.keyQuestion}</p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-lg bg-white/[0.035] p-2">
          <div className="text-[11px] text-white/38">必须讲清</div>
          <div className="mt-1 space-y-1 text-xs leading-5 text-white/68">
            {page.mustInsights.map((item) => <div key={item}>· {item}</div>)}
          </div>
        </div>
        <div className="rounded-lg bg-white/[0.035] p-2">
          <div className="text-[11px] text-white/38">决策动作</div>
          <p className="mt-1 text-xs leading-5 text-white/68">{page.decisionAction}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {page.keyMetrics.slice(0, 8).map((metric) => (
          <span key={metric} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/58">
            {metric}
          </span>
        ))}
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-2">
        {page.suggestedWidgets.slice(0, 4).map((widget) => (
          <WidgetRolePill key={`${page.name}-${widget.label}`} widget={widget} />
        ))}
      </div>
    </article>
  );
}

function AnalysisPreview({ analysis }: { analysis: AnalysisReport }) {
  const context = analysis.inferredContext;

  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-white/8 bg-black/18 p-4">
          <div className="text-xs text-white/42">需求理解</div>
          <h2 className="mt-2 text-lg font-semibold leading-7 text-white">{analysis.summary}</h2>
          <p className="mt-2 text-sm leading-6 text-white/64">{analysis.overallGoal}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[analysis.audience, context.industryTag, context.coreEntity, analysis.recommendedTheme].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/70">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.035] p-3">
            <div className="text-xs text-cyan-100/58">业务假设</div>
            <p className="mt-2 text-sm leading-6 text-white/70">{context.industryHypothesis}</p>
          </div>
          <div className="rounded-xl border border-orange-300/10 bg-orange-300/[0.035] p-3">
            <div className="text-xs text-orange-100/58">经营模型</div>
            <p className="mt-2 text-sm leading-6 text-white/70">{context.businessModelGuess}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["默认切片", context.defaultSlices],
          ["关注问题", context.defaultConcerns],
          ["潜在需求", analysis.potentialNeeds],
        ].map(([label, values]) => (
          <div key={label as string} className="rounded-xl border border-white/8 bg-black/18 p-3">
            <div className="text-xs text-white/42">{label as string}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(values as string[]).slice(0, 8).map((value) => (
                <span key={value} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/62">
                  {value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/8 bg-black/18 p-3">
        <div className="text-xs text-white/42">数据故事线</div>
        <p className="mt-2 text-sm leading-6 text-white/72">{analysis.dataStory}</p>
      </div>

      <div className="mt-4 grid gap-3">
        {analysis.pages.map((page, index) => (
          <PagePlanCard key={page.name} page={page} index={index} />
        ))}
      </div>
    </section>
  );
}

function collectPageNodes(structure: BoardStructure, rootNodeId: string) {
  const result: BoardStructure["nodeMap"][string][] = [];
  const visit = (nodeId: string) => {
    const node = structure.nodeMap[nodeId];
    if (!node) return;
    result.push(node);
    if (node.type === "group") {
      node.childrenIds.forEach(visit);
    }
  };
  visit(rootNodeId);
  return result;
}

function StructurePreview({ structure }: { structure: BoardStructure }) {
  const nodes = Object.values(structure.nodeMap);
  const groups = nodes.filter((node) => node.type === "group");
  const widgets = nodes.filter((node) => node.type === "widget");
  const widgetCounts = widgets.reduce<Record<string, number>>((acc, node) => {
    acc[node.widgetType] = (acc[node.widgetType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["页面", structure.pages.length],
          ["节点", nodes.length],
          ["分组", groups.length],
          ["组件", widgets.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            <div className="text-xs text-white/42">{label}</div>
            <div className="mt-1 text-xl font-semibold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(widgetCounts).map(([type, count]) => (
          <span key={type} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/72">
            {type} × {count}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {structure.pages.map((page) => {
          const pageNodes = collectPageNodes(structure, page.rootNodeId);
          return (
            <article key={page.id} className="rounded-xl border border-white/8 bg-black/18 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{page.name}</h3>
                <code className="rounded-md bg-black/28 px-2 py-1 text-xs text-white/48">{page.rootNodeId}</code>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {pageNodes.slice(0, 10).map((node) => {
                  if (node.type === "group") {
                    return (
                      <div key={node.id} className="rounded-lg border border-cyan-300/10 bg-cyan-300/[0.035] px-3 py-2">
                        <div className="truncate text-xs font-medium text-cyan-100">{node.name}</div>
                        <div className="mt-1 text-[11px] text-white/42">group · children {node.childrenIds.length}</div>
                      </div>
                    );
                  }
                  const [x, y] = node.layoutStyle.position.map((value) => Math.round(value));
                  return (
                    <div key={node.id} className="rounded-lg border border-orange-300/10 bg-orange-300/[0.035] px-3 py-2">
                      <div className="truncate text-xs font-medium text-orange-100">{node.name}</div>
                      <div className="mt-1 text-[11px] text-white/42">
                        {node.widgetType} · {Math.round(node.layoutStyle.width)}×{Math.round(node.layoutStyle.height)} · {x},{y}
                      </div>
                    </div>
                  );
                })}
              </div>
              {pageNodes.length > 10 && (
                <div className="mt-2 text-xs text-white/38">还有 {pageNodes.length - 10} 个节点已纳入页面结构。</div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function VisualSystemPreview({ visualSystem }: { visualSystem: VisualSystemSpec }) {
  const tokenRows = [
    ["页面背景", visualSystem.tokens.pageBg],
    ["面板", visualSystem.tokens.panelBg],
    ["强调", visualSystem.tokens.accent],
    ["正向", visualSystem.tokens.positive],
    ["警示", visualSystem.tokens.warning],
    ["负向", visualSystem.tokens.negative],
  ] as const;

  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-black/18 p-3">
          <div className="text-xs text-white/42">视觉主题</div>
          <div className="mt-2 text-sm text-white/82">
            {visualSystem.themeProfile.theme} · {visualSystem.themeProfile.tone} · {visualSystem.themeProfile.density}
          </div>
          <div className="mt-1 text-xs text-white/46">
            {visualSystem.themeProfile.surfaceStyle} / {visualSystem.themeProfile.contrast}
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-black/18 p-3">
          <div className="text-xs text-white/42">组件规则</div>
          <div className="mt-2 text-xs leading-6 text-white/70">
            KPI {visualSystem.componentRules.kpiCard} · 图表 {visualSystem.componentRules.chartPanel} · 网格 {visualSystem.componentRules.chartGrid}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tokenRows.map(([label, color]) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/18 p-2">
            <span className="h-8 w-8 rounded-lg border border-white/20" style={{ backgroundColor: color }} />
            <div>
              <div className="text-xs text-white/42">{label}</div>
              <div className="font-mono text-xs text-white/72">{color}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex overflow-hidden rounded-xl border border-white/10">
        {visualSystem.tokens.chartPalette.map((color) => (
          <div key={color} className="h-10 flex-1" style={{ backgroundColor: color }} title={color} />
        ))}
      </div>
    </section>
  );
}

function PipelineDataPreview({ state }: { state: PipelineState }) {
  return (
    <>
      {state.analysis && <AnalysisPreview analysis={state.analysis} />}
      {state.structure && <StructurePreview structure={state.structure} />}
      {state.visualSystem && <VisualSystemPreview visualSystem={state.visualSystem} />}
    </>
  );
}

// ══════════════════════════════════════════════════════════
// ─── Main Component ─────────────────────────────────────
// ══════════════════════════════════════════════════════════

export function BoardStudio() {
  const { state, messages, isRunning, runPipeline, stop, clear, changePage } = usePipeline();
  const hasPreview = state.step === "done" && !!state.visdoc && !isRunning;

  if (hasPreview) {
    return (
      <div className="relative h-dvh min-h-0 w-full overflow-hidden bg-[#050816]">
        <DashboardStage
          board={state.visdoc ?? undefined}
          isLoading={false}
          activePageId={state.activePageId}
          onPageChange={changePage}
        />
        <div className="absolute right-4 top-4 z-30">
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/45 px-4 py-2 text-sm font-medium text-white/82 shadow-2xl backdrop-blur-md transition hover:border-white/22 hover:bg-black/60 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            重新生成新看板
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col bg-[#070a12]">
      <main className="min-h-0 flex-1 overflow-hidden">
        <Conversation className="h-full">
          <ConversationContent className="mx-auto flex min-h-full w-full max-w-4xl justify-start gap-5 px-4 pb-36 pt-8 md:px-6 md:pt-12">
            {messages.map((message) => (
              <Message key={message.id} from={message.role} className="max-w-full">
                <MessageContent className="rounded-2xl bg-transparent text-[15px] leading-7 text-white/90 group-[.is-user]:max-w-[78%] group-[.is-user]:bg-white/10 group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-white group-[.is-assistant]:w-full group-[.is-assistant]:px-1">
                  {(() => {
                    const text = message.parts.map((p) => p.text).join("\n");
                    return (
                      <>
                        <MessageResponse
                          className="text-white/90 [&_*]:text-inherit"
                          isAnimating={message.role === "assistant" && isRunning}
                        >
                          {text}
                        </MessageResponse>
                        {message.role === "assistant" && <PalettePreview text={text} />}
                        {message.role === "assistant" && <PipelineDataPreview state={state} />}
                      </>
                    );
                  })()}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton className="bottom-32 border-white/10 bg-black/60 text-white hover:bg-black/80" />
        </Conversation>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#070a12] via-[#070a12]/95 to-transparent px-4 pb-4 pt-10 md:px-6 md:pb-6">
        <PromptInput
          className="pointer-events-auto mx-auto max-w-3xl rounded-[1.5rem] border border-white/10 bg-[rgba(14,18,30,0.96)] p-2 text-white shadow-2xl backdrop-blur-xl"
          onSubmit={({ text }, event) => {
            event.preventDefault();
            runPipeline(text);
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea
              className="border-none bg-transparent text-white placeholder:text-white/36"
              placeholder="描述你想要的数据可视化看板..."
              disabled={isRunning}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              {messages.length > 0 && (
                <PromptInputButton
                  type="button"
                  variant="ghost"
                  className="text-white/58 hover:bg-white/10 hover:text-white"
                  onClick={clear}
                >
                  清空
                </PromptInputButton>
              )}
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
    </div>
  );
}
