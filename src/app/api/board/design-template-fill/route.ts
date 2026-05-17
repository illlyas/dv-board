/**
 * @deprecated 流水线已改为两阶段：design-template-widgets → design-template-store。
 * 本路由仍一次产出 template-fill（易引发 widgets/store 字段不一致），仅保留兼容。
 *
 * 基于 design-story + slots.schema + widgets.manifest 生成 template-fill JSON（流式纯文本）。
 */
import { readFile } from "fs/promises";
import path from "path";
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { WIND_POWER_EMERALD_OPS_TEMPLATE_ID } from "@/lib/board/wind-template-id";
import type { SlotsSchemaFile, WidgetsManifestFile } from "@/lib/board/wind-template-assembler";
import {
  buildAllSlotPromptLines,
  buildChromePromptLines,
  buildPanelHeaderPromptLines,
  TEMPLATE_FILL_JSON_EXAMPLE,
} from "@/lib/board/template-fill-prompt";

export const maxDuration = 120;

const TEMPLATE_DIR = path.join(process.cwd(), "board-templates", WIND_POWER_EMERALD_OPS_TEMPLATE_ID);

function buildManifestPromptBlock(manifest: WidgetsManifestFile): string {
  const platform = (manifest.platformWidgetsUsed ?? []).map((t) => `- ${t}`).join("\n");
  const privateComps = (manifest.components ?? [])
    .map((c) => `- **${c.importName}** — ${c.role ?? ""}；数据经 useStoreData 读 store 中 p*.config.* 槽位`)
    .join("\n");
  return `【widgets.manifest.json — 组件边界】
${manifest.description ?? ""}

**平台 Widget 类型**
${platform || "- （见模板 widgets.json）"}

**私有面板组件（dashboard.jsx 内）**
${privateComps}
私有面板不单独 invent slot；须为下方 slots.schema 中 kind=config 的 slotId 填写 configValue / provinceData / seedSeriesRows 等。`;
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
    const [schemaRaw, manifestRaw] = await Promise.all([
      readFile(path.join(TEMPLATE_DIR, "slots.schema.json"), "utf8"),
      readFile(path.join(TEMPLATE_DIR, "widgets.manifest.json"), "utf8"),
    ]);
    const schema = JSON.parse(schemaRaw) as SlotsSchemaFile;
    const manifest = JSON.parse(manifestRaw) as WidgetsManifestFile;
    const allSlotLines = buildAllSlotPromptLines(schema);
    const panelHeaderLines = buildPanelHeaderPromptLines(schema);
    const chromeLines = buildChromePromptLines(schema);
    const manifestBlock = buildManifestPromptBlock(manifest);
    const slotIdList = schema.slots.map((s) => s.slotId).join(", ");

    const system = `你是数据可视化看板的「模板填空」专家。模板 **${WIND_POWER_EMERALD_OPS_TEMPLATE_ID}** 布局固定；你的输出经装配同时写入：
- **widgets.json**（平台 Widget 的 title/subtitle/unit/轴标签）
- **dashboard.store.json**（各 slotId 的业务 payload，含私有 Config 槽位）
- **slots.schema.json** 的 panelHeaders

只输出 **一个合法 JSON 对象**（无 Markdown 围栏、无解释）。

结构示例（字段按槽位类型取舍，须覆盖下方全部 slotId）：
${TEMPLATE_FILL_JSON_EXAMPLE}

硬性规则：
1. **slots 的键必须是 slotId**（形如 \`p0.kpi.hero_01\`、\`p0.config.gen_progress\`），**禁止** widgetKey（\`p0_kpi_hero_01\`）。
2. **必须为下列每一个 slotId 提供业务数据**（文案 + store 至少其一；Config/seed/Table 必须有数据字段）：  
   ${slotIdList}
3. 业务数据须与 Design Story 的行业、指标、分区语义一致；数值合理、中文标签；**禁止**照搬模板运营示例中的省份名、场站、MWh 等固定文案（除非 Story 明确是运营）。
3b. **中栏 GeoMap（p0.config.province_data + p0.config.map_scatter）为必填**：provinceData 使用省级全称作 provinces 键，指标对象为 power/capacity/farms/rate（按 Story 换指标语义与 regionCard 文案）；map_scatter 为工厂/站点经纬度散点；禁止 CN-xx 编码或仅 {name,value} 的简写。
4. store 数据写法（任选其一，装配时会归一化为 payload）：
   - 通用：**payload** \`{ kind: "kpiValue"|"seriesRows"|"tableRows"|"selectOptions", value: ... }\`
   - Config：**configValue**（对象，常含 items / capacity / running 等）
   - 图表/种子：**seedSeriesRows**（数组）
   - 表格：**tableRows**（数组）
   - 省域地图：**provinceData**（defaultProvince 为「广东省」式全称；provinces 键同为全称，值为 { power,capacity,farms,rate }；mapLegend 为 {on,off}；regionCard 含 volumeLabel 等）
   - 地图散点：**seedSeriesRows**（p0.config.map_scatter，≥8 个 { name, value:[lng,lat,size] }）
   - P1 实时条：**kpiGlowItems**（3 条 KpiGlowBar）
   - 运维左三指标：**p0.config.maintenance_metrics** 的 configValue.items 每项用 **title**（勿用 label），含 iconId/value/unit/tone
5. KPI 的 payload.kind 为 kpiValue；折线/柱/饼/地图散点为 seriesRows；Table 为 tableRows。
6. 有 widgetKey 的槽位同时填写 title/subtitle/unit 等展示文案（与 Story 一致）；饼/环图用 title/subtitle，**勿**自造 seriesName 等未在示例 JSON 中的顶层字段（若写 seriesName 须与 Story 一致）。
7. panelHeaders 键名固定，文案与 Story 分区语义一致。
8. **mapLegend**、**footerNav** 必填（见 chrome 说明）；provinceData 内亦须含 mapLegend。
9. JSON 须一次 parse 成功。

${manifestBlock}

【全部槽位 — 文案 + store 落盘说明】
${allSlotLines}

【PanelShell 分区标题 → panelHeaders】
${panelHeaderLines}

【看板 Chrome — mapLegend + footerNav】
${chromeLines}`;

    let user = "";
    if (existingFill) {
      user += `【既有 template-fill.json（语义上修订合并；输出完整 JSON，含全部 slotId 与 store 数据）】\n\n${existingFill}\n\n---\n\n`;
    }
    user += `【Design Story】\n\n${designStory}\n\n请输出覆盖全部 slotId 的完整 JSON（含 dashboard.store 业务数据）。`;

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
