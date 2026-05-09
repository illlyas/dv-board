import type { VisualAssetItem, VisualAssetsBlock } from "@/lib/visual-assets/types";
import { isImplementationAllowed, isRoleRegistered } from "@/lib/visual-assets/registry-static";

export function validateVisualAssetsBlock(block: unknown): { ok: true; data: VisualAssetsBlock } | { ok: false; error: string } {
  if (!block || typeof block !== "object") {
    return { ok: false, error: "visualAssets must be an object" };
  }
  const b = block as VisualAssetsBlock;
  if (b.version !== 1) {
    return { ok: false, error: "visualAssets.version unsupported" };
  }
  if (!Array.isArray(b.items)) {
    return { ok: false, error: "visualAssets.items must be an array" };
  }
  const keys = new Set<string>();
  for (const item of b.items) {
    const err = validateVisualAssetItem(item);
    if (err) return { ok: false, error: err };
    if (keys.has(item.itemKey)) {
      return { ok: false, error: `duplicate itemKey: ${item.itemKey}` };
    }
    keys.add(item.itemKey);
  }
  return { ok: true, data: b };
}

function validateVisualAssetItem(item: unknown): string | null {
  if (!item || typeof item !== "object") return "invalid item";
  const o = item as VisualAssetItem;
  if (typeof o.itemKey !== "string" || !o.itemKey.trim()) return "item.itemKey required";
  if (typeof o.role !== "string" || !isRoleRegistered(o.role)) return `unknown role: ${o.role}`;
  if (typeof o.implementationId !== "string" || !isImplementationAllowed(o.role, o.implementationId)) {
    return `implementationId not allowed for role ${o.role}: ${o.implementationId}`;
  }
  if (typeof o.enabled !== "boolean") return "item.enabled must be boolean";
  return null;
}
