"use client";

import React from "react";
import type { KpiPresetIconSvgProps } from "./kpi-preset-icon-shared";
import {
  KpiIconAnalyticsBars,
  KpiIconCapsule,
  KpiIconInsightBadge,
  KpiIconPackage,
  KpiIconPharmacy,
  KpiIconSyncRefresh,
} from "./icons";
import { normalizeKpiPresetIconId, type KpiPresetIconIdSemantic } from "./kpi-preset-icon-ids";

export type { KpiPresetIconSvgProps } from "./kpi-preset-icon-shared";

export type KpiPresetIconByIdProps = { id: string } & KpiPresetIconSvgProps;

const PRESET_BY_SEMANTIC: Record<
  KpiPresetIconIdSemantic,
  React.FC<KpiPresetIconSvgProps>
> = {
  "kpi-sync-refresh": KpiIconSyncRefresh,
  "kpi-analytics-bars": KpiIconAnalyticsBars,
  "kpi-insight-badge": KpiIconInsightBadge,
  "kpi-capsule": KpiIconCapsule,
  "kpi-pharmacy": KpiIconPharmacy,
  "kpi-package": KpiIconPackage,
};

export function KpiPresetIconById({ id, className, style }: KpiPresetIconByIdProps) {
  const semantic = normalizeKpiPresetIconId(id);
  const Cmp = PRESET_BY_SEMANTIC[semantic];
  return <Cmp className={className} style={style} />;
}
