/**
 * GET /api/design-systems/list
 *
 * 扫描 design-systems/ 根目录，返回所有包含 DESIGN.md 的子目录名。
 * 响应：{ styles: string[] }（字母序）
 */
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const root = path.join(process.cwd(), "design-systems");
    const entries = await fs.readdir(root, { withFileTypes: true });

    const candidates = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    const validated: string[] = [];
    await Promise.all(
      candidates.map(async (name) => {
        try {
          const stat = await fs.stat(path.join(root, name, "DESIGN.md"));
          if (stat.isFile()) validated.push(name);
        } catch {
          // DESIGN.md 不存在则跳过
        }
      })
    );

    validated.sort((a, b) => a.localeCompare(b));

    return Response.json({ styles: validated });
  } catch (err) {
    console.error("[design-systems/list] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
