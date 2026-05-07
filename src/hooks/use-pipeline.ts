/**
 * 管线状态管理 Hook (重构版)
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { callPipelineStep } from "@/lib/pipeline-api";
import { analyzeResponseSchema, isSufficientResponse, isFormResponse } from "@/lib/board/data-analysis-model";
import type { PipelineState, ChatMessage, AgentTask } from "@/types/pipeline.types";
import {
  createUserMessage,
  createAssistantMessage,
  createSystemMessage,
  createStreamingMessage,
  updateStreamingMessage,
  finalizeStreamingMessage,
} from "@/lib/pipeline/message-utils";
import {
  executeDesignStory,
  executePagesStory,
  executeVISystem,
  executeJSXGeneration,
  executeVIApplication,
} from "@/lib/pipeline/step-executors";

const INITIAL_STATE: PipelineState = {
  step: "idle",
  brief: "",
  projectName: "",
  currentForm: null,
  extractedInfo: null,
  designStory: null,
  pagesStory: null,
  viContent: null,
  jsxCode: null,
  isLoading: false,
  statusText: "等待开始",
  errorMsg: null,
};

export function usePipeline() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);

  // ── 错误处理 ──
  const handleError = useCallback((err: unknown) => {
    if (err instanceof DOMException && err.name === "AbortError") {
      setState((s) => ({ ...s, isLoading: false, statusText: "已中止", errorMsg: null }));
      setMessages((prev) => [...prev, createSystemMessage("操作已取消")]);
      return;
    }

    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pipeline] error:", err);

    let userFriendlyMsg = msg;
    if (msg.includes("DEEPSEEK_API_KEY") || msg.includes("Missing DEEPSEEK_API_KEY")) {
      userFriendlyMsg =
        "⚠️ 缺少 DeepSeek API Key\n\n请在项目根目录创建 .env.local 文件并添加：\nDEEPSEEK_API_KEY=your_api_key_here\n\n然后重启开发服务器。";
    }

    setState((s) => ({
      ...s,
      step: "error",
      isLoading: false,
      errorMsg: userFriendlyMsg,
      statusText: "❌ 出错了",
    }));
    setMessages((prev) => [...prev, createSystemMessage(`❌ 错误: ${userFriendlyMsg}`)]);
  }, []);

  // ── 生成完整流程 ──
  const generateFullPipeline = useCallback(
    async (
      brief: string,
      answers: Record<string, unknown> | undefined,
      ac: AbortController,
      projectName: string
    ) => {
      try {
        const ctx = { signal: ac.signal, projectName };

        // Step 1b: Design Story
        const storyMsgId = crypto.randomUUID();
        setMessages((prev) => [...prev, createStreamingMessage(storyMsgId, "")]);

        const designStory = await executeDesignStory(brief, answers, {
          ...ctx,
          onProgress: (partial) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === storyMsgId ? updateStreamingMessage(m, partial) : m))
            );
          },
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === storyMsgId
              ? finalizeStreamingMessage(m, designStory, { designStoryData: designStory })
              : m
          )
        );

        setState((s) => ({
          ...s,
          step: "designing",
          designStory,
          isLoading: true,
          statusText: "正在设计页面结构...",
        }));

        // Step 2: Pages Story
        const pagesMsgId = crypto.randomUUID();
        setMessages((prev) => [...prev, createStreamingMessage(pagesMsgId, "")]);

        const pagesStory = await executePagesStory(designStory, {
          ...ctx,
          onProgress: (partial) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === pagesMsgId ? updateStreamingMessage(m, partial) : m))
            );
          },
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === pagesMsgId
              ? finalizeStreamingMessage(m, pagesStory, { pagesStoryData: pagesStory })
              : m
          )
        );

        setState((s) => ({
          ...s,
          step: "vi",
          pagesStory,
          isLoading: true,
          statusText: "正在加载 VI 系统...",
        }));

        // Step 3: VI System
        const viMsgId = crypto.randomUUID();
        setMessages((prev) => [...prev, createStreamingMessage(viMsgId, "")]);

        const viContent = await executeVISystem({
          ...ctx,
          onProgress: (partial) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === viMsgId ? updateStreamingMessage(m, partial) : m))
            );
          },
        });

        setMessages((prev) =>
          prev.map((m) => (m.id === viMsgId ? finalizeStreamingMessage(m, viContent) : m))
        );

        setState((s) => ({
          ...s,
          step: "generating",
          viContent,
          isLoading: true,
          statusText: "正在生成 JSX 线框图代码...",
        }));

        setMessages((prev) => [...prev, createSystemMessage("正在生成页面线框图代码...")]);

        // Step 4: JSX Generation (Wireframe)
        const wireframeJSX = await executeJSXGeneration(pagesStory, ctx);

        setState((s) => ({
          ...s,
          step: "applying-vi",
          isLoading: true,
          statusText: "正在应用 VI 系统...",
        }));

        setMessages((prev) => [
          ...prev,
          createSystemMessage("线框图生成完成，正在应用品牌视觉系统..."),
        ]);

        // Step 5: VI Application
        const jsxCode = await executeVIApplication(ctx);

        setState((s) => ({
          ...s,
          step: "done",
          jsxCode,
          isLoading: false,
          statusText: "✅ 品牌化代码生成完成",
        }));

        setMessages((prev) => [
          ...prev,
          createAssistantMessage(
            `品牌化看板生成完成！共 ${jsxCode.metadata.pageCount} 个页面，${jsxCode.metadata.estimatedComponents} 个组件。`,
            { jsxCodeData: jsxCode }
          ),
        ]);
      } catch (err) {
        handleError(err);
      }
    },
    [handleError]
  );

  // ── Step 1a：分析需求 ──
  const runPipeline = useCallback(
    async (brief: string, projectName = "") => {
      if (isRunningRef.current) return;
      const trimmedBrief = brief.trim();
      if (!trimmedBrief) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      isRunningRef.current = true;

      setMessages([createUserMessage(trimmedBrief)]);
      setState((s) => ({
        ...s,
        step: "collecting",
        brief: trimmedBrief,
        projectName,
        isLoading: true,
        statusText: "正在分析需求...",
        currentForm: null,
        extractedInfo: null,
        designStory: null,
        pagesStory: null,
        viContent: null,
      }));

      try {
        const result = await callPipelineStep(
          "/api/board/analyze-brief",
          { brief: trimmedBrief },
          undefined,
          ac.signal
        );

        const parsed = analyzeResponseSchema.parse(result.json);

        if (isSufficientResponse(parsed)) {
          setState((s) => ({
            ...s,
            extractedInfo: parsed.extractedInfo ?? null,
            isLoading: true,
            step: "story",
            statusText: "需求信息充足，正在生成 Design Story...",
          }));

          setMessages((prev) => [
            ...prev,
            createAssistantMessage("需求信息已充足，正在直接生成 Design Story..."),
          ]);

          await generateFullPipeline(trimmedBrief, undefined, ac, projectName);
        } else if (isFormResponse(parsed)) {
          const missingCount = parsed.missingFields?.length ?? parsed.form.questions.length;
          setState((s) => ({
            ...s,
            currentForm: parsed.form,
            extractedInfo: parsed.extractedInfo ?? null,
            isLoading: false,
            statusText: `请补充 ${missingCount} 项缺失信息`,
          }));

          setMessages((prev) => [
            ...prev,
            createAssistantMessage(
              `我已识别了您的核心需求，还需要补充 ${missingCount} 项信息：`,
              { formData: parsed.form }
            ),
          ]);
        }
      } catch (err) {
        handleError(err);
      } finally {
        isRunningRef.current = false;
      }
    },
    [generateFullPipeline, handleError]
  );

  // ── 提交表单答案 ──
  const submitFormAnswers = useCallback(
    async (answers: Record<string, unknown>) => {
      if (isRunningRef.current) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      isRunningRef.current = true;

      const answerSummary = Object.entries(answers)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join("、") : v}`)
        .join(" | ");

      setMessages((prev) => [...prev, createUserMessage(`已补充：${answerSummary}`)]);

      setState((s) => ({
        ...s,
        step: "story",
        isLoading: true,
        statusText: "正在生成 Design Story...",
        currentForm: null,
      }));

      await generateFullPipeline(state.brief, answers, ac, state.projectName);
      isRunningRef.current = false;
    },
    [state.brief, state.projectName, generateFullPipeline]
  );

  // ── 中止 ──
  const stop = useCallback(() => {
    abortRef.current?.abort();
    isRunningRef.current = false;
    setState((s) => ({ ...s, isLoading: false, statusText: "已中止" }));
  }, []);

  // ── 清空 ──
  const clear = useCallback(() => {
    stop();
    setMessages([]);
    setState({ ...INITIAL_STATE });
  }, [stop]);

  return {
    state,
    messages,
    isRunning: state.isLoading,
    tasks: [] as AgentTask[],
    runPipeline,
    submitFormAnswers,
    stop,
    clear,
  };
}
