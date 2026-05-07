# Design Document: Agent 驱动模式

## Overview

在现有 Pipeline 模式基础上，新增 Agent 模式。两种模式通过统一 Hook 接口对外暴露，BoardStudio 组件通过检查项目文件决定使用哪种模式。

核心数据流：
```
用户消息
  → BoardStudio 检查项目文件
  → [空项目] usePipeline（现有逻辑不变）
  → [有文件] useAgent
      → /api/board/agent-plan（LLM 规划 task 列表）
      → TaskRunner 按序执行
          → 检查输出文件是否已存在（增量跳过）
          → 调用 skill-executors 执行
          → [analyze-brief 返回 form] 暂停，等待用户提交
      → 更新 messages / tasks 状态
```

## Architecture

### 新增文件

```
src/
├── hooks/
│   └── use-agent.ts                    # Agent 模式状态管理（≤200行）
├── lib/
│   └── agent/
│       ├── skill-registry.ts           # Skill 注册表（纯数据）
│       ├── skill-executors.ts          # Skill 调用逻辑（复用 step-executors）
│       └── task-runner.ts              # 顺序执行 + 增量跳过 + 中止
└── app/api/board/
    └── agent-plan/
        └── route.ts                    # Planner API（LLM 驱动）
```

### 改造现有文件

```
src/
├── types/
│   └── pipeline.types.ts               # 新增 AgentTask、AgentTaskStatus 类型
├── components/
│   ├── board-studio.tsx                # 增加模式路由逻辑
│   └── board-studio/
│       └── task-progress.tsx           # 支持动态 tasks 输入
```

## Data Models

### AgentTask

```ts
// src/types/pipeline.types.ts 新增
export type AgentTaskStatus = "pending" | "running" | "done" | "skipped" | "error";

export interface AgentTask {
  id: string;                    // 唯一标识，前端生成
  skill: string;                 // skill 名称，对应 SkillRegistry 中的 name
  description: string;           // 人类可读描述，来自 Planner LLM
  inputs: Record<string, unknown>; // skill 所需输入参数
  status: AgentTaskStatus;
}
```

### SkillDefinition

```ts
// src/lib/agent/skill-registry.ts
export interface SkillDefinition {
  name: string;
  description: string;           // 给 Planner LLM 看的功能描述
  outputFiles: string[];         // 产出文件名，用于增量检查（相对于项目目录）
}
```

### 统一 Hook 接口

```ts
// 两个 hook 对外暴露相同形状
interface BoardHookResult {
  messages: ChatMessage[];
  isRunning: boolean;
  state: PipelineState;
  tasks: AgentTask[];            // Pipeline 模式返回 []
  runPipeline: (brief: string, projectName: string) => void;
  submitFormAnswers: (answers: Record<string, unknown>) => void;
  clear: () => void;
}
```

## Module Design

### 1. skill-registry.ts

纯数据模块，无副作用。定义 6 个 skill：

| skill | outputFiles | 说明 |
|-------|-------------|------|
| analyze-brief | [] | 无文件产出，用于需求分析和追问 |
| design-story | ["数据故事/design-story.md"] | 生成数据故事 |
| design-pages | ["页面结构/pages-story.md"] | 设计页面结构 |
| design-vi | ["品牌VI/vi-system.md"] | 加载 VI 系统 |
| generate-jsx | ["页面/wireframe.jsx"] | 生成线框 JSX |
| apply-vi | ["页面/dashboard.jsx"] | 应用 VI 系统 |

导出：
- `SKILL_REGISTRY: SkillDefinition[]`
- `getSkill(name: string): SkillDefinition | undefined`
- `SKILL_REGISTRY_PROMPT: string` — 格式化后的 skill 描述，直接注入 Planner 的 system prompt

### 2. /api/board/agent-plan/route.ts

**输入**：
```ts
{
  userMessage: string;
  projectName: string;
  existingFiles: string[];   // 已存在的文件路径列表，如 ["数据故事/design-story.md"]
}
```

**输出**（流式，最终解析为 JSON）：
```ts
{
  tasks: Array<{
    skill: string;
    description: string;
    inputs: Record<string, unknown>;
  }>;
  clarification?: string;    // 如果无法推断意图，返回澄清消息
}
```

**System Prompt 结构**：
1. 角色定义：你是一个数据看板 Agent 的任务规划器
2. 注入 `SKILL_REGISTRY_PROMPT`（所有 skill 的名称、描述、输出文件）
3. 规则：
   - 只能使用注册表中存在的 skill
   - generate-jsx 出现时，apply-vi 必须紧随其后
   - analyze-brief 出现时，design-story 必须紧随其后
   - 已存在的输出文件对应的 skill 可以跳过（但 Planner 也可以包含，由 TaskRunner 做最终跳过判断）
   - 如果无法推断意图，返回 `{ clarification: "..." }` 而非空 tasks
