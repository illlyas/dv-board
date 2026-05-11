/**
 * POST /api/projects/[id]/visual-assets/scan
 * 读取 dashboard.jsx，返回扫描结果与合并后的建议 visualAssets（不写盘）
 */
import { NextResponse } from "next/server";
import {
  isValidProjectKey,
  PROJECT_CONFIG_FILENAME,
} from "@/lib/projects/project-config";
import {
  parseProjectConfigJson,
  mergeScanIntoVisualAssets,
  ensureProjectVisualAssets,
} from "@/lib/projects/parse-project-config";
import { scanDashboardJsxForVisualAssets } from "@/lib/visual-assets/scan-dashboard";
import { storage, dvPath } from "@/lib/storage";

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!isValidProjectKey(id)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }
    const rawCfg = await storage.tryReadText(dvPath(id, PROJECT_CONFIG_FILENAME));
    if (rawCfg === null) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const cfg = parseProjectConfigJson(rawCfg);
    if (!cfg || cfg.id !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const withAssets = ensureProjectVisualAssets(cfg);
    const jsx = (await storage.tryReadText(dvPath(id, "页面", "dashboard.jsx"))) ?? "";
    const detected = scanDashboardJsxForVisualAssets(jsx);
    const suggestedVisualAssets = mergeScanIntoVisualAssets(
      withAssets.visualAssets!,
      detected.heroImplementationIds,
      detected.chartTitleBackdropUsed,
      detected.footerImplementationIds,
      detected.pageImplementationIds
    );

    return NextResponse.json({
      detected,
      suggestedVisualAssets,
      dashboardPath: dvPath(id, "页面", "dashboard.jsx"),
    });
  } catch (e) {
    console.error("[visual-assets/scan]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
