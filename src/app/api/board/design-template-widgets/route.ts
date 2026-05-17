/**
 * 阶段一：根据 Design Story 生成 widgets.json 字段契约（xAxis/yAxis.field、nameField、columns 等）。
 * 不生成 store 业务数据；阶段二 design-template-store 须严格遵循本阶段 field。
 */
import { readFile } from "fs/promises";
import path from "path";
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { WIND_POWER_EMERALD_OPS_TEMPLATE_ID } from "@/lib/board/wind-template-id";
import type { SlotsSchemaFile, WidgetsManifestFile } from "@/lib/board/wind-template-assembler";
import { buildConfigFieldContractPrompt } from "@/lib/board/config-field-contract";
import {
  buildChromePromptLines,
  buildPanelHeaderPromptLines,
  buildWidgetSlotPromptLines,
  WIDGETS_FILL_JSON_EXAMPLE,
} from "@/lib/board/template-fill-prompt";

export const maxDuration = 120;

const TEMPLATE_DIR = path.join(process.cwd(), "board-templates", WIND_POWER_EMERALD_OPS_TEMPLATE_ID);

function buildManifestPromptBlock(manifest: WidgetsManifestFile): string {
  const platform = (manifest.platformWidgetsUsed ?? []).map((t) => `- ${t}`).join("\n");
  return `【widgets.manifest.json】\n${manifest.description ?? ""}\n\n**平台 Widget**\n${platform || "-"}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    designStory?: string;
    existingWidgetsFill?: string;
  };

  const designStory = body?.designStory?.trim();
  const existingWidgetsFill =
    typeof body.existingWidgetsFill === "string" ? body.existingWidgetsFill.trim() : "";

  if (!designStory) {
    return new Response("Missing designStory", { status: 400 });
  }

  try {
    const [schemaRaw, manifestRaw] = await Promise.all([
      readFile(path.join(TEMPLATE_DIR, "slots.schema.json"), "utf8"),
      readFile(path.join(TEMPLATE_DIR, "widgets.manifest.json"), "utf8"),
    ]);
    const schema = JSON.parse(schemaRaw) as SlotsSchemaFile;
    const manifest = JSON.parse(manifestRaw) as WidgetsManifestFile;
    const widgetSlotLines = buildWidgetSlotPromptLines(schema);
    const panelHeaderLines = buildPanelHeaderPromptLines(schema);
    const chromeLines = buildChromePromptLines(schema);
    const widgetSlotIds = schema.slots.filter((s) => s.widgetKey).map((s) => s.slotId).join(", ");

    const system = `你是数据可视化看板的「widgets 契约」专家。模板 **${WIND_POWER_EMERALD_OPS_TEMPLATE_ID}** 布局固定。

**本阶段只输出 widgets.json 相关配置**（阶段二将据此生成 dashboard.store.json，行对象的键名必须与本阶段 field 完全一致）。

只输出 **一个合法 JSON 对象**（无 Markdown 围栏、无解释）。结构：
${WIDGETS_FILL_JSON_EXAMPLE}

硬性规则：
1. 必须包含 \`"phase": "widgets"\`、\`version\`: 1、\`templateId\`。
2. **slots 的键必须是 slotId**（如 \`p0.chart.capacity\`），禁止 widgetKey。
3. 必须为下列每个含 widgetKey 的 slotId 提供条目：${widgetSlotIds}
4. **BarChart / LineChart**：必须提供 \`xAxis: { field, label }\` 与 \`yAxis: [{ field, label }, ...]\`；field 为短英文/拼音键（如 line, actual, month），label 为中文展示名；禁止沿用模板风电字段 year/operating_capacity 除非 Story 明确是风电装机。
5. **DonutChart / PieChart**：必须提供 nameField、valueField。
6. **Table**：必须提供 columns 数组，每项含 field 与 label。
7. **KPI**：title/subtitle/unit；不要在本阶段写 payload/seedSeriesRows。
8. panelHeaders 与 Story 分区语义一致。
9. **mapLegend**、**footerNav** 必填：与 Story 中 GeoMap 双业务层、底栏分页语义一致（见下方 chrome 说明）。
10. JSON 须一次 parse 成功。
11. **Config 面板**（p0/p1.config.*）业务数据在阶段二生成，但字段形状已锁定（见下方 Config 契约）；阶段二须与图表 field 契约一并遵守。

${buildManifestPromptBlock(manifest)}

【Widget 槽位 — 本阶段须填字段】
${widgetSlotLines}

【PanelShell → panelHeaders】
${panelHeaderLines}

【看板 Chrome — mapLegend + footerNav】
${chromeLines}

【Config 面板字段契约（阶段二 store 须遵循）】
${buildConfigFieldContractPrompt(schema)}`;

    let user = "";
    if (existingWidgetsFill) {
      user += `【既有 widgets-fill（修订合并；输出完整 JSON）】\n\n${existingWidgetsFill}\n\n---\n\n`;
    }
    user += `【Design Story】\n\n${designStory}\n\n请输出 phase=widgets 的完整 JSON。`;

    const model = createDeepSeekModel();
    const result = streamText({ model, system, prompt: user });
    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[design-template-widgets]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
