/**
 * GET /api/files/list?projectName=xxx
 *
 * 读取 .dv/{projectName}/ 下的所有文件，按分类返回
 *
 * 输出：{
 *   categories: {
 *     [category: string]: Array<{ name: string, path: string, updatedAt: string }>
 *   }
 * }
 */
import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get("projectName");

    if (!projectName) {
      return NextResponse.json({ error: "Missing projectName" }, { status: 400 });
    }

    const safeName = projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-\s]/g, "_").trim();
    const projectDir = path.join(process.cwd(), ".dv", safeName);

    // 定义固定的分类顺序
    const CATEGORIES = ["数据故事", "品牌VI", "页面结构", "页面"];

    const result: Record<string, Array<{ name: string; path: string; updatedAt: string }>> = {};

    // 初始化所有分类为空数组
    for (const cat of CATEGORIES) {
      result[cat] = [];
    }

    // 尝试读取项目目录
    try {
      const categories = await readdir(projectDir);

      for (const cat of categories) {
        const catPath = path.join(projectDir, cat);
        const catStat = await stat(catPath);
        if (!catStat.isDirectory()) continue;

        const files = await readdir(catPath);
        const fileInfos = await Promise.all(
          files
            .filter((f) => f.endsWith(".md") || f.endsWith(".jsx"))
            .map(async (f) => {
              const filePath = path.join(catPath, f);
              const fileStat = await stat(filePath);
              return {
                name: f,
                path: path.join(".dv", safeName, cat, f).replace(/\\/g, "/"),
                updatedAt: fileStat.mtime.toISOString(),
              };
            })
        );

        // 如果是已知分类，放入对应位置；否则也保留
        if (CATEGORIES.includes(cat)) {
          result[cat] = fileInfos;
        } else {
          result[cat] = fileInfos;
        }
      }
    } catch {
      // 目录不存在时返回空分类
    }

    return NextResponse.json({ categories: result });
  } catch (err) {
    console.error("[files/list] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
