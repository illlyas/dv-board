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
    description: "加载品牌 VI 系统，定义看板的视觉风格和设计规范",
    outputFiles: ["品牌VI/vi-system.md"],
  },
  {
    name: "generate-jsx",
    description: "根据页面结构生成线框 JSX 代码",
    outputFiles: ["页面/wireframe.jsx"],
  },
  {
    name: "apply-vi",
    description: "将 VI 系统应用到线框代码，生成最终品牌化看板代码",
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
