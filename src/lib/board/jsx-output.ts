/**
 * V2 管线 — JSX 代码输出格式约定
 *
 * Step 3 (generate-jsx) 的输出结构。
 * AI 生成的 JSX 代码字符串 + 元数据。
 */
import { z } from "zod";

// ─── Schema ────────────────────────────────────────────────

export const jsxCodeSchema = z.object({
  /**
   * 完整的 React JSX 代码字符串。
   *
   * 代码规范（AI 必须遵守）：
   * - 单文件函数组件，导出 default
   * - 使用 React.createElement() 格式（非 JSX 语法，避免转译依赖）
   * - 所有样式通过 className (Tailwind) 或 inline style
   * - 图表使用 ECharts option 对象，通过 injected ECharts 实例渲染
   * - 模拟数据内联在组件内部
   * - 颜色/字号/间距等必须使用传入的 VI token 具体值
   * - 固定画布 1920×1080
   * - 多页面用 useState 切换，底部有页码指示器
   */
  code: z.string().min(100)
    .describe("完整可执行的 React 组件代码"),

  /** 代码元数据 */
  metadata: z.object({
    /** 组件名称，如 "SalesDashboard" */
    componentName: z.string().default("Dashboard"),
    /** 页面数量 */
    pageCount: z.number().int().positive().default(1),
    /** 画布尺寸 */
    canvasSize: z.object({ width: z.number(), height: z.number() }).default({ width: 1920, height: 1080 }),
    /** 估算的组件数量（用于进度展示） */
    estimatedComponents: z.number().int().nonnegative().default(0),
    /** 使用了哪些 ECharts 图表类型 */
    chartTypesUsed: z.array(z.string()).default([]).describe("如 ['bar', 'line', 'pie']"),
    /** 使用了哪些 Lucide 图标 */
    iconsUsed: z.array(z.string()).default([]),
  }).default({
    componentName: "Dashboard",
    pageCount: 1,
    canvasSize: { width: 1920, height: 1080 },
    estimatedComponents: 0,
    chartTypesUsed: [],
    iconsUsed: [],
  }),

  /** 可选：AI 对生成代码的说明（展示给用户看） */
  description: z.string().optional()
    .describe("AI 对这套看板的简要设计说明"),
});

// ─── 类型导出 ─────────────────────────────────────────────

export type JSXCode = z.infer<typeof jsxCodeSchema>;

// ─── 默认空值 ─────────────────────────────────────────────

export const EMPTY_JSX_CODE: JSXCode = {
  code: `export default function Dashboard() {
  return React.createElement("div", {
    style: { width: 1920, height: 1080, display: "flex", alignItems: "center", justifyContent: "center" },
  },
    React.createElement("p", { style: { color: "#64748b", fontSize: 16 } }, "正在生成看板...")
  );
}`,
  metadata: {
    componentName: "Dashboard",
    pageCount: 1,
    canvasSize: { width: 1920, height: 1080 },
    estimatedComponents: 0,
    chartTypesUsed: [],
    iconsUsed: [],
  },
};

/** JSX 渲染安全白名单：仅允许这些 API 被注入到 new Function 中 */
export const SANDBOX_INJECTIONS = [
  { name: "React", global: true },
  { name: "useState", global: true },
  { name: "useEffect", global: true },
  { name: "useMemo", global: true },
  { name: "useCallback", global: true },
  { name: "useRef", global: true },
  { name: "ECharts", global: false, optional: true }, // 从 props 注入
] as const;

// ─── 标准化函数 ────────────────────────────────────────────

/**
 * 标准化 AI 输出的 JSX 代码数据
 * 
 * 处理缺失的字段，提供合理的默认值
 * 兼容两种情况：
 * 1. AI 返回了完整 JSON：{ code, metadata, description }
 * 2. AI 直接返回了纯 JSX 代码字符串（未包在 JSON 里）
 */
export function normalizeJSXCode(input: unknown): Record<string, unknown> {
  // 兜底：AI 直接返回了纯 JSX 代码字符串
  if (typeof input === "string" && input.trim()) {
    const code = input.trim();
    return {
      code,
      metadata: inferMetadataFromCode(code),
    };
  }

  if (!input || typeof input !== "object") {
    return {
      code: EMPTY_JSX_CODE.code,
      metadata: EMPTY_JSX_CODE.metadata,
    };
  }

  const raw = input as Record<string, unknown>;
  
  // 确保 code 字段存在
  const code = typeof raw.code === "string" && raw.code.trim() 
    ? raw.code 
    : EMPTY_JSX_CODE.code;

  const metadata = inferMetadataFromCode(code, raw.metadata);

  return {
    code,
    metadata,
    description: typeof raw.description === "string" ? raw.description : undefined,
  };
}

function inferMetadataFromCode(
  code: string,
  rawMetadata?: unknown
): Record<string, unknown> {
  const meta = rawMetadata && typeof rawMetadata === "object"
    ? rawMetadata as Record<string, unknown>
    : {};

  // 尝试从代码中推断页面数量
  let pageCount = 1;
  if (typeof meta.pageCount === "number" && meta.pageCount > 0) {
    pageCount = Math.floor(meta.pageCount);
  } else {
    const pagesMatch = code.match(/pages\s*=\s*\[([^\]]+)\]/);
    if (pagesMatch) {
      const commaCount = (pagesMatch[1].match(/,/g) || []).length;
      pageCount = Math.max(1, commaCount + 1);
    }
  }

  return {
    componentName: typeof meta.componentName === "string" && meta.componentName.trim()
      ? meta.componentName
      : "Dashboard",
    pageCount,
    canvasSize: meta.canvasSize && typeof meta.canvasSize === "object"
      ? {
          width: typeof (meta.canvasSize as Record<string, unknown>).width === "number"
            ? (meta.canvasSize as Record<string, unknown>).width
            : 1920,
          height: typeof (meta.canvasSize as Record<string, unknown>).height === "number"
            ? (meta.canvasSize as Record<string, unknown>).height
            : 1080,
        }
      : { width: 1920, height: 1080 },
    estimatedComponents: typeof meta.estimatedComponents === "number" && meta.estimatedComponents >= 0
      ? Math.floor(meta.estimatedComponents)
      : 0,
    chartTypesUsed: Array.isArray(meta.chartTypesUsed)
      ? meta.chartTypesUsed.filter((item): item is string => typeof item === "string")
      : [],
    iconsUsed: Array.isArray(meta.iconsUsed)
      ? meta.iconsUsed.filter((item): item is string => typeof item === "string")
      : [],
  };
}
