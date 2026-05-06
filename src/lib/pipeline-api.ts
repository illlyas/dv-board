/**
 * 修复 JSON 字符串中的中文引号问题
 *
 * AI 有时会在 JSON 字符串值内使用中文引号（如 "补充"其它"的描述"），
 * 直接全局替换为英文双引号会破坏 JSON 结构。
 * 策略：逐字符扫描，在 JSON 字符串值内部将中文引号替换为单引号。
 */
function fixChineseQuotesInJSON(text: string): string {
  let result = "";
  let inString = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (!inString) {
      if (ch === '"') {
        inString = true;
        result += ch;
      } else if (ch === "“" || ch === "”") {
        // 结构位置的中文引号 → 英文双引号
        result += '"';
      } else {
        result += ch;
      }
    } else {
      // 在字符串内部
      if (ch === '\\') {
        // 转义序列，原样保留两个字符
        result += ch;
        i++;
        if (i < text.length) result += text[i];
      } else if (ch === '"') {
        // 字符串结束
        inString = false;
        result += ch;
      } else if (ch === "“" || ch === "”") {
        // 字符串内容中的中文双引号 → 单引号（避免破坏 JSON）
        result += "'";
      } else if (ch === "‘" || ch === "’") {
        // 字符串内容中的中文单引号 → 英文单引号
        result += "'";
      } else {
        result += ch;
      }
    }
    i++;
  }

  return result;
}

/** 调用 pipeline 的某个步骤 API（流式返回纯文本 → 最终解析为 JSON） */
export async function callPipelineStep(
  url: string,
  body: Record<string, unknown>,
  onStreamText?: (text: string) => void,
  signal?: AbortSignal,
): Promise<{ json: unknown; rawText: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
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
  
  // 移除 markdown 代码块标记
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/, "");
  }
  
  // 尝试提取 JSON 对象（如果文本中包含其他内容）
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  // 清理常见的 JSON 格式问题
  cleaned = cleaned
    .replace(/,(\s*[}\]])/g, '$1')  // 移除尾随逗号
    .replace(/…/g, '...')            // 将省略号替换为三个点
    .replace(/—/g, '-')              // 将中文破折号替换为连字符
    .trim();

  // 处理中文引号问题：
  // AI 有时会在 JSON 字符串值内使用中文引号（如 "补充"其它"的描述"），
  // 直接替换为英文双引号会破坏 JSON 结构。
  // 策略：用正则逐个处理字符串值内的中文引号，将其替换为转义的英文双引号。
  cleaned = fixChineseQuotesInJSON(cleaned);
  
  try {
    const json = JSON.parse(cleaned);
    return { json, rawText: raw };
  } catch (error) {
    console.error('[pipeline-api] JSON parse error:', error);
    console.error('[pipeline-api] Raw text (full):', raw);
    console.error('[pipeline-api] Cleaned text (full):', cleaned);
    
    // 尝试找到错误位置附近的内容
    if (error instanceof SyntaxError) {
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        const start = Math.max(0, pos - 100);
        const end = Math.min(cleaned.length, pos + 100);
        console.error('[pipeline-api] Context around error position:', cleaned.substring(start, end));
        console.error('[pipeline-api] Error at character:', cleaned[pos], '(code:', cleaned.charCodeAt(pos), ')');
      }
    }
    
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}\n\nRaw response:\n${raw.substring(0, 1000)}...`);
  }
}
