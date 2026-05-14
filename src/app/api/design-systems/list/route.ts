/**
 * GET /api/design-systems/list
 *
 * 扫描 design-systems/ 根目录，返回所有包含 design.md 或 DESIGN.md 的子目录名。
 * 查询参数 `viMode=dark`：仅返回存在 vi-tokens.json 且顶层 mode 为 dark 的风格（风电固定模板用）。
 * 响应：{ styles: string[] }（字母序）
 */
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const viMode = new URL(request.url).searchParams.get("viMode")?.trim().toLowerCase();

    const root = path.join(process.cwd(), "design-systems");
    const entries = await fs.readdir(root, { withFileTypes: true });

    const candidates = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    const validated: string[] = [];
    await Promise.all(
      candidates.map(async (name) => {
        try {
          const a = path.join(root, name, "design.md");
          const b = path.join(root, name, "DESIGN.md");
          const ok =
            (await fs.stat(a).catch(() => null))?.isFile() ||
            (await fs.stat(b).catch(() => null))?.isFile();
          if (ok) validated.push(name);
        } catch {
          /* */
        }
      })
    );

    validated.sort((a, b) => a.localeCompare(b));

    if (viMode === "dark") {
      const darkOnly: string[] = [];
      await Promise.all(
        validated.map(async (name) => {
          try {
            const p = path.join(root, name, "vi-tokens.json");
            const raw = await fs.readFile(p, "utf-8");
            const j = JSON.parse(raw) as { mode?: string };
            if (j?.mode === "dark") darkOnly.push(name);
          } catch {
            /* */
          }
        })
      );
      darkOnly.sort((a, b) => a.localeCompare(b));
      return Response.json({ styles: darkOnly });
    }

    return Response.json({ styles: validated });
  } catch (err) {
    console.error("[design-systems/list] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
