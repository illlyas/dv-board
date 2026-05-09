# 大屏设计体系 · 天蓝政务云（冷静指挥）

> Category: 数据可视化大屏 · Big Screen  
> **暗色主题**：海军蓝灰底色 + **天蓝 / 钴蓝** 强调，适合政务、交通、水利等强调可信与秩序的大屏。

## 1. 视觉主题与氛围

- **场景**：**1920×1080**；多区块仪表盘；地图或示意图居中时，两侧对齐条形图、趋势图、排行榜。
- **气质**：克制、权威、清晰；发光弱于赛博风，更偏「高密度仪表」。
- **模式**：**暗色 UI**。

## 2. 色彩体系与 Token 角色映射

| 角色 | 参考 hex | 用途 |
|------|-----------|------|
| `--color-bg` | `#020617` | 整屏底 |
| `--color-surface` | `#0F172A` | 模块底 |
| `--color-surface-2` | `#1E293B` | 次级 |
| `--color-muted` | `#334155` | 分割与弱底 |
| `--color-primary` | `#3B82F6` | 主强调 |
| `--color-primary-hover` | `#60A5FA` | 悬停 |
| `--color-accent` | `#0EA5E9` | 次级系列 / 链接感 |
| `--color-success` | `#22C55E` |
| `--color-warning` | `#F59E0B` |
| `--color-danger` | `#EF4444` |
| `--color-info` | `#06B6D4` |
| `--color-text-primary` | `#F8FAFC` |
| `--color-text-secondary` | `#CBD5E1` |
| `--color-text-muted` | `#94A3B8` |
| `--color-text-inverse` | `#020617` |
| `--color-border` | `rgba(148,163,184,0.35)` |
| `--color-border-strong` | `rgba(59,130,246,0.45)` |
| `--color-grid` | `rgba(59,130,246,0.1)` |

**chartPalette（≥6 色）**  
`#3B82F6` · `#0EA5E9` · `#22C55E` · `#F59E0B` · `#A855F7` · `#EF4444`

**`--dv-chart-*`**：网格细而淡；轴线 `#475569` 层级；Tooltip 深蓝灰底、白字、蓝灰边。

**`--dv-chart-panel-*`**：`0` / `none` / `0` + **color-mix** 弱 `--color-muted`。

## 3. KPI（`--kpi-*`）

深蓝灰渐变卡（如 `#0F172A` → `#1E293B`）；数值浅白；标签 `#CBD5E1`；禁用浅底 KPI。

## 4. 字体与排版

- **展示**：`"Source Han Sans SC", "Noto Sans SC", system-ui, sans-serif`（或 `"IBM Plex Sans", sans-serif`）；600–700。  
- **正文**：同一族 400–500。  
- **等宽**：`"JetBrains Mono", ui-monospace, monospace`。  
- **字号（px）**：12 · 14 · 16 · 18 · 22 · 28 · 36 · 44。

## 5. 间距、圆角与阴影

- 间距：8 / 12 / 16 / 24 / 32 / 40 / 48。  
- 圆角：**6–10px**（略柔和但仍政务感）；图表外壳仍跟 Token **无圆角**约定。  
- 阴影：极低 `y` 偏移 + 冷色微弱外晕。

## 6. 布局原则（大屏）

顶栏 **96px** 内：居中大标题 + 可选日期筛选；主体 **三栏或 2+1** 栅格；**minmax(0,1fr)**；禁止 `auto` 行承载无高度约束图表。

## 7. 组件与交互

- Tab / 分段控件：蓝灰描边；选中 **primary** 底或左指示条。  
- 表格：斑马 `--color-surface` / `--color-surface-2`。

## 8. 文案调性

客观、可审计感；避免口语化感叹。

## 9. 反模式

- ❌ 高饱和霓虹铺满（与本体系克制定位冲突）。  
- ❌ 浅色主背景或白色图表卡片。  
- ❌ KPI 违反深色卡规则。  
- ❌ 声明 light mode 为主。
