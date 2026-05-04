/**
 * 管线状态管理 Hook
 *
 * 管理 3 步流程：
 *   Step 1 (design-vi) + Step 2 (design-story) 并发执行
 *   → Step 3 (generate-jsx) 等待两者完成后执行
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { viSystemSchema } from "@/lib/board/vi-system";
import type { VISystem } from "@/lib/board/vi-system";
import { boardStorySchema, normalizeBoardStory } from "@/lib/board/board-story";
import type { BoardStory } from "@/lib/board/board-story";
import { jsxCodeSchema, normalizeJSXCode, EMPTY_JSX_CODE } from "@/lib/board/jsx-output";
import type { JSXCode } from "@/lib/board/jsx-output";
import { callPipelineStep } from "@/lib/pipeline-api";

// ─── Types ────────────────────────────────────────────────

export type PipelineStep =
  | "idle"
  | "designing"        // Step 1+2 并发中
  | "designed"          // Step 1+2 完成
  | "generating"        // Step 3 执行中
  | "done"              // 全部完成
  | "error";

export interface PipelineState {
  step: PipelineStep;
  brief: string;
  /** Step 1 输出：VI 系统 */
  viSystem: VISystem | null;
  /** Step 2 输出：看板故事 */
  boardStory: BoardStory | null;
  /** Step 3 输出：JSX 代码 */
  jsxCode: JSXCode | null;
  /** 当前活跃的流式文本（用于展示进度） */
  statusText: string;
  errorMsg: string | null;
}

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: "text"; text: string }>;
};

export type UsePipelineReturn = {
  state: PipelineState;
  messages: ChatMessage[];
  isRunning: boolean;
  runPipeline: (brief: string) => Promise<void>;
  stop: () => void;
  clear: () => void;
};

// ─── Helpers ──────────────────────────────────────────────

function createTextMessage(role: "user" | "assistant", text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    parts: [{ type: "text", text }],
  };
}

