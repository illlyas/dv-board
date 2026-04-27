import { streamText } from "ai";
import { createDeepSeekModel, toTextStreamResponse } from "@/lib/board-stream-utils";

export const maxDuration = 120;

/**
 * 节点 3：视觉设计
 * 输入：brief + analysis + skeleton（节点2的结构骨架）
 * 输出：VisdocModel（完整看板，layoutStyle 含所有视觉属性）
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { brief?: string; analysis?: unknown; skeleton?: unknown };
  const brief = body?.brief?.trim();
  if (!brief) return new Response("Missing brief", { status: 400 });

  try {
    const model = createDeepSeekModel();
    const analysisText = typeof body.analysis === "object" ? JSON.stringify(body.analysis, null, 2) : String(body.analysis ?? "");
    const skeletonText = typeof body.skeleton === "object" ? JSON.stringify(body.skeleton, null, 2) : String(body.skeleton ?? "");

    const result = streamText({
      model,
      system: `你是一位资深的数据可视化看板视觉设计专家。
你的职责是接收页面结构骨架，为其应用完整的视觉设计系统。

关键输出规则：
- 仅输出合法 JSON，以 "{" 开头，以 "}" 结尾。
- 不要使用 markdown 代码块、代码围栏，JSON 外不要有任何解释文字。
- 保持输入骨架中的所有结构数据完全不变（位置、尺寸、组件类型、配置）。
- 仅在每个组件的 layoutStyle 中添加视觉样式属性。

需要添加的视觉属性（均为可选，按需应用）：
{
  "borderRadius": 数字,       // 如 8 表示微圆角，16 表示卡片风格，0 表示直角
  "borderWidth": 数字,        // 如 1 表示细边框，0 表示无边框
  "borderColor": "#hex",      // 如 "rgba(255,255,255,0.08)" 适用于暗色主题
  "borderStyle": "solid|dashed|dotted",
  "backgroundColor": "#hex",  // 单个组件背景色（如 "rgba(255,255,255,0.04)"）
  "boxShadow": "CSS box-shadow 字符串",  // 如 "0 4px 24px rgba(0,0,0,0.3)"
  "opacity": 0-1             // 很少需要
}

主题设计指南：
- dark-tech：深海军蓝背景（#0a1628），青色/橙色强调色，发光边框，毛玻璃面板
- dark-business：深炭灰背景（#0f172a），蓝色/靛蓝强调色，简洁线条，极少装饰
- light-clean：白色/浅灰背景，柔和阴影，专业蓝色/灰色调
- dark-executive：近纯黑背景（#030712），金色/琥珀色高亮，正式结构化布局
- dark-data：深蓝绿色背景（#081121），鲜艳数据色彩，高对比度提升可读性

设计规则：
1. 同一页面所有组件应用一致的视觉语言
2. 图表通常不需要背景或仅需极淡背景——让图表色彩说话
3. 文本组件（特别是标题）通常不设背景/边框
4. 下拉筛选组件常加细边框 + 略有区别的背景色
5. 像素进度组件可搭配淡背景容器
6. 看板整体 backgroundColor 应匹配推荐主题
7. 每个页面可有自己的 backgroundColor（主题内略有色差）
8. 圆角值应统一：整个看板最多使用 2-4 个不同值（如图表 0，筛选面板 12）
9. 不得修改骨架中的任何 position/size/widgetType/config 数据`,
      prompt: `为以下看板骨架应用完整的视觉设计系统。

用户需求：${brief}

分析报告：
${analysisText}

页面结构骨架（精确保持所有结构数据不变，仅添加视觉属性）：
${skeletonText}`,
    });

    return toTextStreamResponse(result);
  } catch (err) {
    console.error("[board/visualize] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
