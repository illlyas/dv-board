import { NextResponse } from "next/server";
import {
  listBoardTemplateIds,
  readBoardTemplateMeta,
} from "@/lib/board-templates/server-read";

export async function GET() {
  const cwd = process.cwd();
  const ids = await listBoardTemplateIds(cwd);
  const templates = [];
  for (const id of ids) {
    const meta = await readBoardTemplateMeta(cwd, id);
    if (meta) templates.push(meta);
  }
  return NextResponse.json({ templates });
}
