/**
 * V2 管线 — VI 系统 Token 完整定义
 *
 * 参考 shadcn/ui 的 CSS 变量 token 体系，为数据大屏场景定制完整的视觉标识系统。
 * 覆盖：颜色、排版、间距、尺寸、圆角、阴影、边框、动效、断点、暗/亮主题
 */
import { z } from "zod";

// ─── 枚举类型 ──────────────────────────────────────────────

const viThemeEnum = z.enum([
  "dark-tech",       // 深海军蓝 + 冷色强调 + 科技感
  "dark-business",   // 深炭灰 + 商务蓝 + 克制
  "light-clean",     // 浅底 + 清爽 + 专业
  "dark-executive",  // 近黑背景 + 琥珀高亮 + 正式汇报
  "dark-data",       // 深蓝绿 + 高对比 + 高信息密度
]);

const viModeEnum = z.enum(["dark", "light"]);
const viToneEnum = z.enum(["executive", "operational", "analytical", "command"]);
const viDensityEnum = z.enum(["compact", "balanced", "spacious"]);

const borderStyleEnum = z.enum(["solid", "dashed", "dotted"]);

// ─── 颜色 Tokens ──────────────────────────────────────────

const colorTokensSchema = z.object({
  // shadcn 基础语义色（CSS variable 风格命名）
  background: z.string().describe("主背景色 --background"),
  foreground: z.string().describe("前景文字色 --foreground"),
  card: z.string().describe("卡片/面板背景 --card"),
  popover: z.string().describe("弹出层背景 --popover"),
  primary: z.string().describe("主色调 --primary"),
  primaryForeground: z.string().describe("主色前景文字 --primary-foreground"),
  secondary: z.string().describe("次要色 --secondary"),
  secondaryForeground: z.string().describe("次要色前景 --secondary-foreground"),
  muted: z.string().describe("弱化背景 --muted"),
  mutedForeground: z.string().describe("弱化前景文字 --muted-foreground"),
  accent: z.string().describe("强调色 --accent"),
  accentForeground: z.string().describe("强调色前景 --accent-foreground"),
  destructive: z.string().describe("危险/删除色 --destructive"),
  destructiveForeground: z.string().describe("危险色前景 --destructive-foreground"),
  border: z.string().describe("通用边框色 --border"),
  input: z.string().describe("输入框边框/背景 --input"),
  ring: z.string().describe("焦点环颜色 --ring"),

  // 业务语义色（覆盖数据状态）
  success: z.string().describe("正向/成功色（涨/达标）"),
  warning: z.string().describe("警示/注意色"),
  error: z.string().describe("负向/错误色（跌/未达标）"),
  info: z.string().describe("信息/中性色"),

  // 图表专用
  chartPalette: z.array(z.string()).min(4).max(12).describe("图表系列色板 4-12 色"),
  chartGrid: z.string().describe("图表网格线颜色"),
  chartAxis: z.string().describe("图表坐标轴文字颜色"),
  chartLegend: z.string().describe("图表图例文字颜色"),

  // 渐变（用于标题高亮、KPI 背景、装饰）
  gradients: z.object({
    heroTitle: z.string().describe("大标题区域渐变"),
    kpiPositive: z.string().describe("KPI 正向指标渐变背景"),
    kpiNegative: z.string().describe("KPI 负向指标渐变背景"),
    accentGlow: z.string().describe("强调发光效果渐变"),
    cardHeader: z.string().describe("卡片标题栏渐变").optional(),
    sidebarBg: z.string().describe("侧边栏渐变").optional(),
  }),
});

// ─── 排版 Typography Tokens ─────────────────────────────────

