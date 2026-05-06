/**
 * 管线状态管理 Hook (V9 - 文件持久化)
 *
 * 流程：
 *   Step 1a: 发送 brief → 分析信息充足性
 *            → 充足：直接进入 Step 1b 生成 story
 *            → 不足：展示表单（只问缺失字段），用户填写后进入 Step 1b
 *   Step 1b: brief [+ answers] → 生成 Markdown Design Story → 保存到 .dv/
 *   Step 2:  基于 Design Story → 获取 Markdown Pages Story → 保存到 .dv/
 *   Step 3:  固定获取 Apple VI 系统内容 → 保存到 .dv/
 *   Step 4:  基于 Pages Story → 生成 JSX 线框图代码 → 保存到 .dv/
 */
"use client";

import { useCallback, useRef, useState } from "react";
import type { QuestionForm, FormResponse, SufficientResponse } from "@/lib/board/data-analysis-model";
import { analyzeResponseSchema, isSufficientResponse, isFormResponse } from "@/lib/board/data-analysis-model";
import { jsxCodeSchema, normalizeJSXCode } from "@/lib/board/jsx-output";
import type { JSXCode } from "@/lib/board/jsx-output";
import { callPipelineStep, callPipelineStepText } from "@/lib/pipeline-api";

// ─── Types ────────────────────────────────────────────────

export type PipelineStep =
  | "idle"
  | "collecting"    // 等待用户填写表单
  | "story"         // 生成 Markdown Design Story
  | "designing"     // 生成 Markdown Pages Story
  | "vi"            // 获取 VI 系统
  | "generating"    // 生成 JSX 占位符代码
  | "done"
  | "error";

export interface PipelineState {
  step: PipelineStep;
  brief: string;
  projectName: string; // 新增：项目名称，用于文件存储

  // Step 1：表单收集
  currentForm: QuestionForm | null;
  extractedInfo: FormResponse["extractedInfo"] | SufficientResponse["extractedInfo"] | null;

  // Step 1b：Markdown Design Story
  designStory: string | null;

  // Step 2：Markdown Pages Story（页面结构）
  pagesStory: string | null;

  // Step 3：VI 系统内容
  viContent: string | null;

  // Step 4：JSX 代码
  jsxCode: JSXCode | null;

  isLoading: boolean;
  statusText: string;
  errorMsg: string | null;
}

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;       // 是否正在流式输出
  formData?: QuestionForm;
  designStoryData?: string;
  pagesStoryData?: string;
  jsxCodeData?: JSXCode;
};

export type UsePipelineReturn = {
  state: PipelineState;
  messages: ChatMessage[];
  isRunning: boolean;
  runPipeline: (brief: string, projectName?: string) => Promise<void>;
  submitFormAnswers: (answers: Record<string, unknown>) => Promise<void>;
  generatePages: () => Promise<void>;
  generateJSX: () => Promise<void>;
  stop: () => void;
  clear: () => void;
};

// ─── Helpers ──────────────────────────────────────────────

function createMessage(
  role: "user" | "assistant" | "system",
  content: string,
  extra?: {
    formData?: QuestionForm;
    designStoryData?: string;
    pagesStoryData?: string;
    jsxCodeData?: JSXCode;
  }
): ChatMessage {
  return { id: crypto.randomUUID(), role, content, ...extra };
}

/** 保存文件到 .dv/{projectName}/{category}/{filename} */
async function saveFile(
  projectName: string,
  category: string,
  filename: string,
  content: string
): Promise<void> {
  try {
    const res = await fetch("/api/files/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName, category, filename, content }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to save file");
    }
  } catch (err) {
    console.error("[saveFile] error:", err);
    throw err;
  }
}

// ─── Initial State ────────────────────────────────────────

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

// ══════════════════════════════════════════════════════════
// ─── Hook ────────────────════════════════════════════════
// ══════════════════════════════════════════════════════════

