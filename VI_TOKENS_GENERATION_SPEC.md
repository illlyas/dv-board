# VI Tokens Generation Spec

> 本文档是 **Claude Code / Codex 等编程 AI 工具** 在仓库内执行
> 「读取 `design-systems/<style>/DESIGN.md` → 产出 `vi-tokens.json`」
> 任务时必须遵守的离线规范。本文档**不是**产品端用户触发的 design-vi
> 流水线 Prompt，运行时 Prompt 见
> [`src/lib/board/design-vi-system-prompt.ts`](src/lib/board/design-vi-system-prompt.ts)，
> 二者保持语义一致，本文档为权威源。

---

## 0. Meta

| 项 | 值 |
|---|---|
| 适用对象 | Claude Code / Codex / 任何具备文件读写能力的编程 AI |
| 输入 | `design-systems/<style>/DESIGN.md`（单文件，UTF-8） |
| 输出 | `<目标目录>/vi-tokens.json`（严格 JSON） |
| 参考样本 | [`board-templates/wind-power-emerald-ops/vi-tokens.json`](board-templates/wind-power-emerald-ops/vi-tokens.json) |
| 与运行时 Prompt 关系 | 本文档为权威源；`design-vi-system-prompt.ts` 是其精炼镜像。两者冲突时，以本文档为准并提交修正 PR。 |
| 禁止事项 | 不在输出 JSON 中添加 markdown 围栏、注释、解释文字；不修改运行时 Prompt 与 Schema |

**为什么需要这份规范**：现状中 `design-systems/` 下不同风格独立产出的
`vi-tokens.json` 在键集合、命名、缺失项处理上各不相同，导致下游
`generate-jsx` 注入 CSS 变量时出现 `var(--xxx)` 取不到值或视觉错位。
本文档统一约束键集合、取值类型、缺失项回退公式与自检流程。

---

## 1. 五步工作流

按以下顺序执行，**不允许跳步**：

```
1. 读取 DESIGN.md 全文
        ↓
2. 判定 mode（dark / light）       ← 必须最先，且不可在后续步骤推翻
        ↓
3. 提取核心色 / 字体 / 间距等可见 token
        ↓
4. 按命名空间扩展为全量 cssVariables
   缺失项使用第 5 节的回退公式推导
        ↓
5. 输出 raw 溯源块 + 走完第 11 节自检清单
```

每一步的产物在内部记录（文件注释或 commit message 中可附），
但**最终 JSON 输出仅包含 `mode` / `cssVariables` / `chartPalette` /
`raw` 四个顶层键**。

---

## 2. Mode 判定规则（核心，单独成章）

`mode` 是后续所有色彩取值的根。**必须最先确定，确定后不得在后续步骤中
被任何 token 推翻**。

### 2.1 四级优先级（自上而下，命中即停）

| 优先级 | 触发条件 | 结论 |
|---|---|---|
| L1 显式声明 | DESIGN.md 出现 `dark mode` / `dark UI` / `dark theme` / `暗色` / `深色主题` | `dark` |
| L1 显式声明 | DESIGN.md 出现 `light mode` / `light UI` / `light theme` / `浅色` / `亮色主题` | `light` |
| L2 场景调性词 | 描述含「深色 / 黑色 / 星空 / 夜空 / 电影感 / 科技感 / 沉浸感 / 高级黑 / cinematic / immersive」 | `dark` |
| L2 场景调性词 | 描述含「清新 / 纯白 / 纸质 / 明亮 / 乳白 / 浅灰 / paper / clean / bright」 | `light` |
| L3 主背景亮度 | 主背景色 HSL `L ≥ 50%` 或 RGB 平均 `≥ 128` | `light` |
| L3 主背景亮度 | 否则 | `dark` |
| L4 品牌常识兜底 | Apple / Tesla / Netflix / Spotify / X / Binance / Runway / 任何「大屏 / 数据驾驶舱」类品牌 | `dark` |
| L4 品牌常识兜底 | Google / Airbnb / Notion / Linear / Stripe / Figma / 任何 SaaS 产品页类品牌 | `light` |