const typographySchema = z.object({
  fontFamily: z.object({
    display: z.string().describe("展示字体（大屏标题）：如 Orbitron, DIN, Rajdhani"),
    body: z.string().describe("正文字体：如 Inter, Source Han Sans SC, PingFang SC"),
    mono: z.string().describe("等宽字体：如 JetBrains Mono, Fira Code"),
    numbers: z.string().describe("数字专用字体：如 DIN Alternate, Roboto Mono"),
  }),
  fontSize: z.object({
    hero: z.number().int().min(36).max(96).describe("大屏主标题 48-72px"),
    h1: z.number().int().min(28).max(48).describe("页面一级标题 32-40px"),
    h2: z.number().int().min(20).max(36).describe("区域二级标题 24-28px"),
    h3: z.number().int().min(16).max(28).describe("图表/卡片标题 18-22px"),
    body: z.number().int().min(12).max(18).describe("正文 14-16px"),
    small: z.number().int().min(10).max(16).describe("辅助文字 12px"),
    caption: z.number().int().min(9).max(14).describe("注释/标签 10-11px"),
  }),
  fontWeight: z.object({
    regular: z.number().int().default(400),
    medium: z.number().int().default(500),
    semibold: z.number().int().default(600),
    bold: z.number().int().default(700),
  }),
  lineHeight: z.object({
    tight: z.number().min(1).max(1.4).default(1.2),
    normal: z.number().min(1.3).max(1.8).default(1.5),
    relaxed: z.number().min(1.6).max(2.2).default(1.75),
  }),
  letterSpacing: z.object({
    tight: z.string().default("-0.02em"),
    normal: z.string().default("0em"),
    wide: z.string().default("0.05em").describe("大标题字间距"),
    wider: z.string().default("0.1em").describe("超大标题/英文 logo 字间距").optional(),
  }),
});

// ─── 间距 Spacing Tokens（基于 4px 基准网格）────────────────

const spacingSchema = z.object({
  base: z.number().int().positive().default(4).describe("基准单位 4px"),
  scale: z.array(z.number().int().positive()).min(8).max(16)
    .describe("间距刻度 [4,8,12,16,20,24,32,40,48,64,80,96]"),
  gap: z.object({
    section: z.number().int().positive().describe("区域间间距 24-32"),
    card: z.number().int().positive().describe("卡片间间距 16-20"),
    inner: z.number().int().positive().describe("内容内边距 16-24"),
    text: z.number().int().positive().describe("文字行/段间距 8-12"),
    grid: z.number().int().positive().describe("网格间距 12-16"),
  }),
});

// ─── 尺寸 Sizing Tokens ────────────────────────────────────

const sizingSchema = z.object({
  canvasWidth: z.number().int().positive().default(1920).describe("画布宽度"),
  canvasHeight: z.number().int().positive().default(1080).describe("画布高度"),
  headerHeight: z.number().int().positive().describe("顶部导航区高度 60-80"),
  footerHeight: z.number().int().positive().describe("底部信息栏高度 40-60"),
  sidebarWidth: z.number().int().nonnegative().default(0).describe("侧边栏宽度 0 表示无"),
  cardMinWidth: z.number().int().positive().default(320).describe("卡片最小宽度"),
  cardMinHeight: z.number().int().positive().default(200).describe("卡片最小高度"),
  kpiCardWidth: z.number().int().positive().default(260).describe("KPI 卡片宽度"),
  kpiCardHeight: z.number().int().positive().default(140).describe("KPI 卡片高度"),
});

// ─── 圆角 Border Radius Tokens ─────────────────────────────

const radiusSchema = z.object({
  none: z.number().default(0),
  sm: z.number().int().positive().default(4),
  md: z.number().int().positive().default(8),
  lg: z.number().int().positive().default(12),
  xl: z.number().int().positive().default(16),
  "2xl": z.number().int().positive().default(24).optional(),
  full: z.number().default(9999).describe("pill / 圆形"),
});

// ─── 阴影 Box Shadow Tokens ────────────────────────────────

