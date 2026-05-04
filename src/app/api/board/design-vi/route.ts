/**
 * Step 1: VI 系统设计
 *
 * POST /api/board/design-vi
 *
 * 输入：{ brief: string }
 * 输出：VISystem（完整的视觉标识系统 Token）
 */
import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";
import { viSystemSchemaPrompt } from "@/lib/board/vi-system";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = (await request.json()) as { brief?: string };
  const brief = body?.brief?.trim();
  if (!brief) return new Response("Missing brief", { status: 400 });

  try {
    const model = createDeepSeekModel();

    const result = streamText({
      model,
      system: `你是一位资深的数据大屏视觉系统设计师，专精于 shadcn/ui 风格的 Design Token 体系。
你的任务是根据用户需求，为数据可视化大屏设计一套完整、统一、可执行的 VI（Visual Identity）系统。

你的输出不是"给某个组件配色"，而是定义全局 token 系统——就像 shadcn/ui 用 CSS 变量定义 --background、--primary 那样。
后续步骤会严格使用你输出的每一个值来渲染最终看板。

关键原则：
1. **颜色体系必须完整**——背景层、前景层、卡片层、语义状态色、图表色板、渐变，缺一不可
2. **排版要考虑数据大屏特点**——标题字体需要视觉冲击力（可建议 Orbitron/Rajdhani/DIN），数字用等宽/数字专用字体，中文用思源黑/PingFang
3. **间距基于 4px 网格**——这是 UI 设计的工业标准
4. **动效克制**——大屏不是动画展示台，动效用于页面切换和数值变化即可
5. **组件风格指南是给下一步参考的速查表**——每个组件类型给出推荐的 bg/border/color/shadow
6. **暗色主题优先**——数据大屏绝大多数是深色背景；如果用户明确要求亮色才用 light-clean

主题方向参考：
- dark-tech：深海军蓝(#0a0e1a)底 + 蓝色系强调 + 科技感发光 + 冷色图表
- dark-business：深炭灰(#111827)底 + 商务蓝 + 克制稳重 + 无多余装饰
- light-clean：浅白/淡灰底 + 深色文字 + 清爽专业 + 适合汇报场景
- dark-executive：近黑(#030712)底 + 琥珀/金色高亮 + 正式庄重 + 适合高管汇报
- dark-data：深蓝绿底 + 高对比度 + 高信息密度 + 适合运维监控

输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾
- 不要使用 markdown 代码块、代码围栏，JSON 外不要有任何解释文字
- 输出尽量精确到具体 CSS 值（如 "#0a0e1a"、"16px"、"cubic-bezier(0.4,0,0.2,1)"）
- chartPalette 必须包含 8-12 色，覆盖足够多的系列
- 所有渐变值必须是合法的 CSS gradient 函数

输出 JSON Schema：
${viSystemSchemaPrompt}`,
      prompt: `根据以下用户需求，设计一套完整的 VI 视觉标识系统：

用户需求：${brief}

请分析该需求的行业属性、目标受众、使用场景，然后输出完整的 VI Token 系统。`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/design-vi] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
