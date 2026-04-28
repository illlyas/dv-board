import { z } from "zod";

import {
  colorSchema,
  groupNodeSchema,
  layoutStyleBaseSchema,
  makePageSchema,
  makeVisdocSchema,
  makeWidgetSchemas,
} from "./dashboard-common";

const structureLayoutStyleSchema = layoutStyleBaseSchema;

export const structureWidgetSchema = makeWidgetSchemas(structureLayoutStyleSchema);

export const structureNodeSchema = z.union([groupNodeSchema, structureWidgetSchema]);

export const structurePageSchema = makePageSchema({
  backgroundColor: colorSchema.optional(),
});

export const boardStructureSchema = makeVisdocSchema(structureNodeSchema, structurePageSchema, {});
export const boardStructureJsonSchema = z.toJSONSchema(boardStructureSchema);
export const boardStructureSchemaPrompt = JSON.stringify(boardStructureJsonSchema, null, 2);

export type BoardStructure = z.infer<typeof boardStructureSchema>;
