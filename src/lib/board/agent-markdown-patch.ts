/**
 * Markdown str_replace 微调：各业务 agent 路由共用的解析与落盘辅助。
 * 所有路径走 `@/lib/storage` 统一存储层，`projectName` 即项目目录名。
 */
import { storage, dvPath } from "@/lib/storage";
import { isValidProjectKey } from "@/lib/projects/project-config";

export interface StrReplaceOp {
  oldStr: string;
  newStr: string;
}

export interface StrReplaceEditResponse {
  patches: StrReplaceOp[];
  description: string;
}

/**
 * 兼容旧接口：返回一个"项目 key"字符串，历史代码把它当路径传入 readMarkdownUnderProject。
 * 存储层不再用绝对路径，所以这里只做校验并原样返回。
 */
export function safeDvProjectRoot(projectName: string): string {
  if (!isValidProjectKey(projectName)) {
    throw new Error("Invalid projectName");
  }
  return projectName;
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

export async function readMarkdownUnderProject(projectKey: string, segments: string[]): Promise<string> {
  const raw = await storage.readText(dvPath(projectKey, ...segments));
  return raw.replace(/\r\n/g, "\n");
}

export async function writeMarkdownUnderProject(projectKey: string, segments: string[], content: string): Promise<void> {
  await storage.writeText(dvPath(projectKey, ...segments), content);
}
