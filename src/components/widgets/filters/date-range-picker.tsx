"use client";

import React, { useState } from "react";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { DateRangePickerProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";

/**
 * 日期范围选择器组件
 */
function DateRangePickerWidget({ config }: WidgetComponentProps<{ type: "DateRangePicker"; props: DateRangePickerProps }>) {
  const props = config.props;
  const [selectedValue, setSelectedValue] = useState(props.defaultValue || "");

  const presets = props.presets || [
    { label: "今天", value: "today" },
    { label: "最近7天", value: "last_7_days" },
    { label: "最近30天", value: "last_30_days" },
    { label: "最近90天", value: "last_90_days" },
  ];

  const handleChange = (value: string) => {
    setSelectedValue(value);
    // TODO: 触发 onChange 回调
  };

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 16px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
      ...props.style,
    }}>
      {props.label && (
        <span style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 12,
        }}>{props.label}:</span>
      )}
      
      <select
        value={selectedValue}
        onChange={(e) => handleChange(e.target.value)}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.9)",
          fontSize: 13,
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="" style={{ background: "#1a1f3a" }}>
          {props.placeholder || "选择时间范围"}
        </option>
        {presets.map((preset) => (
          <option
            key={preset.value}
            value={preset.value}
            style={{ background: "#1a1f3a" }}
          >
            {preset.label}
          </option>
        ))}
      </select>
      
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>📅</span>
    </div>
  );
}

// 注册组件
registerWidget("DateRangePicker", DateRangePickerWidget);

export default DateRangePickerWidget;