### 2.2 判定证据

执行 AI 必须能口头复述判定证据（无需写入 JSON），格式：
```
mode=dark, hit=L2, evidence="文档第 3 节 Visual Theme 描述为 'cinematic dark cockpit'"
```

### 2.3 mode 与三色硬约束

mode 一旦确定，下列三个 token 必须自洽：

| token | dark | light |
|---|---|---|
| `--color-bg` | HSL `L ≤ 25%` | HSL `L ≥ 92%` |
| `--color-surface` | HSL `L ≤ 35%` | 通常纯白或近白 |
| `--color-text-primary` | HSL `L ≥ 92%`（如 `#ffffff`、`rgba(255,255,255,0.92)`） | HSL `L ≤ 20%`（如 `#111111`、`#1d1d1f`） |

**禁止**：在 dark 模式下出现浅色 `--color-bg`，或在 light 模式下出现深色
`--color-text-primary`。

---

## 3. cssVariables 必填清单（按命名空间分组）

参考 [`wind-power-emerald-ops/vi-tokens.json`](board-templates/wind-power-emerald-ops/vi-tokens.json)
抽象出 **9 个命名空间**。除标注「可选」外，**每一项都必须有非空值**，
缺失项按第 5 节公式推导。

### 3.1 颜色 `--color-*`（19 项必填 + 1 项可选）

| Key | 类型 | 语义 | 必填 |
|---|---|---|---|
| `--color-bg` | hex / rgba | 主背景，整屏最深底（dark）/ 最浅底（light） | ✅ |
| `--color-surface` | hex / rgba | 顶栏、模块衬底 | ✅ |
| `--color-surface-2` | hex / rgba | hover/选中模块、次级表面 | ✅ |
| `--color-muted` | hex / rgba | 弱衬，分割线内侧、图表绘图区弱底 | ✅ |
| `--color-primary` | hex | 核心强调、主数据线、发光勾边 | ✅ |
| `--color-primary-hover` | hex | 主色交互高亮 | ✅ |
| `--color-accent` | hex | 次级高亮、图例次要系列 | ✅ |
| `--color-accent-gold` | hex | 琥珀金/香槟金属高亮（用于环形指标、警示金边） | ✅ |
| `--color-success` | hex | 正向指标 | ✅ |
| `--color-warning` | hex | 警示数据 | ✅ |
| `--color-danger` | hex | 警戒值、错误 | ✅ |
| `--color-info` | hex | 辅助提示 | ✅ |
| `--color-text-primary` | hex / rgba | 正文标题、数值 | ✅ |
| `--color-text-secondary` | hex / rgba | 次要文字 | ✅ |
| `--color-text-muted` | hex / rgba | 辅助、占位 | ✅ |
| `--color-text-inverse` | hex | 反色文案，用于主色实心按钮上 | ✅ |
| `--color-border` | rgba | 模块分割边界 | ✅ |
| `--color-border-strong` | rgba | 强调边框、发光勾边 | ✅ |
| `--color-grid` | rgba | 图表网格背景（弱透明） | ✅ |
| `--color-overlay` | rgba | 全屏遮罩底（如弹窗、loading） | ✅ |

> **`--color-accent-gold` 不可与 `--color-accent` 完全相同**；色相必须落在
> `[35°, 50°]` 偏暖区间。

### 3.2 排版 `--font-*` / `--font-size-*` / `--font-weight-*` / `--line-height-*` / `--letter-spacing-*`

