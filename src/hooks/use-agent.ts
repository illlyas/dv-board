/**
 * Agent 模式状态管理 Hook
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { callPipelineStep } from "@/lib/pipeline-api";
import { listProjectFiles } from "@/lib/pipeline/file-operations";
import { runTasks } from "@/lib/agent/task-runner";
import type { PipelineState, ChatMessage, AgentTask } from "@/types/pipeline.types";
import {
  createUserMessage,
  createAssistantMessage,
  createSystemMessage,
} from "@/lib/pipeline/message-utils";

const INITIAL_STATE: PipelineState = {
  step: "idle", brief: "", projectName: "", style: "", currentForm: null, extractedInfo: null,
  designStory: null, pagesStory: null, viContent: null, viTokens: null, jsxCode: null, isLoading: false,
  statusText: "等待开始", errorMsg: null,
};

type FilesData = {
  categories: Record<string, Array<{ name: string; path: string; updatedAt: string }>>;
};

function flattenFiles(data: FilesData, projectName: string): string[] {
  const prefix = `.dv/${projectName}/`;
  return Object.values(data.categories).flatMap((files) =>
    files.map((f) => (f.path.startsWith(prefix) ? f.path.slice(prefix.length) : f.path))
  );
}

function toAgentTasks(
  raw: Array<{ skill: string; description: string; inputs: Record<string, unknown> }>
): AgentTask[] {
  return raw.map((t) => ({ id: crypto.randomUUID(), ...t, status: "pending" as const }));
}

/** 将 ChatMessage[] 转为 LLM 多轮对话格式，过滤掉 system 消息和未完成的 streaming 消息 */
function toConversationHistory(messages: ChatMessage[]): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && !m.streaming && m.content.trim())
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

export function useAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);  // 追踪最新 messages，供 callback 读取
  const pausedContextRef = useRef<{
    remainingTasks: AgentTask[];
    projectName: string;
    style: string;
    existingFiles: string[];
  } | null>(null);

  const updateTask = useCallback((id: string, status: AgentTask["status"]) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }, []);

  const appendMsg = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      let next: ChatMessage[];
      if (!msg.streaming) {
        next = [...prev, msg];
      } else {
        const idx = prev.findIndex((m) => m.id === msg.id);
        if (idx === -1) {
          next = [...prev, msg];
        } else {
          next = [...prev];
          next[idx] = msg;
        }
      }
      messagesRef.current = next;
      return next;
    });
  }, []);

  const execTasks = useCallback(
    async (
      agentTasks: AgentTask[],
      projectName: string,
      style: string,
      existingFiles: string[],
      signal: AbortSignal,
      conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
    ) => {
      await runTasks(agentTasks, projectName, style, existingFiles, signal, {
        onTaskStart: (id) => updateTask(id, "running"),
        onTaskDone: (id) => updateTask(id, "done"),
        onTaskSkipped: (id, reason) => {
          updateTask(id, "skipped");
          setMessages((prev) => [...prev, createSystemMessage(`跳过任务：${reason}`)]);
        },
        onTaskError: (id, error) => {
          updateTask(id, "error");
          setMessages((prev) => [...prev, createSystemMessage(`❌ 任务出错：${error}`)]);
          setState((s) => ({ ...s, step: "error", isLoading: false, errorMsg: error }));
        },
        onMessage: appendMsg,
        onFormPause: (taskId, form, extractedInfo) => {
          updateTask(taskId, "running");
          setState((s) => ({ ...s, currentForm: form, isLoading: false }));
          setMessages((prev) => [
            ...prev,
            createAssistantMessage("需要补充一些信息：", { formData: form }),
          ]);
          const idx = agentTasks.findIndex((t) => t.id === taskId);
          pausedContextRef.current = {
            remainingTasks: agentTasks.slice(idx),
            projectName,
            style,
            existingFiles,
          };
          void extractedInfo;
        },
      }, conversationHistory);
    },
    [updateTask, appendMsg]
  );

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

  const markDone = useCallback((signal: AbortSignal) => {
    if (!pausedContextRef.current && !signal.aborted) {
      setState((s) => ({ ...s, step: "done", isLoading: false, statusText: "✅ 完成" }));
      setMessages((prev) => [...prev, createAssistantMessage("所有任务已完成！")]);
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
        ...s, step: "collecting", brief: trimmedBrief, projectName, style,
        isLoading: true, statusText: "正在规划任务...", currentForm: null, errorMsg: null,
      }));

      try {
        const filesData = (await listProjectFiles(projectName)) as FilesData;
        const existingFiles = flattenFiles(filesData, projectName);

        const conversationHistory = toConversationHistory(messagesRef.current);

        const result = await callPipelineStep(
          "/api/board/agent-plan",
          { userMessage: trimmedBrief, projectName, style, existingFiles, conversationHistory },
          undefined,
          ac.signal
        );

        const json = result.json as Record<string, unknown>;

        if (json.clarification) {
          setMessages((prev) => [...prev, createAssistantMessage(json.clarification as string)]);
          setState((s) => ({ ...s, isLoading: false }));
          return;
        }

        const agentTasks = toAgentTasks(
          json.tasks as Array<{ skill: string; description: string; inputs: Record<string, unknown> }>
        );
        setTasks(agentTasks);
        await execTasks(agentTasks, projectName, style, existingFiles, ac.signal, conversationHistory);
        markDone(ac.signal);
      } catch (err) {
        handleError(err);
      } finally {
        isRunningRef.current = false;
      }
    },
    [execTasks, handleError, markDone]
  );

  const submitFormAnswers = useCallback(
    async (answers: Record<string, unknown>) => {
      const ctx = pausedContextRef.current;
      if (!ctx) return;
      pausedContextRef.current = null;

      const { remainingTasks, projectName, style, existingFiles } = ctx;
      const summary = Object.entries(answers)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join("、") : v}`)
        .join(" | ");

      setMessages((prev) => [...prev, createUserMessage(`已补充：${summary}`)]);
      setState((s) => ({ ...s, currentForm: null, isLoading: true }));

      const updatedTasks = remainingTasks.map((t) => {
        if (t.skill === "analyze-brief") return { ...t, inputs: { ...t.inputs, answers } };
        if (t.skill === "design-story") return { ...t, inputs: { ...t.inputs, answers } };
        return t;
      });

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      isRunningRef.current = true;

      try {
        await execTasks(updatedTasks, projectName, style, existingFiles, ac.signal);
        markDone(ac.signal);
      } catch (err) {
        handleError(err);
      } finally {
        isRunningRef.current = false;
      }
    },
    [execTasks, handleError, markDone]
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    isRunningRef.current = false;
    pausedContextRef.current = null;
    messagesRef.current = [];
    setMessages([]);
    setTasks([]);
    setState({ ...INITIAL_STATE });
  }, []);

  return { messages, isRunning: state.isLoading, state, tasks, runPipeline, submitFormAnswers, clear };
}
