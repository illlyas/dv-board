# Implementation Tasks: 仪表盘编辑模式

## Tasks

- [x] 1. 新增 edit-dashboard API
  - 创建 `src/app/api/board/edit-dashboard/route.ts`
  - 输入：`{ userMessage, currentCode, viSystemContent?, conversationHistory }`
  - System prompt 注入当前 JSX 代码 + vi-system 内容 + widget 类型文档
  - 约束：dataKey 不可修改，其他（type、props、增删）均可
  - 输出：流式文本，最终解析为 `{ code, description }`
  - **文件**：`src/app/api/board/edit-dashboard/route.ts`

- [x] 2. 新增 use-dashboard-editor hook
  - 创建 `src/hooks/use-dashboard-editor.ts`
  - 状态：messages、isRunning、editingFile
  - 方法：startEditing(file)、sendEdit(userMessage, projectName)、clear()
  - sendEdit 内部：读取当前文件代码 → 读取 vi-system.md → 调用 edit-dashboard API → 流式展示 → 保存新文件（带编号）→ 触发刷新回调
  - 对外接口形状与 useAgent 一致（messages、isRunning、state、tasks、runPipeline、submitFormAnswers、clear）
  - **文件**：`src/hooks/use-dashboard-editor.ts`

- [x] 3. 新增 DashboardToolbar 组件
  - 创建 `src/components/board-studio/dashboard-toolbar.tsx`
  - 仅在 activeTab 是 .jsx 文件时渲染
  - 右侧放"✨ AI 编辑"按钮；进入编辑模式后变为"退出编辑"按钮
  - props：file: FileItem、isEditing: boolean、onStartEdit()、onExitEdit()
  - **文件**：`src/components/board-studio/dashboard-toolbar.tsx`

- [x] 4. 改造 FilePanel，插入工具栏
  - 在 TabBar 和内容区之间，当 activeTab 是 .jsx 时渲染 DashboardToolbar
  - FilePanel 新增 props：editingTabId?: string、onStartEdit(file: FileItem)、onExitEdit()
  - **文件**：`src/components/board-studio/file-panel.tsx`

- [x] 5. 改造 BoardStudio，接入编辑模式
  - 新增 editingDashboard: FileItem | null 状态
  - 实例化 useDashboardEditor，与 useAgent、usePipeline 并列
  - hook 选择逻辑：editingDashboard 非 null → dashboardEditorHook，否则按现有逻辑
  - 向 FilePanel 传入 onStartEdit / onExitEdit 回调
  - **文件**：`src/components/board-studio.tsx`

- [x] 6. 改造 ChatPanel，显示编辑模式 banner
  - 新增可选 prop：editingFileName?: string
  - 当 editingFileName 存在时，在消息列表顶部显示蓝色 banner
  - **文件**：`src/components/board-studio/chat-panel.tsx`

- [x] 7. 编译验证
  - 运行 npx tsc --noEmit，确保无报错
