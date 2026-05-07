# Bugfix Requirements Document

## Introduction

现有仪表盘编辑交互体验存在根本性缺陷：用户通过左侧 chatbot 对话来修改 dashboard JSX 代码，无法精确指定要修改哪个 Widget 元素。这导致 AI 编辑时缺乏上下文，修改结果不准确，用户需要反复描述才能达到预期效果。

本次重构将编辑交互模式从"全局对话式"改为"选中元素后精准编辑"，通过 Switch 开关切换编辑/预览模式，支持点击选中 Widget 元素，并在选中后弹出浮动对话框，将选中元素的上下文（dataKey、type、props 片段）传递给 AI，实现精准编辑。

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 用户点击"✨ AI 编辑"按钮进入编辑模式 THEN 系统在左侧 chatbot 面板中开启对话，用户只能通过文字描述来指定要修改的元素，无法直接点击选中目标 Widget

1.2 WHEN 用户在 chatbot 中描述修改意图时 THEN 系统将整个 JSX 代码作为上下文传给 AI，AI 无法精确知道用户想修改哪个具体元素，导致修改结果偏差

1.3 WHEN 用户想修改仪表盘中某个特定 Widget 时 THEN 系统没有提供任何视觉反馈来标识可编辑的元素边界，用户无法直观感知哪些元素可以被选中

1.4 WHEN 用户处于编辑模式时 THEN 系统通过独立的"退出编辑"按钮来切换状态，与"✨ AI 编辑"按钮分开显示，交互不一致且占用工具栏空间

1.5 WHEN 用户想同时修改多个 Widget 时 THEN 系统不支持多选操作，每次只能针对整个 dashboard 进行修改

### Expected Behavior (Correct)

2.1 WHEN 用户打开 Switch 开关进入编辑模式 THEN 系统 SHALL 切换到编辑状态，仪表盘内的 Widget 组件显示可交互的视觉提示（如悬停高亮边框），Switch 关闭则回到预览模式

2.2 WHEN 用户在编辑模式下点击某个 Widget 元素 THEN 系统 SHALL 选中该元素并显示高亮边框，同时在工作台区域左上角弹出浮动对话框，对话框顶部显示选中元素的 dataKey 和 type 信息

2.3 WHEN 用户在浮动对话框中输入修改描述并提交 THEN 系统 SHALL 将选中元素的 dataKey、type、当前 props 片段作为上下文附加到 AI 请求中，使 AI 能精准定位并修改目标元素

2.4 WHEN 用户在编辑模式下按住 Ctrl 并点击多个 Widget 元素 THEN 系统 SHALL 支持多选，所有选中元素均显示高亮边框，浮动对话框显示所有选中元素的信息

2.5 WHEN 用户通过 Switch 开关切换编辑/预览模式 THEN 系统 SHALL 用单一 Switch 控件替代原有的"✨ AI 编辑"和"退出编辑"两个按钮，Switch 打开 = 编辑模式，关闭 = 预览模式

2.6 WHEN 用户在编辑模式下悬停在 Widget 元素上 THEN 系统 SHALL 显示悬停高亮边框，提示该元素可被选中

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 用户处于预览模式（Switch 关闭）时 THEN 系统 SHALL CONTINUE TO 正常渲染仪表盘，ScaledBoardPreview 的 1920x1080 缩放逻辑保持不变

3.2 WHEN 用户提交编辑请求后 THEN 系统 SHALL CONTINUE TO 使用现有的 str_replace 模式调用 edit-dashboard API 修改 JSX 文件，文件写回和 tab 刷新逻辑保持不变

3.3 WHEN 仪表盘 JSX 代码通过 JsxRenderer 渲染时 THEN 系统 SHALL CONTINUE TO 使用 Babel standalone 在浏览器端转译，Widget 组件注册表和数据加载逻辑保持不变

3.4 WHEN 用户在非 JSX 文件的 tab 上操作时 THEN 系统 SHALL CONTINUE TO 不显示编辑工具栏，Markdown 等文件的预览行为保持不变

3.5 WHEN 仪表盘编辑完成后 THEN 系统 SHALL CONTINUE TO 通知 FilePanel 刷新对应 tab 的文件内容，updateTabFile 和 setActiveTabId 回调逻辑保持不变

3.6 WHEN 用户在 agent 模式或 pipeline 模式下操作时 THEN 系统 SHALL CONTINUE TO 使用原有的 chatbot 对话流程，BoardStudio 的模式切换逻辑（editingDashboard 状态）保持不变
