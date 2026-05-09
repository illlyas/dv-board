"use client";

import React, { useState, useMemo } from "react";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { TableProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";
import { ChartLabelBackdrop } from "@/components/dv-assets";
import { DV_CHART_TITLE } from "@/lib/dv-chart-tokens";

/**
 * 表格组件
 */
function TableWidget({ config, data, loading }: WidgetComponentProps<{ type: "Table"; props: TableProps }>) {
  const props = config.props;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 排序数据
  const sortedData = useMemo(() => {
    if (!data || !sortColumn) return data || [];
    
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === "asc" 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortColumn, sortOrder]);

  // 分页数据
  const pageSize = props.pageSize || 10;
  const totalPages = Math.ceil((sortedData?.length || 0) / pageSize);
  const paginatedData = useMemo(() => {
    if (!props.pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, props.pagination]);

  // 处理排序
  const handleSort = (column: string) => {
    if (!props.columns.find(col => col.field === column)?.sortable) return;
    
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // 格式化值
  const formatValue = (value: any, column: any) => {
    if (value === null || value === undefined) return "-";
    
    if (column.format === "number") {
      return Number(value).toLocaleString();
    }
    if (column.format === "currency") {
      return `¥${Number(value).toLocaleString()}`;
    }
    if (column.format === "percentage") {
      return `${Number(value).toFixed(1)}%`;
    }
    if (column.format === "date") {
      return new Date(value).toLocaleDateString("zh-CN");
    }
    if (column.format === "datetime") {
      return new Date(value).toLocaleString("zh-CN");
    }
    
    return String(value) + (column.unit || "");
  };

  // 默认色值全部走 CSS 变量，自动匹配 light / dark；AI 可通过 props 覆盖
  const defaultColors = {
    background: props.backgroundColor || "var(--color-surface, transparent)",
    titleColor:
      props.titleColor ??
      (props.titleBackdrop ? DV_CHART_TITLE.colorBackdrop : "var(--color-text-primary, rgba(17,24,39,0.9))"),
    subtitleColor: props.subtitleColor || "var(--color-text-muted, rgba(17,24,39,0.5))",
    borderColor: props.borderColor || "var(--color-border, rgba(17,24,39,0.1))",
    headerBg: props.headerBackgroundColor || "var(--color-surface-2, rgba(17,24,39,0.04))",
    headerText: props.headerTextColor || "var(--color-text-secondary, rgba(17,24,39,0.75))",
    rowBg: props.rowBackgroundColor || "transparent",
    rowText: props.rowTextColor || "var(--color-text-primary, rgba(17,24,39,0.85))",
    stripedBg: props.stripedColor || "var(--color-surface-2, rgba(17,24,39,0.03))",
    hoverBg: props.hoverBackgroundColor || "var(--color-surface-hover, rgba(59,130,246,0.06))",
    emptyText: "var(--color-text-muted, rgba(17,24,39,0.5))",
    paginationText: "var(--color-text-secondary, rgba(17,24,39,0.7))",
    paginationBtnBg: "var(--color-surface-2, rgba(17,24,39,0.04))",
    paginationBtnBorder: "var(--color-border, rgba(17,24,39,0.12))",
  };

  const tagVariantStyles: Record<
    string,
    { bg: string; color: string; border: string }
  > = {
    default: {
      bg: "color-mix(in srgb, var(--color-text-primary, #111827) 8%, transparent)",
      color: "var(--color-text-secondary, rgba(17,24,39,0.75))",
      border: "1px solid var(--color-border, rgba(17,24,39,0.12))",
    },
    success: {
      bg: "color-mix(in srgb, var(--color-success, #16a34a) 18%, transparent)",
      color: "var(--color-success, #16a34a)",
      border: "1px solid color-mix(in srgb, var(--color-success, #16a34a) 35%, transparent)",
    },
    warning: {
      bg: "color-mix(in srgb, var(--color-warning, #d97706) 18%, transparent)",
      color: "var(--color-warning, #b45309)",
      border: "1px solid color-mix(in srgb, var(--color-warning, #d97706) 35%, transparent)",
    },
    danger: {
      bg: "color-mix(in srgb, var(--color-destructive, #dc2626) 16%, transparent)",
      color: "var(--color-destructive, #dc2626)",
      border: "1px solid color-mix(in srgb, var(--color-destructive, #dc2626) 32%, transparent)",
    },
    info: {
      bg: "color-mix(in srgb, var(--color-primary, #3b82f6) 16%, transparent)",
      color: "var(--color-primary, #2563eb)",
      border: "1px solid color-mix(in srgb, var(--color-primary, #3b82f6) 32%, transparent)",
    },
  };

  const renderCell = (row: any, column: (typeof props.columns)[number]) => {
    const value = row[column.field];
    const cellType = column.cellType ?? "text";

    if (cellType === "tag") {
      if (value === null || value === undefined) {
        return <span style={{ color: defaultColors.emptyText }}>-</span>;
      }
      const key = String(value);
      const variant = column.tagVariantMap?.[key] ?? "default";
      const s = tagVariantStyles[variant] ?? tagVariantStyles.default;
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            maxWidth: "100%",
            padding: "2px 10px",
            borderRadius: 9999,
            fontSize: props.size === "small" ? 11 : 12,
            fontWeight: 600,
            lineHeight: 1.35,
            whiteSpace: "nowrap",
            background: s.bg,
            color: s.color,
            border: s.border,
            boxSizing: "border-box",
          }}
        >
          {key}
        </span>
      );
    }

    if (cellType === "progress") {
      const max = column.progressMax ?? 100;
      const n = Number(value);
      const safe = Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
      const pct = max > 0 ? (safe / max) * 100 : 0;
      const show = column.progressShowLabel !== false;
      const barColor =
        pct >= 85
          ? "var(--chart-1, #3b82f6)"
          : pct >= 50
            ? "var(--chart-2, #8b5cf6)"
            : "var(--chart-3, #06b6d4)";
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: column.align === "right" ? "flex-end" : column.align === "center" ? "center" : "flex-start",
            gap: 10,
            minWidth: 72,
            width: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 48,
              maxWidth: 140,
              height: 8,
              borderRadius: 9999,
              background: "color-mix(in srgb, var(--color-text-primary, #111827) 8%, transparent)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                borderRadius: 9999,
                background: barColor,
                transition: "width 0.25s ease",
              }}
            />
          </div>
          {show && (
            <span
              style={{
                flexShrink: 0,
                fontSize: props.size === "small" ? 11 : 12,
                fontVariantNumeric: "tabular-nums",
                color: defaultColors.rowText,
                opacity: 0.9,
              }}
            >
              {column.format === "percentage" || column.unit === "%"
                ? `${safe.toFixed(0)}%`
                : `${safe}${column.unit || ""}`}
            </span>
          )}
        </div>
      );
    }

    return formatValue(value, column);
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      minHeight: 0,
      background: defaultColors.background,
      backdropFilter: "blur(10px)",
      border: `1px solid ${defaultColors.borderColor}`,
      borderRadius: 16,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      ...props.style,
    }}>
      {/* 标题 */}
      {props.title && (
        <div
          style={{
            marginBottom: DV_CHART_TITLE.blockMarginBottom,
            ...(props.titleBackdrop
              ? {
                  position: "relative",
                  padding: DV_CHART_TITLE.backdropPadding,
                  overflow: "hidden",
                }
              : {}),
          }}
        >
          {props.titleBackdrop && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
              }}
            >
              <ChartLabelBackdrop style={{ width: "100%", height: "100%", display: "block" }} />
            </div>
          )}
          <div style={props.titleBackdrop ? { position: "relative", zIndex: 1 } : undefined}>
            <div
              style={{
                ...(props.titleBackdrop
                  ? {
                      fontSize: DV_CHART_TITLE.fontSize,
                      fontWeight: DV_CHART_TITLE.fontWeight,
                      lineHeight: DV_CHART_TITLE.lineHeight,
                      fontFamily: DV_CHART_TITLE.fontFamily,
                    }
                  : {
                      fontSize: DV_CHART_TITLE.fontSizeCompact,
                      fontWeight: DV_CHART_TITLE.fontWeightCompact,
                      fontFamily: DV_CHART_TITLE.fontFamily,
                    }),
                color: defaultColors.titleColor,
                marginBottom: props.subtitle ? DV_CHART_TITLE.gapAfterTitle : 0,
              }}
            >
              {props.title}
            </div>
            {props.subtitle && (
              <div
                style={{
                  fontSize: DV_CHART_TITLE.subtitleFontSize,
                  fontFamily: DV_CHART_TITLE.fontFamily,
                  color: defaultColors.subtitleColor,
                }}
              >
                {props.subtitle}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 表格容器 */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        borderRadius: 8,
        border: props.bordered ? `1px solid ${defaultColors.borderColor}` : "none",
      }}>
        {loading ? (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: defaultColors.emptyText,
          }}>
            加载中...
          </div>
        ) : !paginatedData || paginatedData.length === 0 ? (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: defaultColors.emptyText,
          }}>
            暂无数据
          </div>
        ) : (
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: props.size === "small" ? 12 : props.size === "large" ? 14 : 13,
          }}>
            <thead>
              <tr style={{
                background: defaultColors.headerBg,
                borderBottom: `1px solid ${defaultColors.borderColor}`,
              }}>
                {props.showIndex && (
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    color: defaultColors.headerText,
                    fontWeight: 600,
                    width: 60,
                  }}>#</th>
                )}
                {props.columns.map((column) => (
                  <th
                    key={column.field}
                    onClick={() => handleSort(column.field)}
                    style={{
                      padding: "12px 16px",
                      textAlign: column.align || "left",
                      color: defaultColors.headerText,
                      fontWeight: 600,
                      width: column.width,
                      cursor: column.sortable ? "pointer" : "default",
                      userSelect: "none",
                      position: column.fixed ? "sticky" : "relative",
                      left: column.fixed === "left" ? 0 : undefined,
                      right: column.fixed === "right" ? 0 : undefined,
                      background: column.fixed ? defaultColors.headerBg : undefined,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: column.align === "center" ? "center" : column.align === "right" ? "flex-end" : "flex-start" }}>
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.field && (
                        <span style={{ fontSize: 10 }}>
                          {sortOrder === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row: any, rowIndex: number) => (
                <tr
                  key={rowIndex}
                  style={{
                    borderBottom: `1px solid ${defaultColors.borderColor}`,
                    background: props.striped && rowIndex % 2 === 1 
                      ? defaultColors.stripedBg
                      : defaultColors.rowBg,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = defaultColors.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = props.striped && rowIndex % 2 === 1 
                      ? defaultColors.stripedBg
                      : defaultColors.rowBg;
                  }}
                >
                  {props.showIndex && (
                    <td style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      color: defaultColors.subtitleColor,
                    }}>
                      {(currentPage - 1) * pageSize + rowIndex + 1}
                    </td>
                  )}
                  {props.columns.map((column) => (
                    <td
                      key={column.field}
                      style={{
                        padding: "12px 16px",
                        textAlign: column.align || "left",
                        color: defaultColors.rowText,
                        position: column.fixed ? "sticky" : "relative",
                        left: column.fixed === "left" ? 0 : undefined,
                        right: column.fixed === "right" ? 0 : undefined,
                        background: column.fixed 
                          ? (props.striped && rowIndex % 2 === 1 
                            ? defaultColors.stripedBg
                            : defaultColors.rowBg)
                          : undefined,
                      }}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      {props.pagination && totalPages > 1 && (
        <div style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
          color: defaultColors.paginationText,
        }}>
          <div>
            共 {sortedData.length} 条数据
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "4px 12px",
                background: defaultColors.paginationBtnBg,
                border: `1px solid ${defaultColors.paginationBtnBorder}`,
                borderRadius: 4,
                color: defaultColors.paginationText,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              上一页
            </button>
            <span style={{ padding: "4px 12px" }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "4px 12px",
                background: defaultColors.paginationBtnBg,
                border: `1px solid ${defaultColors.paginationBtnBorder}`,
                borderRadius: 4,
                color: defaultColors.paginationText,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 注册组件
registerWidget("Table", TableWidget);

export default TableWidget;