| Key | 类型 | 必填值 |
|---|---|---|
| `--font-display` | string | 含降级栈，示例 `"Rajdhani","Bahnschrift","DIN Alternate",system-ui,sans-serif` |
| `--font-body` | string | 含降级栈 |
| `--font-mono` | string | 含降级栈 |
| `--font-size-xs` | px | 默认 `12px` |
| `--font-size-sm` | px | 默认 `14px` |
| `--font-size-md` | px | 默认 `16px` |
| `--font-size-lg` | px | 默认 `18px` |
| `--font-size-xl` | px | 默认 `22px` |
| `--font-size-2xl` | px | 默认 `28px` |
| `--font-size-3xl` | px | 默认 `34px` |
| `--font-weight-regular` | int 字符串 | `"400"` |
| `--font-weight-medium` | int 字符串 | `"500"` |
| `--font-weight-semibold` | int 字符串 | `"600"` |
| `--font-weight-bold` | int 字符串 | `"700"` |
| `--line-height-tight` | number 字符串 | 默认 `"1.15"` |
| `--line-height-normal` | number 字符串 | 默认 `"1.45"` |
| `--line-height-relaxed` | number 字符串 | 默认 `"1.55"` |
| `--letter-spacing-tight` | em 字符串 | 默认 `"-0.01em"` |
| `--letter-spacing-normal` | em 字符串 | 默认 `"0"` |
| `--letter-spacing-wide` | em 字符串 | 默认 `"0.08em"` |

### 3.3 间距 `--space-*`（9 项）

8px 基准网格：

| Key | 默认 |
|---|---|
| `--space-1` | `8px` |
| `--space-2` | `12px` |
| `--space-3` | `16px` |
| `--space-4` | `24px` |
| `--space-5` | `32px` |
| `--space-6` | `48px` |
| `--space-8` | `64px` |
| `--space-10` | `96px` |
| `--space-12` | `128px` |

### 3.4 圆角 `--radius-*`（5 项）

| Key | 默认 |
|---|---|
| `--radius-sm` | `4px` |
| `--radius-md` | `6px` |
| `--radius-lg` | `8px` |
| `--radius-xl` | `12px` |
| `--radius-pill` | `9999px`（**固定值**，禁止改写） |

### 3.5 阴影 `--shadow-*`（4 项）

完整 CSS shadow 字符串：

| Key | 类型 |
|---|---|
| `--shadow-sm` | string，如 `0 0 2px rgba(...)` |
| `--shadow-md` | string |
| `--shadow-lg` | string |
| `--shadow-xl` | string |

### 3.6 动效 `--motion-*`（4 项）

| Key | 默认 |
|---|---|
| `--motion-fast` | `150ms` |
| `--motion-normal` | `200ms`（推荐 200~300ms） |
| `--motion-slow` | `240ms`（推荐 240~500ms） |
| `--motion-easing` | `ease-out` 或 `cubic-bezier(0.4,0,0.2,1)` |

### 3.7 边框宽度 / 模糊 `--border-width-*` / `--backdrop-blur`

| Key | 默认 |
|---|---|
| `--border-width-thin` | `1px`（固定） |
| `--border-width-normal` | `2px`（固定） |
| `--backdrop-blur` | `0px`（默认）；玻璃拟态系统可设 `8px ~ 16px` |

### 3.8 图表域 `--dv-chart-*`（关键，外层壳必填，其余按需）

**外层壳 4 件套（必填，固定语义）**：

| Key | 强制取值 |
|---|---|
| `--dv-chart-panel-bg` | `transparent` 或 `color-mix(in srgb, var(--color-muted) N%, transparent)`（N ≤ 10），形成无卡片底 |
| `--dv-chart-panel-padding` | **必须 `0`** |
| `--dv-chart-panel-border` | **必须 `none`** |
| `--dv-chart-panel-radius` | **必须 `0`** |

**绘图区底（必填，唯一合法值）**：

| Key | 强制取值 |
|---|---|
| `--dv-chart-plot-bg` | **唯一合法**：`color-mix(in srgb, var(--color-text-primary) 15%, transparent)`，不允许其它比例、不允许 hex 实色、不允许省略 |

**坐标 / 网格 / 图例 / Tooltip / 引导线（按需追加；一旦写出就必须非空）**：

