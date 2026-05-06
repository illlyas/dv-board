/**
 * Step 3: VI 系统（固定返回 Apple 设计系统）
 *
 * POST /api/board/design-vi
 *
 * 输入：任意（忽略）
 * 输出：design-systems/apple/DESIGN.md 的文件内容（纯文本）
 */
import { promises as fs } from "fs";
import path from "path";

export const maxDuration = 30;

export async function POST() {
  try {
    const filePath = path.join(process.cwd(), "design-systems", "apple", "DESIGN.md");
    const content = await fs.readFile(filePath, "utf-8");

    return new Response(content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[board/design-vi] error reading DESIGN.md:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
