"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { analysisReportSchema } from "@/lib/analysis-report";
import { LOCAL_STORAGE_KEY, visdocSchema } from "@/lib/dashboard-schema";
import { buildStructureDigest } from "@/lib/structure-digest";
import { boardStructureSchema } from "@/lib/structure-schema";
import { visualSystemSchema } from "@/lib/visual-system";
import { composeVisdoc } from "@/lib/visual-composer";
import { callPipelineStep } from "@/lib/pipeline-api";
import type { PipelineState, PipelineStep } from "@/lib/pipeline-types";
import { RUNNING_STEPS } from "@/lib/pipeline-types";

// ─── Types ────────────────────────────────────────────────

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: "text"; text: string }>;
};

export type UsePipelineReturn = {
  /** 当前 pipeline 状态 */
  state: PipelineState;
  /** 对话消息列表 */
  messages: ChatMessage[];
  /** 是否正在运行 */
  isRunning: boolean;
  /** 启动三步流水线 */
  runPipeline: (brief: string) => Promise<void>;
  /** 中止当前运行 */
  stop: () => void;
  /** 清空所有状态 */
  clear: () => void;
  /** 加载示例数据 */
  /** 切换页面 */
  changePage: (pageId: string) => void;
};

// ─── Helpers ──────────────────────────────────────────────

function createTextMessage(role: "user" | "assistant", text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    parts: [{ type: "text" as const, text }],
  };
}

const INITIAL_STATE: PipelineState = {
  step: "idle",
  brief: "",
  analysis: null,
  structure: null,
  structureDigest: null,
  visualSystem: null,
  visdoc: null,
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

  // ── 恢复 localStorage ──
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = visdocSchema.parse(JSON.parse(raw));
      setState((prev) => ({
        ...prev,
        visdoc: parsed,
        activePageId: parsed.currentPageId,
        step: "done",
        statusText: `已恢复上次保存的看板文档（${parsed.pages.length} 页）`,
      }));
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  // ── 运行三步流水线 ──
  const runPipeline = useCallback(async (brief: string) => {
    if (isRunningRef.current) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    isRunningRef.current = true;

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      createTextMessage("user", brief),
      { id: assistantId, role: "assistant", parts: [{ type: "text" as const, text: "开始三阶段流水线…" }] },
    ]);

    const updateAssistant = (text: string) => {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, parts: [{ type: "text" as const, text }] } : m),
      );
    };

    try {
      // ═══ Step 1: Analyze ═══
      setState((s) => ({ ...s, step: "analyzing", brief, statusText: "正在分析用户需求…" }));
      updateAssistant("🔍 步骤 1/3 — 分析需求中…");

      const analyzeRes = await callPipelineStep(
        "/api/board/analyze",
        { brief },
        (streamText) => {
          updateAssistant(`🔍 步骤 1/3 — 分析中…（已收到 ${Math.min(streamText.length / 4, 99)}% 数据）`);
          try {
            const partial = JSON.parse(streamText.replace(/^```.*\n?/i, "").replace(/\n?```.*/g, ""));
            if (partial.summary || partial.pages) {
              setState((s) => ({
                ...s,
                analysis: analysisReportSchema.safeParse(partial).success ? analysisReportSchema.parse(partial) : s.analysis,
              }));
            }
          } catch { /* 增量解析失败是正常的 */ }
        },
      );
      const analysis = analysisReportSchema.parse(analyzeRes.json);

      setState((s) => ({ ...s, step: "analyzed", analysis, statusText: `✅ 需求分析完成：${analysis.pages.length} 个页面规划` }));

      // ═══ Step 2: Structure ═══
      updateAssistant(`📐 步骤 2/3 — 设计页面结构（${analysis.pages.length} 页）…`);
      setState((s) => ({ ...s, step: "structuring", statusText: "正在设计页面布局结构…" }));

      const structureRes = await callPipelineStep(
        "/api/board/structure",
        { brief, analysis: analyzeRes.json },
        (streamText) => {
          updateAssistant(`📐 步骤 2/3 — 结构设计中…（已接收 ${Math.min(streamText.length / 8, 99)}%）`);
        },
      );
      const structure = boardStructureSchema.parse(structureRes.json);
      const structureDigest = buildStructureDigest(structure);

      setState((s) => ({
        ...s,
        step: "structured",
        structure,
        structureDigest,
        statusText: `✅ 结构设计完成：${Object.keys(structure.nodeMap).length} 个节点`,
      }));

      // ═══ Step 3: Visualize ═══
      updateAssistant(`🎨 步骤 3/3 — 设计视觉效果…`);
      setState((s) => ({ ...s, step: "visualizing", statusText: "正在应用视觉风格系统…" }));

      const visualizeRes = await callPipelineStep(
        "/api/board/visualize",
        {
          brief,
          visualBrief: analysis.visualBrief,
          structureDigest,
        },
        (streamText) => {
          updateAssistant(`🎨 步骤 3/3 — 视觉设计中…（已接收 ${Math.min(streamText.length / 10, 99)}%）`);
          try {
            const partialVisual = JSON.parse(streamText.replace(/^```.*\n?/i, "").replace(/\n?```.*/g, ""));
            if (visualSystemSchema.safeParse(partialVisual).success) {
              const visualSystem = visualSystemSchema.parse(partialVisual);
              setState((s) => ({
                ...s,
                visualSystem,
                visdoc: s.structure ? composeVisdoc(s.structure, visualSystem) : s.visdoc,
              }));
            }
          } catch { /* ok */ }
        },
      );
      const visualSystem = visualSystemSchema.parse(visualizeRes.json);
      const visdoc = composeVisdoc(structure, visualSystem);

      // 保存到 localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visdoc));

      setState({
        step: "done",
        brief,
        analysis,
        structure,
        structureDigest,
        visualSystem,
        visdoc,
        activePageId: visdoc.currentPageId,
        statusText: `✅ 全部完成！${visdoc.pages.length} 页看板已生成`,
        errorMsg: null,
      });
      updateAssistant(`✅ 看板生成完毕！共 ${visdoc.pages.length} 页、${Object.keys(visdoc.nodeMap).length} 个组件。`);

    } catch (err) {
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
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setMessages([]);
    setState({ ...INITIAL_STATE });
  }, [stop]);

  // ── 切换页面 ──
  const changePage = useCallback((pageId: string) => {
    setState((s) => {
      if (!s.visdoc) return s;
      const nextDoc = { ...s.visdoc, currentPageId: pageId };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextDoc));
      return { ...s, activePageId: pageId, visdoc: nextDoc };
    });
  }, []);

  const isRunning = RUNNING_STEPS.has(state.step as PipelineStep);

  return { state, messages, isRunning, runPipeline, stop, clear, changePage };
}