| Key | 语义 |
|---|---|
| `--dv-chart-grid-stroke` | 网格线颜色 |
| `--dv-chart-grid-dash` | 虚线模式，如 `"2 8"` |
| `--dv-chart-axis-line` | 坐标轴线 |
| `--dv-chart-axis-tick-stroke` | 刻度短线 |
| `--dv-chart-tick-label` | 刻度数字 |
| `--dv-chart-axis-title` | 轴标题 |
| `--dv-chart-legend-text` | 图例文字 |
| `--dv-chart-legend-inactive` | 图例未激活态 |
| `--dv-chart-tooltip-bg` | Tooltip 背景 |
| `--dv-chart-tooltip-border` | Tooltip 边框 |
| `--dv-chart-tooltip-fg` | Tooltip 文字 |
| `--dv-chart-label-line` | 饼图标签引导线 |
| `--dv-chart-reference-stroke` | 目标线 / 参考线（与 `--color-warning/danger` 一致） |

**图表标题区（可选覆盖）**：`--dv-chart-title-color-backdrop` / `--dv-chart-title-font-size` / `--dv-chart-title-font-size-compact` / `--dv-chart-title-font-weight` / `--dv-chart-title-font-weight-compact` / `--dv-chart-title-line-height` / `--dv-chart-title-font-family` / `--dv-chart-title-gap-after-title` / `--dv-chart-title-subtitle-font-size` / `--dv-chart-title-block-margin-bottom` / `--dv-chart-title-backdrop-padding`。未写出则由应用默认引用全局 `--font-*` / `--space-*`。

### 3.9 KPI 卡 `--kpi-*`（5 项必填 + 1 项可选）

> **特殊规则：与 mode 解耦**。无论 mode=dark 或 light，KPI 卡始终是
> 「深底浅字」组合。

| Key | 类型 | 约束 |
|---|---|---|
| `--kpi-bg-from` | hex | HSL `L ≤ 30%`，渐变起点（如 `#0f172a`） |
| `--kpi-bg-to` | hex | HSL `L ≤ 30%`，渐变终点（如 `#1e293b`） |
| `--kpi-text-primary` | hex / rgba | 浅色，`#ffffff` 或 `rgba(255,255,255,0.92~1.0)`，与 bg-from 对比度 ≥ 4.5:1 |
| `--kpi-text-secondary` | rgba | `rgba(255,255,255,0.65~0.8)` |
| `--kpi-text-muted` | rgba | `rgba(255,255,255,0.4~0.55)` |
| `--kpi-glow-base` | var 引用（可选） | 仅放**色相**，如 `var(--color-primary)`；**禁止**写完整 `text-shadow` 串；不发光主题可省略此键 |

---

## 4. 命名与取值约定

| 维度 | 规则 |
|---|---|
| 颜色取值 | hex（`#rrggbb` / `#rrggbbaa`）或 `rgba(...)`；**禁止** CSS 色名（red / black 等） |
| 尺寸单位 | 长度统一 px；圆角 px 或 9999px；时间 ms |
| 阴影 | 完整 CSS shadow 字符串，含 `offset blur color`，多层用 `,` 拼接 |
| 字体族 | **必须含降级栈**，例如 `"SF Pro Display", system-ui, sans-serif`；不允许单字体名 |
| Var 交叉引用 | **允许且鼓励**，如 `--kpi-glow-base: var(--color-primary)`；引用必须指向已定义的键 |
| 键命名 | kebab-case，前缀固定（见第 3 节命名空间），禁止自创前缀 |
| 顶层键顺序 | `mode` → `cssVariables` → `chartPalette` → `raw`，固定 |
| `cssVariables` 内键顺序 | 按第 3.1 → 3.9 的命名空间分组顺序排列，组内按本规范的 Key 顺序 |

---

## 5. 缺失项回退公式（基于品牌调性推导）

DESIGN.md 未明示的项**禁止留空、禁止猜测**，按下列确定性公式推导。
所有公式以 `--color-primary` 与 `mode` 为锚。

