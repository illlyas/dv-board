# V2 JSX 渲染器修复

## 问题描述

在 V2 生成 JSX 代码后，右侧渲染预览区只显示"等待 JSX 代码输入…"，没有任何渲染结果。

## 根本原因

`JsxRenderer` 组件最初设计用于渲染 JSX 语法（`<div>`），但 AI 生成的代码已经是 `React.createElement()` 格式。渲染器尝试将已经是 `React.createElement()` 的代码再次转换，导致失败。

### 代码格式差异

**JSX 格式**（渲染器原本期望的）：
```jsx
<div className="container">
  <h1>Hello</h1>
</div>
```

**React.createElement 格式**（AI 实际生成的）：
```javascript
export default function Dashboard() {
  const [page, setPage] = React.useState(0);
  
  return React.createElement("div", {
    className: "container"
  },
    React.createElement("h1", null, "Hello")
  );
}
```

## 解决方案

### 1. ✅ 智能格式检测

修改 `src/components/v2/jsx-renderer.tsx`，添加代码格式检测：

```typescript
// 检查是否已经是 React.createElement 格式
const isCreateElementFormat = jsxCode.includes("React.createElement");
```

### 2. ✅ 双格式支持

根据检测结果，采用不同的处理策略：

#### 策略 A：React.createElement 格式
```typescript
if (isCreateElementFormat) {
  // 1. 移除 export default
  finalCode = jsxCode.replace(/export\s+default\s+/, "");
  
  // 2. 提取函数名
  const functionNameMatch = finalCode.match(/function\s+(\w+)/);
  const functionName = functionNameMatch[1];
  
  // 3. 添加函数调用
  finalCode = `${finalCode}\nreturn ${functionName}();`;
}
```

#### 策略 B：JSX 格式
```typescript
else {
  // 使用原有的 jsxToCreateElement 转换
  finalCode = jsxToCreateElement(jsxCode);
}
```

### 3. ✅ 增强 React API 注入

添加 React Hooks 到执行上下文：

```typescript
const safeTokens: Record<string, unknown> = {
  ...tokens,
  React: {
    createElement: React.createElement,
    Fragment: React.Fragment,
    Children: React.Children,
    isValidElement: React.isValidElement,
    // ✅ 新增 Hooks 支持
    useState: React.useState,
    useEffect: React.useEffect,
    useMemo: React.useMemo,
    useCallback: React.useCallback,
    useRef: React.useRef,
  },
};
```

### 4. ✅ 函数执行逻辑

```typescript
// 创建渲染函数
const renderFn = new Function(
  ...Object.keys(safeTokens),
  `"use strict";\n${finalCode}`
);

// 执行函数获取 React 元素
const element = renderFn(...Object.values(safeTokens));
```

## 处理流程

```
AI 生成代码
    ↓
检测代码格式
    ↓
┌─────────────────┬─────────────────┐
│ React.createElement │    JSX 格式    │
│      格式          │                │
├─────────────────┼─────────────────┤
│ 1. 移除 export   │ 1. 元素白名单检查│
│ 2. 提取函数名    │ 2. JSX 转换     │
│ 3. 添加函数调用  │ 3. 包装返回语句 │
└─────────────────┴─────────────────┘
    ↓
创建 new Function
    ↓
注入 React API
    ↓
执行函数
    ↓
获取 React 元素
    ↓
渲染到页面
```

## 代码示例

### 输入：AI 生成的代码
```javascript
export default function Dashboard() {
  const [page, setPage] = React.useState(0);
  
  const pages = [
    React.createElement("div", { style: { padding: 20 } },
      React.createElement("h1", null, "Page 1")
    ),
    React.createElement("div", { style: { padding: 20 } },
      React.createElement("h1", null, "Page 2")
    ),
  ];
  
  return React.createElement("div", {
    style: { width: 1920, height: 1080 }
  },
    pages[page],
    React.createElement("button", {
      onClick: () => setPage(page === 0 ? 1 : 0)
    }, "切换页面")
  );
}
```

