# 大屏设计体系 · 琥珀熔炉（能源工业）

> Category: 数据可视化大屏 · Big Screen  
> **暗色主题**：炭黑炉膛底色 + **琥珀 / 熔橙** 强调 + 金属灰层级，适合能源、制造、电力调度类大屏。

## 1. 视觉主题与氛围

- **场景**：**1920×1080** 固定画布；热力图、负荷曲线、设备状态占比为核心；中央可用示意图或地图占位。
- **气质**：厚重、力量感、工业精密；强调色偏暖，与冷灰底形成「高温焦点」。
- **模式**：**暗色 UI**，无浅色主界面。

## 2. 色彩体系与 Token 角色映射

| 角色 | 参考 hex | 用途 |
|------|-----------|------|
| `--color-bg` | `#0C0A09` | 整屏最深 |
| `--color-surface` | `#1C1917` | 模块衬底 |
| `--color-surface-2` | `#292524` | 次级块 |
| `--color-muted` | `#44403C` | 弱分割、图表弱底 |
| `--color-primary` | `#F59E0B` | 主强调（琥珀） |
| `--color-primary-hover` | `#FBBF24` | 悬停提亮 |
| `--color-accent` | `#EA580C` | 次级强调（熔橙） |
| `--color-success` | `#84CC16` | 正常 / 达标 |
| `--color-warning` | `#EAB308` | 注意 |
| `--color-danger` | `#EF4444` | 告警 / 停机 |
| `--color-info` | `#38BDF8` | 信息提示（冷色点缀） |
| `--color-text-primary` | `#FAFAF9` | 主文案 |
| `--color-text-secondary` | `#A8A29E` | 次级 |
| `--color-text-muted` | `#78716C` | 弱化 |
| `--color-text-inverse` | `#0C0A09` | 琥珀实心按钮字色 |
| `--color-border` | `rgba(168,162,158,0.35)` | 默认边线 |
| `--color-border-strong` | `rgba(245,158,11,0.5)` | 激活模块勾边 |
| `--color-grid` | `rgba(245,158,11,0.08)` | 背景网格暗示 |

**chartPalette（≥6 色）**  
`#F59E0B` · `#EA580C` · `#FBBF24` · `#84CC16` · `#38BDF8` · `#EF4444`

**`--dv-chart-*` 描述**  
网格与轴线用暖灰褐低透明度；Tooltip 深棕灰底、浅字、琥珀 1px 边；图例字色 `--color-text-secondary`。

**`--dv-chart-panel-*`**：`padding: 0`，`border: none`，`radius: 0`，`background` 为 **color-mix** 弱 `--color-muted`。

## 3. KPI（`--kpi-*`）

深色渐变卡（如 `#1C1917` → `#292524`，可微混琥珀）；数字与标题 **浅色**；三级灰度区分标签 / 单位 / 对比。

## 4. 字体与排版

- **展示 / 数据**：`"Barlow Condensed", "Arial Narrow", system-ui, sans-serif`；600–700。  
- **正文**：`system-ui, sans-serif`。  
- **等宽**：`ui-monospace, Consolas, monospace`。  
- **字号（px）**：12 · 14 · 16 · 18 · 24 · 32 · 40 · 56。

## 5. 间距、圆角与阴影

- 间距：8 基准；8 / 12 / 16 / 24 / 32 / 48。  
- 圆角：模块 **4–6px**；工业风可用 **0**。  
- 阴影：短偏移 + 低扩散 + 琥珀色 `color-mix` 外晕，忌浮夸长投影。

## 6. 布局原则（大屏）

同「青蓝赛博」：**1920×1080**，顶栏 **~96px**，main **minHeight:0**；栅格 **minmax(0,1fr)**；模块高度用 px 或比例锁定，防图表撑破画布。

## 7. 组件与交互

- 进度条、环形：主轨道深灰，进度 **primary 渐变**。  
- 筛选：半透明石色底 + `--color-border`；选中 **primary** 描边或填充。

## 8. 文案调性

冷静报告体；指标带单位；告警句短促明确。

## 9. 反模式

- ❌ 大色块纯橙背景（淹没数据）。  
- ❌ 浅色整页或白色图表壳。  
- ❌ KPI 浅色底深色字。  
- ❌ 与暗色主题矛盾的 light mode。
