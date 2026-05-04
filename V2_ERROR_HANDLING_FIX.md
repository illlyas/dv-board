# V2 错误处理改进

## 问题描述

在 V2 生成 JSX 代码后，前端尝试解析时出现 Zod 验证错误：

```
ZodError: [{"expected": "number","code": "invalid_type","path": ["metadata","pageCount"],"message": "Invalid input: expected number, received undefined"}]
```

## 根本原因

AI 生成的 JSON 响应中，`metadata` 字段可能不完整或缺失某些必需字段（如 `pageCount`），导致 Zod schema 验证失败。

## 解决方案

### 1. ✅ 修改 Schema 使字段可选

修改 `src/lib/v2/jsx-output.ts`，为所有 metadata 字段提供默认值：

```typescript
metadata: z.object({
  componentName: z.string().default("Dashboard"),
  pageCount: z.number().int().positive().default(1),  // 添加 .default(1)
  canvasSize: z.object({ width: z.number(), height: z.number() }).default({ width: 1920, height: 1080 }),
  estimatedComponents: z.number().int().nonnegative().default(0),
  chartTypesUsed: z.array(z.string()).default([]),
  iconsUsed: z.array(z.string()).default([]),
}).default({  // 为整个 metadata 对象提供默认值
  componentName: "Dashboard",
  pageCount: 1,
  canvasSize: { width: 1920, height: 1080 },
  estimatedComponents: 0,
  chartTypesUsed: [],
  iconsUsed: [],
}),
```

### 2. ✅ 添加标准化函数

在 `src/lib/v2/jsx-output.ts` 中添加 `normalizeJSXCode` 函数：

```typescript
export function normalizeJSXCode(input: unknown): Record<string, unknown> {
  // 处理缺失的字段
  // 尝试从代码中推断页面数量
  // 提供合理的默认值
}
```

功能：
- 确保 `code` 字段存在且有效
- 处理缺失的 `metadata` 字段
- 尝试从代码中智能推断页面数量
- 为所有字段提供合理的默认值

### 3. ✅ 在 Hook 中使用标准化函数

修改 `src/hooks/use-pipeline-v2.ts`：

```typescript
// 标准化 JSX 输出，处理缺失字段
const normalizedJSX = normalizeJSXCode(jsxResult.json);
const jsxCode = jsxCodeSchema.parse(normalizedJSX);
```

### 4. ✅ 改进 AI Prompt

修改 `src/app/api/board/v2/generate-jsx/route.ts` 的 system prompt，明确要求 AI 生成完整的 metadata：

```
输出规则：
- metadata 字段必须包含所有必需的子字段：
  * componentName: 组件名称（字符串）
  * pageCount: 页面数量（数字，必须 >= 1）
  * canvasSize: { width: 1920, height: 1080 }
  * estimatedComponents: 估算的组件数量（数字，>= 0）
  * chartTypesUsed: 使用的图表类型数组
  * iconsUsed: 使用的图标数组

输出示例结构：
{
  "code": "...",
  "metadata": {
    "componentName": "SalesDashboard",
    "pageCount": 3,
    "canvasSize": { "width": 1920, "height": 1080 },
    "estimatedComponents": 15,
    "chartTypesUsed": ["bar", "line", "pie"],
    "iconsUsed": ["TrendingUp", "Users"]
  }
}
```

## 智能推断逻辑

`normalizeJSXCode` 函数包含智能推断逻辑：

### 推断页面数量

1. 优先使用 AI 提供的 `pageCount`
2. 如果缺失，尝试从代码中查找：
   - 查找 `useState(0)` 初始化
   - 查找 `pages = [...]` 数组定义
   - 通过逗号分隔估算页面数
3. 默认为 1 页

```typescript
// 尝试从代码中推断页面数量
let pageCount = 1;
if (typeof rawMetadata.pageCount === "number" && rawMetadata.pageCount > 0) {
  pageCount = Math.floor(rawMetadata.pageCount);
} else if (typeof code === "string") {
  const stateMatch = code.match(/useState\s*\(\s*0\s*\)/);
  if (stateMatch) {
    const pagesMatch = code.match(/pages\s*=\s*\[([^\]]+)\]/);
    if (pagesMatch) {
      const commaCount = (pagesMatch[1].match(/,/g) || []).length;
      pageCount = Math.max(1, commaCount + 1);
    }
  }
}
```

## 测试验证

### 测试场景 1：完整的 metadata
```json
{
  "code": "...",
  "metadata": {
    "componentName": "Dashboard",
    "pageCount": 3,
    "canvasSize": { "width": 1920, "height": 1080 },
    "estimatedComponents": 10,
    "chartTypesUsed": ["bar", "line"],
    "iconsUsed": []
  }
}
```
✅ 直接通过验证

### 测试场景 2：缺失 pageCount
```json
{
  "code": "export default function Dashboard() { const [page, setPage] = React.useState(0); const pages = [page1, page2, page3]; ... }",
  "metadata": {
    "componentName": "Dashboard"
  }
}
```
✅ 自动推断 pageCount = 3

### 测试场景 3：完全缺失 metadata
```json
{
  "code": "..."
}
```
✅ 使用默认值：
```json
{
  "metadata": {
    "componentName": "Dashboard",
    "pageCount": 1,
    "canvasSize": { "width": 1920, "height": 1080 },
    "estimatedComponents": 0,
    "chartTypesUsed": [],
    "iconsUsed": []
  }
}
```

### 测试场景 4：无效的输入
```json
null
```
或
```json
"invalid string"
```
✅ 返回 EMPTY_JSX_CODE

## 错误处理流程

```
AI 生成 JSON
    ↓
normalizeJSXCode() 标准化
    ↓
jsxCodeSchema.parse() 验证
    ↓
成功 → 渲染
失败 → 显示错误信息
```

## 优势

1. **容错性强**：即使 AI 返回不完整的数据，也能正常工作
2. **智能推断**：尝试从代码中提取缺失的信息
3. **合理默认值**：所有字段都有合理的默认值
4. **类型安全**：保持 TypeScript 类型检查
5. **用户友好**：避免因 AI 输出不完整而导致的崩溃

## 后续改进建议

1. **日志记录**：记录标准化过程中的推断和默认值使用情况
2. **用户提示**：当使用默认值时，可以提示用户
3. **重试机制**：如果推断失败，可以提示用户重新生成
4. **验证增强**：添加更多的代码结构验证

## 相关文件

- `src/lib/v2/jsx-output.ts` - Schema 和标准化函数
- `src/hooks/use-pipeline-v2.ts` - Hook 中的使用
- `src/app/api/board/v2/generate-jsx/route.ts` - AI Prompt 改进

## 验证状态

✅ TypeScript 类型检查通过  
✅ 标准化函数已实现  
✅ Hook 已更新  
✅ AI Prompt 已改进  
✅ 默认值已配置  

## 总结

通过多层防护（Schema 默认值 + 标准化函数 + 智能推断 + 改进 Prompt），确保即使 AI 返回不完整的数据，系统也能正常工作，大大提高了系统的健壮性和用户体验。
