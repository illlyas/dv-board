/**
 * 有文件项目（Agent 模式）：意图分类 → 按需增量修订 story/pages/vi → 始终生成 dashboard.jsx。
 * 默认以磁盘上的 pages-story / vi-tokens / dashboard.jsx 为「长期记忆」；仅在为 true 的意图标志下重写叙事或页面契约。
 * JSX 排版由 /api/board/generate-jsx 约束：顶 KPI 横条 + 其下左中右三栏（中为主视觉），左右栏内多图须均分垂直空间。
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { listProjectFiles, readFile } from "@/lib/pipeline/file-operations";
import {
  executeDesignStory,
  executePagesStory,
  executeVISystem,
  executeViTokensFromMarkdown,
  executeJSXGeneration,
} from "@/lib/pipeline/step-executors";
import type { PipelineState, ChatMessage, AgentTask, ViTokens } from "@/types/pipeline.types";
import {
  createUserMessage,
  createAssistantMessage,
  createSystemMessage,
} from "@/lib/pipeline/message-utils";

const INITIAL_STATE: PipelineState = {
  step: "idle",
  brief: "",
  projectName: "",
  style: "",
  currentForm: null,
  extractedInfo: null,
  designStory: null,
  pagesStory: null,
  viContent: null,
  viTokens: null,
  jsxCode: null,
  isLoading: false,
  statusText: "等待开始",
  errorMsg: null,
};

function toConversationHistory(messages: ChatMessage[]): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && !m.streaming && m.content.trim())
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

async function loadTokens(projectName: string): Promise<ViTokens> {
  const raw = await readFile(`.dv/${projectName}/品牌VI/vi-tokens.json`);
  const parsed = JSON.parse(raw) as ViTokens & { cssVariables?: Record<string, string>; chartPalette?: string[]; raw?: unknown };
  return {
    mode: parsed.mode,
    cssVariables: parsed.cssVariables ?? {},
    chartPalette: parsed.chartPalette ?? [],
    raw: parsed.raw ?? parsed,
  };
}

type Intent = {
  clarification: string | null;
  updateStory: boolean;
  updatePages: boolean;
  updateViReload: boolean;
  viSystemMarkdown: string | null;
};

export function useAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof DOMException && err.name === "AbortError") {
      setState((s) => ({ ...s, isLoading: false, statusText: "已中止" }));
      setMessages((prev) => [...prev, createSystemMessage("操作已取消")]);
    } else {
      const msg = err instanceof Error ? err.message : String(err);
      setState((s) => ({ ...s, step: "error", isLoading: false, errorMsg: msg }));
      setMessages((prev) => [...prev, createSystemMessage(`❌ 错误：${msg}`)]);
    }
  }, []);

  const runPipeline = useCallback(
    async (brief: string, projectName = "", style = "") => {
      if (isRunningRef.current) return;
      const trimmedBrief = brief.trim();
      if (!trimmedBrief) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      isRunningRef.current = true;

      setMessages((prev) => {
        const next = [...prev, createUserMessage(trimmedBrief)];
        messagesRef.current = next;
        return next;
      });
      setTasks([]);
      setState((s) => ({
        ...s,
        step: "collecting",
        brief: trimmedBrief,
        projectName,
        style,
        isLoading: true,
        statusText: "分析迭代意图…",
        currentForm: null,
        errorMsg: null,
      }));

      const ctxBase = { signal: ac.signal, projectName };

      const setTaskStatus = (id: string, status: AgentTask["status"]) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      };

      try {
        const intentRes = await fetch("/api/board/dashboard-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage: trimmedBrief,
            projectName,
            style,
            conversationHistory: toConversationHistory(messagesRef.current.slice(0, -1)),
          }),
          signal: ac.signal,
        });
        if (!intentRes.ok) {
          const errBody = await intentRes.json().catch(() => ({}));
          throw new Error((errBody as { error?: string }).error || `intent HTTP ${intentRes.status}`);
        }
        const intent = (await intentRes.json()) as Intent;

        if (intent.clarification) {
          setMessages((prev) => [...prev, createAssistantMessage(intent.clarification!)]);
          setState((s) => ({ ...s, isLoading: false, step: "idle", statusText: "等待开始" }));
          return;
        }

        const work: AgentTask[] = [];
        if (intent.updateStory) {
          work.push({
            id: crypto.randomUUID(),
            skill: "story",
            description: "更新数据故事 (design-story.md)",
            inputs: {},
            status: "pending",
          });
        }
        if (intent.updatePages) {
          work.push({
            id: crypto.randomUUID(),
            skill: "pages",
            description: "更新页面结构 (pages-story.md)",
            inputs: {},
            status: "pending",
          });
        }
        if (intent.viSystemMarkdown) {
          work.push({
            id: crypto.randomUUID(),
            skill: "vi-md",
            description: "更新品牌 VI 并重算 Tokens",
            inputs: {},
            status: "pending",
          });
        } else if (intent.updateViReload) {
          work.push({
            id: crypto.randomUUID(),
            skill: "vi-reload",
            description: "从预设风格重装 VI 并重算 Tokens",
            inputs: {},
            status: "pending",
          });
        }
        work.push({
          id: crypto.randomUUID(),
          skill: "jsx",
          description: "生成 dashboard.jsx",
          inputs: {},
          status: "pending",
        });
        setTasks(work);

        let designStoryText: string | null = null;
        let pagesStoryText: string | null = null;
        let tokensForJsx: ViTokens | null = null;

        /** 本轮开始前的磁盘快照，供 story/pages 增量合并（AI 长期记忆） */
        let snapshotStory = "";
        let snapshotPages = "";
        try {
          snapshotStory = await readFile(`.dv/${projectName}/数据故事/design-story.md`);
        } catch {
          /* 新项目或无文件 */
        }
        try {
          snapshotPages = await readFile(`.dv/${projectName}/页面结构/pages-story.md`);
        } catch {
          /* */
        }

        for (const task of work) {
          if (ac.signal.aborted) return;
          setTaskStatus(task.id, "running");
          setState((s) => ({
            ...s,
            step:
              task.skill === "story"
                ? "story"
                : task.skill === "pages"
                  ? "designing"
                  : task.skill === "jsx"
                    ? "generating"
                    : "vi",
            statusText: task.description,
          }));

          if (task.skill === "story") {
            designStoryText = await executeDesignStory(trimmedBrief, undefined, ctxBase, {
              existingStory: snapshotStory.trim() ? snapshotStory : undefined,
            });
          } else if (task.skill === "pages") {
            const src =
              designStoryText ??
              (await readFile(`.dv/${projectName}/数据故事/design-story.md`));
            pagesStoryText = await executePagesStory(src, ctxBase, {
              existingPages: snapshotPages.trim() ? snapshotPages : undefined,
            });
          } else if (task.skill === "vi-md") {
            const { tokens } = await executeViTokensFromMarkdown(intent.viSystemMarkdown!, {
              ...ctxBase,
            });
            tokensForJsx = tokens;
          } else if (task.skill === "vi-reload") {
            const st = (style || "").trim();
            if (!st) throw new Error("重装 VI 需要项目风格 style，请在侧栏或创建流程中选择风格。");
            const { tokens } = await executeVISystem({ ...ctxBase }, st);
            tokensForJsx = tokens;
          } else if (task.skill === "jsx") {
            const pages =
              pagesStoryText ??
              (await readFile(`.dv/${projectName}/页面结构/pages-story.md`));
            const tok = tokensForJsx ?? (await loadTokens(projectName));
            const jsx = await executeJSXGeneration(pages, tok, ctxBase, "dashboard.jsx");
            setState((s) => ({
              ...s,
              step: "done",
              jsxCode: jsx,
              isLoading: false,
              statusText: "✅ 看板已更新",
            }));
            setMessages((prev) => [
              ...prev,
              createAssistantMessage(
                `已更新 dashboard.jsx（${jsx.metadata.pageCount} 页，约 ${jsx.metadata.estimatedComponents} 个组件）。`
              ),
            ]);
          }

          setTaskStatus(task.id, "done");
        }
      } catch (err) {
        handleError(err);
      } finally {
        isRunningRef.current = false;
      }
    },
    [handleError]
  );

  const submitFormAnswers = useCallback(async (_answers: Record<string, unknown>) => {
    /* Agent 模式不再使用问卷 */
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    isRunningRef.current = false;
    messagesRef.current = [];
    setMessages([]);
    setTasks([]);
    setState({ ...INITIAL_STATE });
  }, []);

  return { messages, isRunning: state.isLoading, state, tasks, runPipeline, submitFormAnswers, clear };
}
