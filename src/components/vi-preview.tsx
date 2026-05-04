"use client";

import React from "react";
import type { VISystem } from "@/lib/board/vi-system";

// ============================================================================
// 类型定义
// ============================================================================

interface ViPreviewProps {
  design: VISystem | null;
  themeMode?: "light" | "dark";
  compact?: boolean;
}

// ============================================================================
// 主组件：ViPreview
// ============================================================================

/**
 * VI 系统预览组件
 *
 * 展示设计的视觉标识系统，包括：
 * - 主题概览
 * - 颜色色板
 * - 排版样式
 * - 组件风格示例
 */
export function ViPreview({ design, themeMode = "light", compact = false }: ViPreviewProps) {
  if (!design) {
    return (
      <div className="vi-preview-empty flex items-center justify-center p-8 border border-dashed border-border rounded-lg">
        <p className="text-sm text-muted-foreground">等待 VI 系统设计完成…</p>
      </div>
    );
  }

  const { themeProfile, colors, typography, spacing, sizing, radius, shadow, componentStyleGuide } = design;

  return (
    <div className="vi-preview space-y-4 p-4 border border-border rounded-lg bg-card">
      {/* 主题概览 */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-foreground">主题概览</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">名称：</span>
            <span className="font-medium">{themeProfile.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">主题：</span>
            <span className="font-medium">{themeProfile.theme}</span>
          </div>
          <div>
            <span className="text-muted-foreground">模式：</span>
            <span className="font-medium">{themeProfile.mode}</span>
          </div>
          <div>
            <span className="text-muted-foreground">气质：</span>
            <span className="font-medium">{themeProfile.tone}</span>
          </div>
          <div>
            <span className="text-muted-foreground">密度：</span>
            <span className="font-medium">{themeProfile.density}</span>
          </div>
        </div>
        {themeProfile.description && (
          <p className="text-xs text-muted-foreground mt-2 italic">{themeProfile.description}</p>
        )}
      </section>

      {/* 颜色系统 */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-foreground">颜色系统</h4>
        
        {/* 基础颜色 */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">基础色</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "背景", value: colors.background },
              { label: "前景", value: colors.foreground },
              { label: "卡片", value: colors.card },
              { label: "主色", value: colors.primary },
              { label: "强调", value: colors.accent },
              { label: "边框", value: colors.border },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded border border-border shrink-0"
                  style={{ backgroundColor: item.value }}
                  title={item.value}
                />
                <div className="text-[10px] leading-tight">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-muted-foreground font-mono">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 语义色 */}
        <div className="space-y-2 mt-3">
          <div className="text-xs font-medium text-muted-foreground">语义色</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "成功", value: colors.success },
              { label: "警告", value: colors.warning },
              { label: "错误", value: colors.error },
              { label: "信息", value: colors.info },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded border border-border shrink-0"
                  style={{ backgroundColor: item.value }}
                  title={item.value}
                />
                <div className="text-[10px] leading-tight">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-muted-foreground font-mono">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 图表色板 */}
        <div className="space-y-2 mt-3">
          <div className="text-xs font-medium text-muted-foreground">图表色板</div>
          <div className="flex flex-wrap gap-1.5">
            {colors.chartPalette.map((color, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded border border-border"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 排版系统 */}
      {!compact && (
        <section>
          <h4 className="text-sm font-semibold mb-2 text-foreground">排版系统</h4>
          <div className="space-y-2">
            <div className="text-xs">
              <span className="text-muted-foreground">展示字体：</span>
              <span className="font-mono text-[10px] ml-1">{typography.fontFamily.display}</span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">正文字体：</span>
              <span className="font-mono text-[10px] ml-1">{typography.fontFamily.body}</span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">等宽字体：</span>
              <span className="font-mono text-[10px] ml-1">{typography.fontFamily.mono}</span>
            </div>
            
            {/* 字号示例 */}
            <div className="mt-2 space-y-1">
              <div style={{ fontSize: typography.fontSize.hero, fontWeight: typography.fontWeight.bold }}>
                Hero 标题 {typography.fontSize.hero}px
              </div>
              <div style={{ fontSize: typography.fontSize.h1, fontWeight: typography.fontWeight.semibold }}>
                H1 标题 {typography.fontSize.h1}px
              </div>
              <div style={{ fontSize: typography.fontSize.h2 }}>
                H2 标题 {typography.fontSize.h2}px
              </div>
              <div style={{ fontSize: typography.fontSize.body }}>
                正文 {typography.fontSize.body}px
              </div>
              <div style={{ fontSize: typography.fontSize.small }} className="text-muted-foreground">
                小字 {typography.fontSize.small}px
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 组件风格速查 */}
      {!compact && (
        <section>
          <h4 className="text-sm font-semibold mb-2 text-foreground">组件风格</h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">KPI 卡片：</span>
              <span className="ml-1">{componentStyleGuide.kpiCard.valueFontSize} / {componentStyleGuide.kpiCard.valueColor}</span>
            </div>
            <div>
              <span className="text-muted-foreground">图表面板：</span>
              <span className="ml-1">{componentStyleGuide.chartPanel.bg} / {componentStyleGuide.chartPanel.border}</span>
            </div>
            <div>
              <span className="text-muted-foreground">卡片圆角：</span>
              <span className="ml-1">{componentStyleGuide.cardPanel.radius}</span>
            </div>
            <div>
              <span className="text-muted-foreground">卡片阴影：</span>
              <span className="ml-1 font-mono text-[10px]">{componentStyleGuide.cardPanel.shadow}</span>
            </div>
          </div>
        </section>
      )}

      {/* 画布尺寸 */}
      <section>
        <h4 className="text-sm font-semibold mb-2 text-foreground">画布规格</h4>
        <div className="text-xs space-y-1">
          <div>
            <span className="text-muted-foreground">画布：</span>
            <span className="font-mono ml-1">{sizing.canvasWidth} × {sizing.canvasHeight}</span>
          </div>
          <div>
            <span className="text-muted-foreground">顶栏高度：</span>
            <span className="font-mono ml-1">{sizing.headerHeight}px</span>
          </div>
          <div>
            <span className="text-muted-foreground">底栏高度：</span>
            <span className="font-mono ml-1">{sizing.footerHeight}px</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ViPreview;
