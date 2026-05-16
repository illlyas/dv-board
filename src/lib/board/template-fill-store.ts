import type {
  DashboardStoreComponentRecord,
  DashboardStoreFile,
  DashboardStorePayload,
} from "@/types/dashboard-store.types";
import type { TemplateFill, TemplateSlotFill } from "@/lib/board/template-fill-schema";
import { normalizeStorePayload } from "@/lib/board/store-payload-normalize";

const PAYLOAD_KINDS = ["seriesRows", "tableRows", "kpiValue", "selectOptions"] as const;

function isPayloadKind(k: string): k is DashboardStorePayload["kind"] {
  return (PAYLOAD_KINDS as readonly string[]).includes(k);
}

/** 将 template-fill 单槽字段归一为 store.payload */
export function resolveSlotFillPayload(fill: TemplateSlotFill): DashboardStorePayload | null {
  if (fill.payload) {
    const k = fill.payload.kind;
    if (!isPayloadKind(k)) return null;
    return { kind: k, value: fill.payload.value };
  }
  if (fill.tableRows != null && Array.isArray(fill.tableRows)) {
    return { kind: "tableRows", value: fill.tableRows };
  }
  if (fill.seedSeriesRows != null && Array.isArray(fill.seedSeriesRows)) {
    return { kind: "seriesRows", value: fill.seedSeriesRows };
  }
  if (fill.kpiGlowItems != null && Array.isArray(fill.kpiGlowItems)) {
    return { kind: "kpiValue", value: { items: fill.kpiGlowItems } };
  }
  if (fill.configValue != null && typeof fill.configValue === "object") {
    return { kind: "kpiValue", value: fill.configValue };
  }
  if (fill.provinceData != null && typeof fill.provinceData === "object") {
    return { kind: "kpiValue", value: fill.provinceData };
  }
  return null;
}

/** 槽位是否在 template-fill 中提供了可落盘的业务 payload */
export function slotFillHasStorePayload(fill: TemplateSlotFill | undefined): boolean {
  if (!fill) return false;
  return resolveSlotFillPayload(fill) != null;
}

/**
 * 补全模板 store 中缺失的槽位骨架（预览 mock 可能只写入 Widget 槽位，导致 Config/地图槽位丢失）。
 */
export function ensureStoreHasTemplateSkeleton(
  templateStore: DashboardStoreFile,
  store: DashboardStoreFile
): DashboardStoreFile {
  const next: DashboardStoreFile = structuredClone(store);

  for (const templatePage of templateStore.pages) {
    let page = next.pages.find((p) => p.pageIndex === templatePage.pageIndex);
    if (!page) {
      page = { pageIndex: templatePage.pageIndex, components: [] };
      next.pages.push(page);
    }
    const existing = new Set(page.components.map((c) => c.slotId));
    for (const comp of templatePage.components) {
      if (existing.has(comp.slotId)) continue;
      const shell: DashboardStoreComponentRecord = structuredClone(comp);
      delete shell.payload;
      delete shell.filledAt;
      delete shell.source;
      page.components.push(shell);
      existing.add(comp.slotId);
    }
  }

  next.pages.sort((a, b) => a.pageIndex - b.pageIndex);
  return next;
}

/**
 * 将 template-fill 中的业务数据写入模板 store 骨架：
 * - 有 AI payload 的槽位：写入并标记 source=agent
 * - 无 AI payload 的槽位：删除 payload（不保留模板示例数据，预览时可 mock-slot）
 */
export function applyTemplateFillToStore(
  store: DashboardStoreFile,
  fill: TemplateFill
): DashboardStoreFile {
  const next: DashboardStoreFile = structuredClone(store);
  const now = new Date().toISOString();
  next.updatedAt = now;

  for (const page of next.pages) {
    for (const comp of page.components) {
      const slotFill = fill.slots[comp.slotId];
      let payload = slotFill ? resolveSlotFillPayload(slotFill) : null;
      if (payload) {
        payload = normalizeStorePayload(
          payload,
          comp.widgetType,
          comp.propsSnapshot ?? {},
          comp.slotId
        );
        comp.payload = payload;
        comp.filledAt = now;
        comp.source = "agent";
      } else {
        delete comp.payload;
      }
    }
  }

  return next;
}
