/**
 * 将 template-fill 装配为项目 dashboard.jsx、widgets.json、slots.schema.json；
 * store 复制模板槽位骨架，并将 template-fill 中的业务数据写入 dashboard.store.json。
 */
import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { storage, dvPath } from "@/lib/storage";
import {
  normalizeTemplateFillSlotKeys,
  templateFillSchema,
  validateSlotIdsAgainstSchema,
} from "@/lib/board/template-fill-schema";
import {
  applyThemeTitleToDashboardJsx,
  applyTemplateFillToSlotsSchemaJson,
  applyTemplateFillToWidgetsJson,
  parseWidgetsJson,
  mergeTemplateFillIntoStore,
  slotIdToWidgetKeyMap,
  type SlotsSchemaFile,
  countStoreComponents,
} from "@/lib/board/wind-template-assembler";
import {
  storeFillFromTemplateFill,
  widgetsFillFromTemplateFill,
} from "@/lib/board/template-fill-schema";
import {
  buildFieldContractsFromWidgetsFill,
  validateStoreFillAgainstWidgets,
} from "@/lib/board/widget-field-contract";
import { WIND_POWER_EMERALD_OPS_TEMPLATE_ID } from "@/lib/board/wind-template-id";
import type { DashboardStoreFile } from "@/types/dashboard-store.types";
import { jsxCodeSchema } from "@/lib/board/jsx-output";

export const maxDuration = 60;

const TEMPLATE_DIR = path.join(process.cwd(), "board-templates", WIND_POWER_EMERALD_OPS_TEMPLATE_ID);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectName?: string;
      templateFill?: unknown;
    };
    const projectName = body?.projectName?.trim();
    if (!projectName) {
      return NextResponse.json({ error: "Missing projectName" }, { status: 400 });
    }

    const parsedFill = templateFillSchema.parse(body?.templateFill);

    const schemaRaw = await readFile(path.join(TEMPLATE_DIR, "slots.schema.json"), "utf8");
    const schema = JSON.parse(schemaRaw) as SlotsSchemaFile;
    const fill = normalizeTemplateFillSlotKeys(parsedFill, schema.slots);
    const allowed = new Set(schema.slots.map((s) => s.slotId));
    const widgetKeyToSlotId = new Map(
      schema.slots.filter((s) => s.widgetKey).map((s) => [s.widgetKey!, s.slotId])
    );
    validateSlotIdsAgainstSchema(fill, allowed, widgetKeyToSlotId);

    const [jsxTemplate, storeRaw, widgetsRaw] = await Promise.all([
      readFile(path.join(TEMPLATE_DIR, "dashboard.jsx"), "utf8"),
      readFile(path.join(TEMPLATE_DIR, "dashboard.store.json"), "utf8"),
      readFile(path.join(TEMPLATE_DIR, "widgets.json"), "utf8"),
    ]);

    const store = JSON.parse(storeRaw) as DashboardStoreFile;
    const slotMap = slotIdToWidgetKeyMap(schema);
    const templateWidgets = parseWidgetsJson(widgetsRaw);

    const patchedJsx = applyThemeTitleToDashboardJsx(jsxTemplate, fill);
    const patchedWidgets = applyTemplateFillToWidgetsJson(templateWidgets, fill, slotMap);
    const patchedSlotsSchema = applyTemplateFillToSlotsSchemaJson(schemaRaw, fill);

    const widgetsFillPart = widgetsFillFromTemplateFill(fill);
    const storeFillPart = storeFillFromTemplateFill(fill);
    const fieldContracts = buildFieldContractsFromWidgetsFill(
      widgetsFillPart,
      schema,
      patchedWidgets,
      slotMap
    );
    validateStoreFillAgainstWidgets(storeFillPart, fieldContracts);

    const storeForDisk = mergeTemplateFillIntoStore(store, fill);

    const jsxPath = dvPath(projectName, "页面", "dashboard.jsx");
    const storePath = dvPath(projectName, "页面", "dashboard.store.json");
    const widgetsPath = dvPath(projectName, "页面", "widgets.json");

    await storage.writeText(jsxPath, patchedJsx);
    await storage.writeText(storePath, JSON.stringify(storeForDisk, null, 2));
    await storage.writeText(widgetsPath, JSON.stringify(patchedWidgets, null, 2));
    await storage.writeText(dvPath(projectName, "页面结构", "slots.schema.json"), patchedSlotsSchema);

    const pageCount = storeForDisk.pages.length;
    const estimatedComponents = countStoreComponents(storeForDisk);

    const jsxCode = jsxCodeSchema.parse({
      code: patchedJsx,
      metadata: {
        componentName: "Dashboard",
        pageCount,
        canvasSize: { width: 2560, height: 900 },
        estimatedComponents,
        chartTypesUsed: [],
        iconsUsed: [],
      },
      description: `由模板 ${WIND_POWER_EMERALD_OPS_TEMPLATE_ID} 装配生成`,
    });

    return NextResponse.json({ ok: true as const, jsxCode });
  } catch (err) {
    console.error("[assemble-wind-template]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
