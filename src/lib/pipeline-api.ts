/** 调用 pipeline 的某个步骤 API（流式返回纯文本 → 最终解析为 JSON） */
export async function callPipelineStep(
  url: string,
  body: Record<string, unknown>,
  onStreamText?: (text: string) => void,
): Promise<{ json: unknown; rawText: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API ${url} returned ${res.status}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No readable stream");

  const decoder = new TextDecoder();
  let raw = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    raw += decoder.decode(value, { stream: true });
    onStreamText?.(raw);
  }

  // 尝试从流式文本中解析 JSON（去除可能的 markdown 围栏）
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/, "");
  }
  const json = JSON.parse(cleaned);
  return { json, rawText: raw };
}
