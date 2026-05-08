export interface SkillDefinition {
  name: string;
  description: string;
  outputFiles: string[];
}

export const SKILL_REGISTRY: SkillDefinition[] = [
  {
    name: "analyze-brief",
    description: "分析用户的看板需求是否充足，如信息不足则通过表单追问用户",
    outputFiles: [],
  },
  {
    name: "design-story",
    description: "根据用户需求生成数据故事文档，描述看板的业务背景和数据叙事",
    outputFiles: ["数据故事/design-story.md"],
  },
  {
    name: "design-pages",
    description: "根据数据故事设计看板的页面结构和组件布局",
    outputFiles: ["页面结构/pages-story.md"],
  },
  {
    name: "design-vi",
    description: "根据用户选择的风格读取 DESIGN.md 并产出 CSS Tokens JSON，用于驱动看板的视觉效果",
    outputFiles: ["品牌VI/vi-system.md", "品牌VI/vi-tokens.json"],
  },
  {
    name: "generate-jsx",
    description: "根据页面结构和 vi-tokens.json 生成带品牌视觉的看板 JSX 代码（所有样式使用 var(--xxx) CSS 变量）",
    outputFiles: ["页面/dashboard.jsx"],
  },
];

export function getSkill(name: string): SkillDefinition | undefined {
  return SKILL_REGISTRY.find((s) => s.name === name);
}

export const SKILL_REGISTRY_PROMPT: string = SKILL_REGISTRY.map((s) => {
  const files =
    s.outputFiles.length > 0 ? `输出文件：${s.outputFiles.join(", ")}` : "无文件产出";
  return `- ${s.name}：${s.description}（${files}）`;
}).join("\n");
