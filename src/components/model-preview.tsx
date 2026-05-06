"use client";

import React from "react";
import type { DataAnalysisModel } from "@/lib/board/data-analysis-model";
import { 
  normalizeMetric, 
  normalizeDimension, 
  normalizeComparison, 
  normalizeDecisionPoint, 
  normalizeAlertRule,
  normalizeStringOrArray 
} from "@/lib/board/data-analysis-model";

interface ModelPreviewProps {
  model: Partial<DataAnalysisModel>;
  missingFields?: string[];
}

export function ModelPreview({ model, missingFields = [] }: ModelPreviewProps) {
  const fieldLabels: Record<string, string> = {
    business_objective: "业务目标",
    analysis_type: "分析类型",
    metrics: "指标",
    dimensions: "维度",
    filters: "筛选条件",
    comparisons: "对比方式",
    decision_points: "决策点",
    alert_rules: "预警规则",
  };

  const renderFieldValue = (key: string, value: unknown) => {
    if (!value) return <span className="text-muted-foreground text-sm">未设置</span>;

    // 处理 business_objective 和 analysis_type（可能是字符串或数组）
    if (key === "business_objective" || key === "analysis_type") {
      const normalized = normalizeStringOrArray(value as string | string[] | undefined);
      return <span className="text-sm">{normalized || "未设置"}</span>;
    }

    if (typeof value === "string") {
      return <span className="text-sm">{value}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground text-sm">未设置</span>;
      }

      // 根据字段类型标准化显示
      let normalizedValues = value;
      if (key === "metrics") {
        normalizedValues = value.map(normalizeMetric);
      } else if (key === "dimensions") {
        normalizedValues = value.map(normalizeDimension);
      } else if (key === "comparisons") {
        normalizedValues = value.map(normalizeComparison);
      } else if (key === "decision_points") {
        normalizedValues = value.map(normalizeDecisionPoint);
      } else if (key === "alert_rules") {
        normalizedValues = value.map(normalizeAlertRule);
      }

      return (
        <ul className="space-y-1 text-sm">
          {normalizedValues.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>
                {typeof item === "object" && item !== null
                  ? item.name || item.action || item.description || JSON.stringify(item)
                  : String(item)}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
  };

  const isFieldMissing = (key: string) => missingFields.includes(key);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">当前数据模型</h3>
        {missingFields.length > 0 && (
          <span className="text-xs text-muted-foreground">
            还需完善 {missingFields.length} 个字段
          </span>
        )}
      </div>

      <div className="space-y-3">
        {Object.entries(fieldLabels).map(([key, label]) => {
          const value = model[key as keyof DataAnalysisModel];
          const isMissing = isFieldMissing(key);

          return (
            <div
              key={key}
              className={`rounded-lg border p-3 ${
                isMissing
                  ? "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium">{label}</h4>
                {isMissing && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                    待完善
                  </span>
                )}
              </div>
              {renderFieldValue(key, value)}
            </div>
          );
        })}
      </div>

      {missingFields.length === 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20 p-4 text-center">
          <div className="text-emerald-600 dark:text-emerald-400 font-medium mb-1">
            ✅ 数据模型已完成
          </div>
          <div className="text-xs text-muted-foreground">
            所有必需字段已收集完成，可以开始生成看板
          </div>
        </div>
      )}
    </div>
  );
}
