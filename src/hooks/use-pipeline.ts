/**
 * 管线状态管理 Hook (V5 - 完整四步流程)
 *
 * 新流程：
 *   Step 1: 动态表单收集数据分析模型（多轮对话）
 *   Step 2: 基于数据模型生成页面结构设计（BoardStory）
 *   Step 3: 基于页面结构生成 JSX 占位符代码（使用默认 Apple VI）
 *   Step 4: （可选）用户可以手动触发重新生成 JSX
 */
"use client";

import { useCallback, useRef, useState } from "react";
import type { DataAnalysisModel, QuestionForm, StoryResponse } from "@/lib/board/data-analysis-model";
import { storyResponseSchema, isFormResponse, isModelComplete } from "@/lib/board/data-analysis-model";
import { boardStorySchema, normalizeBoardStory } from "@/lib/board/board-story";
import type { BoardStory } from "@/lib/board/board-story";
import { jsxCodeSchema, normalizeJSXCode } from "@/lib/board/jsx-output";
import type { JSXCode } from "@/lib/board/jsx-output";
import { callPipelineStep } from "@/lib/pipeline-api";

// ─── Types ────────────────────────────────────────────────

export type PipelineStep =
  | "idle"
  | "collecting"      // 收集数据模型（表单阶段）
  | "designing"       // 设计页面结构
  | "generating"      // 生成 JSX 占位符代码
  | "done"            // 全部完成
  | "error";

export interface PipelineState {
  step: PipelineStep;
  brief: string;

  // 数据模型收集
  currentForm: QuestionForm | null;
  dataModel: Partial<DataAnalysisModel> | null;
  missingFields: string[];
  conversationHistory: Array<{ role: string; content: string }>;

  // 页面结构设计
  boardStory: BoardStory | null;

  // JSX 代码生成
  jsxCode: JSXCode | null;

  // 加载状态
  isLoading: boolean;

  statusText: string;
  errorMsg: string | null;
}

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  formData?: QuestionForm;
  modelData?: Partial<DataAnalysisModel>;
  boardStoryData?: BoardStory;
  jsxCodeData?: JSXCode;
};

export type UsePipelineReturn = {
  state: PipelineState;
  messages: ChatMessage[];
  isRunning: boolean;
  runPipeline: (brief: string) => Promise<void>;
  submitFormAnswers: (answers: Record<string, unknown>) => Promise<void>;
  generatePages: () => Promise<void>;
  generateJSX: (viSystemName?: string) => Promise<void>;
  stop: () => void;
  clear: () => void;
};

// ─── Helpers ──────────────────────────────────────────────

function createMessage(
  role: "user" | "assistant" | "system",
  content: string,
  extra?: { formData?: QuestionForm; modelData?: Partial<DataAnalysisModel>; boardStoryData?: BoardStory; jsxCodeData?: JSXCode }
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    ...extra,
  };
}

// ─── Initial State ────────────────────────────────────────

const INITIAL_STATE: PipelineState = {
  step: "idle",
  brief: "",
  currentForm: null,
  dataModel: null,
  missingFields: [],
  conversationHistory: [],
  boardStory: null,
  jsxCode: null,
  isLoading: false,
  statusText: "等待开始",
  errorMsg: null,
};

// ══════════════════════════════════════════════════════════
// ─── Hook ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════

