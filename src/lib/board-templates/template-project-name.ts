/** 模板预览在 DashboardPreviewContext / store 缓存里使用的虚拟 projectName 前缀 */

export const BOARD_TEMPLATE_PROJECT_PREFIX = "__dv_template:" as const;

export function encodeBoardTemplateProjectName(templateId: string): string {
  return `${BOARD_TEMPLATE_PROJECT_PREFIX}${templateId}`;
}

export function parseBoardTemplateIdFromProjectName(
  projectName: string
): string | null {
  if (!projectName.startsWith(BOARD_TEMPLATE_PROJECT_PREFIX)) return null;
  const id = projectName.slice(BOARD_TEMPLATE_PROJECT_PREFIX.length).trim();
  return id || null;
}

export function isBoardTemplatePreviewProject(projectName: string): boolean {
  return parseBoardTemplateIdFromProjectName(projectName) !== null;
}

/** 目录名 / URL 段：小写字母、数字、连字符 */
export function assertSafeBoardTemplateId(id: string): string {
  const t = id.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t) || t.length > 64) {
    throw new Error("非法模板 ID");
  }
  return t;
}
