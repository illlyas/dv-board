"use client";

import React, { useEffect, useState, useRef } from "react";
import * as echarts from "echarts";

interface JsxRendererProps {
  code: string;
  onError?: (error: string) => void;
}

/**
 * ECharts 图表组件包装器
 * 用于在 AI 生成的代码中渲染 ECharts 图表
 */
function EChartsWrapper({ option, style }: { option: any; style?: React.CSSProperties }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || !option) return;

    // 初始化或获取图表实例
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    // 设置图表配置
    chartInstanceRef.current.setOption(option, true);

    // 清理函数
    return () => {
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, [option]);

  // 窗口大小变化时重新调整图表大小
  useEffect(() => {
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "100%", ...style }} />;
}

/**
 * JSX 渲染器
 * 
 * 使用更直接的方式渲染 AI 生成的 React 组件代码
 * 提供必要的全局依赖（React Hooks, ECharts 等）
 */
export function JsxRenderer({ code, onError }: JsxRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !code.trim()) {
      setComponent(null);
      setError(null);
      return;
    }

    console.log("[JsxRenderer] Rendering code, length:", code.length);

    try {
      // 1. 移除所有 import 语句（new Function 不支持 ES module 语法）
      let cleanCode = code.replace(/^\s*import\s+.*?['"][^'"]+['"]\s*;?\s*$/gm, "");

      // 2. 移除 export default / export
      cleanCode = cleanCode.replace(/export\s+default\s+/g, "");
      cleanCode = cleanCode.replace(/export\s+/g, "");
      
      // 提取函数名
      const functionMatch = cleanCode.match(/function\s+(\w+)/);
      if (!functionMatch) {
        throw new Error("无法找到函数定义");
      }
      
      const functionName = functionMatch[1];
      console.log("[JsxRenderer] Function name:", functionName);
      
      // 使用 IIFE 包装代码，避免语法错误
      // 将整个代码包装在一个立即执行函数中
      const fullCode = `
        "use strict";
        ${cleanCode}
        return ${functionName};
      `;
      
      console.log("[JsxRenderer] Full code:", fullCode.substring(0, 200));
      
      // 使用 Function 构造函数创建组件，注入所有依赖
      // 注意：这里使用 'return' 语句来返回函数
      const ComponentFactory = new Function(
        "React",
        "useState", 
        "useEffect", 
        "useMemo", 
        "useCallback", 
        "useRef",
        "echarts",
        "EChartsWrapper",
        fullCode
      );
      
      const GeneratedComponent = ComponentFactory(
        React,
        React.useState,
        React.useEffect,
        React.useMemo,
        React.useCallback,
        React.useRef,
        echarts,
        EChartsWrapper
      );
      
      console.log("[JsxRenderer] Component created:", typeof GeneratedComponent);
      
      setComponent(() => GeneratedComponent);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[JsxRenderer] Error:", errorMsg, err);
      
      // 提供更详细的错误信息
      const detailedError = `${errorMsg}\n\n提示：请检查生成的代码格式是否正确。\n常见问题：\n- 确保使用 React.createElement() 而不是 JSX 语法\n- 确保所有对象字面量都正确闭合\n- 确保没有使用未定义的变量`;
      
      setError(detailedError);
      onError?.(errorMsg);
      setComponent(null);
    }
  }, [code, onError]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-destructive text-sm font-semibold mb-2">
          ⚠️ 渲染错误
        </div>
        <pre className="text-xs text-muted-foreground bg-muted p-4 rounded max-w-full overflow-auto">
          {error}
        </pre>
        <button
          onClick={() => {
            setError(null);
            setComponent(null);
          }}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
        >
          重试
        </button>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        等待代码加载...
      </div>
    );
  }

  try {
    return <Component />;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : "";
    console.error("[JsxRenderer] Render error:", errorMsg, err);
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-destructive text-sm font-semibold mb-2">
          ⚠️ 组件渲染错误
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          {errorMsg}
        </div>
        <details className="text-left w-full max-w-2xl">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground mb-2">
            查看详细错误信息
          </summary>
          <pre className="text-xs text-muted-foreground bg-muted p-4 rounded overflow-auto max-h-64">
            {errorStack || errorMsg}
          </pre>
        </details>
        <div className="mt-4 text-xs text-muted-foreground">
          提示：AI 生成的代码可能使用了未定义的变量或函数
        </div>
      </div>
    );
  }
}

export default JsxRenderer;
