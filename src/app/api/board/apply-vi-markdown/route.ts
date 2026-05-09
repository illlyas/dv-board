/**
 * POST /api/board/apply-vi-markdown
 * Body: { projectName: string; markdown: string }
 */
import { applyViMarkdownToProject } from "@/lib/board/apply-vi-markdown";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    projectName?: string;
    markdown?: string;
  };
  const projectName = body.projectName?.trim();
  const markdown = typeof body.markdown === "string" ? body.markdown : "";
  if (!projectName || !markdown.trim()) {
    return Response.json({ error: "Missing projectName or markdown" }, { status: 400 });
  }
  try {
    await applyViMarkdownToProject(projectName, markdown);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[apply-vi-markdown]", err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
