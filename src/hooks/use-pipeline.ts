"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { analysisReportSchema, normalizeAnalysisReport } from "@/lib/analysis-report";
import type { AnalysisReport } from "@/lib/analysis-report";
import { LOCAL_STORAGE_KEY, visdocSchema } from "@/lib/dashboard-schema";
import { buildStructureDigest } from "@/lib/structure-digest";
import { boardStructureSchema } from "@/lib/structure-schema";
import type { BoardStructure } from "@/lib/structure-schema";
import { visualSystemSchema } from "@/lib/visual-system";
import type { VisualSystemSpec } from "@/lib/visual-system";
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

function cleanStreamText(text: string) {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?\s*```\s*$/g, "")
    .trim();
}

function readJsonStringField(text: string, field: string) {
  const match = text.match(new RegExp(`"${field}"\\s*:\\s*"([^"]{1,180})`));
  return match?.[1];
}

function uniqueValues(values: Array<string | undefined>, limit = 6) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim())))).slice(0, limit);
}

function renderProgress(title: string, lines: string[], streamText: string) {
  const received = Math.max(1, Math.round(cleanStreamText(streamText).length / 120));
  return [
    title,
    "",
    ...lines,
    "",
    `已接收 ${received} 段设计信息，正在继续整理...`,
  ].join("\n");
}

function summarizeAnalysisStream(streamText: string) {
  const cleaned = cleanStreamText(streamText);
  const pageNames = uniqueValues(Array.from(cleaned.matchAll(/"name"\s*:\s*"([^"]{1,60})"/g)).map((match) => match[1]), 5);
  const metrics = uniqueValues(Array.from(cleaned.matchAll(/"keyMetrics"\s*:\s*\[([\s\S]*?)\]/g))
    .flatMap((match) => Array.from(match[1].matchAll(/"([^"]{1,50})"/g)).map((item) => item[1])), 8);
  const concerns = uniqueValues(Array.from(cleaned.matchAll(/"defaultConcerns"\s*:\s*\[([\s\S]*?)\]/g))
    .flatMap((match) => Array.from(match[1].matchAll(/"([^"]{1,60})"/g)).map((item) => item[1])), 6);
  const insights = uniqueValues(Array.from(cleaned.matchAll(/"mustInsights"\s*:\s*\[([\s\S]*?)\]/g))
    .flatMap((match) => Array.from(match[1].matchAll(/"([^"]{1,90})"/g)).map((item) => item[1])), 6);
  const widgetLabels = uniqueValues(Array.from(cleaned.matchAll(/"label"\s*:\s*"([^"]{1,80})"/g)).map((match) => match[1]), 8);
  const lines = [
    readJsonStringField(cleaned, "summary") ? `看板定位：${readJsonStringField(cleaned, "summary")}` : "正在提炼看板的业务定位和核心目标。",
    readJsonStringField(cleaned, "audience") ? `目标受众：${readJsonStringField(cleaned, "audience")}` : "正在判断这套看板主要服务的使用者。",
    readJsonStringField(cleaned, "coreEntity") ? `核心对象：${readJsonStringField(cleaned, "coreEntity")}` : "正在识别分析围绕的核心业务对象。",
    pageNames.length ? `页面规划：${pageNames.join("、")}` : "正在拆分页面叙事结构。",
    metrics.length ? `重点指标：${metrics.join("、")}` : "正在筛选需要优先呈现的指标与维度。",
    concerns.length ? `关注问题：${concerns.join("、")}` : "正在判断用户真正关心的经营/运营问题。",
    insights.length ? `关键洞察：${insights.join("、")}` : "正在为每个页面提炼必须讲清的洞察。",
    widgetLabels.length ? `建议模块：${widgetLabels.join("、")}` : "正在规划标题、指标、图表、筛选与注释模块。",
  ];
  return renderProgress("步骤 1/3：需求分析", lines, streamText);
}

function summarizeAnalysisResult(analysis: AnalysisReport) {
  const pageLines = analysis.pages
    .map((page, index) => `${index + 1}. ${page.name}：${page.keyQuestion}`)
    .join("\n");
  const metrics = uniqueValues(analysis.pages.flatMap((page) => page.keyMetrics), 10);

  return [
    "步骤 1/3：需求分析完成",
    "",
    `看板定位：${analysis.summary}`,
    `服务对象：${analysis.audience}`,
    `业务目标：${analysis.overallGoal}`,
    "",
    "页面叙事：",
    pageLines,
    "",
    metrics.length ? `核心指标：${metrics.join("、")}` : "",
    "",
    `主题建议：${analysis.recommendedTheme} / ${analysis.visualBrief.tone} / ${analysis.visualBrief.densityHint}`,
    `内容重心：${analysis.visualBrief.emphasis}`,
  ].filter(Boolean).join("\n");
}

function summarizeStructureStream(streamText: string, analysis: AnalysisReport) {
  const cleaned = cleanStreamText(streamText);
  const widgetTypes = uniqueValues(Array.from(cleaned.matchAll(/"widgetType"\s*:\s*"([^"]{1,30})"/g)).map((match) => match[1]), 8);
  const nodeNames = uniqueValues(Array.from(cleaned.matchAll(/"name"\s*:\s*"([^"]{1,60})"/g)).map((match) => match[1]), 10);
  const nodeIds = uniqueValues(Array.from(cleaned.matchAll(/"(node-[^"]{1,80})"\s*:/g)).map((match) => match[1]), 8);
  const pageNames = analysis.pages.map((page, index) => `${index + 1}. ${page.name}`).join("\n");
  const lines = [
    `页面清单：\n${pageNames}`,
    widgetTypes.length ? `组件类型：${widgetTypes.join("、")}` : "组件类型：正在安排标题、指标、图表、筛选和注释模块。",
    nodeNames.length ? `组件/分区名称：${nodeNames.join("、")}` : "组件/分区名称：正在生成可视化模块命名。",
    nodeIds.length ? `节点样例：${nodeIds.join("、")}` : "节点样例：正在生成 nodeMap 和页面根节点。",
    "结构字段：page.rootNodeId、nodeMap、childrenIds、layoutStyle.position、layoutStyle.width/height",
  ];
  return renderProgress("步骤 2/3：页面结构设计", lines, streamText);
}

function summarizeStructureResult(structure: BoardStructure) {
  const nodes = Object.values(structure.nodeMap);
  const pages = structure.pages.map((page, index) => `${index + 1}. ${page.name} / root: ${page.rootNodeId}`).join("\n");
  const widgetCounts = nodes.reduce<Record<string, number>>((acc, node) => {
    if (node?.type === "widget") {
      const widgetType = node.widgetType ?? "widget";
      acc[widgetType] = (acc[widgetType] ?? 0) + 1;
    }
    return acc;
  }, {});
  const widgetSummary = Object.entries(widgetCounts)
    .map(([type, count]) => `${type} × ${count}`)
    .join("、");
  const nodeSketch = nodes
    .slice(0, 12)
    .map((node) => {
      if (node?.type === "group") {
        return `- ${node.id} / group / ${node.name} / children: ${node.childrenIds.length}`;
      }
      if (node?.type === "widget") {
        const width = Math.round(node.layoutStyle.width);
        const height = Math.round(node.layoutStyle.height);
        const [x, y] = node.layoutStyle.position.map((value) => Math.round(value));
        return `- ${node.id} / ${node.widgetType} / ${node.name} / ${width}×${height} @ ${x},${y}`;
      }
      return null;
    })
    .filter(Boolean)
    .join("\n");

  return [
    "步骤 2/3：页面结构设计完成",
    "",
    "页面结构：",
    pages,
    "",
    `节点总数：${nodes.length} 个`,
    widgetSummary ? `组件构成：${widgetSummary}` : "",
    "",
    "节点草图：",
    nodeSketch,
    "",
    "结构策略：关键指标优先占据高可见区域，趋势、排行、拆解和明细模块围绕主结论提供证据。",
  ].filter(Boolean).join("\n");
}

function summarizeVisualStream(streamText: string) {
  const cleaned = cleanStreamText(streamText);
  const palette = Array.from(cleaned.matchAll(/#[0-9a-fA-F]{6}/g)).map((match) => match[0]);
  const lines = [
    readJsonStringField(cleaned, "theme") ? `主题方向：${readJsonStringField(cleaned, "theme")}` : "正在确定整体主题方向。",
    readJsonStringField(cleaned, "tone") ? `表达气质：${readJsonStringField(cleaned, "tone")}` : "正在匹配看板的业务语气。",
    readJsonStringField(cleaned, "density") ? `信息密度：${readJsonStringField(cleaned, "density")}` : "正在控制页面密度和可读性。",
    palette.length ? `候选色彩：${uniqueValues(palette, 6).join("、")}` : "正在生成背景、面板、图表和状态色。",
  ];
  return renderProgress("步骤 3/3：视觉系统设计", lines, streamText);
}

function summarizeVisualResult(visualSystem: VisualSystemSpec) {
  return [
    "步骤 3/3：视觉系统设计完成",
    "",
    `主题：${visualSystem.themeProfile.theme}`,
    `气质：${visualSystem.themeProfile.tone}`,
    `密度：${visualSystem.themeProfile.density}`,
    `对比度：${visualSystem.themeProfile.contrast}`,
    `面板风格：${visualSystem.themeProfile.surfaceStyle}`,
    `图表色板：${visualSystem.tokens.chartPalette.join("、")}`,
    `状态色：正向 ${visualSystem.tokens.positive} / 警示 ${visualSystem.tokens.warning} / 负向 ${visualSystem.tokens.negative}`,
    "",
    "组件规则：",
    `- KPI 卡片：${visualSystem.componentRules.kpiCard}`,
    `- 图表面板：${visualSystem.componentRules.chartPanel}`,
    `- 标题徽标：${visualSystem.componentRules.chartTitleBadge}`,
    `- 图表网格：${visualSystem.componentRules.chartGrid}`,
    "",
    "正在合成最终看板并进入预览界面。",
  ].join("\n");
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
      window.setTimeout(() => {
        setState((prev) => ({
          ...prev,
          visdoc: parsed,
          activePageId: parsed.currentPageId,
          step: "done",
          statusText: `已恢复上次保存的看板文档（${parsed.pages.length} 页）`,
        }));
      }, 0);
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  // ── 运行三步流水线 ──
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
      { id: assistantId, role: "assistant", parts: [{ type: "text" as const, text: "开始理解你的看板需求..." }] },
    ]);

    const updateAssistant = (text: string) => {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, parts: [{ type: "text" as const, text }] } : m),
      );
    };
    const completedSections: string[] = [];
    const renderTranscript = (draft?: string) => {
      updateAssistant([...completedSections, draft].filter(Boolean).join("\n\n---\n\n"));
    };
    const commitTranscript = (section: string) => {
      completedSections.push(section);
      renderTranscript();
    };

    try {
      // ═══ Step 1: Analyze ═══
      setState((s) => ({ ...s, step: "analyzing", brief: trimmedBrief, statusText: "正在分析用户需求…" }));
      renderTranscript("步骤 1/3：需求分析\n\n正在识别业务主题、页面范围、核心指标和视觉表达方向...");

      const analyzeRes = await callPipelineStep(
        "/api/board/analyze",
        { brief: trimmedBrief },
        (streamText) => {
          renderTranscript(summarizeAnalysisStream(streamText));
          try {
            const partial = JSON.parse(cleanStreamText(streamText));
            if (partial.summary || partial.pages) {
              const normalizedPartial = normalizeAnalysisReport(partial);
              setState((s) => ({
                ...s,
                analysis: analysisReportSchema.safeParse(normalizedPartial).success ? analysisReportSchema.parse(normalizedPartial) : s.analysis,
              }));
            }
          } catch { /* 增量解析失败是正常的 */ }
        },
        ac.signal,
      );
      const analysis = analysisReportSchema.parse(normalizeAnalysisReport(analyzeRes.json));

      setState((s) => ({ ...s, step: "analyzed", analysis, statusText: `✅ 需求分析完成：${analysis.pages.length} 个页面规划` }));
      commitTranscript(summarizeAnalysisResult(analysis));

      // ═══ Step 2: Structure ═══
      renderTranscript(`步骤 2/3：页面结构设计\n\n需求分析完成，已规划 ${analysis.pages.length} 个页面。正在生成布局、组件层级和数据模块结构...`);
      setState((s) => ({ ...s, step: "structuring", statusText: "正在设计页面布局结构…" }));

      const structureRes = await callPipelineStep(
        "/api/board/structure",
        { brief: trimmedBrief, analysis: analyzeRes.json },
        (streamText) => {
          renderTranscript(summarizeStructureStream(streamText, analysis));
        },
        ac.signal,
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
      commitTranscript(summarizeStructureResult(structure));

      // ═══ Step 3: Visualize ═══
      renderTranscript(`步骤 3/3：视觉系统设计\n\n结构设计完成，已生成 ${Object.keys(structure.nodeMap).length} 个节点。正在配置主题、图表样式、颜色和大屏视觉层次...`);
      setState((s) => ({ ...s, step: "visualizing", statusText: "正在应用视觉风格系统…" }));

      const visualizeRes = await callPipelineStep(
        "/api/board/visualize",
        {
          brief: trimmedBrief,
          visualBrief: analysis.visualBrief,
          structureDigest,
        },
        (streamText) => {
          renderTranscript(summarizeVisualStream(streamText));
          try {
            const partialVisual = JSON.parse(cleanStreamText(streamText));
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
        ac.signal,
      );
      const visualSystem = visualSystemSchema.parse(visualizeRes.json);
      commitTranscript(summarizeVisualResult(visualSystem));
      const visdoc = composeVisdoc(structure, visualSystem);

      // 保存到 localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visdoc));

      setState({
        step: "done",
        brief: trimmedBrief,
        analysis,
        structure,
        structureDigest,
        visualSystem,
        visdoc,
        activePageId: visdoc.currentPageId,
        statusText: `✅ 全部完成！${visdoc.pages.length} 页看板已生成`,
        errorMsg: null,
      });
      commitTranscript(`看板生成完毕。\n\n共 ${visdoc.pages.length} 页、${Object.keys(visdoc.nodeMap).length} 个组件，正在进入预览界面。`);

    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        renderTranscript("已停止本次生成。");
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
      renderTranscript(`❌ 出错了: ${msg.slice(0, 200)}。请重试。`);

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
