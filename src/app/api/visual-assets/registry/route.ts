import { NextResponse } from "next/server";
import { VISUAL_ASSET_ROLE_REGISTRY } from "@/lib/visual-assets/registry-static";

/**
 * GET /api/visual-assets/registry
 * 返回所有已注册 role 及其实现元数据（供工作台配置 UI）
 */
export async function GET() {
  return NextResponse.json({ roles: VISUAL_ASSET_ROLE_REGISTRY });
}
