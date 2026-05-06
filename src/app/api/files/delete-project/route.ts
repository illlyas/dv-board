/**
 * DELETE /api/files/delete-project
 *
 * 删除 .dv/{projectName}/ 整个目录
 *
 * 输入：{ projectName: string }
 * 输出：{ success: true }
 */
import { NextResponse } from "next/server";
import { rm, access } from "fs/promises";
import path from "path";

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { projectName?: string };
    const { projectName } = body;

    if (!projectName) {
      return NextResponse.json({ error: "Missing projectName" }, { status: 400 });
    }

    const safeName = projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-\s]/g, "_").trim();
    const projectDir = path.join(process.cwd(), ".dv", safeName);

    // 检查目录是否存在，不存在则直接返回成功
    try {
      await access(projectDir);
    } catch {
      return NextResponse.json({ success: true, message: "Directory not found, skipped" });
    }

    await rm(projectDir, { recursive: true, force: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[files/delete-project] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
