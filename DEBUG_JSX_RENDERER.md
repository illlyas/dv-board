# JSX 渲染器调试指南

## 问题现象

右侧预览区显示"等待 JSX 代码输入…"，即使 JSX 代码已经生成。

## 调试步骤

### 1. 打开浏览器控制台

按 F12 或右键 -> 检查，打开开发者工具的 Console 标签。

### 2. 查看日志输出

现在代码中已经添加了详细的调试日志，查看以下信息：

#### 日志 A：State 更新
```
[BoardStudioV2] State updated: {
  step: "done",
  hasViSystem: true,
  hasBoardStory: true,
  hasJsxCode: true,
  jsxCodeLength: 1234
}
```

**检查点**：
- `hasJsxCode` 应该是 `true`
- `jsxCodeLength` 应该大于 0

#### 日志 B：传递给渲染器
```
[BoardStudioV2] Rendering JsxRenderer with code: {
  hasCode: true,
  codeLength: 1234,
  first100: "export default function Dashboard() { ..."
}
```

**检查点**：
- `hasCode` 应该是 `true`
- `codeLength` 应该大于 0
- `first100` 应该显示代码的前 100 个字符

#### 日志 C：渲染器接收
```
[JsxRenderer] Code changed: {
  hasCode: true,
  codeLength: 1234,
  trimmedLength: 1234,
  autoRender: true
}
```

**检查点**：
- `hasCode` 应该是 `true`
- `autoRender` 应该是 `true`

#### 日志 D：开始渲染
```
[JsxRenderer] Auto-rendering in 150ms
[JsxRenderer] Starting render
[JsxRenderer] render() called with code length: 1234
[JsxRenderer] First 200 chars: export default function Dashboard() { ...
```

**检查点**：
- 应该看到这些日志
- 如果没有，说明渲染没有被触发

### 3. 常见问题诊断

#### 问题 1：jsxCodeLength 为 0 或 undefined
**原因**：JSX 代码没有正确生成或解析失败  
**解决**：
1. 检查 API 响应是否正确
2. 查看是否有 Zod 验证错误
3. 检查 `normalizeJSXCode` 函数是否正常工作

#### 问题 2：hasJsxCode 为 false
**原因**：State 没有正确更新  
**解决**：
1. 检查 `use-pipeline-v2.ts` 中的 `setState` 调用
2. 确认 Step 3 是否成功完成
3. 查看是否有错误被捕获

#### 问题 3：代码传递到渲染器但没有渲染
**原因**：渲染器内部错误  
**解决**：
1. 查看控制台是否有错误信息
2. 检查代码格式是否正确
3. 查看是否触发了安全检查

#### 问题 4：渲染器显示 "rendering" 但卡住
**原因**：代码执行出错  
**解决**：
1. 查看控制台错误
2. 检查生成的代码是否有语法错误
3. 确认 React API 是否正确注入

## 手动测试

### 测试 1：检查 State
在控制台输入：
```javascript
// 查看当前 state
window.__DEBUG_STATE = true;
```

### 测试 2：手动触发渲染
在控制台输入：
```javascript
// 获取渲染器容器
const container = document.querySelector('[data-render-status]');
if (container && container.__render) {
  container.__render('export default function Test() { return React.createElement("div", null, "Test"); }');
}
```

### 测试 3：简单代码测试
尝试渲染一个最简单的组件：
```javascript
const simpleCode = `
export default function Test() {
  return React.createElement("div", {
    style: { padding: 20, fontSize: 24 }
  }, "Hello World!");
}
`;
```

## 临时解决方案

如果调试发现问题复杂，可以使用以下临时方案：

### 方案 A：直接显示代码
修改 `board-studio-v2.tsx`，暂时只显示代码而不渲染：

```typescript
{jsxResult?.code ? (
  <div className="p-4">
    <h4 className="text-sm font-semibold mb-2">生成的代码：</h4>
    <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-auto text-xs">
      {jsxResult.code}
    </pre>
    <button 
      onClick={() => {
        // 复制代码
        navigator.clipboard.writeText(jsxResult.code);
        alert('代码已复制到剪贴板');
      }}
      className="mt-2 px-4 py-2 bg-primary text-white rounded"
    >
      复制代码
    </button>
  </div>
) : null}
```

### 方案 B：使用 iframe 渲染
创建一个 iframe 来隔离渲染环境：

```typescript
<iframe
  srcDoc={`
    <!DOCTYPE html>
    <html>
    <head>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    </head>
    <body>
      <div id="root"></div>
      <script>
        ${jsxResult.code}
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Dashboard));
      </script>
    </body>
    </html>
  `}
  style={{ width: '100%', height: '600px', border: 'none' }}
/>
```

## 预期的正常流程

```
1. AI 生成 JSX 代码
   ↓
2. normalizeJSXCode() 标准化
   ↓
3. jsxCodeSchema.parse() 验证
   ↓
4. setState({ jsxCode: ... })
   ↓
5. BoardStudioV2 重新渲染
   ↓
6. 传递 jsxResult.code 给 JsxRenderer
   ↓
7. JsxRenderer useEffect 触发
   ↓
8. render() 函数执行
   ↓
9. 检测代码格式
   ↓
10. 移除 export default
   ↓
11. 提取函数名
   ↓
12. 添加函数调用
   ↓
13. new Function() 创建
   ↓
14. 注入 React API
   ↓
15. 执行函数
   ↓
16. 获取 React 元素
   ↓
17. setResult({ status: "success", element })
   ↓
18. 渲染到页面
```

## 需要收集的信息

如果问题仍然存在，请提供以下信息：

1. **控制台日志**：所有 `[BoardStudioV2]` 和 `[JsxRenderer]` 开头的日志
2. **错误信息**：任何红色的错误信息
3. **生成的代码**：`jsxResult.code` 的内容（前 500 个字符）
4. **State 状态**：`state.step` 的值
5. **浏览器信息**：Chrome/Firefox/Safari 版本

## 下一步

1. 启动应用：`npm run dev`
2. 打开浏览器控制台（F12）
3. 输入需求，等待生成
4. 查看控制台日志
5. 根据日志信息定位问题

如果看到错误信息，请将完整的错误堆栈提供给我，我会进一步分析和修复。
