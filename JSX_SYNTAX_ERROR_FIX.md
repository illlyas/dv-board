# JSX 语法错误修复

## 问题描述

AI 生成的代码在渲染时报错：
```
SyntaxError: Invalid or unexpected token
```

错误代码示例：
```javascript
const viSystem = {colors: {background: '#0b131e', ...}};

function Dashboard() {
  // ...
}
```

## 根本原因

`new Function()` 构造函数会将传入的代码作为函数体执行。当代码中包含在函数外部定义的变量时，会导致语法错误。

### 为什么会出错？

```javascript
// ❌ 错误：在函数外部定义变量
const viSystem = {...};
function Dashboard() { ... }

// 使用 new Function() 时，相当于：
new Function("React", ..., `
  const viSystem = {...};  // ← 这里会被解析为代码块，而不是对象字面量
  function Dashboard() { ... }
  return Dashboard;
`);
```

在 JavaScript 中，`{` 可以是：
1. 对象字面量的开始
2. 代码块的开始

在 `new Function()` 的上下文中，`const viSystem = {` 中的 `{` 会被解析为代码块，导致语法错误。

## 解决方案

### 1. 更新 API Prompt

**文件**: `src/app/api/board/generate-jsx/route.ts`

添加了明确的代码格式要求：

```typescript
⚠️ 代码格式要求：
- 所有代码必须在 function 内部
- 不要在 function 外部定义 const、let、var
- 不要在 function 外部定义对象字面量
- 确保代码可以直接通过 new Function() 执行
```

### 2. 提供正确的代码模板

**正确的格式**：

```javascript
export default function Dashboard() {
  // ✅ 所有变量在函数内部定义
  const viSystem = {
    colors: {
      background: '#0b131e',
      foreground: '#e2e8f0',
      // ...
    }
  };
  
  const [page, setPage] = useState(0);
  
  const salesData = [120, 200, 150, 180, 220, 250];
  
  // ... 其他代码
  
  return React.createElement("div", { ... });
}
```

**错误的格式**：

```javascript
// ❌ 错误：在函数外部定义
const viSystem = { ... };
const salesData = [ ... ];

export default function Dashboard() {
  // 使用上面定义的变量
  return React.createElement("div", { ... });
}
```

### 3. 改进错误提示

**文件**: `src/components/jsx-renderer.tsx`

添加了更详细的错误信息：

```typescript
const detailedError = `${errorMsg}

提示：请检查生成的代码格式是否正确。
常见问题：
- 确保使用 React.createElement() 而不是 JSX 语法
- 确保所有对象字面量都正确闭合
- 确保没有使用未定义的变量`;
```

## 代码示例

### 完整的正确示例

```javascript
export default function Dashboard() {
  // 1. 使用 React Hooks
  const [page, setPage] = useState(0);
  
  // 2. 定义数据
  const salesData = {
    gmv: [120, 200, 150, 180, 220, 250],
    categories: ['1月', '2月', '3月', '4月', '5月', '6月']
  };
  
  // 3. 定义 VI 系统（如果需要）
  const colors = {
    background: '#0b131e',
    foreground: '#e2e8f0',
    primary: '#3b82f6'
  };
  
  // 4. 定义图表配置
  const chartOption = {
    title: { text: 'GMV 趋势' },
    xAxis: {
      type: 'category',
      data: salesData.categories
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type: 'line',
      data: salesData.gmv,
      smooth: true
    }]
  };
  
  // 5. 渲染函数
  function renderPage0() {
    return React.createElement("div", {
      style: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
        color: colors.foreground,
        padding: 20
      }
    },
      React.createElement("h1", {
        style: { fontSize: 32, marginBottom: 20 }
      }, "销售数据看板"),
      
      React.createElement(EChartsWrapper, {
        option: chartOption,
        style: { width: 800, height: 400 }
      })
    );
  }
  
  // 6. 返回主容器
  return React.createElement("div", {
    style: {
      width: 1920,
      height: 1080,
      backgroundColor: colors.background,
      position: "relative",
      overflow: "hidden"
    }
  },
    renderPage0(),
    
    // 页码指示器
    React.createElement("div", {
      style: {
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)"
      }
    }, "Page 1")
  );
}
```

