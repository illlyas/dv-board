/**
 * POST /api/files/save
 *
 * 将 AI 生成的内容保存为 .md 文件到 .dv/{projectName}/{category}/ 目录
 *
 * 输入：{ projectName: string, category: string, filename: string, content: string }
 * 输出：{ success: true, path: string }
 */
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    // 构建目录路径：.dv/{projectName}/{category}/
    const dirPath = path.join(process.cwd(), ".dv", safeName, safeCategory);
    await mkdir(dirPath, { recursive: true });

    // 写入文件
    const filePath = path.join(dirPath, safeFilename);
    await writeFile(filePath, content, "utf-8");

    const relativePath = path.join(".dv", safeName, safeCategory, safeFilename);

    return NextResponse.json({ success: true, path: relativePath });
  } catch (err) {
    console.error("[files/save] error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