const shadowSchema = z.object({
  sm: z.string().default("0 1px 2px rgba(0,0,0,0.05)").describe("小阴影"),
  md: z.string().default("0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)")
    .describe("中阴影（卡片默认）"),
  lg: z.string().default("0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)")
    .describe("大阴影（弹窗）"),
  glow: z.string().describe("发光效果（科技感大屏用）"),
  inset: z.string().default("inset 0 2px 4px 0 rgba(0,0,0,0.06)").describe("内阴影"),
});

// ─── 边框 Border Tokens ────────────────────────────────────

const borderSchema = z.object({
  width: z.object({
    thin: z.number().int().positive().default(1),
    normal: z.number().int().positive().default(2),
    thick: z.number().int().positive().default(3),
  }),
  style: borderStyleEnum.default("solid"),
});

// ─── 动效 Animation Tokens ─────────────────────────────────

const animationSchema = z.object({
  duration: z.object({
    fast: z.string().default("150ms"),
    normal: z.string().default("300ms"),
    slow: z.string().default("500ms"),
    pageTransition: z.string().default("800ms"),
  }),
  easing: z.object({
    default: z.string().default("cubic-bezier(0.4, 0, 0.2, 1)"),
    in: z.string().default("cubic-bezier(0, 0, 0.2, 1)"),
    out: z.string().default("cubic-bezier(0.4, 0, 1, 1)"),
    bounce: z.string().default("cubic-bezier(0.68, -0.55, 0.265, 1.55)"),
    smooth: z.string().default("cubic-bezier(0.25, 0.46, 0.45, 0.94)"),
  }),
});

// ─── 断点 Breakpoints ──────────────────────────────────────

const breakpointSchema = z.object({
  xs: z.number().int().positive().default(480),
  sm: z.number().int().positive().default(768),
  md: z.number().int().positive().default(1024),
  lg: z.number().int().positive().default(1440),
  xl: z.number().int().positive().default(1920),
  "2xl": z.number().int().positive().default(2560),
});

// ─── 组件风格速查指南（给 Step 3 JSX 生成参考）─────────────

const componentStyleGuideSchema = z.object({
  headerBar: z.object({
    bg: z.string(),
    border: z.string().optional(),
    height: z.string().describe("Tailwind class 如 'h-16'"),
    padding: z.string().describe("如 'px-6'"),
    titleColor: z.string(),
    subtitleColor: z.string(),
  }),
  pageHeader: z.object({
    bg: z.string().optional(),
    padding: z.string(),
    titleFontFamily: z.string(),
    titleFontSize: z.string().describe("Tailwind class 如 'text-4xl'"),
    titleColor: z.string(),
    subtitleColor: z.string(),
  }),
  cardPanel: z.object({
    bg: z.string(),
    border: z.string(),
    radius: z.string().describe("如 'rounded-xl'"),
    shadow: z.string(),
    padding: z.string().describe("内部 padding 如 'p-4'"),
    headerBg: z.string().optional().describe("卡片头部背景"),
    headerBorder: z.string().optional(),
  }),
  kpiCard: z.object({
    valueFontSize: z.string(),
    valueFontWeight: z.string(),
    valueColor: z.string(),
    labelFontSize: z.string(),
    labelColor: z.string(),
    trendUpColor: z.string(),
    trendDownColor: z.string(),
    bgColor: z.string(),
    borderColor: z.string(),
  }),
  chartPanel: z.object({
    bg: z.string(),
    border: z.string(),
    titleFontSize: z.string(),
    titleColor: z.string(),
    gridColor: z.string(),
    axisColor: z.string(),
    legendColor: z.string(),
  }),
  tablePanel: z.object({
    bg: z.string(),
    border: z.string(),
    headerBg: z.string(),
    headerColor: z.string(),
    rowBorderColor: z.string(),
    rowAltBg: z.string().optional(),
    highlightColor: z.string(),
  }),
  divider: z.object({
    color: z.string(),
    thickness: z.string().describe("如 'h-[1px]' 或 'w-[2px]'"),
    style: z.string(),
  }),
  tagBadge: z.object({
    bg: z.string(),
    textColor: z.string(),
    radius: z.string(),
    fontSize: z.string(),
  }),
  filterSelect: z.object({
    bg: z.string(),
    border: z.string(),
    textColor: z.string(),
    activeBg: z.string(),
    activeTextColor: z.string(),
  }),
  annotationText: z.object({
    color: z.string(),
    fontSize: z.string(),
    lineHeight: z.string(),
  }),
});

