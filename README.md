# DV Board

一个通过自然语言生成数据可视化大屏的前端平台原型。

## 🎉 V2 版本已上线！

**V2 版本现在是默认版本**，采用全新的 3 步生成流程：
1. **VI 系统设计**（并发）- 参考 shadcn/ui 的 Design Token 体系
2. **看板故事设计**（并发）- 规划页面结构和叙事逻辑
3. **JSX 代码生成**（串行）- 直接输出可执行的 React 组件代码

### 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问
# http://localhost:3000
```

**详细文档**：
- [快速启动指南](./QUICK_START.md) - 立即开始使用
- [V2 使用指南](./V2_USAGE_GUIDE.md) - 详细的使用说明
- [V2 实现总结](./V2_IMPLEMENTATION_SUMMARY.md) - 技术实现细节
- [集成完成报告](./V2_INTEGRATION_COMPLETE.md) - 集成状态和验证

## 版本对比

### V2（默认）- 新一代看板生成系统
- ✅ **并发执行** - Step 1 和 Step 2 同时进行，速度更快
- ✅ **完整 VI 系统** - 参考 shadcn/ui 的 Design Token 体系
- ✅ **直接生成代码** - 输出可执行的 JSX 代码
- ✅ **实时预览** - 左右分屏，边生成边预览
- ✅ **专业设计** - 统一的视觉语言和组件风格

### V1 - 经典版本（保持可用）
- 支持通过输入框描述看板需求
- 支持后端通过 LLM 生成结构化大屏数据
- 支持前端流式接收并实时更新界面
- 支持生成接近 `VisdocModel` 的多分页文档结构

**切换版本**：点击界面右上角的版本切换按钮

## 技术栈

- `Next.js 16`
- `React 19`
- `Tailwind CSS 4`
- `Vercel AI SDK 6`
- `@ai-sdk/openai`（DeepSeek OpenAI 兼容接口）
- `ECharts`
- `Zod`

## 环境配置

1. 创建环境变量文件

```bash
cp .env.example .env.local
```

2. 在 `.env.local` 中填写模型配置

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

## 项目结构

```
src/
├── app/
│   ├── page.tsx                    # 主页面（支持 V1/V2 切换）
│   └── api/board/
│       ├── analyze/                # V1 - 需求分析
│       ├── structure/              # V1 - 页面结构
│       ├── visualize/              # V1 - 视觉设计
│       └── v2/                     # V2 - 新版 API
│           ├── design-vi/          # Step 1: VI 系统设计
│           ├── design-story/       # Step 2: 看板故事设计
│           └── generate-jsx/       # Step 3: JSX 代码生成
│
├── components/
│   ├── board-studio.tsx            # V1 主组件
│   └── v2/                         # V2 组件
│       ├── board-studio-v2.tsx     # V2 主工作室
│       ├── jsx-renderer.tsx        # JSX 动态渲染器
│       ├── vi-preview.tsx          # VI 系统预览
│       └── story-preview.tsx       # 看板故事预览
│
├── hooks/
│   ├── use-pipeline.ts             # V1 管线 Hook
│   └── use-pipeline-v2.ts          # V2 管线 Hook
│
└── lib/
    ├── v2/                         # V2 类型定义
    │   ├── board-story.ts          # 看板故事类型
    │   ├── vi-system.ts            # VI 系统类型
    │   └── jsx-output.ts           # JSX 输出类型
    │
    ├── analysis-report.ts          # V1 类型
    ├── structure-schema.ts         # V1 类型
    └── visual-system.ts            # V1 类型
```

## 使用示例

### 简单需求
```
创建一个销售数据看板
```

### 详细需求
```
创建一个电商运营监控大屏，需要展示：
1. 实时销售额和订单量（大数字 KPI）
2. 近30天销售趋势（折线图）
3. 品类销售占比（饼图）
4. TOP10 热销商品（排行榜）
5. 区域销售分布（柱状图）

使用深色科技风格，蓝色系为主色调。
目标受众是运营团队。
```

## API 端点

### V2 API（推荐）
```
POST /api/board/v2/design-vi       # Step 1: 设计 VI 系统
POST /api/board/v2/design-story    # Step 2: 设计看板故事
POST /api/board/v2/generate-jsx    # Step 3: 生成 JSX 代码
```

### V1 API（保持可用）
```
POST /api/board/analyze            # 需求分析
POST /api/board/structure          # 页面结构
POST /api/board/visualize          # 视觉设计
```

## 验证

```bash
# 类型检查
npx tsc --noEmit

# 代码检查
npm run lint

# 构建
npm run build
```

## 支持的组件类型

### V2
- 动态生成的 React 组件
- 使用 `React.createElement()` 格式
- 支持所有标准 HTML 元素
- 支持 ECharts 图表

### V1
- `text` - 文本标题
- `image` - 图片
- `pixel` - KPI 指标卡
- `select` - 筛选器
- `bar` - 柱状图
- `line` - 折线图
- `pie` - 饼图
- `funnel` - 漏斗图

## 常见问题

### Q: 如何切换版本？
A: 点击界面右上角的版本切换按钮，或修改 `src/app/page.tsx` 中的默认版本。

### Q: V2 生成失败怎么办？
A: 检查网络连接和 AI 服务状态，尝试简化需求描述，或切换回 V1 版本。

### Q: 如何使用生成的代码？
A: 点击"复制代码"按钮，将代码粘贴到你的 React 项目中，替换模拟数据为真实数据即可。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
