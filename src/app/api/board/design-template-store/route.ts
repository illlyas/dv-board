/**
 * 阶段二：在 widgets-fill 字段契约已确定的前提下，生成 dashboard.store.json 业务数据。
 */
import { readFile } from "fs/promises";
import path from "path";
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { WIND_POWER_EMERALD_OPS_TEMPLATE_ID } from "@/lib/board/wind-template-id";
import {
  parseWidgetsJson,
  slotIdToWidgetKeyMap,
  type SlotsSchemaFile,
  type WidgetsManifestFile,
} from "@/lib/board/wind-template-assembler";
import {
  buildAllSlotPromptLines,
  buildChromePromptLines,
  STORE_FILL_JSON_EXAMPLE,
} from "@/lib/board/template-fill-prompt";
import { widgetsFillSchema } from "@/lib/board/template-fill-schema";
import { buildConfigFieldContractPrompt } from "@/lib/board/config-field-contract";
import {
  buildFieldContractsFromWidgetsFill,
  buildStoreFieldContractPrompt,
} from "@/lib/board/widget-field-contract";

export const maxDuration = 120;

const TEMPLATE_DIR = path.join(process.cwd(), "board-templates", WIND_POWER_EMERALD_OPS_TEMPLATE_ID);

export async function POST(request: Request) {
  const body = (await request.json()) as {
    designStory?: string;
    widgetsFill?: unknown;
    existingStoreFill?: string;
  };

  const designStory = body?.designStory?.trim();
  const existingStoreFill =
    typeof body.existingStoreFill === "string" ? body.existingStoreFill.trim() : "";

  if (!designStory) {
    return new Response("Missing designStory", { status: 400 });
  }

  let widgetsFill;
  try {
    widgetsFill = widgetsFillSchema.parse(body?.widgetsFill);
  } catch {
    return new Response("Missing or invalid widgetsFill", { status: 400 });
  }

  try {
    const [schemaRaw, manifestRaw, widgetsRaw] = await Promise.all([
      readFile(path.join(TEMPLATE_DIR, "slots.schema.json"), "utf8"),
      readFile(path.join(TEMPLATE_DIR, "widgets.manifest.json"), "utf8"),
      readFile(path.join(TEMPLATE_DIR, "widgets.json"), "utf8"),
    ]);
    const schema = JSON.parse(schemaRaw) as SlotsSchemaFile;
    JSON.parse(manifestRaw) as WidgetsManifestFile;
    const templateWidgets = parseWidgetsJson(widgetsRaw);
    const slotMap = slotIdToWidgetKeyMap(schema);
    const allSlotLines = buildAllSlotPromptLines(schema);
    const chromeLines = buildChromePromptLines(schema);
    const slotIdList = schema.slots.map((s) => s.slotId).join(", ");

    const contracts = buildFieldContractsFromWidgetsFill(
      widgetsFill,
      schema,
      templateWidgets,
      slotMap
    );
    const fieldContractBlock = buildStoreFieldContractPrompt(contracts);
    const configContractBlock = buildConfigFieldContractPrompt(schema);

    const system = `你是数据可视化看板的「store 数据」专家。模板 **${WIND_POWER_EMERALD_OPS_TEMPLATE_ID}**。

**阶段一 widgets 契约已锁定**（见下方「字段契约表」）。本阶段只输出 **dashboard.store.json** 业务数据。

只输出 **一个合法 JSON 对象**（无 Markdown 围栏、无解释）。结构：
${STORE_FILL_JSON_EXAMPLE}

硬性规则：
1. 必须包含 \`"phase": "store"\`、\`version\`: 1、\`templateId\`。
2. **slots 的键必须是 slotId**；必须为下列每一个 slotId 提供业务数据：  
   ${slotIdList}
3. **禁止**在本阶段输出 title/xAxis/yAxis/nameField/columns（属于 widgets 阶段）。
4. **图表/折线**：优先用 **seedSeriesRows** 数组（勿写非法 payload.kind）；若用 payload 则 kind 只能是 seriesRows|tableRows|kpiValue|selectOptions。
5. **Donut/Pie**：每行必须含契约中的 nameField 与 valueField 键。
6. **Table**：优先 **tableRows**；列 field 与契约一致。
7. **KPI**：payload 为 \`{ "kind": "kpiValue", "value": { "value", "trend", ... } }\`。
8. **Config 私有面板**（p0.config.* 除 province_data/map_scatter）：只用 **configValue**（或 P1 实时条的 **kpiGlowItems**），**禁止** payload.kind=config；province_data 用 **provinceData**；map_scatter 用 **seedSeriesRows**。**Config 字段形状必须严格遵循下方「Config 面板契约」**（尤其 production_base：圆环用 current/total，capacityBars/planBars 用 value/max）。
9. 禁止照搬模板风电示例省份/场站名（除非 Story 是风电）。
10. 时序类 seed ≥12 行；分类柱/折线 ≥8 行；数值合理、中文标签。
11. **p0.config.province_data.provinceData.mapLegend** 必填 \`{ on, off }\`（可与 widgets 阶段顶层 mapLegend 一致；装配时合并）。
12. JSON 须一次 parse 成功。

【看板 Chrome — mapLegend 须写入 provinceData】
${chromeLines}

【字段契约表 — 图表/表格行对象键名必须严格遵循】
${fieldContractBlock}

【Config 面板契约 — configValue / kpiGlowItems 字段名必须严格遵循】
${configContractBlock}

【全部槽位 — store 落盘说明】
${allSlotLines}`;

    let user = "";
    if (existingStoreFill) {
      user += `【既有 store-fill（修订合并；输出完整 JSON）】\n\n${existingStoreFill}\n\n---\n\n`;
    }
    user += `【Design Story】\n\n${designStory}\n\n请输出 phase=store 的完整 JSON（图表行键名与字段契约表一致；Config 与 Config 面板契约一致）。`;

    const model = createDeepSeekModel();
    const result = streamText({ model, system, prompt: user });
    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[design-template-store]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
