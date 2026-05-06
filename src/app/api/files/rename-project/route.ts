/**
 * POST /api/files/rename-project
 *
 * 重命名 .dv/{oldName}/ 为 .dv/{newName}/
 *
 * 输入：{ oldName: string, newName: string }
 * 输出：{ success: true }
 */
import { NextResponse } from "next/server";
import { rename, access } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { oldName?: string; newName?: string };
    const { oldName, newName } = body;

    if (!oldName || !newName) {
      return NextResponse.json({ error: "Missing oldName or newName" }, { status: 400 });
    }

    const safeFn = (name: string) =>
      name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-\s]/g, "_").trim();

    const oldDir = path.join(process.cwd(), ".dv", safeFn(oldName));
    const newDir = path.join(process.cwd(), ".dv", safeFn(newName));

    // 旧目录不存在则跳过
    try {
      await access(oldDir);
    } catch {
      return NextResponse.json({ success: true, message: "Old directory not found, skipped" });
    }

    await rename(oldDir, newDir);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[files/rename-project] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