function cleanStreamText(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?\s*```\s*$/g, "")
    .trim();
}

/** 从流式文本中提取 JSON 字段值（用于进度展示） */
function readJsonStringField(text: string, field: string): string | undefined {
  const match = text.match(new RegExp(`"${field}"\\s*:\\s*"([^"]{1,180})`));
  return match?.[1];
}

function uniqueValues(values: Array<string | undefined>, limit = 6): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v?.trim())))).slice(0, limit);
}

// ─── 进度摘要函数 ─────────────────────────────────────────

function renderProgress(title: string, lines: string[], streamText: string): string {
  const received = Math.max(1, Math.round(cleanStreamText(streamText).length / 120));
  return [
    title,
    "",
    ...lines,
    "",
    `已接收 ${received} 段设计信息，正在继续整理...`,
  ].join("\n");
}

function summarizeVIStream(streamText: string): string {
  const cleaned = cleanStreamText(streamText);
  const palette = uniqueValues(
    Array.from(cleaned.matchAll(/#[0-9a-fA-F]{6}/g)).map((m) => m[0]),
    8,
  );
  const lines = [
    readJsonStringField(cleaned, "name") ? `VI 名称：${readJsonStringField(cleaned, "name")}` : "正在确定 VI 系统名称和主题方向。",
    readJsonStringField(cleaned, "theme") ? `主题模式：${readJsonStringField(cleaned, "theme")} / ${readJsonStringField(cleaned, "mode")}` : "正在匹配暗色/亮色模式和视觉风格。",
    palette.length ? `色彩样本：${palette.join("、")}` : "正在生成完整的颜色 token 系统（背景/前景/语义色/图表色板）。",
  ];
  return renderProgress("① 设计 VI 系统", lines, streamText);
}

function summarizeStoryStream(streamText: string): string {
  const cleaned = cleanStreamText(streamText);
  const pageNames = uniqueValues(
    Array.from(cleaned.matchAll(/"name"\s*:\s*"([^"]{1,60})"/g)).map((m) => m[1]),
    5,
  );
  const insights = uniqueValues(
    Array.from(cleaned.matchAll(/"mustInsights"/g))
      .flatMap(() => []),
    4,
  );
  const lines = [
    pageNames.length ? `页面规划：${pageNames.join("、")}` : "正在拆分页面叙事结构和分析目标。",
    readJsonStringField(cleaned, "summary") ? `看板定位：${readJsonStringField(cleaned, "summary")}` : "正在提炼看板的核心目标和业务价值。",
    insights.length > 0 || readJsonStringField(cleaned, "keyQuestion")
      ? "正在为每个页面定义关键问题和必须讲清的洞察。"
      : "正在识别分析角度和建议的内容模块。",
  ];
  return renderProgress("② 设计看板故事", lines, streamText);
}

function summarizeJSXStream(streamText: string): string {
  const cleaned = cleanStreamText(streamText);
  const componentCount = (cleaned.match(/React\.createElement/g) ?? []).length;
  const lines = [
    `已生成约 ${componentCount} 个 React 元素节点。`,
    "正在组装完整的看板组件代码...",
  ];
  return renderProgress("③ 生成 JSX 看板代码", lines, streamText);
}

function summarizeFinalResult(jsxCode: JSXCode, story: BoardStory, vi: VISystem): string {
  const pages = story.pages.map((p, i) => `${i + 1}. ${p.name}`).join("\n");
  return [
    "✅ V2 管线全部完成！",
    "",
    `组件名称：${jsxCode.metadata.componentName}`,
    `画布尺寸：${jsxCode.metadata.canvasSize.width} × ${jsxCode.metadata.canvasSize.height}`,
    `页面数量：${jsxCode.metadata.pageCount} 页`,
    `组件数量：约 ${jsxCode.metadata.estimatedComponents} 个`,
    `图表类型：${jsxCode.metadata.chartTypesUsed.join("、") || "无"}`,
    "",
    "页面结构：",
    pages,
    "",
    "VI 主题：" + vi.themeProfile.name + " (" + vi.themeProfile.theme + ")",
  ]
    .filter(Boolean)
    .join("\n");
}

// ─── Initial State ────────────────────────────────────────

const INITIAL_STATE: PipelineState = {
  step: "idle",
  brief: "",
  viSystem: null,
  boardStory: null,
  jsxCode: null,
  statusText: "等待生成请求。",
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

  // ── 运行管线 ──
  const runPipeline = useCallback(async (brief: string) => {
    if (isRunningRef.current) return;
    const trimmedBrief = brief.trim();
    if (!trimmedBrief) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    isRunningRef.current = true;

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      createTextMessage("user", trimmedBrief),
      { id: assistantId, role: "assistant", parts: [{ type: "text" as const, text: "开始设计你的数据大屏..." }] },
    ]);

    const updateAssistant = (text: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, parts: [{ type: "text" as const, text }] } : m)),
      );
    };

    try {
      // ════════════════════════════════════════
      // Step 1 + Step 2 并发执行
      // ════════════════════════════════════════
      setState((s) => ({ ...s, step: "designing", brief: trimmedBrief, statusText: "同时启动 VI 设计和故事设计…" }));
      updateAssistant("正在同时进行两步设计工作…\n\n");

      let viStreamAcc = "";
      let storyStreamAcc = "";

      const [viResult, storyResult] = await Promise.allSettled([
        callPipelineStep(
          "/api/board/design-vi",
          { brief: trimmedBrief },
          (streamText) => {
            viStreamAcc = streamText;
            updateAssistant(
              `① 设计 VI 系统\n\n${summarizeVIStream(streamText)}\n\n---\n\n② 设计看板故事\n\n${storyStreamAcc ? summarizeStoryStream(storyStreamAcc) : "等待 VI 设计完成后自动开始…"}`,
            );
            // 尝试增量解析
            try {
              const partial = JSON.parse(cleanStreamText(streamText));
              if (partial.colors?.background) {
                setState((s) => ({
                  ...s,
                  viSystem: viSystemSchema.safeParse(partial).success
                    ? viSystemSchema.parse(partial)
                    : s.viSystem,
                }));
              }
            } catch { /* 增量解析失败是正常的 */ }
          },
          ac.signal,
        ),
        callPipelineStep(
          "/api/board/design-story",
          { brief: trimmedBrief },
          (streamText) => {
            storyStreamAcc = streamText;
            updateAssistant(
              `① 设计 VI 系统\n\n${viStreamAcc ? summarizeVIStream(viStreamAcc) : "正在分析用户需求并设计 VI Token 系统…"}\n\n---\n\n② 设计看板故事\n\n${summarizeStoryStream(streamText)}`,
            );
          },
          ac.signal,
        ),
      ]);

      // 解析 Step 1 结果
      let viSystem: VISystem;
      if (viResult.status === "fulfilled") {
        const parsed = viSystemSchema.parse(viResult.value.json);
        viSystem = parsed;
      } else {
        throw new Error(`VI 设计失败: ${viResult.reason instanceof Error ? viResult.reason.message : String(viResult.reason)}`);
      }

      // 解析 Step 2 结果
      let boardStory: BoardStory;
      if (storyResult.status === "fulfilled") {
        const normalized = normalizeBoardStory(storyResult.value.json);
        boardStory = boardStorySchema.parse(normalized);
      } else {
        throw new Error(`故事设计失败: ${storyResult.reason instanceof Error ? storyResult.reason.message : String(storyResult.reason)}`);
      }

      setState((s) => ({
        ...s,
        step: "designed",
        viSystem,
        boardStory,
        statusText: `✅ VI 系统和看板故事已完成（${boardStory.pages.length} 页）`,
      }));

      // ════════════════════════════════════════
      // Step 3: JSX 代码生成
      // ════════════════════════════════════════
      updateAssistant(`✅ VI 系统和故事设计完成！\n\nVI 主题：${viSystem.themeProfile.name}\n页面规划：${boardStory.pages.map((p) => p.name).join("、")}\n\n正在生成最终的 JSX 看板代码…\n\n`);

      setState((s) => ({ ...s, step: "generating", statusText: "正在生成 JSX 看板代码…" }));

      const jsxResult = await callPipelineStep(
        "/api/board/generate-jsx",
        {
          brief: trimmedBrief,
          viSystem: viResult.status === "fulfilled" ? viResult.value.json : undefined,
          boardStory: storyResult.status === "fulfilled" ? storyResult.value.json : undefined,
        },
        (streamText) => {
          updateAssistant(summarizeJSXStream(streamText));
        },
        ac.signal,
      );

      // 标准化 JSX 输出，处理缺失字段
      const normalizedJSX = normalizeJSXCode(jsxResult.json);
      const jsxCode = jsxCodeSchema.parse(normalizedJSX);

      setState({
        step: "done",
        brief: trimmedBrief,
        viSystem,
        boardStory,
        jsxCode,
        statusText: `✅ 全部完成！${jsxCode.metadata.componentName} 已就绪`,
        errorMsg: null,
      });

      updateAssistant(summarizeFinalResult(jsxCode, boardStory, viSystem));

    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        updateAssistant("已停止本次生成。");
        setState((s) => ({ ...s, step: "idle", statusText: "已中止", errorMsg: null }));
        return;
      }
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

  const isRunning = state.step === "designing" || state.step === "generating";

  return { state, messages, isRunning, runPipeline, stop, clear };
}
