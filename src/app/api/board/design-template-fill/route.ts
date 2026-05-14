/**
 * 基于 design-story 生成 wind-power-emerald-ops 模板填空 JSON（流式纯文本，客户端解析为 JSON）。
 */
import { readFile } from "fs/promises";
import path from "path";
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { WIND_POWER_EMERALD_OPS_TEMPLATE_ID } from "@/lib/board/wind-template-id";
import type { SlotsSchemaFile } from "@/lib/board/wind-template-assembler";

export const maxDuration = 120;

function buildSlotPromptLines(schema: SlotsSchemaFile): string {
  return schema.slots
    .map((s) => {
      const wk = s.widgetKey ? `widgetKey=${s.widgetKey}` : "（仅文案/轴标签）";
      return `- **${s.slotId}** — ${wk} — ${(s as { surface?: string }).surface ?? (s as { kind?: string }).kind ?? ""}`;
    })
    .join("\n");
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    designStory?: string;
    existingFill?: string;
  };

  const designStory = body?.designStory?.trim();
  const existingFill = typeof body.existingFill === "string" ? body.existingFill.trim() : "";

  if (!designStory) {
    return new Response("Missing designStory", { status: 400 });
  }

  try {
    const schemaPath = path.join(
      process.cwd(),
      "board-templates",
      WIND_POWER_EMERALD_OPS_TEMPLATE_ID,
      "slots.schema.json"
    );
    const raw = await readFile(schemaPath, "utf8");
    const schema = JSON.parse(raw) as SlotsSchemaFile;
    const slotLines = buildSlotPromptLines(schema);

    const system = `你是数据可视化看板的「模板填空」专家。用户已固定使用模板 **${WIND_POWER_EMERALD_OPS_TEMPLATE_ID}**（两页大屏骨架固定），布局与 slotId 清单不可改。

你的任务：只输出 **一个合法 JSON 对象**（不要 Markdown 围栏、不要解释文字），结构必须严格符合下列 JSON Schema 语义。

【重要】装配阶段**只**把下列「展示文案与轴标签」写入 dashboard.jsx / store 的 props 快照，**禁止**在 JSON 中输出任何业务数据字段：不要输出 kpiValue、tableRows、seedSeriesRows、configValue、provinceData、kpiGlowItems 等；图表/KPI/表格的真实数据由预览时各组件调用 mock 接口后再写入 dashboard.store.json。

{
  "version": 1,
  "templateId": "${WIND_POWER_EMERALD_OPS_TEMPLATE_ID}",
  "themeDocumentTitle": "string，顶栏主标题，与 Design Story 业务一致",
  "slots": {
    "<slotId>": {
      "title": "可选，Widget 标题",
      "subtitle": "可选",
      "unit": "可选，KPI 等单位文案",
      "xAxisLabel": "可选，折线/柱状等的首个 xAxis.label",
      "yAxisLabels": ["可选","按顺序对应 yAxis 各系列的 label 文案"]
    }
  },
  "panelHeaders": {
    "gen_completion": "可选",
    "production_base": "可选",
    "capacity": "可选",
    "power_realtime": "可选",
    "wind_speed": "可选",
    "logistics": "可选",
    "maintenance": "可选",
    "alarm_list": "可选",
    "device_log": "可选"
  }
}

硬性规则：
1. **slots 的键**只能来自下列 slotId 列表（不得发明新键）。
2. 不必每个 slot 都填；未出现的 slot 使用模板内置展示与数据流。
3. 填空内容须与 Design Story 的叙事与指标命名一致（标题、分区名、轴标签用业务语言）。
4. **JSON 必须可被 JSON.parse 一次解析**，字符串内的引号必须转义。

【本模板全部 slotId】
${slotLines}`;

    let user = "";
    if (existingFill) {
      user += `【既有 template-fill.json（请在其语义上修订合并，可增删 slots 键；输出仍为完整 JSON）】\n\n${existingFill}\n\n---\n\n`;
    }
    user += `【Design Story】\n\n${designStory}\n\n请输出完整 JSON。`;

    const model = createDeepSeekModel();
    const result = streamText({ model, system, prompt: user });
    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[design-template-fill]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
