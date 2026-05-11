/**
 * POST /api/board/mock-slot
 * 单槽位 mock 数据（非 SSE），供预览时 store 未命中后调用。
 */
import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createDeepSeekModel } from "@/lib/board-stream-utils";
import type {
  DashboardStoreBindingSnapshot,
  DashboardStorePayload,
  DashboardStoreSlotRole,
} from "@/types/dashboard-store.types";

export const maxDuration = 120;

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("模型输出中未找到 JSON 对象");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

function isValidPayload(p: unknown): p is DashboardStorePayload {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  const kind = o.kind;
  const value = o.value;
  const allowed = ["seriesRows", "tableRows", "kpiValue", "selectOptions"];
  if (typeof kind !== "string" || !allowed.includes(kind)) return false;
  return "value" in o;
}

function buildSystemPrompt(): string {
  return `你是数据可视化看板的 mock 数据生成器。只输出一个 JSON 对象，不要其它说明文字。

JSON 顶层结构固定为：
{ "payload": { "kind": "<四种之一>", "value": <与 kind 对应的值> } }

kind 与 value 规则：
1) seriesRows — 折线/面积/柱状/条形/雷达等「多行多列」时序或分类数据。value 为对象数组；数组项的字段名必须与用户提供的 xAxis.field、yAxis[].field 一致（若有多条 y 轴系列，每行包含所有 series 字段）。至少 8 行，数值为合理随机正数。
2) tableRows — Table 用。value 为对象数组，每行字段与 columns 配置或 propsSnapshot 中的列 field 对齐；至少 12 行。
3) kpiValue — KPI/Metric/StatCard。value 为单个对象，建议含 value:number、trend:"up"|"down"|"flat"、trendValue:string、comparison:{label,value} 等常见键；数值与标题语义相关。
4) selectOptions — Select/MultiSelect 等筛选项。value 为 { "label": string, "value": string|number }[]，至少 5 项，中文 label。

约束：
- 只输出合法 JSON，字符串使用双引号。
- 业务含义与「页面故事」摘要一致；若无摘要则生成通用中文业务名。
- 禁止在 JSON 外输出任何字符。

【KPI】widgetType 为 KPI / Metric / StatCard 时：value 为单指标对象（含 value、trend、comparison 等）；含 miniChart.seriesKey 时根级须有同名数组（≥10 点）；含 footer 时在 value 中带 footerText。`;
}

function buildKpiMockAppendix(widgetType: string, propsSnapshot: Record<string, unknown>): string {
  const t = widgetType.trim().toLowerCase();
  if (!["kpi", "metric", "statcard"].includes(t)) return "";
  let s =
    "\n\n【本槽 KPI 形状约束】payload.kind=kpiValue；value 为单指标对象（非多指标合并对象）。";
  const mc = propsSnapshot.miniChart as { seriesKey?: string } | undefined;
  if (mc?.seriesKey) {
    s += ` 必须包含根字段 "${mc.seriesKey}" 为非空数组（迷你图）。`;
  }
  if (typeof propsSnapshot.footer === "string" && propsSnapshot.footer.trim()) {
    s += " 含 footerText 脚注文案。";
  }
  return s;
}

function buildPieMockAppendix(widgetType: string, propsSnapshot: Record<string, unknown>): string {
  const t = widgetType.trim().toLowerCase();
  if (!["piechart", "donutchart", "funnel"].includes(t)) return "";
  const nf =
    typeof propsSnapshot.nameField === "string" && propsSnapshot.nameField.trim()
      ? propsSnapshot.nameField.trim()
      : "name";
  const vf =
    typeof propsSnapshot.valueField === "string" && propsSnapshot.valueField.trim()
      ? propsSnapshot.valueField.trim()
      : "value";
  return `\n\n【本槽饼/环图形状约束】payload.kind=seriesRows；value 为对象数组（≥5 项）。每一项必须同时包含字段 "${nf}"（分类名，字符串）与 "${vf}"（非负数值，扇区大小）；禁止只用 category/value 等与上述字段不一致的键名。`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectName?: string;
      dashboardFile?: string;
      pageIndex?: number;
      slotId?: string;
      widgetType?: string;
      role?: DashboardStoreSlotRole;
      binding?: DashboardStoreBindingSnapshot;
      propsSnapshot?: Record<string, unknown>;
      pagesStoryExcerpt?: string;
    };

    const {
      slotId,
      widgetType,
      role = "data",
      binding = {},
      propsSnapshot = {},
      pagesStoryExcerpt = "",
    } = body;

    if (!slotId?.trim() || !widgetType?.trim()) {
      return NextResponse.json(
        { error: "缺少 slotId 或 widgetType" },
        { status: 400 }
      );
    }

    const model = createDeepSeekModel();
    const userPayload = {
      slotId: slotId.trim(),
      widgetType: widgetType.trim(),
      role,
      binding,
      propsSnapshot,
      pagesStoryExcerpt: String(pagesStoryExcerpt).slice(0, 12000),
    };

    const roleHint =
      role === "filter-options"
        ? "\n\n【强制】当前 role 为 filter-options，payload.kind 必须是 selectOptions，value 为 {label,value}[]。"
        : "";

    const kpiHint = buildKpiMockAppendix(widgetType.trim(), propsSnapshot);
    const pieHint = buildPieMockAppendix(widgetType.trim(), propsSnapshot);

    const { text } = await generateText({
      model,
      system: buildSystemPrompt(),
      prompt: `请根据以下输入生成 payload：\n${JSON.stringify(userPayload, null, 2)}${roleHint}${kpiHint}${pieHint}`,
      temperature: 0.4,
    });

    const parsed = extractJsonObject(text) as { payload?: unknown };
    const payload = parsed?.payload;
    if (!isValidPayload(payload)) {
      console.error("[mock-slot] invalid payload", text?.slice(0, 500));
      return NextResponse.json(
        { error: "模型返回的 payload 格式无效", raw: text?.slice(0, 800) },
        { status: 502 }
      );
    }

    return NextResponse.json({ payload });
  } catch (err) {
    console.error("[mock-slot]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