### 5.1 颜色阶梯

| 目标 | 公式 |
|---|---|
| `--color-primary-hover` | `lighten(primary, +8% L)`（dark 模式） / `darken(primary, -8% L)`（light 模式） |
| `--color-accent` | `rotate(primary, +15°)`，再调 L 至与 primary 相近 |
| `--color-accent-gold` | 取 hue ∈ `[35°, 50°]`、`S=70%~85%`、`L=55%~75%` 的金色；推导式 `mix(--color-warning, --color-primary, 30%)` 后将 hue 钳制到金色区间 |
| `--color-success` | DESIGN.md 未给则固定 `#22C55E`（dark）或 `#16A34A`（light） |
| `--color-warning` | 固定 `#FACC15` |
| `--color-danger` | 固定 `#F87171`（dark）或 `#DC2626`（light） |
| `--color-info` | 固定 `#38BDF8` |

### 5.2 表面阶梯

| 目标 | dark 模式公式 | light 模式公式 |
|---|---|---|
| `--color-bg` | 文档主背景；缺则取 primary hue 的 `L=5%` 极深底 | primary hue 的 `L=98%` 极浅底（或 `#FAFAFA`） |
| `--color-surface` | `bg.L + 4~6%` | `bg.L - 2%` 或纯白 `#FFFFFF` |
| `--color-surface-2` | `surface.L + 4~6%` | `surface.L - 2%` |
| `--color-muted` | `surface-2.L + 4~6%` | `surface-2.L - 2%` |

### 5.3 文本

| 目标 | dark | light |
|---|---|---|
| `--color-text-primary` | 取 primary hue 的 `L=95%~98%`（如 `#E8FFE8`），与 bg 对比度 ≥ 4.5:1 | `L=10%~18%`（如 `#111111`） |
| `--color-text-secondary` | text-primary @ alpha `0.72`（或独立浅色 `L=75%`） | text-primary @ alpha `0.72` |
| `--color-text-muted` | text-primary @ alpha `0.42`（或独立浅色 `L=55%`） | text-primary @ alpha `0.42` |
| `--color-text-inverse` | = `--color-bg` 的实色版本 | = `--color-bg` 的实色版本 |

### 5.4 边框 / 网格

| 目标 | dark | light |
|---|---|---|
| `--color-border` | `rgba(primary, 0.22)` 或 `rgba(255,255,255,0.12)` | `rgba(0,0,0,0.08)` |
| `--color-border-strong` | `rgba(primary, 0.55)` 或 `rgba(255,255,255,0.28)` | `rgba(0,0,0,0.18)` |
| `--color-grid` | `rgba(primary, 0.08)` 或 `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.05)` |
| `--color-overlay` | `rgba(0,0,0,0.65)` | `rgba(0,0,0,0.45)` |

### 5.5 字号 / 间距 / 圆角

| 族 | 默认值 | 覆盖条件 |
|---|---|---|
| `--font-size-*` | `12 / 14 / 16 / 18 / 22 / 28 / 34` px | DESIGN.md 显式给出字号阶梯则覆盖 |
| `--space-*` | 8px 基准的 `1 / 1.5 / 2 / 3 / 4 / 6 / 8 / 12 / 16` 倍 | DESIGN.md 显式给出 baseUnit 则按比例缩放 |
| `--radius-*` | `4 / 6 / 8 / 12 / 9999` px | DESIGN.md 描述「方正 / sharp / brutalism」→ 全部减半（`2 / 4 / 6 / 8 / 9999`）；描述「柔和 / soft」→ 翻倍封顶 16px |

### 5.6 阴影

