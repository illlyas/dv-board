import { z } from "zod";
import {
  groupNodeSchema,
  layoutStyleBaseSchema,
  makePageSchema,
  makeVisdocSchema,
  makeWidgetSchemas,
  colorSchema,
} from "./dashboard-common";
import { visualSystemSchema } from "./visual-system";

// ─── 完整版 layoutStyle（含视觉样式）───────────────────────

export const layoutStyleSchema = layoutStyleBaseSchema.extend({
  // ── Visual style (AI-driven, all optional) ──
  borderRadius: z.number().optional(),
  borderWidth: z.number().optional(),
  borderColor: colorSchema.optional(),
  borderStyle: z.enum(["solid", "dashed", "dotted"]).optional(),
  backgroundColor: colorSchema.optional(),
  boxShadow: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

// ─── Widget 节点 & 文档 schema ─────────────────────────────

export const widgetNodeSchema = makeWidgetSchemas(layoutStyleSchema);

export const dashboardNodeSchema = z.union([groupNodeSchema, widgetNodeSchema]);

// ─── Page / Visdoc ─────────────────────────────────────────

const pageSchema = makePageSchema({});

export const visdocSchema = makeVisdocSchema(dashboardNodeSchema, pageSchema, {
  visualSystem: visualSystemSchema.optional(),
});

// ─── 类型导出 ──────────────────────────────────────────────

export type GroupNode = z.infer<typeof groupNodeSchema>;
export type WidgetNode = z.infer<typeof widgetNodeSchema>;
export type PageModel = z.infer<typeof pageSchema>;
export type VisdocModel = z.infer<typeof visdocSchema>;

export const LOCAL_STORAGE_KEY = "dv-board.visdoc";
