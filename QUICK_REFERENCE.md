# 快速参考指南

## 🚀 快速开始

### 启动开发服务器
```bash
npm run dev
```

### 访问应用
```
http://localhost:3000
```

## 📁 项目结构

### API 路由
```
src/app/api/board/
├── design-vi/route.ts       # Step 1: VI 系统设计
├── design-story/route.ts    # Step 2: 看板故事设计
└── generate-jsx/route.ts    # Step 3: JSX 代码生成
```

### 核心库
```
src/lib/board/
├── vi-system.ts             # VI 系统类型和 Schema
├── board-story.ts           # 看板故事类型和 Schema
└── jsx-output.ts            # JSX 输出类型和 Schema
```

### 主要组件
```
src/components/
├── board-studio.tsx         # 主界面组件
├── jsx-renderer.tsx         # JSX 代码渲染器
├── vi-preview.tsx           # VI 系统预览
└── story-preview.tsx        # 看板故事预览
```

### Hooks
```
src/hooks/
└── use-pipeline.ts          # 管线状态管理
```

## 🔧 核心 API

### 1. VI 系统设计
```typescript
POST /api/board/design-vi

Request:
{
  "brief": "用户需求描述"
}

Response: (流式)
{
  "themeProfile": { ... },
  "colors": { ... },
  "typography": { ... },
  "spacing": { ... },
  "radius": { ... },
  "shadow": { ... },
  "animation": { ... },
  "componentStyles": { ... }
}
```

### 2. 看板故事设计
```typescript
POST /api/board/design-story

Request:
{
  "brief": "用户需求描述"
}

Response: (流式)
{
  "summary": "看板概述",
  "targetAudience": "目标受众",
  "dataStory": "数据叙事",
  "pages": [
    {
      "name": "页面名称",
      "purpose": "页面目的",
      "keyQuestion": "核心问题",
      "mustInsights": ["洞察1", "洞察2"],
      "analysisAngles": [...],
      "suggestedWidgets": [...]
    }
  ]
}
```

### 3. JSX 代码生成
```typescript
POST /api/board/generate-jsx

Request:
{
  "brief": "用户需求描述",
  "viSystem": { ... },      // Step 1 的输出
  "boardStory": { ... }     // Step 2 的输出
}

Response: (流式)
{
  "code": "export default function Dashboard() { ... }",
  "metadata": {
    "componentName": "Dashboard",
    "pageCount": 3,
    "canvasSize": { "width": 1920, "height": 1080 },
    "estimatedComponents": 15,
    "chartTypesUsed": ["bar", "line", "pie"],
    "iconsUsed": []
  },
  "description": "设计说明"
}
```

## 💻 代码示例

### 使用管线 Hook
```typescript
import { usePipeline } from "@/hooks/use-pipeline";

function MyComponent() {
  const { state, isRunning, runPipeline } = usePipeline();
  
  const handleGenerate = async () => {
    await runPipeline("一个电商销售数据仪表盘");
  };
  
  return (
    <div>
      <button onClick={handleGenerate} disabled={isRunning}>
        生成看板
      </button>
      {state.jsxCode && (
        <div>代码已生成！</div>
      )}
    </div>
  );
}
```

### 使用 JSX 渲染器
```typescript
import { JsxRenderer } from "@/components/jsx-renderer";

function Preview({ code }: { code: string }) {
  return (
    <JsxRenderer
      code={code}
      onError={(error) => console.error(error)}
    />
  );
}
```

### 使用类型
```typescript
import type { VISystem } from "@/lib/board/vi-system";
import type { BoardStory } from "@/lib/board/board-story";
import type { JSXCode } from "@/lib/board/jsx-output";

function processData(
  vi: VISystem,
  story: BoardStory,
  jsx: JSXCode
) {
  // 处理数据
}
```

## 🎨 主题和样式

### VI 系统结构
```typescript
{
  themeProfile: {
    name: "主题名称",
    theme: "dark-tech" | "dark-business" | "light-clean" | ...,
    mode: "dark" | "light",
    density: "compact" | "comfortable" | "spacious"
  },
  colors: {
    background: "#0a0e1a",
    foreground: "#ffffff",
    card: "#1a1f2e",
    primary: "#3b82f6",
    accent: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    chartPalette: ["#3b82f6", "#8b5cf6", ...]
  },
  typography: {
    fontFamily: {
      heading: "Orbitron, sans-serif",
      body: "Inter, sans-serif",
      mono: "JetBrains Mono, monospace"
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px"
    }
  }
}
```

## 📊 工作流程

### 完整流程
```
用户输入需求
    ↓
Step 1 + Step 2 并发执行
    ├─ design-vi (VI 系统设计)
    └─ design-story (看板故事设计)
    ↓
Step 3 执行
    └─ generate-jsx (JSX 代码生成)
    ↓
JsxRenderer 渲染
    ↓
最终看板显示
```

### 状态流转
```
idle → designing → designed → generating → done
                                         ↓
                                       error
```

## 🔍 调试技巧

### 查看管线状态
```typescript
const { state } = usePipeline();

console.log("当前步骤:", state.step);
console.log("VI 系统:", state.viSystem);
console.log("看板故事:", state.boardStory);
console.log("JSX 代码:", state.jsxCode);
```

### 查看渲染错误
```typescript
<JsxRenderer
  code={code}
  onError={(error) => {
    console.error("渲染错误:", error);
    // 显示错误提示
  }}
/>
```

### 浏览器控制台日志
```
[BoardStudio] State updated: { step: 'designing', ... }
[JsxRenderer] Rendering code, length: 12345
[JsxRenderer] Function name: Dashboard
[JsxRenderer] Component created: function
```

## ⚙️ 配置

### 环境变量
```bash
# .env.local
DEEPSEEK_API_KEY=your_api_key_here
```

### API 超时设置
```typescript
// route.ts
export const maxDuration = 120; // 秒
```

## 🐛 常见问题

### Q: 生成的代码不渲染
**A**: 检查浏览器控制台错误，确认代码格式正确

### Q: API 请求失败
**A**: 检查 `.env.local` 文件中的 API 密钥

### Q: 图表不显示
**A**: 确认代码使用了 `EChartsWrapper` 组件

### Q: 生成速度慢
**A**: 正常现象，完整流程需要 1-2 分钟

## 📚 更多文档

- `MIGRATION_COMPLETE.md` - 迁移完成说明
- `V2_TESTING_GUIDE.md` - 详细测试指南
- `V2_ECHARTS_FIX.md` - ECharts 使用说明
- `TEST_CHECKLIST.md` - 测试清单

## 🎯 快速命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 类型检查
npx tsc --noEmit

# 代码检查
npm run lint
```

---

**更新时间**: 2026-05-02  
**版本**: 1.0（标准版）