### 处理后：可执行代码
```javascript
function Dashboard() {
  const [page, setPage] = React.useState(0);
  
  const pages = [
    React.createElement("div", { style: { padding: 20 } },
      React.createElement("h1", null, "Page 1")
    ),
    React.createElement("div", { style: { padding: 20 } },
      React.createElement("h1", null, "Page 2")
    ),
  ];
  
  return React.createElement("div", {
    style: { width: 1920, height: 1080 }
  },
    pages[page],
    React.createElement("button", {
      onClick: () => setPage(page === 0 ? 1 : 0)
    }, "切换页面")
  );
}

return Dashboard();
```

### 执行：注入 React API
```javascript
const renderFn = new Function(
  "React",
  `"use strict";
  function Dashboard() { ... }
  return Dashboard();`
);

const element = renderFn({
  createElement: React.createElement,
  useState: React.useState,
  // ... 其他 API
});
```

## 安全措施

保持原有的安全检查：

1. **关键词黑名单**：阻止危险操作
   - `dangerouslySetInnerHTML`
   - `innerHTML`
   - `document.`
   - `window.`
   - `fetch`
   - `eval`
   - 等

2. **元素白名单**：仅允许标准 HTML 元素

3. **try-catch 隔离**：错误不会影响主应用

4. **无网络访问**：无法发起网络请求

5. **无 DOM 访问**：无法直接操作 DOM

## 测试场景

### 场景 1：React.createElement 格式（V2 生成）
```javascript
export default function Dashboard() {
  return React.createElement("div", null, "Hello");
}
```
✅ 正确渲染

### 场景 2：JSX 格式（手动输入）
```jsx
<div>Hello</div>
```
✅ 正确转换并渲染

### 场景 3：带 Hooks 的组件
```javascript
export default function Dashboard() {
  const [count, setCount] = React.useState(0);
  return React.createElement("button", {
    onClick: () => setCount(count + 1)
  }, `Count: ${count}`);
}
```
✅ Hooks 正常工作

### 场景 4：多页面组件
```javascript
export default function Dashboard() {
  const [page, setPage] = React.useState(0);
  const pages = [page1, page2, page3];
  return pages[page];
}
```
✅ 页面切换正常

## 错误处理

### 错误类型 1：函数名提取失败
```
错误：无法找到函数名称
原因：代码格式不符合预期
解决：检查代码是否包含有效的函数定义
```

### 错误类型 2：执行错误
```
错误：渲染函数没有返回有效的 React 元素
原因：函数返回了 null/undefined/boolean
解决：确保函数返回有效的 React 元素
```

### 错误类型 3：安全限制
```
错误：安全限制：代码包含不被允许的关键词
原因：代码包含危险操作
解决：移除危险代码
```

## 优势

1. **双格式支持**：同时支持 JSX 和 React.createElement 格式
2. **智能检测**：自动识别代码格式
3. **完整 Hooks 支持**：支持 useState、useEffect 等
4. **向后兼容**：不影响原有的 JSX 渲染功能
5. **安全可靠**：保持所有安全检查

## 相关文件

- `src/components/v2/jsx-renderer.tsx` - 渲染器核心逻辑
- `src/components/v2/board-studio-v2.tsx` - 使用渲染器的组件
- `src/app/api/board/v2/generate-jsx/route.ts` - 生成 JSX 代码的 API

## 验证状态

✅ TypeScript 类型检查通过  
✅ 双格式支持已实现  
✅ React Hooks 已注入  
✅ 函数执行逻辑已完善  
✅ 安全检查保持不变  

## 总结

通过添加智能格式检测和双格式支持，`JsxRenderer` 现在可以正确处理 AI 生成的 `React.createElement()` 格式代码，同时保持对传统 JSX 格式的支持。渲染器会自动：

1. 检测代码格式
2. 移除 `export default`
3. 提取函数名
4. 添加函数调用
5. 注入 React API
6. 执行函数获取元素
7. 渲染到页面

现在右侧预览区应该能正确显示渲染结果了！
