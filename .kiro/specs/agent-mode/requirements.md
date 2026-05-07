# Requirements Document

## Introduction

Agent 模式是对现有固定 Pipeline 工作流的升级。现有系统按照硬编码顺序执行 5 个固定步骤（分析需求 → 生成故事 → 设计页面 → 加载 VI → 生成 JSX → 应用 VI），无法根据项目上下文动态调整执行计划。

Agent 模式引入 LLM 驱动的 Planner，根据用户消息和项目现有文件动态生成 task 列表，再由 Task Runner 按序调用对应的 Skill 执行。两种模式（Pipeline 模式和 Agent 模式）通过统一的 Hook 接口对外暴露，BoardStudio 组件无需感知底层差异。

## Glossary

- **Agent**: 整个 Agent 模式的运行时，包含 Planner + Task Runner + Skill 执行层
- **Planner**: LLM 驱动的规划器，接收用户消息和项目上下文，输出结构化 task 列表
- **Task**: 一个待执行的工作单元，包含 skill 名称和输入参数
- **Skill**: 可被 Agent 调用的原子能力单元（如 analyze-brief、design-story、design-vi 等）
- **Skill_Registry**: 所有可用 Skill 的注册表，包含每个 Skill 的描述、输入输出规范
- **Task_Runner**: 按 task 列表顺序执行 skill，处理跳过、中止和错误
- **Pipeline_Mode**: 现有的固定步骤工作流模式（保持不变）
- **Agent_Mode**: 新的动态规划执行模式
- **BoardStudio**: 主 UI 组件，通过统一 Hook 接口驱动两种模式
- **useAgent**: Agent 模式的状态管理 Hook
- **usePipeline**: 现有 Pipeline 模式的状态管理 Hook（保持不变）
- **Form_Pause**: 当 skill 返回 form 类型时，暂停 task 执行，等待用户填写表单后继续

## Requirements

### Requirement 1

**User Story:** As a developer, I want the Planner to dynamically generate a task list based on user messages and existing project files, so that the Agent can adapt its execution plan to the current project context.

#### Acceptance Criteria

1. WHEN a user submits a message, THE Planner SHALL call the `/api/board/agent-plan` endpoint with the user message, project file list, and Skill Registry descriptions
2. WHEN the Planner receives a response, THE Planner SHALL return a structured JSON array of AgentTask objects, each containing a skill name and input parameters
3. WHEN the project already has files (e.g., `design-story.md` exists), THE Planner SHALL generate a task list that skips already-completed steps
4. IF the Planner API returns an error or invalid JSON, THEN THE Agent SHALL display an error message and stop execution
5. THE Planner SHALL only reference skill names that exist in the Skill_Registry

### Requirement 2

**User Story:** As a developer, I want the Skill Registry to define all available skills with their metadata, so that the Planner and Task Runner have a single source of truth for skill capabilities.

#### Acceptance Criteria

1. THE Skill_Registry SHALL define each skill with: name, description, input parameters, and output file names
2. THE Skill_Registry SHALL include the following skills: `analyze-brief`, `design-story`, `design-pages`, `design-vi`, `generate-jsx`, `apply-vi`
3. WHEN a skill defines output file names, THE Task_Runner SHALL use those file names to check for existing outputs before execution
4. THE Skill_Registry SHALL be a pure data module with no side effects

### Requirement 3

**User Story:** As a developer, I want the Task Runner to execute tasks sequentially with incremental skip logic, so that already-completed work is not repeated.

#### Acceptance Criteria

1. WHEN the Task_Runner starts executing a task, THE Task_Runner SHALL check if the skill's output files already exist in the project
2. WHEN all output files of a skill already exist, THE Task_Runner SHALL skip that task and move to the next one
3. WHEN a task is skipped, THE Task_Runner SHALL emit a status update indicating the task was skipped
4. WHEN a task executes successfully, THE Task_Runner SHALL update the task status to "done" and proceed to the next task
5. IF a task execution throws an error, THEN THE Task_Runner SHALL stop execution and report the error
6. WHEN the abort signal is triggered, THE Task_Runner SHALL stop execution after the current task completes

### Requirement 4

**User Story:** As a user, I want the analyze-brief skill to pause execution and show a form when more information is needed, so that I can provide missing details before the pipeline continues.

#### Acceptance Criteria

1. WHEN the `analyze-brief` skill returns a response with `type: "form"`, THE Agent SHALL pause task execution and set the `currentForm` state
2. WHEN the Agent is paused with a form, THE Agent SHALL expose the form data through the unified Hook interface
3. WHEN the user submits form answers, THE Agent SHALL resume task execution from the next task after `analyze-brief`
4. WHEN the `analyze-brief` skill returns a response with `type: "sufficient"`, THE Agent SHALL continue to the next task without pausing

### Requirement 5

**User Story:** As a developer, I want both Pipeline mode and Agent mode to expose the same Hook interface, so that BoardStudio does not need to know which mode is active.

#### Acceptance Criteria

1. THE `useAgent` Hook SHALL expose: `{ messages, isRunning, state, tasks, runPipeline, submitFormAnswers, clear }`
2. THE `usePipeline` Hook SHALL expose the same interface shape as `useAgent`
3. WHEN BoardStudio calls `runPipeline(brief, projectName)`, THE active Hook SHALL handle the call regardless of which mode is active
4. WHEN BoardStudio calls `submitFormAnswers(answers)`, THE active Hook SHALL resume execution with the provided answers
5. THE `tasks` field SHALL be `AgentTask[]` in Agent mode and an empty array `[]` in Pipeline mode

### Requirement 6

**User Story:** As a developer, I want BoardStudio to automatically select the appropriate mode based on project context, so that users get the best experience without manual configuration.

#### Acceptance Criteria

1. WHEN BoardStudio initializes with a `projectName`, THE BoardStudio SHALL check existing project files via `listProjectFiles`
2. WHEN the project has existing files, THE BoardStudio SHALL use Agent mode (`useAgent`)
3. WHEN the project has no existing files, THE BoardStudio SHALL use Agent mode (`useAgent`) as the default
4. THE BoardStudio SHALL pass the `tasks` array from the active Hook to the `TaskProgress` component

### Requirement 7

**User Story:** As a developer, I want the TaskProgress component to render a dynamic task list, so that it can display Agent-generated tasks instead of the hardcoded TASK_STEPS.

#### Acceptance Criteria

1. WHEN `tasks` is a non-empty array, THE TaskProgress component SHALL render the dynamic task list
2. WHEN `tasks` is empty and `currentStep` is not "idle", THE TaskProgress component SHALL fall back to rendering the static TASK_STEPS
3. WHEN a task status is "running", THE TaskProgress component SHALL display an animated spinner for that task
4. WHEN a task status is "done", THE TaskProgress component SHALL display a checkmark for that task
5. WHEN a task status is "skipped", THE TaskProgress component SHALL display a skip indicator for that task
6. WHEN a task status is "pending", THE TaskProgress component SHALL display an empty circle for that task

### Requirement 8

**User Story:** As a developer, I want the agent-plan API to use LLM to generate task lists, so that the planning logic is flexible and context-aware.

#### Acceptance Criteria

1. WHEN the `/api/board/agent-plan` endpoint receives a request, THE endpoint SHALL send the user message, project file list, and Skill Registry descriptions to the LLM
2. WHEN the LLM responds, THE endpoint SHALL parse and return a JSON array of AgentTask objects
3. IF the LLM response cannot be parsed as valid JSON, THEN THE endpoint SHALL return a 500 error with a descriptive message
4. THE endpoint SHALL use streaming response format consistent with other pipeline API endpoints
