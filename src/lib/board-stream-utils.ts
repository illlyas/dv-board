/**
 * 共享工具：创建 DeepSeek 模型实例 + 流式文本响应包装
 * 所有 3 个 board pipeline 路由共用
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";

const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";
const DEFAULT_MODEL = "deepseek-v4-flash";

export function createDeepSeekModel() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("Missing DEEPSEEK_API_KEY");
  const baseURL = process.env.DEEPSEEK_BASE_URL ?? DEFAULT_BASE_URL;
  const modelName = process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;
  return createOpenAICompatible({ name: "deepseek", apiKey, baseURL })(modelName);
}

/**
 * 将 streamText 的输出包装为纯文本流 Response
 * 前端 useObject 通过 TextDecoderStream + parsePartialJson 消费
 */
export function toTextStreamResponse(result: ReturnType<typeof streamText>) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = result.textStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(encoder.encode(value));
        }
        controller.close();
      } catch (err) {
        console.error("[board-pipeline] textStream read error:", err);
        controller.error(err);
      }
    },
  });
  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
