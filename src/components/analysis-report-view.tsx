"use client";

import {
  BookOpen,
  Lightbulb,
  Layers,
  Palette,
  Sparkles,
  Target,
} from "lucide-react";

import type { AnalysisReport } from "@/lib/analysis-report";

// ─── Widget Type → 中文标签 + 颜色 ────────────────────────

const WIDGET_TYPE_MAP: Record<string, { label: string; color: string }> = {
  text:   { label: "文本",    color: "bg-blue-500/15 text-blue-400" },
  bar:    { label: "柱状图",  color: "bg-orange-500/15 text-orange-400" },
  line:   { label: "折线图",  color: "bg-cyan-500/15 text-cyan-400" },
  pie:    { label: "饼图",    color: "bg-emerald-500/15 text-emerald-400" },
  funnel: { label: "漏斗图",  color: "bg-pink-500/15 text-pink-400" },
  pixel:  { label: "像素进度", color: "bg-violet-500/15 text-violet-400" },
  select: { label: "筛选器",  color: "bg-amber-500/15 text-amber-400" },
  image:  { label: "图片",    color: "bg-teal-500/15 text-teal-400" },
};

const THEME_LABELS: Record<string, string> = {
  "dark-tech":        "深色科技风",
  "dark-business":    "深色商务风",
  "light-clean":      "浅色简洁风",
  "dark-executive":   "深色行政风",
  "dark-data":        "深色数据风",
};

// ══════════════════════════════════════════════════════════
type ReportViewProps = {
  report: AnalysisReport;
};

export function AnalysisReportView({ report }: ReportViewProps) {
  return (
    <div className="flex flex-col gap-5 p-5">
      {/* ── 标题区 ── */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-[#f97316]/10 p-2">
          <BookOpen className="h-5 w-5 text-[#f97316]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white/92">需求分析报告</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/60">{report.summary}</p>
        </div>
      </div>

      {/* ── 数据故事线（高亮） ── */}
      <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#f97316]">
          <Sparkles className="h-3.5 w-3.5" />
          数据故事线
        </div>
        <p className="text-sm leading-7 text-white/72">{report.dataStory}</p>
      </div>

      {/* ── 推荐主题标签 ── */}
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-white/36" />
        <span className="text-xs text-white/40">推荐风格:</span>
        <span className="rounded-full bg-[#f97316]/12 px-3 py-1 text-xs font-medium text-[#f97316]">
          {THEME_LABELS[report.recommendedTheme] ?? report.recommendedTheme}
        </span>
      </div>

      {/* ── 分页规划（每页一个卡片） ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/44">
          <Layers className="h-3.5 w-3.5" />
          分页规划 ({report.pages.length} 页)
        </div>

        {report.pages.map((page, idx) => (
          <PagePlanCard key={page.name ?? idx} page={page} index={idx} />
        ))}
      </div>

      {/* ── 潜在需求 ── */}
      {report.potentialNeeds?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/44">
            <Lightbulb className="h-3.5 w-3.5" />
            潜在需求
          </div>
          <ul className="ml-6 list-disc space-y-1">
            {report.potentialNeeds.map((need, i) => (
              <li key={i} className="text-sm leading-6 text-white/50">{need}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── 单个页面规划卡片 ─────────────────────────────────────

function PagePlanCard({ page, index }: { page: AnalysisReport["pages"][number]; index: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 transition hover:border-white/[0.12]">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f97316]/12 text-sm font-bold text-[#f97316]">
          P{index + 1}
        </span>
        <div>
          <h4 className="text-sm font-semibold text-white/88">{page.name}</h4>
          <p className="text-xs leading-5 text-white/46">{page.purpose}</p>
        </div>
      </div>

      {/* 关键指标 */}
      {page.keyMetrics?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {page.keyMetrics.map((m) => (
            <span key={m} className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/50">
              <Target className="h-3 w-3" />{m}
            </span>
          ))}
        </div>
      )}

      {/* 建议组件列表 */}
      {page.suggestedWidgets?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {page.suggestedWidgets.map((w) => {
            const meta = WIDGET_TYPE_MAP[w.type] ?? { label: w.type, color: "bg-gray-500/15 text-gray-400" };
            return (
              <span key={w.label} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${meta.color}`}>
                {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* 布局思路 */}
      {page.layoutIdea && (
        <p className="rounded-lg bg-black/20 px-3 py-2 text-xs leading-6 text-white/40 italic">
          布局: {page.layoutIdea}
        </p>
      )}
    </div>
  );
}
