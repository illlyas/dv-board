/**
 * Step 3: VI Token 生成
 *
 * POST /api/board/design-vi
 *
 * 输入：{ style: string }
 * 步骤：
 *   1. 读取 design-systems/{style}/DESIGN.md
 *   2. 调用 DeepSeek，从 DESIGN.md 抽取结构化 CSS Tokens JSON
 *   3. 以流式文本返回 JSON（前端 callPipelineStep 解析）
 */
import { promises as fs } from "fs";
import path from "path";
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";

export const maxDuration = 120;

const STYLE_RE = /^[a-zA-Z0-9_-]+$/;

const SYSTEM_PROMPT = `你是一位资深的品牌设计系统工程师，擅长从品牌 Design 文档中抽取可落地的设计 Token。

========================
【核心任务】
========================
阅读用户提供的品牌 DESIGN.md，产出一份**尽可能完整**的 CSS Tokens JSON，供下游直接作为 CSS 变量注入到页面中使用。

========================
【输出 JSON Schema（严格遵守字段名）】
========================
{
  "mode": "light" | "dark",
  "cssVariables": {
    "--color-bg": "...",
    "--color-surface": "...",
    "--color-surface-2": "...",
    "--color-primary": "...",
    "--color-primary-hover": "...",
    "--color-accent": "...",
    "--color-success": "...",
    "--color-warning": "...",
    "--color-danger": "...",
    "--color-info": "...",
    "--color-text-primary": "...",
    "--color-text-secondary": "...",
    "--color-text-muted": "...",
    "--color-text-inverse": "...",
    "--color-border": "...",
    "--color-border-strong": "...",
    "--color-grid": "...",
    "--color-overlay": "...",

    "--font-display": "...",
    "--font-body": "...",
    "--font-mono": "...",
    "--font-size-xs": "...",
    "--font-size-sm": "...",
    "--font-size-md": "...",
    "--font-size-lg": "...",
    "--font-size-xl": "...",
    "--font-size-2xl": "...",
    "--font-size-3xl": "...",
    "--font-weight-regular": "400",
    "--font-weight-medium": "500",
    "--font-weight-semibold": "600",
    "--font-weight-bold": "700",
    "--line-height-tight": "...",
    "--line-height-normal": "...",
    "--line-height-relaxed": "...",
    "--letter-spacing-tight": "...",
    "--letter-spacing-normal": "...",
    "--letter-spacing-wide": "...",

    "--space-1": "...",
    "--space-2": "...",
    "--space-3": "...",
    "--space-4": "...",
    "--space-5": "...",
    "--space-6": "...",
    "--space-8": "...",
    "--space-10": "...",
    "--space-12": "...",

    "--radius-sm": "...",
    "--radius-md": "...",
    "--radius-lg": "...",
    "--radius-xl": "...",
    "--radius-pill": "9999px",

    "--shadow-sm": "...",
    "--shadow-md": "...",
    "--shadow-lg": "...",
    "--shadow-xl": "...",

    "--motion-fast": "...",
    "--motion-normal": "...",
    "--motion-slow": "...",
    "--motion-easing": "...",

    "--border-width-thin": "1px",
    "--border-width-normal": "2px",
    "--backdrop-blur": "...",

    "--kpi-bg-from": "...",
    "--kpi-bg-to": "...",
    "--kpi-text-primary": "...",
    "--kpi-text-secondary": "...",
    "--kpi-text-muted": "..."
  },
  "chartPalette": ["#...", "#...", "#...", "#...", "#...", "#..."],
  "raw": {
    "color": {
      "primary": {"name": "...", "hex": "...", "usage": "..."},
      "secondary": [...],
      "accent": [...],
      "surface": [...],
      "text": [...],
      "border": [...],
      "semantic": {...}
    },
    "typography": {
      "fontFamily": {"display": "...", "body": "...", "mono": "..."},
      "scale": [...],
      "weights": [...]
    },
    "spacing": {"baseUnit": "...", "scale": [...]},
    "radius": {...},
    "shadow": {...},
    "motion": {...},
    "components": {
      "button": {...},
      "card": {...},
      "input": {...},
      "navigation": {...}
    }
  }
}

========================
【硬性要求】
========================
1. **mode 必须仅依据 DESIGN.md 的内容判断，判断后不可切换**。运行时不会提供任何亮/暗模式切换按钮，你给出的 mode 就是最终结果。判断依据（优先级从高到低）：
   a。DESIGN.md 明确提到 "dark mode" / "暗色主题" / "dark UI" → dark；DESIGN.md 明确提到 "light mode" / "浅色主题" / "light UI" → light。
   b。文档描述的主场景背景/整体调性：描述为深色、黑色、星空、夜空、电影感、科技感、沉浸感、高级黑 → dark；描述为清新、纯白、纸质、明亮、背景白色/乳白/浅灰 → light。
   c。主背景色色值的亮度：HSL L ≥ 50% 或 RGB 平均值 ≥ 128 → light；否则 dark。
   d。品牌常规认知（仅当以上信息均缺失时）：Apple / Tesla / Netflix / Spotify / X / Binance / Runway 等 → dark；Google / Airbnb / Notion / Linear / Stripe 等 → light。
   不准输出模棱两可的 mode；mode 确定后，--color-bg / --color-surface / --color-text-primary 必须严格和 mode 自洽。
2. cssVariables 中**每一个键都必须有非空值**。DESIGN.md 未明示的项，必须根据品牌整体调性合理推导（颜色对比度、字号阶梯、间距比例等）。
3. 颜色值统一使用 hex（#rrggbb / #rrggbbaa）或 rgba()；禁止使用色名。
4. 字号使用 px；间距使用 px；圆角使用 px 或 9999px；阴影使用完整 CSS shadow 字符串。
5. 文字与背景对比度必须足够（WCAG AA 至少 4.5:1）：
   - dark 模式 --color-bg 必须为深色（亮度 ≤ 25%），--color-surface 略亮一些但仍然是暗调（亮度 ≤ 35%），--color-text-primary 必须为浅色（如 #ffffff、rgba(255,255,255,0.92)）；
   - light 模式 --color-bg 必须为浅色（亮度 ≥ 92%），--color-surface 通常为纯白或近白，--color-text-primary 必须为深色（如 #111111、#1d1d1f）。
   - --color-border / --color-grid 在 dark 下为半透明白色或深灰，在 light 下为半透明黑色或浅灰。
6. chartPalette 至少 6 色，按品牌主色 → 次级 → 对比色排序，适合数据可视化系列配色；在当前 mode 背景下可辨识度必须足够。
7. raw 字段尽量还原 DESIGN.md 原始描述（名称、hex、用途），便于下游追溯。
8. 字体族若 DESIGN.md 指定了具体字体（如 SF Pro Display），必须包含降级字体栈：\`"SF Pro Display", system-ui, sans-serif\`。
9. **KPI 指标卡专属 Token（--kpi-* 五项）必须始终产出"深色卡片 + 浅色文字"的视觉组合，不论 mode 是 light 还是 dark**：
   - \`--kpi-bg-from\` / \`--kpi-bg-to\`：两端必须都是深色调（HSL L ≤ 30%；例如 #0f172a / #1e293b / #111827 / #1f2937 / #18181b 等），形成 135deg 渐变；严禁浅色。
   - \`--kpi-text-primary\`：主数值文字，必须是浅色（#ffffff 或 rgba(255,255,255,0.92~1.0)），与 bg-from 对比度 ≥ WCAG AA 4.5:1。
   - \`--kpi-text-secondary\`：标题 / 前后缀 / 单位，rgba(255,255,255,0.65~0.8) 或同等浅色半透明。
   - \`--kpi-text-muted\`：副标题 / 对比文字 / loading 占位，rgba(255,255,255,0.4~0.55)。
   - 这 5 个 token 的色调可以与品牌主色产生呼应（例如在深色基底上混入品牌色相），但底色始终为深色、文字始终为浅色，不得被 mode 影响。
10. **只输出严格合法的 JSON，不要 markdown 围栏、不要注释、不要解释文字**。
`;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { style?: string };
  const style = body?.style?.trim();

  if (!style || !STYLE_RE.test(style)) {
    return new Response(JSON.stringify({ error: "Missing or invalid style" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const root = path.join(process.cwd(), "design-systems");
    const target = path.join(root, style, "DESIGN.md");
    const resolved = path.resolve(target);
    if (!resolved.startsWith(path.resolve(root) + path.sep)) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const designMd = await fs.readFile(resolved, "utf-8");

    const model = createDeepSeekModel();
    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      prompt: `以下是品牌 "${style}" 的 Design 文档，请基于它产出完整的 CSS Tokens JSON：

=== DESIGN.md ===
${designMd}

=== 输出要求 ===
严格按 Schema 产出 JSON，所有 cssVariables 字段必须有值，chartPalette 至少 6 色。只输出 JSON。`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/design-vi] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