export function usePipeline(): UsePipelineReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);

  // ── 启动管线：发送初始需求 ──
  const runPipeline = useCallback(async (brief: string) => {
    if (isRunningRef.current) return;
    const trimmedBrief = brief.trim();
    if (!trimmedBrief) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    isRunningRef.current = true;

    setMessages([createMessage("user", trimmedBrief)]);
    setState((s) => ({
      ...s,
      step: "collecting",
      brief: trimmedBrief,
      isLoading: true,
      statusText: "正在分析需求并生成第一个表单...",
      conversationHistory: [],
    }));

    try {
      let streamAcc = "";
      const result = await callPipelineStep(
        "/api/board/design-story",
        { brief: trimmedBrief },
        (streamText) => {
          streamAcc = streamText;
        },
        ac.signal
      );

      // result.json 已经是解析好的对象
      const parsed = storyResponseSchema.parse(result.json);

      if (isFormResponse(parsed)) {
        
        setState((s) => ({
          ...s,
          currentForm: parsed.form,
          dataModel: parsed.currentModel,
          missingFields: parsed.missingFields,
          isLoading: false,
          conversationHistory: [
            ...s.conversationHistory,
            { role: "assistant", content: "已生成表单" },
          ],
          statusText: `请填写表单（还需完善 ${parsed.missingFields.length} 个字段）`,
        }));

        setMessages((prev) => [
          ...prev,
          createMessage(
            "assistant",
            `我已经分析了你的需求。为了构建精准的数据分析模型，请回答以下问题：`,
            { formData: parsed.form, modelData: parsed.currentModel }
          ),
        ]);
      } else if (isModelComplete(parsed)) {
        // 模型完成，自动进入页面设计阶段
        setState((s) => ({
          ...s,
          step: "designing",
          dataModel: parsed.currentModel,
          missingFields: [],
          currentForm: null,
          isLoading: true,
          statusText: "✅ 数据模型已完成，正在设计页面结构...",
        }));

        setMessages((prev) => [
          ...prev,
          createMessage(
            "assistant",
            "🎉 数据分析模型已经构建完成！现在开始设计页面结构...",
            { modelData: parsed.currentModel }
          ),
        ]);

        // 自动调用页面设计 API
        try {
          let streamAcc2 = "";
          const pagesResult = await callPipelineStep(
            "/api/board/design-pages",
            { dataModel: parsed.currentModel },
            (streamText) => {
              streamAcc2 = streamText;
            },
            ac.signal
          );

          const normalized = normalizeBoardStory(pagesResult.json);
          const boardStory = boardStorySchema.parse(normalized);

          setState((s) => ({
            ...s,
            step: "generating",
            boardStory,
            isLoading: true,
            statusText: "✅ 页面结构设计完成，正在生成 JSX 占位符代码...",
          }));

          setMessages((prev) => [
            ...prev,
            createMessage(
              "assistant",
              `✨ 页面结构设计完成！共设计了 ${boardStory.pages.length} 个页面。现在开始生成 JSX 占位符代码...`,
              { boardStoryData: boardStory }
            ),
          ]);

          // 自动调用 JSX 生成 API
          try {
            let streamAcc3 = "";
            const jsxResult = await callPipelineStep(
              "/api/board/generate-jsx",
              { boardStory },
              (streamText) => {
                streamAcc3 = streamText;
              },
              ac.signal
            );

            const normalizedJSX = normalizeJSXCode(jsxResult.json);
            const jsxCode = jsxCodeSchema.parse(normalizedJSX);

            setState((s) => ({
              ...s,
              step: "done",
              jsxCode,
              isLoading: false,
              statusText: "✅ JSX 占位符代码生成完成",
            }));

            setMessages((prev) => [
              ...prev,
              createMessage(
                "assistant",
                `🎉 JSX 占位符代码生成完成！共 ${jsxCode.metadata.pageCount} 个页面，${jsxCode.metadata.estimatedComponents} 个组件占位符。`,
                { jsxCodeData: jsxCode }
              ),
            ]);
          } catch (jsxErr) {
            handleError(jsxErr);
          }
        } catch (pagesErr) {
          handleError(pagesErr);
        }
      }
    } catch (err) {
      handleError(err);
    } finally {
      // 确保在所有情况下都重置 running 状态
      isRunningRef.current = false;
    }
  }, []);

  // ── 提交表单答案 ──
  const submitFormAnswers = useCallback(
    async (answers: Record<string, unknown>) => {
      if (isRunningRef.current) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      isRunningRef.current = true;

      // 添加用户回答消息
      setMessages((prev) => [
        ...prev,
        createMessage("user", `已提交表单答案：${Object.keys(answers).length} 个字段`),
      ]);

      setState((s) => ({
        ...s,
        isLoading: true,
        statusText: "正在处理你的回答...",
      }));

      try {
        let streamAcc = "";
        const result = await callPipelineStep(
          "/api/board/design-story",
          {
            conversationHistory: state.conversationHistory,
            userAnswers: answers,
          },
          (streamText) => {
            streamAcc = streamText;
          },
          ac.signal
        );

        // result.json 已经是解析好的对象
        const parsed = storyResponseSchema.parse(result.json);

        if (isFormResponse(parsed)) {
          // 还需要继续收集
          setState((s) => ({
            ...s,
            currentForm: parsed.form,
            dataModel: parsed.currentModel,
            missingFields: parsed.missingFields,
            isLoading: false,
            conversationHistory: [
              ...s.conversationHistory,
              { role: "user", content: JSON.stringify(answers) },
              { role: "assistant", content: "已生成下一个表单" },
            ],
            statusText: `请继续填写（还需完善 ${parsed.missingFields.length} 个字段）`,
          }));

          setMessages((prev) => [
            ...prev,
            createMessage(
              "assistant",
              `很好！我已经更新了数据模型。接下来请回答以下问题：`,
              { formData: parsed.form, modelData: parsed.currentModel }
            ),
          ]);
        } else if (isModelComplete(parsed)) {
          // 模型完成，自动进入页面设计阶段
          setState((s) => ({
            ...s,
            step: "designing",
            dataModel: parsed.currentModel,
            missingFields: [],
            currentForm: null,
            isLoading: true,
            conversationHistory: [
              ...s.conversationHistory,
              { role: "user", content: JSON.stringify(answers) },
              { role: "assistant", content: "模型构建完成，开始设计页面结构" },
            ],
            statusText: "✅ 数据模型已完成，正在设计页面结构...",
          }));

          setMessages((prev) => [
            ...prev,
            createMessage(
              "assistant",
              "🎉 太棒了！数据分析模型已经构建完成。现在开始设计页面结构...",
              { modelData: parsed.currentModel }
            ),
          ]);

          // 自动调用页面设计 API
          try {
            let streamAcc = "";
            const pagesResult = await callPipelineStep(
              "/api/board/design-pages",
              { dataModel: parsed.currentModel },
              (streamText) => {
                streamAcc = streamText;
              },
              ac.signal
            );

            // 解析并标准化 BoardStory
            const normalized = normalizeBoardStory(pagesResult.json);
            const boardStory = boardStorySchema.parse(normalized);

            setState((s) => ({
              ...s,
              step: "generating",
              boardStory,
              isLoading: true,
              statusText: "✅ 页面结构设计完成，正在生成 JSX 占位符代码...",
            }));

            setMessages((prev) => [
              ...prev,
              createMessage(
                "assistant",
                `✨ 页面结构设计完成！共设计了 ${boardStory.pages.length} 个页面。现在开始生成 JSX 占位符代码...`,
                { boardStoryData: boardStory }
              ),
            ]);

            // 自动调用 JSX 生成 API
            try {
              let streamAcc2 = "";
              const jsxResult = await callPipelineStep(
                "/api/board/generate-jsx",
                { boardStory },
                (streamText) => {
                  streamAcc2 = streamText;
                },
                ac.signal
              );

              const normalizedJSX = normalizeJSXCode(jsxResult.json);
              const jsxCode = jsxCodeSchema.parse(normalizedJSX);

              setState((s) => ({
                ...s,
                step: "done",
                jsxCode,
                isLoading: false,
                statusText: "✅ JSX 占位符代码生成完成",
              }));

              setMessages((prev) => [
                ...prev,
                createMessage(
                  "assistant",
                  `🎉 JSX 占位符代码生成完成！共 ${jsxCode.metadata.pageCount} 个页面，${jsxCode.metadata.estimatedComponents} 个组件占位符。`,
                  { jsxCodeData: jsxCode }
                ),
              ]);
            } catch (jsxErr) {
              handleError(jsxErr);
            }
          } catch (pagesErr) {
            handleError(pagesErr);
          }
        }
      } catch (err) {
        handleError(err);
      } finally {
        isRunningRef.current = false;
      }
    },
    [state.conversationHistory]
  );

  // ── 生成页面结构（手动触发或重新生成）──
  const generatePages = useCallback(async () => {
    if (isRunningRef.current || !state.dataModel) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    isRunningRef.current = true;

    setState((s) => ({
      ...s,
      step: "designing",
      isLoading: true,
      statusText: "正在设计页面结构...",
    }));

    setMessages((prev) => [
      ...prev,
      createMessage("user", "重新生成页面结构"),
    ]);

    try {
      let streamAcc = "";
      const result = await callPipelineStep(
        "/api/board/design-pages",
        { dataModel: state.dataModel },
        (streamText) => {
          streamAcc = streamText;
        },
        ac.signal
      );

      const normalized = normalizeBoardStory(result.json);
      const boardStory = boardStorySchema.parse(normalized);

      setState((s) => ({
        ...s,
        step: "generating",
        boardStory,
        isLoading: true,
        statusText: "✅ 页面结构设计完成，正在生成 JSX 占位符代码...",
      }));

      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          `✨ 页面结构设计完成！共设计了 ${boardStory.pages.length} 个页面。现在开始生成 JSX 占位符代码...`,
          { boardStoryData: boardStory }
        ),
      ]);

      // 自动调用 JSX 生成 API
      try {
        let streamAcc2 = "";
        const jsxResult = await callPipelineStep(
          "/api/board/generate-jsx",
          { boardStory },
          (streamText) => {
            streamAcc2 = streamText;
          },
          ac.signal
        );

        const normalizedJSX = normalizeJSXCode(jsxResult.json);
        const jsxCode = jsxCodeSchema.parse(normalizedJSX);

        setState((s) => ({
          ...s,
          step: "done",
          jsxCode,
          isLoading: false,
          statusText: "✅ JSX 占位符代码生成完成",
        }));

        setMessages((prev) => [
          ...prev,
          createMessage(
            "assistant",
            `🎉 JSX 占位符代码生成完成！共 ${jsxCode.metadata.pageCount} 个页面，${jsxCode.metadata.estimatedComponents} 个组件占位符。`,
            { jsxCodeData: jsxCode }
          ),
        ]);
      } catch (jsxErr) {
        handleError(jsxErr);
      }
    } catch (err) {
      handleError(err);
    } finally {
      isRunningRef.current = false;
    }
  }, [state.dataModel]);

  // ── 生成 JSX 占位符代码（手动触发或重新生成）──
  const generateJSX = useCallback(async (viSystemName: string = "apple") => {
    if (isRunningRef.current || !state.boardStory) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    isRunningRef.current = true;

    setState((s) => ({
      ...s,
      step: "generating",
      isLoading: true,
      statusText: `正在生成 JSX 占位符代码（使用 ${viSystemName} 设计系统）...`,
    }));

    setMessages((prev) => [
      ...prev,
      createMessage("user", `重新生成 JSX 占位符代码（${viSystemName}）`),
    ]);

    try {
      let streamAcc = "";
      const result = await callPipelineStep(
        "/api/board/generate-jsx",
        { boardStory: state.boardStory, viSystemName },
        (streamText) => {
          streamAcc = streamText;
        },
        ac.signal
      );

      const normalizedJSX = normalizeJSXCode(result.json);
      const jsxCode = jsxCodeSchema.parse(normalizedJSX);

      setState((s) => ({
        ...s,
        step: "done",
        jsxCode,
        isLoading: false,
        statusText: "✅ JSX 占位符代码生成完成",
      }));

      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          `🎉 JSX 占位符代码生成完成！共 ${jsxCode.metadata.pageCount} 个页面，${jsxCode.metadata.estimatedComponents} 个组件占位符。`,
          { jsxCodeData: jsxCode }
        ),
      ]);
    } catch (err) {
      handleError(err);
    } finally {
      isRunningRef.current = false;
    }
  }, [state.boardStory]);

  // ── 错误处理 ──
  const handleError = (err: unknown) => {
    if (err instanceof DOMException && err.name === "AbortError") {
      setState((s) => ({ ...s, statusText: "已中止", errorMsg: null }));
      setMessages((prev) => [...prev, createMessage("system", "操作已取消")]);
      return;
    }

    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pipeline] error:", err);
    
    // 检查是否是 API key 缺失错误
    let userFriendlyMsg = msg;
    if (msg.includes("DEEPSEEK_API_KEY") || msg.includes("Missing DEEPSEEK_API_KEY")) {
      userFriendlyMsg = "⚠️ 缺少 DeepSeek API Key\n\n请在项目根目录创建 .env.local 文件并添加：\nDEEPSEEK_API_KEY=your_api_key_here\n\n然后重启开发服务器。";
    }
    
    setState((s) => ({
      ...s,
      step: "error",
      errorMsg: userFriendlyMsg,
      statusText: `❌ 出错了`,
    }));
    setMessages((prev) => [
      ...prev,
      createMessage("system", `❌ 错误: ${userFriendlyMsg}`),
    ]);
  };

  // ── 中止 ──
  const stop = useCallback(() => {
    abortRef.current?.abort();
    isRunningRef.current = false;
    setState((s) => ({ ...s, statusText: "已中止" }));
  }, []);

  // ── 清空 ──
  const clear = useCallback(() => {
    stop();
    setMessages([]);
    setState({ ...INITIAL_STATE });
  }, [stop]);

  const isRunning = state.isLoading;

  return {
    state,
    messages,
    isRunning,
    runPipeline,
    submitFormAnswers,
    generatePages,
    generateJSX,
    stop,
    clear,
  };
}
