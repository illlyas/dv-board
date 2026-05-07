"use client";

import React, { useState } from "react";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import type { SelectProps } from "@/types/widget.types";
import { registerWidget } from "@/components/widget/registry";

/**
 * 下拉选择器组件
 */
function SelectWidget({ config, data }: WidgetComponentProps<{ type: "Select"; props: SelectProps }>) {
  const props = config.props;
  const [selectedValue, setSelectedValue] = useState<string | number>("");
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>([]);

  // 选项来源：props.options 或 data
  const options = props.options || data || [];

  const handleChange = (value: string) => {
    if (props.multiple) {
      const values = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      setSelectedValues(values);
    } else {
      setSelectedValue(value);
    }
    // TODO: 触发 onChange 回调
  };

  if (props.multiple) {
    // 多选模式
    return (
      <div style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 4,
        padding: "8px 16px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        fontSize: 13,
        minWidth: 200,
        ...props.style,
      }}>
        {props.label && (
          <span style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            marginBottom: 4,
          }}>{props.label}</span>
        )}
        
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {options.map((option: any) => {
            const value = typeof option === "object" ? option.value : option;
            const label = typeof option === "object" ? option.label : option;
            const isSelected = selectedValues.includes(value);
            
            return (
              <label
                key={value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 4,
                  background: isSelected ? "rgba(59,130,246,0.2)" : "transparent",
                  transition: "background 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleChange(String(value))}
                  style={{
                    accentColor: "#3b82f6",
                  }}
                />
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                  {label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  // 单选模式
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
          minWidth: 120,
        }}
      >
        <option value="" style={{ background: "#1a1f3a" }}>
          {props.placeholder || "请选择"}
        </option>
        {options.map((option: any) => {
          const value = typeof option === "object" ? option.value : option;
          const label = typeof option === "object" ? option.label : option;
          
          return (
            <option
              key={value}
              value={value}
              style={{ background: "#1a1f3a" }}
            >
              {label}
            </option>
          );
        })}
      </select>
      
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>🔽</span>
    </div>
  );
}

// 注册组件
registerWidget("Select", SelectWidget);
registerWidget("MultiSelect", SelectWidget);

export default SelectWidget;
