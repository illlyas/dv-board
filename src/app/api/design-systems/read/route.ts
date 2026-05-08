/**
 * GET /api/design-systems/read?style=apple
 *
 * 读取 design-systems/{style}/DESIGN.md 原文。
 * 路径白名单：style 只能是 design-systems 下真实存在的目录名，禁止 ..、/ 等。
 */
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const STYLE_RE = /^[a-zA-Z0-9_-]+$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style")?.trim();

  if (!style || !STYLE_RE.test(style)) {
    return new Response(JSON.stringify({ error: "Invalid style" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const root = path.join(process.cwd(), "design-systems");
    const target = path.join(root, style, "DESIGN.md");

    // 防御性校验：解析后仍在 root 下
    const resolved = path.resolve(target);
    if (!resolved.startsWith(path.resolve(root) + path.sep)) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const content = await fs.readFile(resolved, "utf-8");
    return new Response(content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[design-systems/read] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
}