| mode | 公式 |
|---|---|
| dark | 主色 glow：`--shadow-sm = "0 0 2px rgba(primary, 0.4)"` / md `0 0 6px rgba(primary, 0.35)` / lg `0 0 12px rgba(primary, 0.45)` / xl `0 0 20px rgba(primary, 0.55)` |
| light | 中性投影：`--shadow-sm = "0 1px 2px rgba(0,0,0,0.05)"` / md `0 4px 6px -1px rgba(0,0,0,0.10)` / lg `0 10px 15px -3px rgba(0,0,0,0.10)` / xl `0 20px 25px -5px rgba(0,0,0,0.10)` |

### 5.7 字体族

DESIGN.md 未指定具体字体时：

| Key | 默认 |
|---|---|
| `--font-display` | `"Inter","PingFang SC",system-ui,sans-serif`（科技/数据大屏可用 `"Rajdhani","Bahnschrift","DIN Alternate",system-ui,sans-serif`） |
| `--font-body` | `system-ui,"Segoe UI","PingFang SC",sans-serif` |
| `--font-mono` | `ui-monospace,"JetBrains Mono","Fira Code",monospace` |

DESIGN.md 指定单一字体时（如 `SF Pro Display`），**必须补全降级栈**。

---

## 6. mode 自洽硬约束（校验表）

生成后必须验证：

| 项 | dark 必满足 | light 必满足 |
|---|---|---|
| `--color-bg` HSL.L | ≤ 25% | ≥ 92% |
| `--color-surface` HSL.L | ≤ 35% | 通常 ≥ 96% |
| `--color-text-primary` HSL.L | ≥ 92% | ≤ 20% |
| `--color-text-primary` 与 `--color-bg` 对比度 | ≥ 4.5:1 (WCAG AA) | ≥ 4.5:1 |
| `--color-grid` 透明度 | 半透明白 / 弱主色 | 半透明黑 / 浅灰 |
| `--color-border` 透明度 | 半透明白 / 主色 0.22 | 半透明黑 0.08 |

任一项不满足 → 重算该 token。

---

## 7. 三个易错的专项 token（重申）

### 7.1 `--dv-chart-plot-bg` 唯一合法值

```
"--dv-chart-plot-bg": "color-mix(in srgb, var(--color-text-primary) 15%, transparent)"
```

- **禁止**改比例（不允许 10% / 20% 等）。
- **禁止**写实色 hex / rgba。
- **禁止**省略此键。

### 7.2 图表壳 4 件套

```
"--dv-chart-panel-bg":      "transparent",   // 或 color-mix(... muted ≤10%, transparent)
"--dv-chart-panel-padding": "0",
"--dv-chart-panel-border":  "none",
"--dv-chart-panel-radius":  "0"
```

四个键必须**全部**出现，取值与上面语义等价。目的是让图表 widget
不再渲染卡片白底/圆角/边框，由父容器统一控制。

### 7.3 `--kpi-*` 永远深底浅字

```
"--kpi-bg-from":      "#081C16",            // L ≤ 30%
"--kpi-bg-to":        "#0F2A20",            // L ≤ 30%
"--kpi-text-primary": "#E8FFE8",            // 浅色
"--kpi-text-secondary": "rgba(232,255,232,0.72)",
"--kpi-text-muted":   "rgba(232,255,232,0.42)",
"--kpi-glow-base":    "var(--color-primary)"   // 仅色相，可省略
```

- 即使 mode=light，KPI 卡仍是深底浅字（业务约束，不可放宽）。
- `--kpi-glow-base` **只放色相变量引用**，不要写完整 `text-shadow`
  字符串（运行时按公式生成多层 blur）。

---

## 8. chartPalette

- 长度 `≥ 6`，`≤ 12`。
- 排序：`primary → 次级 → 对比色`。
- 当前 mode 的 `--color-bg` 下，每个色与背景对比度 `≥ 3:1`。
- 相邻两色的 hue 差 `≥ 12°`，避免视觉混淆。
- 数据可视化语境，避免使用饱和度过低的灰系（除非作为对比色压尾）。

示例（dark + 翠绿主色）：

```json
["#5FE48C", "#3AFF9B", "#22C55E", "#86EFAC", "#FACC15", "#F87171"]
```

---

