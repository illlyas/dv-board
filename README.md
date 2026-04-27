# DV Board

一个通过自然语言生成数据可视化大屏的前端平台原型。

用户在左侧输入业务需求后，前端会调用后端 `/api/generate-board`。后端使用 `Vercel AI SDK` 把请求转发给 LLM，并以结构化对象流的方式返回一个接近 `VisdocModel` 的多分页看板文档；前端收到流式 JSON 后，按 `pages + nodeMap + currentPageId` 实时渲染页面和组件。

## 技术栈

- `Next.js 16`
- `React 19`
- `Tailwind CSS 4`
- `Vercel AI SDK 6`
- `@ai-sdk/openai`（DeepSeek OpenAI 兼容接口）
- `ECharts`
- `Zod`

## 启动方式

1. 安装依赖

```bash
pnpm install
```

2. 创建环境变量文件

```bash
cp .env.example .env.local
```

3. 在 `.env.local` 中填写模型配置

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

4. 启动开发环境

```bash
pnpm dev
```

5. 打开 [http://localhost:3000](http://localhost:3000)

## 当前能力

- 支持通过输入框描述看板需求
- 支持后端通过 LLM 生成结构化大屏数据
- 支持前端流式接收并实时更新界面
- 支持生成接近 `VisdocModel` 的多分页文档结构
- 支持 `text`、`image`、`pixel`、`select`、`bar`、`line`、`pie`、`funnel` 组件
- 支持 ECharts 图表渲染
- 支持把完整文档持久化到浏览器 `localStorage`
- 支持桌面大屏布局，同时兼容窄屏浏览

## 关键目录

- `src/app/page.tsx`：入口页面
- `src/components/board-studio.tsx`：左侧输入控制台
- `src/components/dashboard-stage.tsx`：多分页文档渲染舞台
- `src/app/api/generate-board/route.ts`：LLM 转发接口
- `src/lib/dashboard-schema.ts`：前后端共享的 Visdoc schema、类型和本地缓存 key

## 已验证

```bash
pnpm lint
pnpm build
```
