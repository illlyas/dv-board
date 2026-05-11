/**
 * GET  /api/projects — 列出 .dv 下带 project.config.json 的项目
 * POST /api/projects — 创建项目目录、分类子目录与 project.config.json
 */
import { NextResponse } from "next/server";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  PROJECT_CATEGORY_DIRS,
  PROJECT_CONFIG_FILENAME,
  isValidProjectKey,
  projectConfigPath,
  projectRootDir,
  dvProjectsRoot,
  type BoardKind,
  type ProjectConfig,
  type ThemeMode,
} from "@/lib/projects/project-config";
import {
  parseProjectConfigJson,
  ensureProjectBoardDefaults,
  ensureProjectVisualAssets,
} from "@/lib/projects/parse-project-config";
import { getLayoutPreset } from "@/lib/board/board-layout-presets";
import { createVisualAssetsForNewProject, getAssetKit } from "@/lib/projects/asset-kits";
import { getScreenPreset } from "@/lib/board/screen-presets";

export async function GET() {
  try {
    const cwd = process.cwd();
    const base = dvProjectsRoot(cwd);
    let entries: string[] = [];
    try {
      entries = await readdir(base);
    } catch {
      return NextResponse.json({ projects: [] as ProjectConfig[] });
    }

    const projects: ProjectConfig[] = [];
    for (const name of entries) {
      if (!isValidProjectKey(name)) continue;
      const cfgPath = projectConfigPath(cwd, name);
      let raw: string;
      try {
        raw = await readFile(cfgPath, "utf-8");
      } catch {
        continue;
      }
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
      themeMode?: ThemeMode;
      boardKind?: BoardKind;
      layoutPresetId?: string;
      assetKitId?: string;
      screenPresetId?: string;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const style = typeof body.style === "string" ? body.style.trim() : "";
    const themeMode: ThemeMode = body.themeMode === "light" ? "light" : "dark";
    const boardKind: BoardKind = body.boardKind === "wallboard" ? "wallboard" : "dashboard";
    const layoutPresetId = getLayoutPreset(
      typeof body.layoutPresetId === "string" ? body.layoutPresetId : undefined
    ).id;
    const assetKitId = getAssetKit(typeof body.assetKitId === "string" ? body.assetKitId : undefined).id;
    const screenPresetId = getScreenPreset(
      typeof body.screenPresetId === "string" ? body.screenPresetId : undefined
    ).id;
    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const cwd = process.cwd();
    const id = `project-${Date.now()}`;
    const root = projectRootDir(cwd, id);

    await mkdir(root, { recursive: true });
    for (const cat of PROJECT_CATEGORY_DIRS) {
      await mkdir(path.join(root, cat), { recursive: true });
    }

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
    await writeFile(
      path.join(root, PROJECT_CONFIG_FILENAME),
      JSON.stringify(config, null, 2),
      "utf-8"
    );

    return NextResponse.json({ project: config });
  } catch (err) {
    console.error("[api/projects POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
