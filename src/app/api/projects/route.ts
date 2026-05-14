/**
 * GET  /api/projects — 列出 .dv 下带 project.config.json 的项目
 * POST /api/projects — 创建项目的 project.config.json（分类"目录"由首次写入文件时隐式建立）
 */
import { NextResponse } from "next/server";
import {
  PROJECT_CONFIG_FILENAME,
  isValidProjectKey,
  type ProjectConfig,
} from "@/lib/projects/project-config";
import {
  parseProjectConfigJson,
  ensureProjectBoardDefaults,
  ensureProjectVisualAssets,
} from "@/lib/projects/parse-project-config";
import { getLayoutPreset } from "@/lib/board/board-layout-presets";
import { createVisualAssetsForNewProject, getAssetKit } from "@/lib/projects/asset-kits";
import { getScreenPreset } from "@/lib/board/screen-presets";
import { WIND_TEMPLATE_SCREEN_PRESET_ID } from "@/lib/board/wind-template-id";
import { storage, dvPath } from "@/lib/storage";

export async function GET() {
  try {
    const { dirs } = await storage.listChildren(".dv");

    const projects: ProjectConfig[] = [];
    for (const name of dirs) {
      if (!isValidProjectKey(name)) continue;
      const raw = await storage.tryReadText(dvPath(name, PROJECT_CONFIG_FILENAME));
      if (!raw) continue;
      const cfg = parseProjectConfigJson(raw);
      if (!cfg || cfg.id !== name) continue;
      projects.push(ensureProjectBoardDefaults(ensureProjectVisualAssets(cfg)));
    }

    projects.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    return NextResponse.json({ projects });
  } catch (err) {
    console.error("[api/projects GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      style?: string;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const style = typeof body.style === "string" ? body.style.trim() : "";
    /** 装配管线固定使用风电运营模板；与弹窗解耦，由服务端写入 project.config */
    const themeMode = "dark" as const;
    const boardKind = "wallboard" as const;
    const layoutPresetId = getLayoutPreset(undefined).id;
    const assetKitId = getAssetKit(undefined).id;
    const screenPresetId = getScreenPreset(WIND_TEMPLATE_SCREEN_PRESET_ID).id;
    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const id = `project-${Date.now()}`;

    const now = new Date().toISOString();
    const base: ProjectConfig = {
      configVersion: 3,
      id,
      name,
      style,
      createdAt: now,
      updatedAt: now,
      themeMode,
      boardKind,
      layoutPresetId,
      assetKitId,
      screenPresetId,
      visualAssets: createVisualAssetsForNewProject(assetKitId),
    };
    const config = ensureProjectBoardDefaults(ensureProjectVisualAssets(base));

    await storage.writeText(
      dvPath(id, PROJECT_CONFIG_FILENAME),
      JSON.stringify(config, null, 2)
    );

    return NextResponse.json({ project: config });
  } catch (err) {
    console.error("[api/projects POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