4. 输出格式：严格 JSON

### 3. skill-executors.ts

每个 skill 对应一个执行函数，统一签名：

```ts
export interface SkillExecutorContext {
  signal: AbortSignal;
  projectName: string;
  onProgress?: (partial: string) => void;
  onMessage?: (msg: ChatMessage) => void;
}

export type SkillExecutorResult =
  | { type: "done" }
  | { type: "form"; form: QuestionForm; extractedInfo: unknown };

export type SkillExecutor = (
  inputs: Record<string, unknown>,
  ctx: SkillExecutorContext
) => Promise<SkillExecutorResult>;
```

各 skill executor 直接复用 `src/lib/pipeline/step-executors.ts` 中已有的函数：
- `executeAnalyzeBrief` — 调用 analyze-brief API，处理 sufficient/form 两种返回
- `executeDesignStory` — 复用现有 `executeDesignStory`
- `executeDesignPages` — 复用现有 `executePagesStory`
- `executeDesignVI` — 复用现有 `executeVISystem`
- `executeGenerateJSX` — 复用现有 `executeJSXGeneration`
- `executeApplyVI` — 复用现有 `executeVIApplication`

导出：
```ts
export const SKILL_EXECUTORS: Record<string, SkillExecutor>
```

### 4. task-runner.ts

```ts
export interface TaskRunnerCallbacks {
  onTaskStart: (taskId: string) => void;
  onTaskDone: (taskId: string) => void;
  onTaskSkipped: (taskId: string, reason: string) => void;
  onTaskError: (taskId: string, error: string) => void;
  onMessage: (msg: ChatMessage) => void;
  onFormPause: (taskId: string, form: QuestionForm, extractedInfo: unknown) => void;
}

export async function runTasks(
  tasks: AgentTask[],
  projectName: string,
  existingFiles: string[],
  signal: AbortSignal,
  callbacks: TaskRunnerCallbacks
): Promise<void>
```

执行逻辑：
1. 遍历 tasks
2. 检查 signal.aborted，是则停止
3. 从 SkillRegistry 获取 skill 的 outputFiles
4. 检查 outputFiles 是否都已存在于 existingFiles → 是则 onTaskSkipped，continue
5. callbacks.onTaskStart(task.id)
6. 调用 SKILL_EXECUTORS[task.skill](task.inputs, ctx)
7. 如果返回 `{ type: "form" }` → callbacks.onFormPause，**return**（暂停，等待外部恢复）
8. 如果返回 `{ type: "done" }` → callbacks.onTaskDone
9. catch → callbacks.onTaskError，**return**（停止后续）

### 5. use-agent.ts

状态：
```ts
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [tasks, setTasks] = useState<AgentTask[]>([]);
const [state, setState] = useState<PipelineState>(INITIAL_STATE);
// 暂停时保存待恢复的上下文
const pausedContextRef = useRef<{ remainingTasks: AgentTask[]; brief: string } | null>(null);
```

主要方法：
- `runPipeline(brief, projectName)` — 调用 agent-plan → 设置 tasks → 调用 runTasks
- `submitFormAnswers(answers)` — 从 pausedContextRef 恢复，继续执行剩余 tasks
- `clear()` — 重置所有状态

### 6. BoardStudio 改造

```tsx
// 检查项目文件，决定模式
const [isAgentMode, setIsAgentMode] = useState(false);

useEffect(() => {
  if (!projectName) return;
  listProjectFiles(projectName).then((data) => {
    const hasFiles = Object.values(data.categories).some((files) => files.length > 0);
    setIsAgentMode(hasFiles);
  });
}, [projectName]);

const hook = isAgentMode ? agentHook : pipelineHook;
```

将 `hook.tasks` 传给 `TaskProgress`。

### 7. TaskProgress 改造

新增 `tasks?: AgentTask[]` prop：
- `tasks` 非空 → 渲染动态列表
- `tasks` 为空且 `currentStep !== "idle"` → 回退到静态 TASK_STEPS

## Key Design Decisions

1. **TaskRunner 是纯函数**，不持有状态，通过回调通知外部。状态全部在 `use-agent.ts` 管理。

2. **Form 暂停通过 return 实现**：`runTasks` 遇到 form 时直接 return，`use-agent` 保存剩余 tasks 到 ref，`submitFormAnswers` 时重新调用 `runTasks` 传入剩余 tasks。

3. **增量检查在 TaskRunner 层**：不在 Planner 层做，Planner 只负责规划意图，TaskRunner 做最终的文件存在性检查。

4. **usePipeline 不改动**：只在 `usePipeline` 的返回值中补充 `tasks: []`，满足统一接口要求。
