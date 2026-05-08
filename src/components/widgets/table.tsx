"use client";

import React, { useState, useMemo } from "react";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { TableProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";

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
    titleColor: props.titleColor || "var(--color-text-primary, rgba(17,24,39,0.9))",
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

  return (
    <div style={{
      width: "100%",
      height: "100%",
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
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: defaultColors.titleColor,
            marginBottom: 4,
          }}>{props.title}</div>
          {props.subtitle && (
            <div style={{
              fontSize: 12,
              color: defaultColors.subtitleColor,
            }}>{props.subtitle}</div>
          )}
        </div>
      )}

      {/* 表格容器 */}
      <div style={{
        flex: 1,
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
                      {formatValue(row[column.field], column)}
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
