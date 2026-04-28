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
  bullet: { label: "目标达成", color: "bg-lime-500/15 text-lime-400" },
  rank:   { label: "排名变化", color: "bg-sky-500/15 text-sky-400" },
  table:  { label: "明细表",  color: "bg-rose-500/15 text-rose-400" },
  select: { label: "筛选器",  color: "bg-amber-500/15 text-amber-400" },
  image:  { label: "图片",    color: "bg-teal-500/15 text-teal-400" },
  waterfall: { label: "贡献拆解", color: "bg-fuchsia-500/15 text-fuchsia-400" },
};

const THEME_LABELS: Record<string, string> = {
  "dark-tech":        "深色科技风",
  "dark-business":    "深色商务风",
  "light-clean":      "浅色简洁风",
  "dark-executive":   "深色行政风",
  "dark-data":        "深色数据风",
};

const INDUSTRY_LABELS: Record<string, string> = {
  energy: "能源",
  industrial: "工业",
  water: "水利",
  transport: "交通",
  port: "港口",
  tourism: "文旅",
  government: "政务",
  agriculture: "农业",
  finance: "金融",
  "sports-culture": "文体",
  campus: "校园",
  park: "园区",
  retail: "零售",
  "ops-maintenance": "运维",
  generic: "通用",
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

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-white/40">主要受众</div>
          <p className="text-sm leading-6 text-white/72">{report.audience}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-white/40">整体目标</div>
          <p className="text-sm leading-6 text-white/72">{report.overallGoal}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">AI 推断的业务上下文</div>
        <p className="text-sm leading-6 text-white/72">
          {report.inferredContext.industryHypothesis}，核心对象是“{report.inferredContext.coreEntity}”，
          业务模式判断为：{report.inferredContext.businessModelGuess}
        </p>
        <div className="mt-2 inline-flex rounded-full bg-[#f97316]/12 px-3 py-1 text-xs font-medium text-[#fbbf24]">
          行业模板: {INDUSTRY_LABELS[report.inferredContext.industryTag] ?? report.inferredContext.industryTag}
        </div>
        <div className="mt-3">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-white/34">默认分析维度</div>
          <div className="flex flex-wrap gap-1.5">
            {report.inferredContext.defaultSlices.map((item) => (
              <span key={item} className="inline-flex rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/58">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-white/34">默认关注问题</div>
          <div className="flex flex-wrap gap-1.5">
            {report.inferredContext.defaultConcerns.map((item) => (
              <span key={item} className="inline-flex rounded-md bg-black/20 px-2 py-0.5 text-[11px] text-white/52">
                {item}
              </span>
            ))}
          </div>
        </div>
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

      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-white/46">
        <span className="rounded-md bg-white/[0.04] px-2 py-1">叙事角色: {page.storyRole}</span>
        <span className="rounded-md bg-white/[0.04] px-2 py-1">核心问题: {page.keyQuestion}</span>
        <span className="rounded-md bg-[#f97316]/10 px-2 py-1 text-[#fbbf24]">分析动作: {page.analysisGoal}</span>
      </div>

      <p className="mb-3 text-xs leading-6 text-white/58">{page.narrative}</p>

      {page.mustInsights?.length > 0 && (
        <div className="mb-3 rounded-lg bg-[#f97316]/8 px-3 py-2">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-[#fbbf24]">必须讲清的洞察</div>
          <div className="space-y-1">
            {page.mustInsights.map((insight) => (
              <p key={insight} className="text-xs leading-5 text-white/68">{insight}</p>
            ))}
          </div>
        </div>
      )}

      {page.analysisAngles?.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-white/34">分析角度</div>
          <div className="flex flex-wrap gap-1.5">
            {page.analysisAngles.map((angle) => (
              <span key={angle} className="inline-flex rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300/80">
                {angle}
              </span>
            ))}
          </div>
        </div>
      )}

      {page.decisionAction ? (
        <div className="mb-3 rounded-lg bg-white/[0.03] px-3 py-2">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-white/34">看完后应采取的动作</div>
          <p className="text-xs leading-5 text-white/62">{page.decisionAction}</p>
        </div>
      ) : null}

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

      {page.primaryData?.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-white/34">主要数据内容</div>
          <div className="flex flex-wrap gap-1.5">
            {page.primaryData.map((item) => (
              <span key={item} className="inline-flex rounded-md bg-black/20 px-2 py-0.5 text-[11px] text-white/52">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {page.filters?.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-white/34">建议筛选维度</div>
          <div className="flex flex-wrap gap-1.5">
            {page.filters.map((item) => (
              <span key={item} className="inline-flex rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300/80">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 建议组件列表 */}
      {page.suggestedWidgets?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {page.suggestedWidgets.map((w) => {
            const meta = WIDGET_TYPE_MAP[w.type] ?? { label: w.type, color: "bg-gray-500/15 text-gray-400" };
            return (
              <span key={`${w.label}-${w.role}`} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${meta.color}`}>
                {meta.label} · {w.analyticRole} · {w.priority}
              </span>
            );
          })}
        </div>
      )}

      {page.suggestedWidgets?.length > 0 && (
        <div className="mb-3 space-y-2">
          {page.suggestedWidgets.map((w) => (
            <div key={`${w.label}-${w.role}-detail`} className="rounded-lg bg-black/20 px-3 py-2">
              <div className="text-xs font-medium text-white/72">{w.label}</div>
              <div className="mt-1 text-[11px] leading-5 text-white/46">{w.dataDescription}</div>
              <div className="mt-1 text-[11px] leading-5 text-white/34">分析角色: {w.analyticRole} · 原因: {w.rationale}</div>
            </div>
          ))}
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
