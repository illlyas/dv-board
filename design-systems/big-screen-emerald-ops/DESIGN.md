# 大屏设计体系 · 翠绿运维（安全监控）

> Category: 数据可视化大屏 · Big Screen  
> **暗色主题**：近黑绿灰底 + **翠绿 / 薄荷** 强调，适合机房、网络安全、物联网态势。

## 1. 视觉主题与氛围

- **场景**：**1920×1080**；拓扑、心跳曲线、告警列表、合规评分并排；绿色表征「正常」，红橙表征异常。
- **气质**：矩阵式秩序感；可读性优先于装饰；可有轻微「扫描线」隐喻但勿遮挡数据。
- **模式**：**暗色 UI**。

## 2. 色彩体系与 Token 角色映射

| 角色 | 参考 hex | 用途 |
|------|-----------|------|
| `--color-bg` | `#030712` | 整屏 |
| `--color-surface` | `#0B1F14` | 模块（带绿倾向的深灰） |
| `--color-surface-2` | `#132A1F` | 次级块 |
| `--color-muted` | `#1F3D2E` | 弱底、分割 |
| `--color-primary` | `#4ADE80` | 主强调 |
| `--color-primary-hover` | `#86EFAC` | 悬停 |
| `--color-accent` | `#2DD4BF` | 青绿辅助系列 |
| `--color-success` | `#22C55E` | 正常 |
| `--color-warning` | `#FACC15` | 预警 |
| `--color-danger` | `#F87171` | 严重 |
| `--color-info` | `#38BDF8` | 信息 |
| `--color-text-primary` | `#ECFDF5` | 主字 |
| `--color-text-secondary` | `#A7F3D0` | 次级（仍保持高明度绿白） |
| `--color-text-muted` | `#34D399` | 弱化标签 |
| `--color-text-inverse` | `#022C22` |
| `--color-border` | `rgba(74,222,128,0.22)` |
| `--color-border-strong` | `rgba(74,222,128,0.55)` |
| `--color-grid` | `rgba(74,222,128,0.06)` |

**chartPalette（≥6 色）**  
`#4ADE80` · `#2DD4BF` · `#22C55E` · `#38BDF8` · `#FACC15` · `#F87171`

**`--dv-chart-*`**：暗绿灰绘图区；网格 `#14532D` 极低透明度；刻度 `#86EFAC` 系弱化。

**`--dv-chart-panel-*`**：与全局管线一致（0 / none / 0 / color-mix muted）。

## 3. KPI（`--kpi-*`）

深绿灰渐变（如 `#052e16` → `#0f2918`）；数字 `#ECFDF5`；标题 `#A7F3D0`。

## 4. 字体与排版

- **展示 / 数字**：`"Rajdhani", "Bahnschrift", system-ui, sans-serif`；600–700。  
- **正文**：`system-ui, sans-serif`。  
- **等宽**：`"JetBrains Mono", monospace`。  
- **字号（px）**：12 · 14 · 16 · 18 · 22 · 28 · 34 · 42。

## 5. 间距、圆角与阴影

- 间距：8 / 12 / 16 / 24 / 32 / 48。  
- 圆角：**4–8px**。  
- 阴影：绿色 `color-mix` 外发光极弱，忌大范围糊光。

## 6. 布局原则（大屏）

与其它大屏模板一致：**1920×1080**、顶栏 **96px**、**minHeight:0**、**minmax(0,1fr)**；告警条可置顶一条 **40–48px** 不占主栅格或并入顶栏下沿。

## 7. 组件与交互

- 状态灯：绿 / 黄 / 红圆点 + 文案。  
- 刷新指示：primary 细进度或 spinner，避免遮挡图表。

## 8. 文案调性

简短状态句：「正常」「预警」「严重」；时间与指标并列。

## 9. 反模式

- ❌ 大面积纯绿背景（对比度崩溃）。  
- ❌ 浅色主题主导。  
- ❌ KPI 浅色卡片。  
- ❌ 图表白底壳。
