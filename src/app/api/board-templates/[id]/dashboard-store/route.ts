/**
 * 只读：模板内置 dashboard.store.json，与项目 /api/board/dashboard-store GET 返回形状一致。
 */
import { NextResponse } from "next/server";
import {
  readBoardTemplateMeta,
  readBoardTemplateStoreFile,
} from "@/lib/board-templates/server-read";
import { assertSafeBoardTemplateId } from "@/lib/board-templates/template-project-name";

function assertDashboardJsx(name: string) {
  if (!name || !/\.jsx$/i.test(name)) {
    throw new Error("dashboardFile 必须为 .jsx 文件名");
  }
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new Error("非法 dashboardFile");
  }
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await ctx.params;
  let id: string;
  try {
    id = assertSafeBoardTemplateId(rawId);
  } catch {
    return NextResponse.json({ error: "非法模板 ID" }, { status: 400 });
  }
  try {
    const meta = await readBoardTemplateMeta(process.cwd(), id);
    if (!meta) {
      return NextResponse.json({ error: "模板不存在" }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const qFile = searchParams.get("dashboardFile")?.trim();
    const defaultFile = (meta.dashboardFile ?? "dashboard.jsx").trim();
    const dashboardFile =
      qFile && /\.jsx$/i.test(qFile) ? qFile : defaultFile || "dashboard.jsx";
    assertDashboardJsx(dashboardFile);
    const store = await readBoardTemplateStoreFile(process.cwd(), id, dashboardFile);
    return NextResponse.json({ store });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
