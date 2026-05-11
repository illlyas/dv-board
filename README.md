# DV Board · AI 数据看板生成器

> 用自然语言描述需求，AI 自动生成可交付的数据可视化大屏。

## 核心理念

传统 BI 工具的产物是 JSON 配置——对人类不可读，对 AI 不可理解。DV Board 选择了不同的路径：

**交付物是代码，不是配置。** 生成的 Markdown 文档和 JSX 组件既是人类可读的设计文档，也是 AI 可直接理解和修改的源码。这意味着每一次对话式修改都精准命中意图，无需在配置映射中猜测语义。

## 核心特性

### 📁 文件即记忆

每个项目的完整上下文以纯文本文件持久化在 `.dv/` 目录中：

```
.dv/project-{id}/
├── 数据故事/design-story.md      # 业务目标、指标体系、决策场景
├── 页面结构/pages-story.md       # 布局规划、组件清单、数据契约
├── 品牌VI/vi-system.md           # 视觉规范文档
├── 品牌VI/vi-tokens.json         # CSS 变量、色板、字体 Token
└── 页面/dashboard.jsx            # 最终可渲染的 React 组件
```

AI 在每次对话中读取这些文件作为长期记忆，理解项目全貌后再做增量修改。项目天然支持 Git 版本控制、团队协作和跨工具迁移。

### 🧠 Markdown + JSX 作为交付产物

- **Markdown** 承载设计决策（数据故事、页面结构、VI 规范），结构化且语义明确
- **JSX** 承载最终视图，是真实可运行的 React 组件而非抽象配置
- AI 对这两种格式有原生理解能力，修改时无需额外的 schema 映射或格式转换，改动精准度显著高于 JSON 配置方案

### ⚡ 实时预览与微调

- **VI Token 实时调节**：颜色、间距、字体等设计变量即改即现，所见即所得
- **Markdown 局部精修**：选中文档片段，用自然语言描述修改意图，AI 仅重写选中部分
- **Widget 级编辑**：点选看板中的任意组件，通过对话修改其数据绑定、样式或布局
- **全量重生成**：修改上游文档（数据故事/页面结构）后，一键级联重新生成下游产物

### 🎨 134+ 设计体系

内置覆盖多行业、多风格的设计体系参考库——从 Apple、BMW 等品牌风格到赛博朋克、政务蓝等场景主题。选择风格后，AI 自动生成匹配的 VI Token 和视觉规范。

### 🔄 渐进式生成管线

```
需求描述 → 数据故事 → 页面结构 → VI 体系 → JSX 看板
```

五阶段管线，每一步产出独立可审阅的文档。支持从任意阶段介入修改，下游自动级联更新。

### 🌐 去中心化存储

集成 0G Network，项目文件可选择存储到去中心化网络，实现数据主权自持。默认使用本地文件系统，零配置即可运行。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入 DeepSeek API Key：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

> 获取 API Key：https://platform.deepseek.com/

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 使用流程

1. **描述需求** — 用自然语言说明你想要的看板（行业、受众、关注指标）
2. **补充细节** — AI 通过动态表单收集关键信息（数据维度、对比方式、预警阈值）
3. **审阅设计** — 逐步生成数据故事、页面结构、VI 规范，每步可介入修改
4. **预览看板** — 实时渲染最终 JSX 看板，支持交互式微调
5. **持续迭代** — 对已有项目直接对话，AI 基于文件记忆做增量更新

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 框架 | Next.js 16 (App Router) |
| 前端 | React 19, TypeScript, Tailwind CSS 4 |
| UI 组件 | shadcn/ui (Radix), Lucide Icons |
| 图表 | ECharts 6 |
| AI | Vercel AI SDK + DeepSeek API |
| 存储 | 本地文件系统 / 0G Network（可选） |

## 项目结构

```
├── src/
│   ├── app/                  # Next.js App Router 路由
│   ├── components/           # UI 组件（Board Studio 为核心）
│   ├── hooks/                # 状态管理（Pipeline、Agent、VI Tweaks）
│   ├── lib/                  # 业务逻辑（管线、存储、设计体系）
│   └── types/                # TypeScript 类型定义
├── board-templates/          # 预置看板模板
├── design-systems/           # 134+ 设计体系参考
├── .dv/                      # 项目文件存储（长期记忆）
└── .assets/                  # 矢量素材资源
```

## License

Private
