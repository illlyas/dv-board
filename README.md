# AI 数据看板生成器

通过动态表单和多轮对话构建数据分析模型，自动生成数据看板。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件并添加你的 DeepSeek API Key：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

> 获取 API Key: https://platform.deepseek.com/

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 使用流程

1. **输入需求**：描述你想要的数据看板
2. **填写表单**：AI 会生成一系列表单来收集信息
3. **查看模型**：右侧实时显示构建的数据分析模型
4. **完成**：模型完成后可以查看完整的 JSON 数据

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Vercel AI SDK
- DeepSeek API
