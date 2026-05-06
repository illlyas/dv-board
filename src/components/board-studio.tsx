"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { ModelPreview } from "./model-preview";
import { usePipeline } from "@/hooks/use-pipeline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { Question } from "@/lib/board/data-analysis-model";

interface BoardStudioProps {
  initialPrompt?: string;
}

export function BoardStudio({ initialPrompt = "" }: BoardStudioProps) {
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, unknown>>({});
  const [input, setInput] = useState(initialPrompt);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    state,
    messages,
    isRunning,
    runPipeline,
    submitFormAnswers,
    clear,
  } = usePipeline();

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, state.currentForm]);

  // 自动聚焦输入框（当 AI 完成响应时）
  useEffect(() => {
    if (!isRunning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRunning]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;

    // 只在 idle 状态下使用输入框发送消息
    if (state.step === "idle") {
      runPipeline(input);
      setInput("");
    }
    // 如果有表单，用户应该使用表单内的提交按钮
  }, [input, isRunning, state.step, runPipeline]);

  // 标准化 option 为字符串
  const getOptionValue = (option: string | { label: string; value: string }): string => {
    return typeof option === "string" ? option : option.value;
  };

  const getOptionLabel = (option: string | { label: string; value: string }): string => {
    return typeof option === "string" ? option : option.label;
  };

  // 渲染单个问题
  const renderQuestion = (question: Question) => {
    const value = currentAnswers[question.id];

    switch (question.type) {
      case "text":
        return (
          <Input
            value={(value as string) ?? ""}
            onChange={(e) => setCurrentAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
            placeholder={question.placeholder}
            className="bg-background"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={(value as string) ?? ""}
            onChange={(e) => setCurrentAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
            placeholder={question.placeholder}
            rows={3}
            className="bg-background"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={(value as number) ?? ""}
            onChange={(e) => setCurrentAnswers((prev) => ({ ...prev, [question.id]: parseFloat(e.target.value) }))}
            placeholder={question.placeholder}
            className="bg-background"
          />
        );

      case "radio":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const optionValue = getOptionValue(option);
              const optionLabel = getOptionLabel(option);
              return (
                <label key={optionValue} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name={question.id}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => setCurrentAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                    className="w-4 h-4 text-primary mt-0.5"
                  />
                  <span className="text-sm flex-1">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const optionValue = getOptionValue(option);
              const optionLabel = getOptionLabel(option);
              return (
                <label key={optionValue} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <input
                    type="checkbox"
                    value={optionValue}
                    checked={((value as string[]) ?? []).includes(optionValue)}
                    onChange={(e) => {
                      const currentValues = (value as string[]) ?? [];
                      const newValues = e.target.checked
                        ? [...currentValues, optionValue]
                        : currentValues.filter((v) => v !== optionValue);
                      setCurrentAnswers((prev) => ({ ...prev, [question.id]: newValues }));
                    }}
                    className="w-4 h-4 text-primary mt-0.5"
                  />
                  <span className="text-sm flex-1">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case "select":
        return (
          <select
            value={(value as string) ?? ""}
            onChange={(e) => setCurrentAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">请选择...</option>
            {question.options?.map((option) => {
              const optionValue = getOptionValue(option);
              const optionLabel = getOptionLabel(option);
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );

      default:
        return null;
    }
  };

  // 获取当前活跃的表单
  const currentForm = state.currentForm;
  // 底部输入框只在 idle 状态下可用
  const canSubmit = state.step === "idle" && input.trim().length > 0;

  return (
    <div className="board-studio flex flex-col h-full bg-background text-foreground">
      {/* 顶部栏 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">AI 数据看板生成器</h1>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            对话式构建
          </span>
        </div>

        <div className="flex items-center gap-3">
          {state.step !== "idle" && (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="text-xs"
            >
              重新开始
            </Button>
          )}
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden flex">
        {/* 左侧：对话区域 */}
        <div className="w-1/2 border-r border-border/50 flex flex-col">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {state.step === "idle" && (
              <div className="text-center space-y-4 py-8">
                <div className="text-4xl">💬</div>
                <h2 className="text-xl font-bold">开始对话构建数据模型</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  描述你的数据看板需求，AI 将通过对话引导你定义业务目标、指标、维度和决策点
                </p>
                
                {/* 快捷示例 */}
                <div className="grid grid-cols-2 gap-3 pt-4 max-w-2xl mx-auto">
                  {[
                    "电商销售数据看板，包含GMV趋势、品类占比、TOP商品",
                    "用户增长分析面板，展示DAU/MAU、留存率、渠道来源",
                    "财务报表看板，包含收入利润趋势、成本结构分析",
                    "运营监控大屏，展示实时订单量、服务器负载、告警",
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(example)}
                      className="text-left p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all text-sm"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : msg.role === "system"
                        ? "bg-muted/50 text-muted-foreground text-sm italic"
                        : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* 显示当前表单 */}
            {currentForm && !isRunning && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-1">{currentForm.title}</h3>
                  <p className="text-xs text-muted-foreground">{currentForm.description}</p>
                </div>

                <div className="space-y-4">
                  {currentForm.questions.map((question) => (
                    <div key={question.id} className="space-y-2">
                      <label className="block">
                        <span className="text-sm font-medium">
                          {question.label}
                          {question.required && <span className="text-destructive ml-1">*</span>}
                        </span>
                        {question.description && (
                          <span className="block text-xs text-muted-foreground mt-1">
                            {question.description}
                          </span>
                        )}
                      </label>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>

                {/* 表单提交按钮 */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <span className="text-xs text-muted-foreground">
                    {currentForm.questions.filter(q => q.required && !currentAnswers[q.id]).length > 0
                      ? `还有 ${currentForm.questions.filter(q => q.required && !currentAnswers[q.id]).length} 个必填项`
                      : "已完成必填项"}
                  </span>
                  <Button
                    onClick={() => {
                      submitFormAnswers(currentAnswers);
                      setCurrentAnswers({});
                    }}
                    disabled={
                      isRunning ||
                      currentForm.questions.some((q) => q.required && !currentAnswers[q.id])
                    }
                    size="default"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        提交中...
                      </>
                    ) : (
                      <>
                        提交表单
                        <svg
                          className="w-4 h-4 ml-2"
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
                  </Button>
                </div>
              </div>
            )}

            {/* 加载状态 */}
            {isRunning && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">{state.statusText}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 底部输入区 - 标准聊天输入框 */}
          <div className="border-t border-border/50 p-4 bg-background shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    state.step === "idle"
                      ? "描述你的数据看板需求..."
                      : currentForm
                        ? "请使用上方表单提交按钮..."
                        : "等待 AI 响应..."
                  }
                  disabled={isRunning || state.step !== "idle"}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-muted-foreground">
                    {input.length > 0 ? `${input.length} 字符` : " "}
                  </span>
                  <kbd className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    Enter 发送
                  </kbd>
                </div>
              </div>
              <Button
                type="submit"
                disabled={!canSubmit || isRunning}
                size="lg"
                className="h-[52px] px-6 shrink-0"
              >
                {isRunning ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5"
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
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* 右侧：模型预览区域 */}
        <div className="w-1/2 flex flex-col bg-muted/10">
          <div className="flex-1 overflow-auto p-6">
            {state.step === "idle" && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center space-y-2">
                  <div className="text-4xl">📊</div>
                  <p className="text-sm">在左侧输入需求开始对话</p>
                </div>
              </div>
            )}

            {(state.step === "collecting" || state.step === "done") &&
              state.dataModel && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">数据分析模型</h3>
                  <ModelPreview
                    model={state.dataModel}
                    missingFields={state.missingFields}
                  />
                  
                  {/* 完整模型 JSON 展示 */}
                  {state.step === "done" && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold mb-2">完整模型数据</h4>
                      <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-xs font-mono overflow-auto max-h-96 leading-relaxed">
                        {JSON.stringify(state.dataModel, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

            {state.step === "error" && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3 max-w-md">
                  <div className="text-4xl">❌</div>
                  <p className="text-sm text-destructive whitespace-pre-wrap">{state.errorMsg}</p>
                  <Button onClick={clear} variant="outline">
                    重新开始
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="shrink-0 px-4 py-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            状态: <code className="font-mono">{state.step}</code>
          </span>
          {state.dataModel && (
            <span>
              模型完整度:{" "}
              {Math.round(
                ((8 - state.missingFields.length) / 8) * 100
              )}%
            </span>
          )}
        </div>
        <div>{state.statusText}</div>
      </footer>
    </div>
  );
}

export default BoardStudio;
