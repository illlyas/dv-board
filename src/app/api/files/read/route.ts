/**
 * GET /api/files/read?path=.dv/xxx/yyy/zzz.md
 *
 * 读取指定文件内容（通过存储层）
 *
 * 输出：{ content: string }
 */
import { NextResponse } from "next/server";
import { storage, normalizeLogical } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    // 安全检查：只允许读取 .dv/ 目录下的文件
    const normalized = normalizeLogical(filePath);
    if (!normalized.startsWith(".dv/") && normalized !== ".dv") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const content = await storage.readText(normalized);
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[files/read] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
