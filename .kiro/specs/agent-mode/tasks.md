# Implementation Tasks: Agent 驱动模式

## Tasks

- [x] 1. 新增类型定义
  - 在 `src/types/pipeline.types.ts` 中新增 `AgentTaskStatus`、`AgentTask` 类型
  - 在 `usePipeline` 返回值中补充 `tasks: []` 字段，满足统一接口
  - **验证**：TypeScript 编译无报错
  - **文件**：`src/types/pipeline.types.ts`, `src/hooks/use-pipeline.ts`

- [x] 2. 实现 Skill Registry
  - 创建 `src/lib/agent/skill-registry.ts`
  - 定义 `SkillDefinition` 接口和 6 个 skill（analyze-brief、design-story、design-pages、design-vi、generate-jsx、apply-vi）
  - 导出 `SKILL_REGISTRY`、`getSkill(name)`、`SKILL_REGISTRY_PROMPT`
  - **验证**：纯数据模块，无副作用，TypeScript 编译无报错
  - **文件**：`src/lib/agent/skill-registry.ts`

- [x] 3. 实现 Skill Executors
  - 创建 `src/lib/agent/skill-executors.ts`
  - 定义 `SkillExecutorContext`、`SkillExecutorResult`、`SkillExecutor` 类型
  - 实现 6 个 executor，复用 `src/lib/pipeline/step-executors.ts` 中已有函数
  - 导出 `SKILL_EXECUTORS: Record<string, SkillExecutor>`
  - **验证**：TypeScript 编译无报错
  - **文件**：`src/lib/agent/skill-executors.ts`

- [x] 4. 实现 Task Runner
  - 创建 `src/lib/agent/task-runner.ts`
  - 实现 `runTasks` 函数：顺序执行、增量跳过、form 暂停、abort 支持、错误停止
  - **验证**：TypeScript 编译无报错
  - **文件**：`src/lib/agent/task-runner.ts`

- [x] 5. 实现 Planner API
  - 创建 `src/app/api/board/agent-plan/route.ts`
  - POST 接收 `{ userMessage, projectName, existingFiles }`
  - 将用户消息 + `SKILL_REGISTRY_PROMPT` + existingFiles 发给 LLM
  - 流式返回，最终解析为 `{ tasks: AgentTask[] }` 或 `{ clarification: string }`
  - **验证**：TypeScript 编译无报错
  - **文件**：`src/app/api/board/agent-plan/route.ts`

- [x] 6. 实现 useAgent Hook
  - 创建 `src/hooks/use-agent.ts`（≤200行）
  - 管理 messages、tasks、state 状态
  - 实现 `runPipeline`（调用 agent-plan → 设置 tasks → 调用 runTasks）
  - 实现 `submitFormAnswers`（从 pausedContextRef 恢复，继续执行剩余 tasks）
  - 实现 `clear`
  - 对外接口与 `usePipeline` 保持一致
  - **验证**：TypeScript 编译无报错，≤200行
  - **文件**：`src/hooks/use-agent.ts`

- [x] 7. 改造 TaskProgress 组件
  - 新增 `tasks?: AgentTask[]` prop
  - tasks 非空时渲染动态列表；tasks 为空且 currentStep 非 idle 时回退到静态 TASK_STEPS
  - 支持 "pending" | "running" | "done" | "skipped" | "error" 五种状态图标
  - **验证**：TypeScript 编译无报错，现有 Pipeline 模式视觉不变
  - **文件**：`src/components/board-studio/task-progress.tsx`

- [x] 8. 改造 BoardStudio 组件
  - 初始化时调用 `listProjectFiles` 检查项目文件
  - 有文件 → 使用 `useAgent`；无文件 → 使用 `usePipeline`
  - 将 `hook.tasks` 传给 `TaskProgress`
  - **验证**：TypeScript 编译无报错，空项目走 Pipeline 模式，有文件项目走 Agent 模式
  - **文件**：`src/components/board-studio.tsx`
