import { z } from "zod";

export const visualSystemSchema = z.object({
  themeProfile: z.object({
    theme: z.enum(["dark-tech", "dark-business", "light-clean", "dark-executive", "dark-data"]),
    tone: z.enum(["executive", "operational", "analytical", "command"]),
    density: z.enum(["compact", "balanced", "spacious"]),
    contrast: z.enum(["medium", "high"]),
    surfaceStyle: z.enum(["subtle-panels", "solid-panels", "transparent-charts"]),
  }),
  tokens: z.object({
    pageBg: z.string(),
    pageBgAlt: z.string(),
    panelBg: z.string(),
    panelBorder: z.string(),
    textPrimary: z.string(),
    textSecondary: z.string(),
    accent: z.string(),
    accentSoft: z.string(),
    positive: z.string(),
    warning: z.string(),
    negative: z.string(),
    chartPalette: z.array(z.string()).min(4).max(6),
    titleSize: z.number().int().positive(),
    sectionTitleSize: z.number().int().positive(),
    metricValueSize: z.number().int().positive(),
    bodySize: z.number().int().positive(),
    radius: z.number().int().nonnegative(),
    borderWidth: z.number().nonnegative(),
    shadow: z.enum(["none", "soft", "elevated"]),
  }),
  componentRules: z.object({
    titleText: z.enum(["transparent", "panel"]),
    kpiCard: z.enum(["soft", "solid", "outline"]),
    chartPanel: z.enum(["transparent", "soft-panel", "solid-panel"]),
    filterControl: z.enum(["outline", "soft-fill"]),
    annotation: z.enum(["muted", "subtle-panel"]),
    chartGrid: z.enum(["none", "subtle", "strong"]),
    chartLegend: z.enum(["muted", "bright"]),
  }),
});

export const visualSystemJsonSchema = z.toJSONSchema(visualSystemSchema);
export const visualSystemSchemaPrompt = JSON.stringify(visualSystemJsonSchema, null, 2);

export type VisualSystemSpec = z.infer<typeof visualSystemSchema>;
