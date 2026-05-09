# 大屏设计体系 · 虚空紫星云（科幻展厅）

> Category: 数据可视化大屏 · Big Screen  
> **暗色主题**：深紫近黑底 + **品红 / 紫罗兰 / 电青** 渐变强调，适合品牌展厅、发布现场、创意运营大屏。

## 1. 视觉主题与氛围

- **场景**：**1920×1080**；强视觉层次与少量渐变光晕；中央可用大型图表或媒体位，四周环形 KPI。
- **气质**：未来感、舞台感；允许受控的渐变与 glow，但数据区域仍需冷静底色。
- **模式**：**暗色 UI**。

## 2. 色彩体系与 Token 角色映射

| 角色 | 参考 hex | 用途 |
|------|-----------|------|
| `--color-bg` | `#09090B` | 最深底 |
| `--color-surface` | `#18181B` | 模块 |
| `--color-surface-2` | `#27272A` | 次级 |
| `--color-muted` | `#3F3F46` | 弱对比 |
| `--color-primary` | `#E879F9` | 主强调（品红紫） |
| `--color-primary-hover` | `#F0ABFC` | 悬停 |
| `--color-accent` | `#22D3EE` | 电青辅助（与紫对比） |
| `--color-success` | `#4ADE80` |
| `--color-warning` | `#FBBF24` |
| `--color-danger` | `#FB7185` |
| `--color-info` | `#818CF8` | 靛紫信息 |
| `--color-text-primary` | `#FAFAFA` |
| `--color-text-secondary` | `#D4D4D8` |
| `--color-text-muted` | `#A1A1AA` |
| `--color-text-inverse` | `#09090B` |
| `--color-border` | `rgba(212,212,216,0.25)` |
| `--color-border-strong` | `rgba(232,121,249,0.45)` |
| `--color-grid` | `rgba(129,140,248,0.12)` |

**chartPalette（≥6 色）**  
`#E879F9` · `#818CF8` · `#22D3EE` · `#4ADE80` · `#FBBF24` · `#FB7185`

**`--dv-chart-*`**：绘图区偏 `#18181B`；网格淡紫或淡青；Tooltip 深 `#27272A`、浅字、紫细边。

**`--dv-chart-panel-*`**：`padding 0`、`border none`、`radius 0`、`panel-bg` 为 **color-mix** 弱 `--color-muted`。

## 3. KPI（`--kpi-*`）

深色渐变（如 `#18181B` → `#27272A`，可沿 135deg 混入 `#581C87` 极低比例）；数字浅色；**禁止** KPI 白底。

## 4. 字体与排版

- **展示**：`"Space Grotesk", "DM Sans", system-ui, sans-serif`；600–700。  
- **正文**：`"Inter", system-ui, sans-serif`。  
- **等宽**：`"IBM Plex Mono", monospace`。  
- **字号（px）**：12 · 14 · 16 · 18 · 24 · 30 · 38 · 48。

## 5. 间距、圆角与阴影

- 间距：8 / 12 / 16 / 24 / 32 / 48 / 64。  
- 圆角：**8–12px**（展厅感略柔）；图表容器本身仍随 `--dv-chart-panel-radius: 0`。  
- 阴影：多层 `box-shadow` 可用 **紫 / 青** 的 `color-mix` 低强度叠加，忌糊成一团。

## 6. 布局原则（大屏）

顶栏 **96px** 可略具「舞台顶光」渐变（仅用 Token，禁止裸 hex 出现在生成 JSX 样式外的约束由管线保证）；主体三分或对称栅格；**minmax(0,1fr)**。

## 7. 组件与交互

- 按钮 / Chip：紫描边 + 透明底；选中渐变条可沿 **primary → accent**（由 Token 描述，不由 JSX 硬编码色）。  
- 焦点环：可见轮廓 `#818CF8` 系。

## 8. 文案调性

短标题 + 强数字；副文案克制；避免低龄游戏 copy。

## 9. 反模式

- ❌ 全屏高饱和渐变导致数据不可读。  
- ❌ 浅色主界面。  
- ❌ 白色图表容器。  
- ❌ KPI 违反深色卡 + 浅色字规则。
