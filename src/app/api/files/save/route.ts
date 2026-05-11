/**
 * POST /api/files/save
 *
 * 将 AI 生成的内容保存为文件到 .dv/{projectName}/{category}/ 目录（通过存储层）
 *
 * 输入：{ projectName: string, category: string, filename: string, content: string }
 * 输出：{ success: true, path: string }
 */
import { NextResponse } from "next/server";
import { storage, dvPath } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectName?: string;
      category?: string;
      filename?: string;
      content?: string;
    };

    const { projectName, category, filename, content } = body;

    if (!projectName || !category || !filename || content === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: projectName, category, filename, content" },
        { status: 400 }
      );
    }

    // 安全处理：防止路径穿越
    const safeName = projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-\s]/g, "_").trim();
    const safeCategory = category.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-]/g, "_");
    const safeFilename = filename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-\.]/g, "_");

    const relativePath = dvPath(safeName, safeCategory, safeFilename);
    await storage.writeText(relativePath, content);

    return NextResponse.json({ success: true, path: relativePath });
  } catch (err) {
    console.error("[files/save] error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
