/**
 * GET /api/files/list?projectName=xxx
 *
 * 读取 .dv/{projectName}/ 下的所有文件，按分类返回（通过存储层）
 *
 * 输出：{
 *   categories: {
 *     [category: string]: Array<{ name: string, path: string, updatedAt: string }>
 *   }
 * }
 */
import { NextResponse } from "next/server";
import { storage, dvPath } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get("projectName");

    if (!projectName) {
      return NextResponse.json({ error: "Missing projectName" }, { status: 400 });
    }

    const safeName = projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-\s]/g, "_").trim();
    const projectPrefix = dvPath(safeName);

    // 定义固定的分类顺序
    const CATEGORIES = ["数据故事", "品牌VI", "页面结构", "页面"];

    const result: Record<string, Array<{ name: string; path: string; updatedAt: string }>> = {};
    for (const cat of CATEGORIES) {
      result[cat] = [];
    }

    const { dirs } = await storage.listChildren(projectPrefix);
    const catsSet = new Set<string>([...CATEGORIES, ...dirs]);

    for (const cat of catsSet) {
      const { files } = await storage.listChildren(dvPath(safeName, cat));
      result[cat] = files
        .filter((f) => f.name.endsWith(".md") || f.name.endsWith(".jsx"))
        .map((f) => ({
          name: f.name,
          path: f.path,
          updatedAt: f.updatedAt,
        }));
    }

    return NextResponse.json({ categories: result });
  } catch (err) {
    console.error("[files/list] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
