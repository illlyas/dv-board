/**
 * GET    /api/projects/[id] — 读取 project.config.json（缺 visualAssets 时补全并写回）
 * PATCH  /api/projects/[id] — 更新 name / style / visualAssets
 * DELETE /api/projects/[id] — 删除整个项目目录（0G 适配器只摘除索引）
 */
import { NextResponse } from "next/server";
import {
  isValidProjectKey,
  PROJECT_CONFIG_FILENAME,
} from "@/lib/projects/project-config";
import {
  parseProjectConfigJson,
  ensureProjectBoardDefaults,
  ensureProjectVisualAssets,
  withPersistedDefaults,
} from "@/lib/projects/parse-project-config";
import { validateVisualAssetsBlock } from "@/lib/visual-assets/validate";
import { storage, dvPath } from "@/lib/storage";

async function readAllProjectNames(excludeId: string): Promise<Set<string>> {
  const names = new Set<string>();
  const { dirs } = await storage.listChildren(".dv");
  for (const key of dirs) {
    if (!isValidProjectKey(key) || key === excludeId) continue;
    const raw = await storage.tryReadText(dvPath(key, PROJECT_CONFIG_FILENAME));
    if (!raw) continue;
    const c = parseProjectConfigJson(raw);
    if (c?.id === key) names.add(c.name);
  }
  return names;
}

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!isValidProjectKey(id)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }
    const raw = await storage.tryReadText(dvPath(id, PROJECT_CONFIG_FILENAME));
    if (raw === null) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const cfg = parseProjectConfigJson(raw);
    if (!cfg || cfg.id !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const ensured = ensureProjectBoardDefaults(ensureProjectVisualAssets(cfg));
    const needsWrite = !cfg.visualAssets?.items?.length || cfg.configVersion < 2;
    if (needsWrite) {
      await storage.writeText(
        dvPath(id, PROJECT_CONFIG_FILENAME),
        JSON.stringify(ensured, null, 2)
      );
    }
    return NextResponse.json({ project: ensured });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!isValidProjectKey(id)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      style?: string;
      visualAssets?: unknown;
    };
    const raw = await storage.tryReadText(dvPath(id, PROJECT_CONFIG_FILENAME));
    if (raw === null) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const cfg = parseProjectConfigJson(raw);
    if (!cfg || cfg.id !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (typeof body.name === "string") {
      const nextName = body.name.trim();
      if (!nextName) {
        return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
      }
      const taken = await readAllProjectNames(id);
      if (taken.has(nextName)) {
        return NextResponse.json({ error: "DUPLICATE_NAME", message: "已存在同名展示项目" }, { status: 409 });
      }
      cfg.name = nextName;
    }
    if (typeof body.style === "string") {
      cfg.style = body.style.trim();
    }
    if (body.visualAssets !== undefined) {
      const v = validateVisualAssetsBlock(body.visualAssets);
      if (!v.ok) {
        return NextResponse.json({ error: v.error }, { status: 400 });
      }
      cfg.visualAssets = v.data;
      cfg.configVersion = 2;
    }
    cfg.updatedAt = new Date().toISOString();

    const out = withPersistedDefaults(cfg);
    await storage.writeText(
      dvPath(id, PROJECT_CONFIG_FILENAME),
      JSON.stringify(out, null, 2)
    );
    return NextResponse.json({ project: out });
  } catch (e) {
    console.error("[api/projects PATCH]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!isValidProjectKey(id)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }
    await storage.removeDir(dvPath(id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/projects DELETE]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
