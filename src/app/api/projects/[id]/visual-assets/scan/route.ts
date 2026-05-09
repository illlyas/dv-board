/**
 * POST /api/projects/[id]/visual-assets/scan
 * 读取 dashboard.jsx，返回扫描结果与合并后的建议 visualAssets（不写盘）
 */
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isValidProjectKey, projectRootDir } from "@/lib/projects/project-config";
import { parseProjectConfigJson, mergeScanIntoVisualAssets, ensureProjectVisualAssets } from "@/lib/projects/parse-project-config";
import { projectConfigPath } from "@/lib/projects/project-config";
import { scanDashboardJsxForVisualAssets } from "@/lib/visual-assets/scan-dashboard";

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!isValidProjectKey(id)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }
    const cwd = process.cwd();
    const rawCfg = await readFile(projectConfigPath(cwd, id), "utf-8");
    const cfg = parseProjectConfigJson(rawCfg);
    if (!cfg || cfg.id !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const withAssets = ensureProjectVisualAssets(cfg);
    const dashPath = path.join(projectRootDir(cwd, id), "页面", "dashboard.jsx");
    let jsx = "";
    try {
      jsx = await readFile(dashPath, "utf-8");
    } catch {
      jsx = "";
    }
    const detected = scanDashboardJsxForVisualAssets(jsx);
    const suggestedVisualAssets = mergeScanIntoVisualAssets(withAssets.visualAssets!, detected.heroImplementationIds, detected.chartTitleBackdropUsed);

    return NextResponse.json({
      detected,
      suggestedVisualAssets,
      dashboardPath: `.dv/${id}/页面/dashboard.jsx`,
    });
  } catch (e) {
    console.error("[visual-assets/scan]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