export function usePipeline(): UsePipelineReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);

  // ── Step 1a：发送 brief，分析信息充足性 ──
  const runPipeline = useCallback(async (brief: string, projectName = "") => {
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
        // 信息充足，直接生成 Design Story
        setState((s) => ({
          ...s,
          extractedInfo: parsed.extractedInfo ?? null,
          isLoading: true,
          step: "story",
          statusText: "需求信息充足，正在生成 Design Story...",
        }));

        setMessages((prev) => [
          ...prev,
          createMessage("assistant", "需求信息已充足，正在直接生成 Design Story..."),
        ]);

        await _generateStory(trimmedBrief, undefined, ac, projectName);
      } else if (isFormResponse(parsed)) {
        // 信息不足，展示表单
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
          createMessage(
            "assistant",
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
  }, []);

  // ── 内部：生成 Design Story 并串联后续步骤 ──
  // 注意：调用前必须已设置 isRunningRef = true，且传入有效的 AbortController
  const _generateStory = async (
    brief: string,
    answers: Record<string, unknown> | undefined,
    ac: AbortController,
    projectName: string
  ) => {
    try {
      // ── Step 1b: Design Story（流式） ──
      const storyMsgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: storyMsgId, role: "assistant", content: "", streaming: true },
      ]);

      const designStory = await callPipelineStepText(
        "/api/board/design-story",
        { brief, ...(answers ? { answers } : {}) },
        (partial) => {
          setMessages((prev) =>
            prev.map((m) => m.id === storyMsgId ? { ...m, content: partial } : m)
          );
        },
        ac.signal
      );

      // 流式结束，标记完成
      setMessages((prev) =>
        prev.map((m) =>
          m.id === storyMsgId
            ? { ...m, content: designStory, streaming: false, designStoryData: designStory }
            : m
        )
      );

      // 保存 Design Story 文件
      if (projectName) {
        try {
          await saveFile(projectName, "数据故事", "design-story.md", designStory);
        } catch (e) {
          console.warn("[pipeline] Failed to save design story:", e);
        }
      }

      setState((s) => ({
        ...s,
        step: "designing",
        designStory,
        isLoading: true,
        statusText: "正在设计页面结构...",
      }));

      // ── Step 2: Pages Story（流式） ──
      try {
        const pagesMsgId = crypto.randomUUID();
        setMessages((prev) => [
          ...prev,
          { id: pagesMsgId, role: "assistant", content: "", streaming: true },
        ]);

        const pagesStory = await callPipelineStepText(
          "/api/board/design-pages",
          { designStory },
          (partial) => {
            setMessages((prev) =>
              prev.map((m) => m.id === pagesMsgId ? { ...m, content: partial } : m)
            );
          },
          ac.signal
        );

        setMessages((prev) =>
          prev.map((m) =>
            m.id === pagesMsgId
              ? { ...m, content: pagesStory, streaming: false, pagesStoryData: pagesStory }
              : m
          )
        );

        // 保存 Pages Story 文件
        if (projectName) {
          try {
            await saveFile(projectName, "页面结构", "pages-story.md", pagesStory);
          } catch (e) {
            console.warn("[pipeline] Failed to save pages story:", e);
          }
        }

        setState((s) => ({
          ...s,
          step: "vi",
          pagesStory,
          isLoading: true,
          statusText: "正在加载 VI 系统...",
        }));

        // ── Step 3: VI 系统（流式） ──
        try {
          const viMsgId = crypto.randomUUID();
          setMessages((prev) => [
            ...prev,
            { id: viMsgId, role: "assistant", content: "", streaming: true },
          ]);

          const viContent = await callPipelineStepText(
            "/api/board/design-vi",
            {},
            (partial) => {
              setMessages((prev) =>
                prev.map((m) => m.id === viMsgId ? { ...m, content: partial } : m)
              );
            },
            ac.signal
          );

          setMessages((prev) =>
            prev.map((m) =>
              m.id === viMsgId ? { ...m, content: viContent, streaming: false } : m
            )
          );

          // 保存 VI 系统文件
          if (projectName) {
            try {
              await saveFile(projectName, "品牌VI", "vi-system.md", viContent);
            } catch (e) {
              console.warn("[pipeline] Failed to save VI content:", e);
            }
          }

          setState((s) => ({
            ...s,
            step: "generating",
            viContent,
            isLoading: true,
            statusText: "正在生成 JSX 线框图代码...",
          }));

          setMessages((prev) => [
            ...prev,
            createMessage("system", "正在生成页面线框图代码..."),
          ]);

          // ── Step 4: JSX（等待完整 JSON） ──
          try {
            const jsxResult = await callPipelineStep(
              "/api/board/generate-jsx",
              { boardStory: pagesStory },
              undefined,
              ac.signal
            );

            const normalizedJSX = normalizeJSXCode(jsxResult.json);
            const jsxCode = jsxCodeSchema.parse(normalizedJSX);

            // 保存为 .jsx 文件（纯代码）
            if (projectName) {
              try {
                await saveFile(projectName, "页面", "dashboard.jsx", jsxCode.code);
              } catch (e) {
                console.warn("[pipeline] Failed to save JSX code:", e);
              }
            }

            setState((s) => ({
              ...s,
              step: "done",
              jsxCode,
              isLoading: false,
              statusText: "✅ 线框图代码生成完成",
            }));

            setMessages((prev) => [
              ...prev,
              createMessage(
                "assistant",
                `线框图生成完成！共 ${jsxCode.metadata.pageCount} 个页面，${jsxCode.metadata.estimatedComponents} 个组件。`,
                { jsxCodeData: jsxCode }
              ),
            ]);
          } catch (jsxErr) { handleError(jsxErr); }
        } catch (viErr) { handleError(viErr); }
      } catch (pagesErr) { handleError(pagesErr); }
    } catch (err) { handleError(err); }
  };

  // ── Step 1b：用户提交表单答案，调用 generate 生成 story ──
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

      setMessages((prev) => [
        ...prev,
        createMessage("user", `已补充：${answerSummary}`),
      ]);

      setState((s) => ({
        ...s,
        step: "story",
        isLoading: true,
        statusText: "正在生成 Design Story...",
        currentForm: null,
      }));

      await _generateStory(state.brief, answers, ac, state.projectName);
      isRunningRef.current = false;
    },
    [state.brief]
  );

  // ── 手动重新生成页面结构 ──
  const generatePages = useCallback(async () => {
    if (isRunningRef.current || !state.designStory) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    isRunningRef.current = true;

    setState((s) => ({
      ...s,
      step: "designing",
      isLoading: true,
      statusText: "正在重新设计页面结构...",
    }));

    setMessages((prev) => [...prev, createMessage("user", "重新生成页面结构")]);

    try {
      const pagesStory = await callPipelineStepText(
        "/api/board/design-pages",
        { designStory: state.designStory },
        undefined,
        ac.signal
      );

      setState((s) => ({
        ...s,
        step: "vi",
        pagesStory,
        isLoading: true,
        statusText: "✅ 页面结构设计完成，正在加载 VI 系统...",
      }));

      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          "页面结构设计完成，正在加载 VI 系统...",
          { pagesStoryData: pagesStory }
        ),
      ]);

      // 获取 VI 系统，再生成 JSX
      try {
        const viContent = await callPipelineStepText(
          "/api/board/design-vi",
          {},
          undefined,
          ac.signal
        );

        setState((s) => ({
          ...s,
          step: "generating",
          viContent,
          isLoading: true,
          statusText: "✅ VI 系统加载完成，正在生成 JSX 占位符代码...",
        }));

        // 自动生成 JSX
        try {
          const jsxResult = await callPipelineStep(
            "/api/board/generate-jsx",
            { boardStory: pagesStory },
            undefined,
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
      } catch (viErr) {
        handleError(viErr);
      }
    } catch (err) {
      handleError(err);
    } finally {
      isRunningRef.current = false;
    }
  }, [state.designStory]);

  // ── 手动重新生成 JSX ──
  const generateJSX = useCallback(
    async () => {
      if (isRunningRef.current || !state.pagesStory) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      isRunningRef.current = true;

      setState((s) => ({
        ...s,
        step: "generating",
        isLoading: true,
        statusText: "正在重新生成 JSX 占位符代码...",
      }));

      setMessages((prev) => [
        ...prev,
        createMessage("user", "重新生成 JSX 占位符代码"),
      ]);

      try {
        const result = await callPipelineStep(
          "/api/board/generate-jsx",
          { boardStory: state.pagesStory },
          undefined,
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
    },
    [state.pagesStory]
  );

  // ── 错误处理 ──
  const handleError = (err: unknown) => {
    if (err instanceof DOMException && err.name === "AbortError") {
      setState((s) => ({ ...s, isLoading: false, statusText: "已中止", errorMsg: null }));
      setMessages((prev) => [...prev, createMessage("system", "操作已取消")]);
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
    setMessages((prev) => [
      ...prev,
      createMessage("system", `❌ 错误: ${userFriendlyMsg}`),
    ]);
  };

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
    runPipeline,
    submitFormAnswers,
    generatePages,
    generateJSX,
    stop,
    clear,
  };
}
