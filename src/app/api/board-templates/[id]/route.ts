import { NextResponse } from "next/server";
import { loadBoardTemplateBundle } from "@/lib/board-templates/server-read";
import { assertSafeBoardTemplateId } from "@/lib/board-templates/template-project-name";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await ctx.params;
  let id: string;
  try {
    id = assertSafeBoardTemplateId(rawId);
  } catch {
    return NextResponse.json({ error: "非法模板 ID" }, { status: 400 });
  }
  const bundle = await loadBoardTemplateBundle(process.cwd(), id);
  if (!bundle) {
    return NextResponse.json({ error: "模板不存在或未就绪" }, { status: 404 });
  }
  return NextResponse.json(bundle);
}