## 验证方法

### 1. 检查生成的代码

查看左侧的代码预览，确认：
- [ ] 没有在 `function Dashboard()` 外部定义变量
- [ ] 所有 `const`、`let`、`var` 都在函数内部
- [ ] 所有对象字面量都在函数内部

### 2. 查看错误信息

如果仍然出错，查看浏览器控制台：
```
[JsxRenderer] Full code: ...
[JsxRenderer] Error: Invalid or unexpected token
```

检查 "Full code" 的前 200 个字符，看是否有函数外部的定义。

### 3. 手动测试

可以将生成的代码复制到浏览器控制台测试：

```javascript
// 测试代码是否可以通过 new Function() 执行
const testCode = `
  function Dashboard() {
    const data = [1, 2, 3];
    return React.createElement("div", null, "Test");
  }
  return Dashboard;
`;

try {
  const fn = new Function("React", testCode);
  const Component = fn(React);
  console.log("✅ 代码格式正确");
} catch (err) {
  console.error("❌ 代码格式错误:", err.message);
}
```

## 如果问题仍然存在

### 临时解决方案

如果 AI 仍然生成错误格式的代码，可以：

1. **点击"重试"按钮**重新生成
2. **修改输入需求**，使其更简单
3. **查看生成的代码**，手动检查格式

### 报告问题

如果问题持续出现，请提供：
1. 输入的需求描述
2. 生成的完整代码（前 500 行）
3. 浏览器控制台的完整错误信息
4. `[JsxRenderer] Full code:` 日志的内容

## 技术细节

### new Function() 的工作原理

```javascript
// 语法
new Function(arg1, arg2, ..., functionBody)

// 示例
const add = new Function('a', 'b', 'return a + b');
console.log(add(2, 3)); // 5

// 相当于
function add(a, b) {
  return a + b;
}
```

### 为什么不能在外部定义变量？

```javascript
// ❌ 这样会失败
const ComponentFactory = new Function("React", `
  const data = [1, 2, 3];  // ← 这里的 { 会被解析为代码块
  function Dashboard() { ... }
  return Dashboard;
`);

// ✅ 这样才正确
const ComponentFactory = new Function("React", `
  function Dashboard() {
    const data = [1, 2, 3];  // ← 在函数内部定义
    // ...
  }
  return Dashboard;
`);
```

## 最佳实践

### 1. 所有数据在函数内部

```javascript
function Dashboard() {
  // ✅ 数据定义
  const kpiData = {
    sales: 1000000,
    orders: 5000,
    conversion: 0.15
  };
  
  // ✅ 使用数据
  return React.createElement("div", null,
    React.createElement("span", null, `销售额: ${kpiData.sales}`)
  );
}
```

### 2. 使用 useMemo 优化性能

```javascript
function Dashboard() {
  const chartOption = useMemo(() => ({
    title: { text: '销售趋势' },
    // ... 其他配置
  }), []); // 只创建一次
  
  return React.createElement(EChartsWrapper, {
    option: chartOption,
    style: { width: 800, height: 400 }
  });
}
```

### 3. 提取辅助函数

```javascript
function Dashboard() {
  // 辅助函数也在内部定义
  function formatNumber(num) {
    return num.toLocaleString();
  }
  
  function renderKPI(label, value) {
    return React.createElement("div", null,
      React.createElement("span", null, label),
      React.createElement("span", null, formatNumber(value))
    );
  }
  
  return React.createElement("div", null,
    renderKPI("销售额", 1000000)
  );
}
```

---

**修复时间**: 2026-05-02  
**状态**: ✅ 已修复  
**影响**: API Prompt 已更新，错误提示已改进
