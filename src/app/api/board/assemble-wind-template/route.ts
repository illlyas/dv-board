/**
 * 将 template-fill 装配为项目内 dashboard.jsx + dashboard.store.json（确定性，无 LLM）。
 * 业务数据 payload 不落盘；预览时由各槽位 mock-slot 写入 store。
 */
import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { storage, dvPath } from "@/lib/storage";
import { templateFillSchema, validateSlotIdsAgainstSchema } from "@/lib/board/template-fill-schema";
import {
  applyTemplateFillToDashboardJsx,
  mergeTemplateFillIntoDashboardStore,
  stripStorePayloadsForRuntimeAgentFill,
  slotIdToWidgetKeyMap,
  type SlotsSchemaFile,
  countStoreComponents,
} from "@/lib/board/wind-template-assembler";
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

    const fill = templateFillSchema.parse(body?.templateFill);

    const schemaRaw = await readFile(path.join(TEMPLATE_DIR, "slots.schema.json"), "utf8");
    const schema = JSON.parse(schemaRaw) as SlotsSchemaFile;
    const allowed = new Set(schema.slots.map((s) => s.slotId));
    validateSlotIdsAgainstSchema(fill, allowed);

    const [jsxTemplate, storeRaw] = await Promise.all([
      readFile(path.join(TEMPLATE_DIR, "dashboard.jsx"), "utf8"),
      readFile(path.join(TEMPLATE_DIR, "dashboard.store.json"), "utf8"),
    ]);

    const store = JSON.parse(storeRaw) as DashboardStoreFile;
    const slotMap = slotIdToWidgetKeyMap(schema);

    const patchedJsx = applyTemplateFillToDashboardJsx(jsxTemplate, fill, slotMap);
    const mergedStore = stripStorePayloadsForRuntimeAgentFill(
      mergeTemplateFillIntoDashboardStore(store, fill)
    );

    const jsxPath = dvPath(projectName, "页面", "dashboard.jsx");
    const storePath = dvPath(projectName, "页面", "dashboard.store.json");

    await storage.writeText(jsxPath, patchedJsx);
    await storage.writeText(storePath, JSON.stringify(mergedStore, null, 2));

    const pageCount = mergedStore.pages.length;
    const estimatedComponents = countStoreComponents(mergedStore);

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
