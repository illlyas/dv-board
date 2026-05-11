/**
 * GET  读取仪表盘数据 store（不存在则返回空结构）
 * POST 合并写入单条组件记录（读-改-写同一文件）
 *
 * 注意：本路由**始终走本地 fs**，不经 0G。
 * dashboard.store.json 是 slot mock 的高频读写文件，每次上链成本不可接受。
 */
import { NextResponse } from "next/server";
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
import { FsStorageAdapter } from "@/lib/storage/fs-adapter";
import { dvPath } from "@/lib/storage";

export const maxDuration = 60;

/** 强制本地 fs：dashboard.store.json 高频读写，不进 0G */
const localStore = new FsStorageAdapter(process.cwd());

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

function storeLogicalPath(projectName: string, dashboardFile: string): string {
  const fn = dashboardStoreFilename(dashboardFile);
  return dvPath(safeProject(projectName), "页面", fn);
}

async function readStoreFile(
  projectName: string,
  dashboardFile: string
): Promise<DashboardStoreFile> {
  const raw = await localStore.tryReadText(storeLogicalPath(projectName, dashboardFile));
  if (raw === null) return createEmptyDashboardStore(dashboardFile);
  try {
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

    const prev = await readStoreFile(projectName, dashboardFile);
    const merged = mergeComponentIntoStore(prev, component);

    const out: DashboardStoreFile = {
      ...merged,
      dashboardFile,
    };

    await localStore.writeText(
      storeLogicalPath(projectName, dashboardFile),
      JSON.stringify(out, null, 2)
    );
    return NextResponse.json({ success: true, store: out });
  } catch (err) {
    console.error("[dashboard-store POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