// ══════════════════════════════════════════════════════════
// ─── 主 Schema：VISystem ─────────────────────────────────
// ══════════════════════════════════════════════════════════

export const viSystemSchema = z.object({
  /** 主题身份概览 */
  themeProfile: z.object({
    name: z.string().describe("这套 VI 的名称，如「深蓝科技数据大屏」"),
    theme: viThemeEnum,
    mode: viModeEnum.describe("暗色或亮色模式"),
    tone: viToneEnum,
    density: viDensityEnum,
    description: z.string().optional().describe("一句话描述视觉气质"),
  }),

  /** 颜色系统 */
  colors: colorTokensSchema,

  /** 排版系统 */
  typography: typographySchema,

  /** 间距系统 */
  spacing: spacingSchema,

  /** 尺寸规范 */
  sizing: sizingSchema,

  /** 圆角规范 */
  radius: radiusSchema,

  /** 阴影规范 */
  shadow: shadowSchema,

  /** 边框规范 */
  border: borderSchema,

  /** 动效规范 */
  animation: animationSchema,

  /** 断点 */
  breakpoints: breakpointSchema,

  /** 组件风格速查 — 给 Step 3 AI 参考 */
  componentStyleGuide: componentStyleGuideSchema,
});

// ─── JSON Schema Prompt 版本（注入 AI system prompt）───────

export const viSystemJsonSchema = z.toJSONSchema(viSystemSchema);
export const viSystemSchemaPrompt = JSON.stringify(viSystemJsonSchema, null, 2);

// ─── 类型导出 ─────────────────────────────────────────────

export type VISystem = z.infer<typeof viSystemSchema>;
export type VIColorTokens = z.infer<typeof colorTokensSchema>;
export type VITypography = z.infer<typeof typographySchema>;
export type VISpacing = z.infer<typeof spacingSchema>;
export type VISizing = z.infer<typeof sizingSchema>;
export type VIRadius = z.infer<typeof radiusSchema>;
export type VIShadow = z.infer<typeof shadowSchema>;
export type VIBorder = z.infer<typeof borderSchema>;
export type VIAnimation = z.infer<typeof animationSchema>;
export type VIBreakpoints = z.infer<typeof breakpointSchema>;
export type VIComponentStyleGuide = z.infer<typeof componentStyleGuideSchema>;

