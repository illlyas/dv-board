"use client";

import React, { useCallback, useEffect, useState } from "react";
import { JsxRenderer } from "./jsx-renderer";
import { ViPreview } from "./vi-preview";
import { StoryPreview } from "./story-preview";
import { usePipeline } from "@/hooks/use-pipeline";
import type { VISystem } from "@/lib/board/vi-system";
import type { BoardStory } from "@/lib/board/board-story";
import type { JSXCode } from "@/lib/board/jsx-output";

type ThemeMode = "light" | "dark";

// ============================================================================
// 类型定义
// ============================================================================

interface BoardStudioProps {
  /** 初始用户输入的看板需求描述 */
  initialPrompt?: string;
}

// ============================================================================
// 子组件：阶段指示器 (Step Indicator)
// ============================================================================

interface StepIndicatorProps {
  currentPhase: string;
  onStepClick?: (phase: string) => void;
}

const STEPS: {
  phase: string;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    phase: "design-vi",
    label: "VI 设计",
    description: "设计视觉系统 Token",
    icon: "🎨",
  },
  {
    phase: "design-story",
    label: "故事设计",
    description: "规划看板布局与内容",
    icon: "📖",
  },
  {
    phase: "generate-jsx",
    label: "生成代码",
    description: "生成 JSX 看板代码",
    icon: "⚡",
  },
];

