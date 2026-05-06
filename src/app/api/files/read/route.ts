/**
 * GET /api/files/read?path=.dv/xxx/yyy/zzz.md
 *
 * 读取指定文件内容
 *
 * 输出：{ content: string }
 */
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    // 安全检查：只允许读取 .dv/ 目录下的文件
    const normalized = path.normalize(filePath);
    if (!normalized.startsWith(".dv") && !normalized.startsWith(".dv/") && !normalized.startsWith(".dv\\")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const absolutePath = path.join(process.cwd(), normalized);
    const content = await readFile(absolutePath, "utf-8");

    return NextResponse.json({ content });
  } catch (err) {
    console.error("[files/read] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
