"use client";

import React, { useEffect, useState } from "react";

interface JsxRendererProps {
  code: string;
  onError?: (error: string) => void;
}

/**
 * JSX 渲染器
 * 
 * 渲染 AI 生成的纯视图层 React 组件代码
 * 支持 JSX 语法（通过 Babel 转译）
 */
export function JsxRenderer({ code, onError }: JsxRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBabelLoaded, setIsBabelLoaded] = useState(false);

  // 动态加载 Babel standalone
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // 检查是否已加载
    if ((window as any).Babel) {
      setIsBabelLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@babel/standalone@7.23.5/babel.min.js";
    script.async = true;
    script.onload = () => {
      console.log("[JsxRenderer] Babel loaded");
      setIsBabelLoaded(true);
    };
    script.onerror = () => {
      console.error("[JsxRenderer] Failed to load Babel");
      setError("无法加载 Babel 转译器");
    };
    document.head.appendChild(script);

    return () => {
      // 不移除 script，因为可能被其他组件使用
    };
  }, []);

  useEffect(() => {
    if (!code || !code.trim() || !isBabelLoaded) {
      if (!code || !code.trim()) {
        setComponent(null);
        setError(null);
      }
      return;
    }

    console.log("[JsxRenderer] Rendering code, length:", code.length);

    // 异步加载和执行
    (async () => {
      try {
        const Babel = (window as any).Babel;
        if (!Babel) {
          throw new Error("Babel 未加载");
        }

        // 动态导入 Widget 组件和注册表
        const { Widget } = await import("@/components/widget/widget");
        const { BoardHeroBackdrop, BoardFooterBackdrop, BoardPageBackdrop, BoardPresetIcon } =
          await import("@/components/dv-assets");
        await import("@/components/widgets"); // 自动注册所有组件

        // 1. 移除所有 import 语句
        let cleanCode = code.replace(/^\s*import\s+.*?['"][^'"]+['"]\s*;?\s*$/gm, "");

        // 2. 移除 export default / export
        cleanCode = cleanCode.replace(/export\s+default\s+/g, "");
        cleanCode = cleanCode.replace(/export\s+/g, "");
        
        // 3. 使用 Babel 转译 JSX 到 React.createElement
        const transformed = Babel.transform(cleanCode, {
          presets: ["react"],
          filename: "dashboard.jsx",
        }).code;
        
        console.log("[JsxRenderer] Transformed code:", transformed.substring(0, 300));
        
        // 4. 提取函数名
        const functionMatch = transformed.match(/function\s+(\w+)/);
        if (!functionMatch) {
          throw new Error("无法找到函数定义");
        }
        
        const functionName = functionMatch[1];
        console.log("[JsxRenderer] Function name:", functionName);
        
        // 5. 包装代码并返回组件
        const fullCode = `
          "use strict";
          ${transformed}
          return ${functionName};
        `;
        
        // 6. 使用 Function 构造函数创建组件
        const ComponentFactory = new Function(
          "React",
          "useState", 
          "useEffect", 
          "useMemo", 
          "useCallback", 
          "useRef",
          "Widget",
          "BoardHeroBackdrop",
          "BoardFooterBackdrop",
          "BoardPageBackdrop",
          "BoardPresetIcon",
          fullCode
        );
        
        const GeneratedComponent = ComponentFactory(
          React,
          React.useState,
          React.useEffect,
          React.useMemo,
          React.useCallback,
          React.useRef,
          Widget,
          BoardHeroBackdrop,
          BoardFooterBackdrop,
          BoardPageBackdrop,
          BoardPresetIcon
        );
        
        console.log("[JsxRenderer] Component created:", typeof GeneratedComponent);
        
        setComponent(() => GeneratedComponent);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("[JsxRenderer] Error:", errorMsg, err);
        
        const detailedError = `${errorMsg}\n\n提示：请检查生成的代码格式是否正确。`;
        
        setError(detailedError);
        onError?.(errorMsg);
        setComponent(null);
      }
    })();
  }, [code, onError, isBabelLoaded]);

  if (!isBabelLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>加载 JSX 转译器...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-red-500 text-sm font-semibold mb-2">
          ⚠️ 渲染错误
        </div>
        <pre className="text-xs text-gray-600 bg-gray-100 p-4 rounded max-w-full overflow-auto">
          {error}
        </pre>
        <button
          onClick={() => {
            setError(null);
            setComponent(null);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          重试
        </button>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
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
        <div className="text-red-500 text-sm font-semibold mb-2">
          ⚠️ 组件渲染错误
        </div>
        <div className="text-xs text-gray-600 mb-2">
          {errorMsg}
        </div>
        <details className="text-left w-full max-w-2xl">
          <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-900 mb-2">
            查看详细错误信息
          </summary>
          <pre className="text-xs text-gray-600 bg-gray-100 p-4 rounded overflow-auto max-h-64">
            {errorStack || errorMsg}
          </pre>
        </details>
        <div className="mt-4 text-xs text-gray-500">
          提示：AI 生成的代码可能使用了未定义的变量或函数
        </div>
      </div>
    );
  }
}

export default JsxRenderer;
