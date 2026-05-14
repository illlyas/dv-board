/**
 * GET /api/design-systems/vi-system?style=apple
 *
 * 读取 design-systems/{style}/vi-system.json；若无则回退 vi-tokens.json（预置 Token，供管线跳过 design-vi）。
 */
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const STYLE_RE = /^[a-zA-Z0-9_-]+$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style")?.trim();

  if (!style || !STYLE_RE.test(style)) {
    return Response.json({ error: "Invalid style" }, { status: 400 });
  }

  try {
    const root = path.join(process.cwd(), "design-systems");
    const base = path.join(root, style);
    const resolvedBase = path.resolve(base);
    if (!resolvedBase.startsWith(path.resolve(root) + path.sep)) {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }

    const tryRead = async (name: string): Promise<string | null> => {
      const p = path.join(base, name);
      try {
        return await fs.readFile(path.resolve(p), "utf-8");
      } catch {
        return null;
      }
    };

    const raw = (await tryRead("vi-system.json")) ?? (await tryRead("vi-tokens.json"));
    if (!raw) {
      return Response.json({ error: "vi-system.json and vi-tokens.json not found" }, { status: 404 });
    }
    const parsed = JSON.parse(raw) as unknown;
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "preset vi json invalid or not found" }, { status: 404 });
  }
}
