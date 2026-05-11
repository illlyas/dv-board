/**
 * Dashboard 编辑 API（str_replace 模式）
 *
 * LLM 只输出需要修改的片段（oldStr/newStr），后端在文件上执行替换。
 * 相比全量重写，输出 token 减少 90%+，响应速度从 2min 降到 5-15s。
 */
import { generateText } from "ai";
import { createDeepSeekModel } from "@/lib/board-stream-utils";
import { generateWidgetTypesDocs } from "@/lib/widget-metadata";
import { storage, dvPath } from "@/lib/storage";
import { isValidProjectKey } from "@/lib/projects/project-config";

export const maxDuration = 120;

interface StrReplaceOp {
  oldStr: string;
  newStr: string;
}

interface EditResponse {
  patches: StrReplaceOp[];
  description: string;
}

function applyPatches(code: string, patches: StrReplaceOp[]): { result: string; errors: string[] } {
  let result = code;
  const errors: string[] = [];

  for (const { oldStr, newStr } of patches) {
    if (!result.includes(oldStr)) {
      errors.push(`未找到匹配片段：${oldStr.slice(0, 60)}...`);
      continue;
    }
    // 只替换第一次出现（避免误替换）
    result = result.replace(oldStr, newStr);
  }

  return { result, errors };
}

function buildSystemPrompt(viSystemContent?: string): string {
  const widgetDocs = generateWidgetTypesDocs();

  let prompt = `你是一个数据看板代码编辑器，使用 str_replace 方式精确修改 JSX 仪表盘代码。

========================
【Widget 组件文档】
========================
${widgetDocs}

========================
【核心约束】
========================
1. **dataKey 绝对不能修改** —— 数据绑定字段，改了数据会断开
2. **可以修改 Widget 的 type** —— 如把 BarChart 改成 LineChart
3. **可以修改所有 props** —— 样式、配置、颜色、字体、间距等
4. **可以增删 Widget 组件** —— 根据用户需求添加或移除`;

  if (viSystemContent) {
    prompt += `

========================
【VI 规范】
========================
视觉修改必须遵循以下 VI 规范：

${viSystemContent}`;
  }

  prompt += `

========================
【输出格式（str_replace 模式）】
========================
只输出需要修改的片段，不要输出完整代码。

规则：
- oldStr：从原代码中复制需要修改的片段（必须能在原代码中唯一匹配）
- newStr：替换后的新内容
- 每个 patch 只改一处，多处修改用多个 patch
- oldStr 要包含足够的上下文（至少 2-3 行）确保唯一匹配
- 严格输出 JSON，不要有 markdown 代码块

示例：
{
  "patches": [
    {
      "oldStr": "    chart_trend: {\\n      type: \\"LineChart\\",",
      "newStr": "    chart_trend: {\\n      type: \\"BarChart\\","
    },
    {
      "oldStr": "        gradient: [\\"#3b82f6\\", \\"#8b5cf6\\"],",
      "newStr": "        gradient: [\\"#ef4444\\", \\"#f59e0b\\"],"
    }
  ],
  "description": "把折线图改成柱状图，调整渐变色为红橙色"
}`;

  return prompt;
}

interface SelectedElement {
  dataKey: string;
  type: string;
  codeSnippet: string;
}

/** body.filePath 可能形如 "页面/dashboard.jsx" 或 ".dv/xxx/页面/dashboard.jsx"，统一成后者 */
function resolveLogicalPath(projectName: string, filePath: string): string {
  const f = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (f.startsWith(".dv/")) return f;
  return dvPath(projectName, ...f.split("/"));
}

export async function POST(request: Request) {
  const body = await request.json() as {
    userMessage: string;
    projectName: string;
    filePath: string;
    selectedElements?: SelectedElement[];
  };

  if (!body.userMessage) return new Response("Missing userMessage", { status: 400 });
  if (!body.projectName || !body.filePath) return new Response("Missing projectName or filePath", { status: 400 });
  if (!isValidProjectKey(body.projectName)) return new Response("Invalid projectName", { status: 400 });

  const logicalPath = resolveLogicalPath(body.projectName, body.filePath);

  const currentCode = await storage.tryReadText(logicalPath);
  if (currentCode === null) {
    return new Response(`File not found: ${body.filePath}`, { status: 404 });
  }

  const viSystemContent =
    (await storage.tryReadText(dvPath(body.projectName, "品牌VI", "vi-system.md"))) ?? undefined;

  const systemPrompt = buildSystemPrompt(viSystemContent);

  const selectedCtx = body.selectedElements?.length
    ? `\n【用户选中的目标元素】\n${body.selectedElements.map(el =>
        `- dataKey: ${el.dataKey}（type: ${el.type}）\n  当前代码片段:\n${el.codeSnippet.split("\n").map(l => "    " + l).join("\n")}`
      ).join("\n")}\n\n请优先修改上述选中元素，不要改动其他元素。\n`
    : "";

  const userPrompt = `当前 Dashboard 代码：
\`\`\`jsx
${currentCode}
\`\`\`
${selectedCtx}
用户修改意图：${body.userMessage}

请输出 str_replace patches，只包含需要修改的片段。`;

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    { role: "user", content: userPrompt },
  ];

  try {
    const model = createDeepSeekModel();

    // 使用 generateText（非流式）：patches 很短，等待时间极短
    const { text } = await generateText({ model, system: systemPrompt, messages });

    // 解析 patches
    let editResponse: EditResponse;
    try {
      let cleaned = text.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/, "");
      }
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleaned = jsonMatch[0];
      editResponse = JSON.parse(cleaned) as EditResponse;
    } catch {
      return new Response(
        JSON.stringify({ error: "LLM 返回格式无效", raw: text.slice(0, 500) }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 应用 patches
    const { result: newCode, errors } = applyPatches(currentCode, editResponse.patches ?? []);

    // 写回文件
    await storage.writeText(logicalPath, newCode);

    return new Response(
      JSON.stringify({
        description: editResponse.description,
        patchCount: editResponse.patches?.length ?? 0,
        errors,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[board/edit-dashboard] error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