## 9. raw 块（溯源）

`raw` 与 `cssVariables` **双向可追溯**：每个 `raw.color.*` 项必须能在
`cssVariables` 中找到对应键，反之亦然。结构与
[`wind-power-emerald-ops/vi-tokens.json`](board-templates/wind-power-emerald-ops/vi-tokens.json)
保持一致：

```jsonc
"raw": {
  "color": {
    "primary":   { "name": "...", "hex": "...", "usage": "..." },
    "secondary": [ { "name": "...", "hex": "...", "usage": "..." } ],
    "accent":    [ ... ],
    "surface":   [ { "name": "主背景", "hex": "...", "usage": "..." }, ... ],
    "text":      [ { "name": "主文案", "hex": "...", "usage": "..." }, ... ],
    "border":    [ { "name": "边框", "hex": "rgba(...)", "usage": "..." }, ... ],
    "semantic":  {
      "success": { "name": "成功", "hex": "...", "usage": "..." },
      "warning": { ... }, "danger": { ... }, "info": { ... }, "grid": { ... }
    }
  },
  "typography": {
    "fontFamily": { "display": "...", "body": "...", "mono": "..." },
    "scale":   [ { "size": "12px", "usage": "xs" }, ... ],
    "weights": [ { "weight": 400, "name": "regular" }, ... ]
  },
  "spacing": { "baseUnit": "8px", "scale": ["8px", ...] },
  "radius":  { "sm": "...", "md": "...", "lg": "...", "xl": "...", "pill": "9999px" },
  "shadow":  { "sm": "...", "md": "...", "lg": "...", "xl": "..." },
  "motion":  { "fast": "...", "normal": "...", "slow": "...", "easing": "..." },
  "components": {
    "button":     { "background": "...", "border": "...", "active": "..." },
    "card":       { "background": "...", "border": "...", "radius": "..." },
    "input":      { "background": "...", "border": "...", "focus": "..." },
    "navigation": { "tab": "..." }
  }
}
```

`raw.color.*` 子项最小字段表：`{ name: string, hex: string, usage: string }`。

---

## 10. 输出契约

- **严格 JSON**：UTF-8、双引号、无尾逗号。
- **禁止**：markdown 围栏（如 ```` ```json ````）、`//` 或 `/* */` 注释、
  说明性文字。
- **顶层键固定 4 个**：`mode` / `cssVariables` / `chartPalette` / `raw`，
  顺序如示例。
- 文件落盘路径：与项目内已有 vi-tokens.json 同名同位（如
  `board-templates/<id>/vi-tokens.json` 或 design-vi 流水线返回值），
  由调用方决定具体路径；本规范只约束**内容**。

---

## 11. 自检清单（生成后 AI 必走，逐条勾选）

- [ ] **C01** mode 已确定，且记录了命中的优先级与证据
- [ ] **C02** `--color-bg` / `--color-surface` / `--color-text-primary` 与 mode 自洽（对照第 6 节）
- [ ] **C03** `--color-text-primary` 与 `--color-bg` 对比度 ≥ 4.5:1
- [ ] **C04** 第 3.1 节列出的 19 项 `--color-*` 必填全部非空
- [ ] **C05** `--color-accent-gold` 与 `--color-accent` 不相等，hue ∈ `[35°, 50°]`
- [ ] **C06** 第 3.2 节排版 token 全部非空，字体族含降级栈
- [ ] **C07** `--space-*` 9 项、`--radius-*` 5 项、`--shadow-*` 4 项、`--motion-*` 4 项全部非空
- [ ] **C08** `--radius-pill` 严格等于 `9999px`
- [ ] **C09** `--dv-chart-plot-bg` 严格等于 `color-mix(in srgb, var(--color-text-primary) 15%, transparent)`
- [ ] **C10** 图表壳 4 件套全部出现：panel-padding=`0`、panel-border=`none`、panel-radius=`0`、panel-bg 为 transparent 或弱 muted color-mix
- [ ] **C11** 任何写出的 `--dv-chart-*` 键值非空
- [ ] **C12** `--kpi-bg-from` 与 `--kpi-bg-to` 两端 HSL `L ≤ 30%`
- [ ] **C13** `--kpi-text-primary` 与 `--kpi-bg-from` 对比度 ≥ 4.5:1
- [ ] **C14** `--kpi-glow-base`（若出现）值为 `var(...)` 引用，不是完整 text-shadow 串
- [ ] **C15** chartPalette 长度 ≥ 6，相邻 hue 差 ≥ 12°，每色与 bg 对比度 ≥ 3:1
- [ ] **C16** raw 块结构完整，与 cssVariables 双向可追溯
- [ ] **C17** 输出为纯 JSON：无围栏、无注释、无解释文字；顶层键顺序为 mode → cssVariables → chartPalette → raw

