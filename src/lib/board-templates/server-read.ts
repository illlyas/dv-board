import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import {
  createEmptyDashboardStore,
  dashboardStoreFilename,
} from "@/lib/dashboard-store";
import type { DashboardStoreFile } from "@/types/dashboard-store.types";
import type {
  BoardTemplateBundle,
  BoardTemplateMeta,
} from "@/lib/board-templates/types";
import { assertSafeBoardTemplateId } from "@/lib/board-templates/template-project-name";

export type {
  BoardTemplateMeta,
  BoardTemplateListItem,
  BoardTemplateBundle,
} from "@/lib/board-templates/types";

const ROOT_DIR = "board-templates";

function templatesRoot(cwd: string): string {
  return path.join(cwd, ROOT_DIR);
}

function templateDir(cwd: string, id: string): string {
  return path.join(templatesRoot(cwd), id);
}

function defaultDashboardFile(meta: BoardTemplateMeta): string {
  const n = (meta.dashboardFile ?? "dashboard.jsx").trim();
  if (!/^[a-zA-Z0-9_\-.]+\.jsx$/i.test(n)) return "dashboard.jsx";
  return n;
}

export async function listBoardTemplateIds(cwd: string): Promise<string[]> {
  const root = templatesRoot(cwd);
  let names: string[] = [];
  try {
    names = await readdir(root);
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const name of names) {
    try {
      assertSafeBoardTemplateId(name);
    } catch {
      continue;
    }
    const dir = path.join(root, name);
    try {
      if (!(await stat(dir)).isDirectory()) continue;
    } catch {
      continue;
    }
    const metaPath = path.join(dir, "meta.json");
    const tokensPath = path.join(dir, "vi-tokens.json");
    try {
      const rawMeta = await readFile(metaPath, "utf-8");
      const meta = JSON.parse(rawMeta) as BoardTemplateMeta;
      if (!meta || meta.id !== name) continue;
      const dashFile = defaultDashboardFile(meta);
      const jsxPath = path.join(dir, dashFile);
      const storeName = dashboardStoreFilename(dashFile);
      const storePath = path.join(dir, storeName);
      await readFile(tokensPath, "utf-8");
      await readFile(jsxPath, "utf-8");
      await readFile(storePath, "utf-8");
      out.push(name);
    } catch {
      continue;
    }
  }
  out.sort();
  return out;
}

export async function readBoardTemplateMeta(
  cwd: string,
  id: string
): Promise<BoardTemplateMeta | null> {
  const safe = assertSafeBoardTemplateId(id);
  try {
    const raw = await readFile(
      path.join(templateDir(cwd, safe), "meta.json"),
      "utf-8"
    );
    const meta = JSON.parse(raw) as BoardTemplateMeta;
    if (!meta || meta.id !== safe) return null;
    return meta;
  } catch {
    return null;
  }
}

export async function readBoardTemplateStoreFile(
  cwd: string,
  templateId: string,
  dashboardFile: string
): Promise<DashboardStoreFile> {
  const safe = assertSafeBoardTemplateId(templateId);
  const storeName = dashboardStoreFilename(dashboardFile);
  const fp = path.join(templateDir(cwd, safe), storeName);
  try {
    const raw = await readFile(fp, "utf-8");
    const parsed = JSON.parse(raw) as DashboardStoreFile;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.pages)) {
      return createEmptyDashboardStore(dashboardFile);
    }
    return {
      version: 1,
      dashboardFile: parsed.dashboardFile || dashboardFile,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      pages: parsed.pages,
    };
  } catch {
    return createEmptyDashboardStore(dashboardFile);
  }
}

function safeRelativeFileName(name: string | undefined): string | undefined {
  const n = (name ?? "").trim();
  if (!n) return undefined;
  if (n.includes("..") || n.includes("/") || n.includes("\\")) return undefined;
  if (!/^[a-zA-Z0-9_\-.]+\.json$/i.test(n)) return undefined;
  return n;
}

export async function loadBoardTemplateBundle(
  cwd: string,
  id: string
): Promise<BoardTemplateBundle | null> {
  const meta = await readBoardTemplateMeta(cwd, id);
  if (!meta) return null;
  const safe = assertSafeBoardTemplateId(id);
  const dir = templateDir(cwd, safe);
  const dashboardFile = defaultDashboardFile(meta);
  try {
    const slotsFile = safeRelativeFileName(meta.slotsSchemaFile);
    const widgetsFile = safeRelativeFileName(meta.widgetsManifestFile);
    const [viTokensJson, dashboardJsx, store, slotsSchemaJson, widgetsManifestJson] =
      await Promise.all([
        readFile(path.join(dir, "vi-tokens.json"), "utf-8"),
        readFile(path.join(dir, dashboardFile), "utf-8"),
        readBoardTemplateStoreFile(cwd, safe, dashboardFile),
        slotsFile
          ? readFile(path.join(dir, slotsFile), "utf-8").catch(() => undefined)
          : Promise.resolve(undefined),
        widgetsFile
          ? readFile(path.join(dir, widgetsFile), "utf-8").catch(() => undefined)
          : Promise.resolve(undefined),
      ]);
    const out: BoardTemplateBundle = {
      meta,
      viTokensJson,
      dashboardJsx,
      store,
    };
    if (slotsSchemaJson !== undefined) out.slotsSchemaJson = slotsSchemaJson;
    if (widgetsManifestJson !== undefined) out.widgetsManifestJson = widgetsManifestJson;
    return out;
  } catch {
    return null;
  }
}