function StepIndicator({ currentPhase, onStepClick }: StepIndicatorProps) {
  const currentStepIndex = STEPS.findIndex((s) => s.phase === currentPhase);

  return (
    <div className="step-indicator flex items-center justify-center w-full py-3 px-4">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <React.Fragment key={step.phase}>
            {/* 步骤节点 */}
            <button
              onClick={() =>
                onStepClick?.(step.phase)
              }
              disabled={!isCurrent && !isCompleted}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isCurrent
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : isCompleted
                    ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    : "text-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              <span className="text-base">{isCompleted ? "✓" : step.icon}</span>
              {!isCurrent ? (
                <>
                  <span className="text-xs font-medium hidden sm:inline">
                    {step.label}
                  </span>
                  <span className="text-[10px] hidden md:inline opacity-70">
                    {step.description}
                  </span>
                </>
              ) : (
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold leading-tight">
                    Step {index + 1}: {step.label}
                  </div>
                  <div className="text-[10px] opacity-80 leading-tight">
                    {step.description}
                  </div>
                </div>
              )}
            </button>

            {/* 连接线 */}
            {index < STEPS.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 mx-1 ${
                  index < currentStepIndex
                    ? "bg-primary"
                    : "bg-border"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// 子组件：提示词输入区域
// ============================================================================

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder,
}: PromptInputProps) {
  // Ctrl/Cmd + Enter 提交
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isLoading && value.trim()) {
          onSubmit();
        }
      }
    },
    [isLoading, value, onSubmit]
  );

  return (
    <div className="prompt-input relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          placeholder ??
          "描述你想要的数据看板…\n\n例如：\n• 一个展示电商销售数据的仪表盘\n• 用户增长趋势分析面板\n• 财务报表概览\n• 运营监控大屏"
        }
        disabled={isLoading}
        rows={4}
        className="w-full resize-none rounded-lg border border-input bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none disabled:opacity-50 transition-colors"
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <kbd
          className={`hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border ${
            isLoading ? "opacity-50" : ""
          }`}
        >
          ⌘↵
        </kbd>
        <button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              处理中…
            </>
          ) : (
            <>
              开始设计
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 子组件：主题切换按钮组
// ============================================================================

interface ThemeToggleProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

function ThemeToggle({ mode, onChange }: ThemeToggleProps) {
  return (
    <div className="theme-toggle inline-flex rounded-lg border border-border p-0.5">
      <button
        onClick={() => onChange("light")}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          mode === "light"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        ☀️ 亮色
      </button>
      <button
        onClick={() => onChange("dark")}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          mode === "dark"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        🌙 暗色
      </button>
    </div>
  );
}

// ============================================================================
// 子组件：操作工具栏
// ============================================================================

interface ToolbarProps {
  jsxCode: string;
  onCopyCode: () => void;
  onDownloadCode: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

function Toolbar({
  jsxCode,
  onCopyCode,
  onRegenerate,
  isLoading,
  themeMode,
  onThemeChange,
}: ToolbarProps) {
  return (
    <div className="toolbar flex items-center justify-between py-2 px-3 border-b border-border/50 bg-muted/20">
      <div className="flex items-center gap-2">
        <ThemeToggle mode={themeMode} onChange={onThemeChange} />

        {jsxCode && (
          <span className="text-[11px] text-muted-foreground font-mono ml-2">
            {jsxCode.length.toLocaleString()} chars
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* 复制代码 */}
        <button
          onClick={onCopyCode}
          disabled={!jsxCode}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-muted disabled:opacity-40 transition-colors"
          title="复制 JSX 代码"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
            />
          </svg>
          复制
        </button>

        {/* 重新生成 */}
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-40 transition-colors"
          title="重新生成（仅当前步骤）"
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          )}
          重试
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 主组件：BoardStudio
// ============================================================================

/**
 * 看板工作室主组件
 *
 * 三步管线流程：
 * 1. VI 系统设计 → 预览 Design Tokens
 * 2. 看板故事设计 → 预览布局结构
 * 3. JSX 代码生成 → 实时渲染预览
 *
 * 支持：
 * - Step 1 & 2 并行执行
 * - 亮色/暗色主题切换
 * - 逐步确认 / 一键完成两种工作模式
 */
export function BoardStudio({
  initialPrompt = "",
}: BoardStudioProps) {
  // ===== 本地状态 =====
  const [prompt, setPrompt] = useState(initialPrompt);
  const [activeTab, setActiveTab] = useState<
    "input" | "preview" | "render"
  >("input");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // ===== 管线 Hook =====
  const { state, messages, isRunning, runPipeline, stop, clear } = usePipeline();

  // ===== 从管线状态派生值 =====
  const viDesign: VISystem | null = state.viSystem;
  const story: BoardStory | null = state.boardStory;
  const jsxResult: JSXCode | null = state.jsxCode;

  // 调试日志
  useEffect(() => {
    console.log("[BoardStudio] State updated:", {
      step: state.step,
      hasViSystem: !!state.viSystem,
      hasBoardStory: !!state.boardStory,
      hasJsxCode: !!state.jsxCode,
      jsxCodeLength: state.jsxCode?.code?.length,
    });
  }, [state]);

  // ===== 事件处理 =====

  /** 启动管线（从输入提交） */
  const handleSubmit = useCallback(() => {
    if (!prompt.trim()) return;
    runPipeline(prompt);
    setActiveTab("preview");
  }, [prompt, runPipeline]);

  /** 复制 JSX 代码到剪贴板 */
  const handleCopyCode = useCallback(async () => {
    if (!jsxResult?.code) return;
    try {
      await navigator.clipboard.writeText(jsxResult.code);
      // TODO: 添加 toast 提示
      console.log("[BoardStudio] 代码已复制到剪贴板");
    } catch (err) {
      console.error("[BoardStudio] 复制失败:", err);
    }
  }, [jsxResult]);

  /** 下载 JSX 代码为文件 */
  const handleDownloadCode = useCallback(() => {
    if (!jsxResult?.code) return;
    const blob = new Blob([jsxResult.code], {
      type: "text/typescript;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-${Date.now()}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [jsxResult]);

  /** 重新执行当前步骤 */
  const handleRegenerate = useCallback(() => {
    // V2 管线不支持单步重试，只能重新运行整个流程
    if (prompt.trim()) {
      runPipeline(prompt);
    }
  }, [prompt, runPipeline]);

  /** 切换到指定步骤 */
  const handleStepClick = useCallback(
    (phase: string) => {
      // 管线是线性流程，不支持跳转
      console.log(`[BoardStudio] 步骤点击: ${phase}`);
    },
    []
  );



  // ===== 渲染 =====

  return (
    <div
      className="board-studio flex flex-col h-full bg-background text-foreground overflow-hidden"
      data-pipeline-step={state.step}
      data-pipeline-status={isRunning ? "running" : state.step}
    >
      {/* ====== 顶部栏 ====== */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border/50 shrink-0">
        {/* 左侧：标题 */}
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight">
            AI 数据看板
          </h1>
        </div>

        {/* 右侧：状态指示 */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-1.5 text-xs text-primary animate-pulse">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              AI 处理中…
            </div>
          )}
          {state.step === "error" && (
            <div className="flex items-center gap-1.5 text-xs text-destructive">
              ❌ 出错了
            </div>
          )}
          {state.step === "done" && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              ✅ 完成
            </div>
          )}
        </div>
      </header>

      {/* ====== 阶段指示器 ====== */}
      <StepIndicator
        currentPhase={state.step === "designing" ? "design-vi" : state.step === "generating" ? "generate-jsx" : "design-vi"}
        onStepClick={handleStepClick}
      />

      {/* ====== 主内容区 ====== */}
      <main className="flex-1 overflow-auto">
        {/* --- 输入模式 --- */}
        {(state.step === "idle" ||
          state.step === "error" ||
          activeTab === "input") && (
          <div className="max-w-2xl mx-auto p-6 space-y-4">
            <div className="text-center mb-6 space-y-2">
              <h2 className="text-xl font-bold">三步创建专业数据看板</h2>
              <p className="text-sm text-muted-foreground">
                AI 将依次设计视觉系统、规划看板布局、生成可渲染代码
              </p>
            </div>

            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSubmit}
              isLoading={isRunning}
            />

            {/* 错误信息 */}
            {state.errorMsg && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                <strong>错误：</strong>
                {state.errorMsg}
              </div>
            )}

            {/* 快捷示例 */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                {
                  title: "电商销售仪表盘",
                  prompt: "一个电商销售数据仪表盘，包含 GMV 趋势图、品类占比饼图、TOP10 商品表格、关键指标卡片",
                },
                {
                  title: "用户增长分析",
                  prompt: "用户增长分析面板，展示 DAU/WAU/MAU 趋势、留存率漏斗、渠道来源分布",
                },
                {
                  title: "财务报表概览",
                  prompt: "企业财务报表看板，包含收入利润趋势、成本结构分析、现金流量表",
                },
                {
                  title: "运营监控大屏",
                  prompt: "实时运营监控大屏，展示实时订单量、服务器负载、告警列表、SLA 指标",
                },
              ].map((example) => (
                <button
                  key={example.title}
                  onClick={() => setPrompt(example.prompt)}
                  className="text-left p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group"
                >
                  <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    {example.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {example.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- 预览模式 --- */}
        {activeTab === "preview" && state.step !== "idle" && (
          <div className="h-full flex flex-col">
            <Toolbar
              jsxCode={jsxResult?.code ?? ""}
              onCopyCode={handleCopyCode}
              onDownloadCode={handleDownloadCode}
              onRegenerate={handleRegenerate}
              isLoading={isRunning}
              themeMode={themeMode}
              onThemeChange={setThemeMode}
            />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-x divide-border/50 overflow-hidden">
              {/* 左侧：设计预览区 */}
              <div className="overflow-auto p-4 space-y-4">
                {/* VI 系统预览 */}
                {(state.step === "designing" ||
                  state.step === "designed" ||
                  state.step === "generating" ||
                  state.step === "done") && (
                  <section id="vi-preview-section">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Step 1: 视觉系统
                    </h3>
                    <ViPreview design={viDesign} themeMode={themeMode} />
                  </section>
                )}

                {/* 故事预览 */}
                {(state.step === "designing" ||
                  state.step === "designed" ||
                  state.step === "generating" ||
                  state.step === "done") && (
                  <section id="story-preview-section" className="pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Step 2: 看板布局
                    </h3>
                    <StoryPreview
                      story={story}
                      compact={false}
                      onBlockClick={setSelectedBlockId}
                    />
                  </section>
                )}

                {/* 代码查看器 */}
                {jsxResult?.code && (
                  <section id="code-viewer-section" className="pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      生成的 JSX 代码
                    </h3>
                    <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-xs font-mono overflow-auto max-h-96 leading-relaxed">
                      {jsxResult.code}
                    </pre>
                  </section>
                )}
              </div>

              {/* 右侧：渲染预览区 */}
              <div className="overflow-auto bg-muted/10 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 sticky top-0 bg-inherit py-1">
                  🖥️ 实时渲染预览
                </h3>
                {jsxResult?.code ? (
                  <div
                    className="rounded-lg border border-border bg-background shadow-sm min-h-[400px]"
                    style={{
                      backgroundColor:
                        themeMode === "dark" ? "#09090b" : "#ffffff",
                    }}
                  >
                    <JsxRenderer
                      code={jsxResult.code}
                      onError={(error) => {
                        console.error("[BoardStudio] Render error:", error);
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    {isRunning &&
                    state.step === "generating" ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">正在生成 JSX 代码…</span>
                      </div>
                    ) : (
                      <span className="text-sm">
                        完成 Step 3 后在此处预览渲染效果
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ====== 底部状态栏 ====== */}
      <footer className="shrink-0 px-4 py-1.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>
            Step:{" "}
            <code className="font-mono text-foreground">
              {state.step}
            </code>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>{state.statusText}</span>
        </div>
      </footer>
    </div>
  );
}

export default BoardStudio;
