"use client";

import React from "react";
import type { BoardStory, PagePlanV2, SuggestedWidgetV2 } from "@/lib/board/board-story";

// ============================================================================
// 类型定义
// ============================================================================

interface StoryPreviewProps {
  story: BoardStory | null;
  compact?: boolean;
  onBlockClick?: (blockId: string) => void;
}

// ============================================================================
// 子组件：Widget 卡片
// ============================================================================

interface WidgetCardProps {
  widget: SuggestedWidgetV2;
  onClick?: () => void;
}

function WidgetCard({ widget, onClick }: WidgetCardProps) {
  const priorityColors = {
    high: "border-red-500/30 bg-red-500/5",
    medium: "border-yellow-500/30 bg-yellow-500/5",
    low: "border-blue-500/30 bg-blue-500/5",
  };

  const roleIcons = {
    title: "📌",
    kpi: "📊",
    chart: "📈",
    filter: "🔍",
    annotation: "💬",
    media: "🖼️",
  };

  return (
    <div
      className={`widget-card p-2 rounded border ${priorityColors[widget.priority]} cursor-pointer hover:shadow-sm transition-all`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <span className="text-base shrink-0">{roleIcons[widget.role]}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-foreground truncate">
            {widget.label}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
            {widget.dataDescription}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
              {widget.type}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {widget.analyticRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 子组件：Page 卡片
// ============================================================================

interface PageCardProps {
  page: PagePlanV2;
  index: number;
  onWidgetClick?: (widgetLabel: string) => void;
}

function PageCard({ page, index, onWidgetClick }: PageCardProps) {
  const goalColors = {
    overview: "bg-blue-500/10 border-blue-500/30",
    trend: "bg-green-500/10 border-green-500/30",
    comparison: "bg-purple-500/10 border-purple-500/30",
    composition: "bg-orange-500/10 border-orange-500/30",
    "target-gap": "bg-red-500/10 border-red-500/30",
    ranking: "bg-yellow-500/10 border-yellow-500/30",
    diagnostic: "bg-pink-500/10 border-pink-500/30",
    risk: "bg-red-600/10 border-red-600/30",
  };

  return (
    <div className="page-card border border-border rounded-lg overflow-hidden bg-card">
      {/* 页面头部 */}
      <div className={`p-3 border-b border-border ${goalColors[page.analysisGoal] || "bg-muted/30"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">P{index + 1}</span>
              <h5 className="text-sm font-semibold text-foreground">{page.name}</h5>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{page.purpose}</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/80 text-muted-foreground font-medium shrink-0">
            {page.analysisGoal}
          </span>
        </div>
      </div>

      {/* 页面内容 */}
      <div className="p-3 space-y-3">
        {/* 核心问题 */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            核心问题
          </div>
          <p className="text-xs text-foreground">{page.keyQuestion}</p>
        </div>

        {/* 分析角度 */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            分析角度
          </div>
          <div className="flex flex-wrap gap-1">
            {page.analysisAngles.map((angle, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded bg-muted text-foreground"
              >
                {angle}
              </span>
            ))}
          </div>
        </div>

        {/* 关键洞察 */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            必须讲清的洞察
          </div>
          <ul className="space-y-1">
            {page.mustInsights.map((insight, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                <span className="text-primary shrink-0">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 建议组件 */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            内容模块 ({page.suggestedWidgets.length})
          </div>
          <div className="grid grid-cols-1 gap-2">
            {page.suggestedWidgets.map((widget, i) => (
              <WidgetCard
                key={i}
                widget={widget}
                onClick={() => onWidgetClick?.(widget.label)}
              />
            ))}
          </div>
        </div>

        {/* 决策动作 */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            决策动作
          </div>
          <p className="text-xs text-foreground italic">{page.decisionAction}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 主组件：StoryPreview
// ============================================================================

/**
 * 看板故事预览组件
 *
 * 展示看板的叙事结构，包括：
 * - 整体目标和受众
 * - 页面规划和顺序
 * - 每个页面的分析目标、关键问题、洞察
 * - 建议的内容模块
 */
export function StoryPreview({ story, compact = false, onBlockClick }: StoryPreviewProps) {
  if (!story) {
    return (
      <div className="story-preview-empty flex items-center justify-center p-8 border border-dashed border-border rounded-lg">
        <p className="text-sm text-muted-foreground">等待看板故事设计完成…</p>
      </div>
    );
  }

  return (
    <div className="story-preview space-y-4">
      {/* 整体概览 */}
      {!compact && (
        <div className="p-4 border border-border rounded-lg bg-card">
          <h4 className="text-sm font-semibold mb-3 text-foreground">看板概览</h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">定位：</span>
              <span className="ml-1 text-foreground">{story.summary}</span>
            </div>
            <div>
              <span className="text-muted-foreground">受众：</span>
              <span className="ml-1 text-foreground">{story.audience}</span>
            </div>
            <div>
              <span className="text-muted-foreground">目标：</span>
              <span className="ml-1 text-foreground">{story.overallGoal}</span>
            </div>
            <div>
              <span className="text-muted-foreground">行业：</span>
              <span className="ml-1 font-mono text-foreground">{story.inferredContext.industryTag}</span>
            </div>
            <div>
              <span className="text-muted-foreground">核心对象：</span>
              <span className="ml-1 text-foreground">{story.inferredContext.coreEntity}</span>
            </div>
          </div>

          {/* 数据故事线 */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              叙事逻辑
            </div>
            <p className="text-xs text-foreground leading-relaxed">{story.dataStory}</p>
          </div>

          {/* 视觉建议 */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              视觉建议
            </div>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="px-2 py-1 rounded bg-muted text-foreground">
                {story.visualBrief.tone}
              </span>
              <span className="px-2 py-1 rounded bg-muted text-foreground">
                {story.visualBrief.themeHint}
              </span>
              <span className="px-2 py-1 rounded bg-muted text-foreground">
                {story.visualBrief.densityHint}
              </span>
              <span className="px-2 py-1 rounded bg-muted text-foreground">
                {story.visualBrief.emphasis}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 页面列表 */}
      <div>
        <h4 className="text-sm font-semibold mb-3 text-foreground">
          页面规划 ({story.pages.length} 页)
        </h4>
        <div className="space-y-3">
          {story.pages.map((page, index) => (
            <PageCard
              key={index}
              page={page}
              index={index}
              onWidgetClick={onBlockClick}
            />
          ))}
        </div>
      </div>

      {/* 潜在需求 */}
      {!compact && story.potentialNeeds.length > 0 && (
        <div className="p-4 border border-dashed border-border rounded-lg bg-muted/20">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            💡 潜在需求建议
          </div>
          <ul className="space-y-1">
            {story.potentialNeeds.map((need, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="shrink-0">•</span>
                <span>{need}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default StoryPreview;
