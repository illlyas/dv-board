/**
 * Markdown str_replace 微调：各业务 agent 路由共用的解析与落盘辅助。
 */
import { readFile, writeFile } from "fs/promises";
import path from "path";

export interface StrReplaceOp {
  oldStr: string;
  newStr: string;
}

export interface StrReplaceEditResponse {
  patches: StrReplaceOp[];
  description: string;
}

export function safeDvProjectRoot(projectName: string): string {
  const base = path.resolve(process.cwd(), ".dv");
  const resolved = path.resolve(base, projectName);
  if (!resolved.startsWith(base + path.sep)) {
    throw new Error("Invalid projectName");
  }
  return resolved;
}

export function applyStrReplacePatches(doc: string, patches: StrReplaceOp[]): { result: string; errors: string[] } {
  let result = doc;
  const errors: string[] = [];
  for (const { oldStr, newStr } of patches) {
    if (!oldStr) continue;
    const parts = result.split(oldStr);
    const count = parts.length - 1;
    if (count === 0) {
      errors.push(`未找到匹配片段：${oldStr.slice(0, 80)}…`);
      continue;
    }
    if (count > 1) {
      errors.push(`匹配不唯一（${count} 处）：${oldStr.slice(0, 80)}…`);
      continue;
    }
    result = parts.join(newStr);
  }
  return { result, errors };
}

export function parseStrReplaceEditJson(text: string): StrReplaceEditResponse {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/, "");
  }
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) cleaned = m[0];
  return JSON.parse(cleaned) as StrReplaceEditResponse;
}

export async function readMarkdownUnderProject(root: string, segments: string[]): Promise<string> {
  const abs = path.join(root, ...segments);
  const raw = await readFile(abs, "utf-8");
  return raw.replace(/\r\n/g, "\n");
}

export async function writeMarkdownUnderProject(root: string, segments: string[], content: string): Promise<void> {
  const abs = path.join(root, ...segments);
  await writeFile(abs, content, "utf-8");
}