/** 默认深色科技主题的 fallback 值 */
export const DEFAULT_VI_SYSTEM: VISystem = {
  themeProfile: {
    name: "默认数据大屏",
    theme: "dark-tech",
    mode: "dark",
    tone: "analytical",
    density: "balanced",
  },
  colors: {
    background: "#0a0e1a",
    foreground: "#e2e8f0",
    card: "#111827",
    popover: "#1a2234",
    primary: "#3b82f6",
    primaryForeground: "#ffffff",
    secondary: "#1e293b",
    secondaryForeground: "#94a3b8",
    muted: "#1e293b",
    mutedForeground: "#64748b",
    accent: "#06b6d4",
    accentForeground: "#ffffff",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#1e3a5f",
    input: "#1e3a5f",
    ring: "#3b82f6",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    chartPalette: ["#3b82f6", "#06b6d4", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#14b8a6", "#f97316"],
    chartGrid: "rgba(148,163,184,0.08)",
    chartAxis: "#64748b",
    chartLegend: "#94a3b8",
    gradients: {
      heroTitle: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
      kpiPositive: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
      kpiNegative: "linear-gradient(135deg, #450a0a 0%, #2c0a0a 100%)",
      accentGlow: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
    },
  },
  typography: {
    fontFamily: { display: "'Rajdhani', sans-serif", body: "'Inter', 'PingFang SC', sans-serif", mono: "'JetBrains Mono', monospace", numbers: "'DIN Alternate', 'Roboto Mono', monospace" },
    fontSize: { hero: 56, h1: 36, h2: 26, h3: 20, body: 14, small: 12, caption: 11 },
    fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.75 },
    letterSpacing: { tight: "-0.02em", normal: "0em", wide: "0.05em" },
  },
  spacing: { base: 4, scale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96], gap: { section: 28, card: 18, inner: 20, text: 10, grid: 14 } },
  sizing: { canvasWidth: 1920, canvasHeight: 1080, headerHeight: 72, footerHeight: 48, sidebarWidth: 0, cardMinWidth: 320, cardMinHeight: 200, kpiCardWidth: 260, kpiCardHeight: 140 },
  radius: { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  shadow: { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px -1px rgba(0,0,0,0.1)", lg: "0 10px 15px -3px rgba(0,0,0,0.1)", glow: "0 0 40px rgba(59,130,246,0.15)", inset: "inset 0 2px 4px 0 rgba(0,0,0,0.06)" },
  border: { width: { thin: 1, normal: 2, thick: 3 }, style: "solid" as const },
  animation: { duration: { fast: "150ms", normal: "300ms", slow: "500ms", pageTransition: "800ms" }, easing: { default: "cubic-bezier(0.4, 0, 0.2, 1)", in: "cubic-bezier(0, 0, 0.2, 1)", out: "cubic-bezier(0.4, 0, 1, 1)", bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" } },
  breakpoints: { xs: 480, sm: 768, md: 1024, lg: 1440, xl: 1920, "2xl": 2560 },
  componentStyleGuide: {
    headerBar: { bg: "#111827", height: "h-[72px]", padding: "px-6", titleColor: "#e2e8f0", subtitleColor: "#94a3b8" },
    pageHeader: { padding: "pb-4", titleFontFamily: "'Rajdhani', sans-serif", titleFontSize: "text-[36px]", titleColor: "#e2e8f0", subtitleColor: "#94a3b8" },
    cardPanel: { bg: "#111827", border: "#1e3a5f", radius: "rounded-xl", shadow: "0 4px 6px -1px rgba(0,0,0,0.1)", padding: "p-4" },
    kpiCard: { valueFontSize: "text-[32px]", valueFontWeight: "font-bold", valueColor: "#e2e8f0", labelFontSize: "text-xs", labelColor: "#64748b", trendUpColor: "#22c55e", trendDownColor: "#ef4444", bgColor: "#111827", borderColor: "#1e3a5f" },
    chartPanel: { bg: "#111827", border: "#1e3a5f", titleFontSize: "text-base", titleColor: "#cbd5e1", gridColor: "rgba(148,163,184,0.08)", axisColor: "#64748b", legendColor: "#94a3b8" },
    tablePanel: { bg: "#111827", border: "#1e3a5f", headerBg: "#1e293b", headerColor: "#e2e8f0", rowBorderColor: "#1e3a5f", highlightColor: "#fef3c7" },
    divider: { color: "#1e3a5f", thickness: "h-[1px]", style: "solid" },
    tagBadge: { bg: "#1e293b", textColor: "#cbd5e1", radius: "rounded-full", fontSize: "text-xs" },
    filterSelect: { bg: "#1e293b", border: "#1e3a5f", textColor: "#cbd5e1", activeBg: "#1e3a5f", activeTextColor: "#3b82f6" },
    annotationText: { color: "#64748b", fontSize: "text-xs", lineHeight: "leading-relaxed" },
  },
};
