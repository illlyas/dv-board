/**
 * 视觉素材注册表（纯数据，供服务端校验与 GET /api/visual-assets/registry）
 * 新增 role 时在此追加条目。
 */
import {
  IMPLEMENTATION_CHART_LABEL_DEFAULT,
  IMPLEMENTATION_FOOTER_DEFAULT,
  IMPLEMENTATION_HERO_DEFAULT,
  IMPLEMENTATION_PAGE_DEFAULT,
  VISUAL_ROLE_CHART_TITLE,
  VISUAL_ROLE_FOOTER_NAV,
  VISUAL_ROLE_HERO_HEADER,
  VISUAL_ROLE_PAGE_BACKGROUND,
} from "@/lib/visual-assets/types";

export type VisualAssetRoleDefinition = {
  displayGroup: string;
  defaultImplementationId: string;
  allowedImplementationIds: readonly string[];
  /** 各 implementation 的展示文案 */
  implementations: Record<
    string,
    {
      title: string;
      description: string;
    }
  >;
};

export const VISUAL_ASSET_ROLE_REGISTRY: Record<string, VisualAssetRoleDefinition> = {
  [VISUAL_ROLE_HERO_HEADER]: {
    displayGroup: "标题区",
    defaultImplementationId: IMPLEMENTATION_HERO_DEFAULT,
    allowedImplementationIds: [IMPLEMENTATION_HERO_DEFAULT],
    implementations: {
      [IMPLEMENTATION_HERO_DEFAULT]: {
        title: "主标题区默认矢量底",
        description: "顶栏 96px 内全宽矢量背景，与 token-demo / generate-jsx 约定一致。",
      },
    },
  },
  [VISUAL_ROLE_CHART_TITLE]: {
    displayGroup: "图表区",
    defaultImplementationId: IMPLEMENTATION_CHART_LABEL_DEFAULT,
    allowedImplementationIds: [IMPLEMENTATION_CHART_LABEL_DEFAULT],
    implementations: {
      [IMPLEMENTATION_CHART_LABEL_DEFAULT]: {
        title: "图表标题条底纹",
        description: "Line/Bar/Pie 等组件标题区 ChartLabelBackdrop；与 props.titleBackdrop 组合，运行时由配置决定是否绘制。",
      },
    },
  },
  [VISUAL_ROLE_FOOTER_NAV]: {
    displayGroup: "底栏区",
    defaultImplementationId: IMPLEMENTATION_FOOTER_DEFAULT,
    allowedImplementationIds: [IMPLEMENTATION_FOOTER_DEFAULT],
    implementations: {
      [IMPLEMENTATION_FOOTER_DEFAULT]: {
        title: "分页条默认矢量底",
        description: "画布底部 footer（约 56px 高）内全宽底纹，与 token-demo / generate-jsx 约定一致。",
      },
    },
  },
  [VISUAL_ROLE_PAGE_BACKGROUND]: {
    displayGroup: "整页画布",
    defaultImplementationId: IMPLEMENTATION_PAGE_DEFAULT,
    allowedImplementationIds: [IMPLEMENTATION_PAGE_DEFAULT],
    implementations: {
      [IMPLEMENTATION_PAGE_DEFAULT]: {
        title: "页面默认纹理底",
        description: "1920×1080 画布内全幅弱对比底纹（叠在 var(--color-bg) 之上），与 token-demo / generate-jsx 约定一致。",
      },
    },
  },
};

export function listRegisteredRoles(): string[] {
  return Object.keys(VISUAL_ASSET_ROLE_REGISTRY);
}

export function isRoleRegistered(role: string): boolean {
  return role in VISUAL_ASSET_ROLE_REGISTRY;
}

export function isImplementationAllowed(role: string, implementationId: string): boolean {
  const def = VISUAL_ASSET_ROLE_REGISTRY[role];
  if (!def) return false;
  return def.allowedImplementationIds.includes(implementationId);
}