任一项 ❌ → 修正后重跑清单，**禁止**带不通过项落盘。

---

## 12. 反例对照

### 反例 A：mode 与 bg 矛盾

```jsonc
{
  "mode": "dark",
  "cssVariables": {
    "--color-bg": "#FAFAFA",          // ❌ dark 模式却给浅底
    "--color-text-primary": "#111"    // ❌ 跟着错成深字
  }
}
```

**修正**：mode 已判为 dark，按第 5.2 节回退 `--color-bg` 至 `L ≤ 25%`
的深底，文本换成 `L ≥ 92%` 浅字。

### 反例 B：`--dv-chart-plot-bg` 比例错

```jsonc
"--dv-chart-plot-bg": "color-mix(in srgb, var(--color-text-primary) 10%, transparent)"
// ❌ 比例必须是 15%，不是 10%
```

**修正**：替换为唯一合法值
`color-mix(in srgb, var(--color-text-primary) 15%, transparent)`。

### 反例 C：KPI 卡跟随 mode 变浅

```jsonc
{
  "mode": "light",
  "cssVariables": {
    "--kpi-bg-from": "#FFFFFF",        // ❌ 跟随 light mode 用了纯白底
    "--kpi-text-primary": "#111111"     // ❌ 深字
  }
}
```

**修正**：KPI 与 mode 解耦。无论 light/dark，`--kpi-bg-*` 必须
`L ≤ 30%` 深底，`--kpi-text-primary` 必须浅色。

---

## 附录 A：与运行时 Prompt 的差异同步

本文档与 [`src/lib/board/design-vi-system-prompt.ts`](src/lib/board/design-vi-system-prompt.ts)
保持语义一致。两者出现冲突时：

1. 本文档为权威源。
2. 修改本文档后，需同步精炼版本到运行时 Prompt（保留硬约束、压缩说明文字）。
3. 提交 PR 时在 description 列出受影响的 token 族，便于回归。

## 附录 B：与项目内其他 Token 文件的关系

| 文件 | 角色 |
|---|---|
| [`src/lib/dv-chart-tokens.ts`](src/lib/dv-chart-tokens.ts) | 图表组件读取 `--dv-chart-*` 的常量映射；本规范的 3.8 节键集合必须与它对齐 |
| [`src/lib/board/vi-system.ts`](src/lib/board/vi-system.ts) | Zod Schema（产品端 design-vi 流水线运行时使用），命名风格不同（驼峰），不在本规范约束内 |
| [`board-templates/<id>/vi-tokens.json`](board-templates/) | 模板市场的成品产物，结构必须满足本规范 |

## 附录 C：术语

- **mode**：`"dark"` 或 `"light"`，全局色系的根，运行时不可切换。
- **token / cssVariable**：`--xxx` 形式的 CSS 自定义属性键值对。
- **raw**：可读的设计意图溯源块，便于人和 AI 二次理解。
- **HSL.L**：HSL 颜色空间的亮度分量，用于自洽校验。
- **color-mix**：CSS Color Module Level 5 的颜色混合函数，本规范用于
  绘图区底与图表壳。
