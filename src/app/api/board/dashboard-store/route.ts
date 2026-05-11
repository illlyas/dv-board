/**
 * GET  读取仪表盘数据 store（不存在则返回空结构）
 * POST 合并写入单条组件记录（读-改-写同一文件）
 */
import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  createEmptyDashboardStore,
  dashboardStoreFilename,
  mergeComponentIntoStore,
} from "@/lib/dashboard-store";
import { isBoardTemplatePreviewProject } from "@/lib/board-templates/template-project-name";
import type {
  DashboardStoreComponentRecord,
  DashboardStoreFile,
} from "@/types/dashboard-store.types";

export const maxDuration = 60;

function safeProject(name: string) {
  return name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-\s]/g, "_").trim();
}

function assertDashboardJsx(name: string) {
  if (!name || !/\.jsx$/i.test(name)) {
    throw new Error("dashboardFile 必须为 .jsx 文件名");
  }
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new Error("非法 dashboardFile");
  }
}

function storeAbsolutePath(projectName: string, dashboardFile: string): string {
  const fn = dashboardStoreFilename(dashboardFile);
  return path.join(process.cwd(), ".dv", safeProject(projectName), "页面", fn);
}

async function readStoreFile(
  projectName: string,
  dashboardFile: string
): Promise<DashboardStoreFile> {
  const fp = storeAbsolutePath(projectName, dashboardFile);
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get("projectName");
    const dashboardFile = searchParams.get("dashboardFile");
    if (!projectName || !dashboardFile) {
      return NextResponse.json(
        { error: "缺少 projectName 或 dashboardFile" },
        { status: 400 }
      );
    }
    assertDashboardJsx(dashboardFile);
    const store = await readStoreFile(projectName, dashboardFile);
    return NextResponse.json({ store });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectName?: string;
      dashboardFile?: string;
      component?: DashboardStoreComponentRecord;
    };
    const { projectName, dashboardFile, component } = body;
    if (!projectName || !dashboardFile || !component) {
      return NextResponse.json(
        { error: "缺少 projectName、dashboardFile 或 component" },
        { status: 400 }
      );
    }
    if (isBoardTemplatePreviewProject(projectName)) {
      return NextResponse.json(
        { error: "模板预览为只读，不可写入 store" },
        { status: 403 }
      );
    }
    assertDashboardJsx(dashboardFile);
    if (!component.slotId?.trim()) {
      return NextResponse.json({ error: "component.slotId 无效" }, { status: 400 });
    }

    const fp = storeAbsolutePath(projectName, dashboardFile);
    await mkdir(path.dirname(fp), { recursive: true });

    const prev = await readStoreFile(projectName, dashboardFile);
    const merged = mergeComponentIntoStore(prev, component);

    const out: DashboardStoreFile = {
      ...merged,
      dashboardFile,
    };

    await writeFile(fp, JSON.stringify(out, null, 2), "utf-8");
    return NextResponse.json({ success: true, store: out });
  } catch (err) {
    console.error("[dashboard-store POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
