/**
 * 将 AI template-fill 中的省域地图 / 散点数据归一为 CenterGeoMapPanel + GeoMap 约定结构。
 */

const ADCODE_TO_PROVINCE: Record<string, string> = {
  "110000": "北京市",
  "120000": "天津市",
  "130000": "河北省",
  "140000": "山西省",
  "150000": "内蒙古自治区",
  "210000": "辽宁省",
  "220000": "吉林省",
  "230000": "黑龙江省",
  "310000": "上海市",
  "320000": "江苏省",
  "330000": "浙江省",
  "340000": "安徽省",
  "350000": "福建省",
  "360000": "江西省",
  "370000": "山东省",
  "410000": "河南省",
  "420000": "湖北省",
  "430000": "湖南省",
  "440000": "广东省",
  "450000": "广西壮族自治区",
  "460000": "海南省",
  "500000": "重庆市",
  "510000": "四川省",
  "520000": "贵州省",
  "530000": "云南省",
  "540000": "西藏自治区",
  "610000": "陕西省",
  "620000": "甘肃省",
  "630000": "青海省",
  "640000": "宁夏回族自治区",
  "650000": "新疆维吾尔自治区",
  "710000": "台湾省",
  "810000": "香港特别行政区",
  "820000": "澳门特别行政区",
};

const CN_PREFIX_TO_PROVINCE: Record<string, string> = {
  "CN-11": "北京市",
  "CN-12": "天津市",
  "CN-13": "河北省",
  "CN-14": "山西省",
  "CN-15": "内蒙古自治区",
  "CN-21": "辽宁省",
  "CN-22": "吉林省",
  "CN-23": "黑龙江省",
  "CN-31": "上海市",
  "CN-32": "江苏省",
  "CN-33": "浙江省",
  "CN-34": "安徽省",
  "CN-35": "福建省",
  "CN-36": "江西省",
  "CN-37": "山东省",
  "CN-41": "河南省",
  "CN-42": "湖北省",
  "CN-43": "湖南省",
  "CN-44": "广东省",
  "CN-45": "广西壮族自治区",
  "CN-46": "海南省",
  "CN-50": "重庆市",
  "CN-51": "四川省",
  "CN-52": "贵州省",
  "CN-53": "云南省",
  "CN-54": "西藏自治区",
  "CN-61": "陕西省",
  "CN-62": "甘肃省",
  "CN-63": "青海省",
  "CN-64": "宁夏回族自治区",
  "CN-65": "新疆维吾尔自治区",
  "CN-71": "台湾省",
  "CN-81": "香港特别行政区",
  "CN-82": "澳门特别行政区",
};

export type ProvinceMetrics = {
  volume: number;
  capacity: number;
  sites: number;
  rate: number;
};

function finiteNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** 将 adcode / CN-xx / 简称 解析为 GeoJSON 中的省级全称 */
export function resolveProvinceDisplayName(key: string, row?: unknown): string {
  const k = key.trim();
  if (!k) {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      const name = (row as Record<string, unknown>).name;
      if (typeof name === "string" && name.trim()) return name.trim();
    }
    return "";
  }

  if (ADCODE_TO_PROVINCE[k]) return ADCODE_TO_PROVINCE[k];
  if (CN_PREFIX_TO_PROVINCE[k]) return CN_PREFIX_TO_PROVINCE[k];

  const cn = /^CN-(\d{1,2})$/i.exec(k);
  if (cn) {
    const padded = `CN-${cn[1]!.padStart(2, "0")}`;
    if (CN_PREFIX_TO_PROVINCE[padded]) return CN_PREFIX_TO_PROVINCE[padded];
  }

  if (row && typeof row === "object" && !Array.isArray(row)) {
    const name = (row as Record<string, unknown>).name;
    if (typeof name === "string" && name.trim()) {
      const n = name.trim();
      if (n.endsWith("省") || n.endsWith("市") || n.includes("自治区") || n.includes("特别行政区")) {
        return n;
      }
      const withSuffix = `${n}省`;
      if (withSuffix.length <= 12) return withSuffix;
      return n;
    }
  }

  if (k.endsWith("省") || k.endsWith("市") || k.includes("自治区") || k.includes("特别行政区")) {
    return k;
  }

  return `${k}省`;
}

function normalizeProvinceMetrics(raw: unknown): ProvinceMetrics {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { volume: 0, capacity: 0, sites: 0, rate: 0 };
  }
  const o = raw as Record<string, unknown>;
  if (
    "volume" in o ||
    "power" in o ||
    "capacity" in o ||
    "sites" in o ||
    "farms" in o ||
    "rate" in o
  ) {
    return {
      volume: finiteNum(o.volume ?? o.volume),
      capacity: finiteNum(o.capacity),
      sites: finiteNum(o.sites ?? o.sites),
      rate: finiteNum(o.rate),
    };
  }

  const primary = finiteNum(o.value ?? o.output ?? o.amount ?? o.total);
  return {
    volume: primary,
    capacity: finiteNum(o.capacity, primary > 0 ? Math.round(primary * 1.15) : 0),
    sites: finiteNum(o.sites ?? o.sites ?? o.count, primary > 0 ? Math.max(1, Math.round(primary / 40)) : 0),
    rate: finiteNum(o.rate ?? o.efficiency ?? o.utilization, primary > 0 ? Math.min(99, 82 + (primary % 17)) : 0),
  };
}

function normalizeMapLegend(raw: unknown): { on: string; off: string } {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    return {
      on: String(o.on ?? o.active ?? "● 业务点位"),
      off: String(o.off ?? o.inactive ?? "○ 监测点位"),
    };
  }
  if (typeof raw === "string" && raw.trim()) {
    return { on: `● ${raw.trim()}`, off: "○ 监测点位" };
  }
  return { on: "● 业务点位", off: "○ 监测点位" };
}

function normalizeRegionCard(raw: unknown): Record<string, string> {
  const defaults = {
    volumeLabel: "区域指标",
    volumeUnit: "",
    scaleLabel: "规模指标",
    scaleUnit: "",
    sitesLabel: "点位数量",
    sitesUnit: "个",
    rateLabel: "达成率",
    rateUnit: "%",
    logsColumnLabel: "区域",
  };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaults;
  const o = raw as Record<string, unknown>;
  const out = { ...defaults };
  if (typeof o.volumeLabel === "string") out.volumeLabel = o.volumeLabel;
  else if (typeof o.label === "string") out.volumeLabel = o.label;
  if (typeof o.volumeUnit === "string") out.volumeUnit = o.volumeUnit;
  if (typeof o.scaleLabel === "string") out.scaleLabel = o.scaleLabel;
  if (typeof o.scaleUnit === "string") out.scaleUnit = o.scaleUnit;
  if (typeof o.sitesLabel === "string") out.sitesLabel = o.sitesLabel;
  if (typeof o.sitesUnit === "string") out.sitesUnit = o.sitesUnit;
  if (typeof o.rateLabel === "string") out.rateLabel = o.rateLabel;
  if (typeof o.rateUnit === "string") out.rateUnit = o.rateUnit;
  if (typeof o.logsColumnLabel === "string") out.logsColumnLabel = o.logsColumnLabel;
  return out;
}

/** p0.config.province_data → payload.value */
export function normalizeProvinceDataValue(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      defaultProvince: "广东省",
      provinces: {},
      mapLegend: normalizeMapLegend(null),
      regionCard: normalizeRegionCard(null),
    };
  }

  const v = { ...(value as Record<string, unknown>) };
  const provincesIn = v.provinces;
  const provincesOut: Record<string, ProvinceMetrics> = {};

  if (provincesIn && typeof provincesIn === "object" && !Array.isArray(provincesIn)) {
    for (const [key, row] of Object.entries(provincesIn as Record<string, unknown>)) {
      const name = resolveProvinceDisplayName(key, row);
      if (!name) continue;
      provincesOut[name] = normalizeProvinceMetrics(row);
    }
  }

  const names = Object.keys(provincesOut);
  let defaultProvince = resolveProvinceDisplayName(String(v.defaultProvince ?? ""), null);
  if (!defaultProvince || !provincesOut[defaultProvince]) {
    defaultProvince = names[0] ?? "广东省";
  }

  const header =
    v.header && typeof v.header === "object" && !Array.isArray(v.header)
      ? { ...(v.header as Record<string, unknown>) }
      : undefined;

  return {
    ...(header ? { header } : {}),
    defaultProvince,
    provinces: provincesOut,
    mapLegend: normalizeMapLegend(v.mapLegend),
    regionCard: normalizeRegionCard(v.regionCard),
  };
}

type ScatterRow = { name: string; value: [number, number, number?] };

/** p0.config.map_scatter → seriesRows.value */
export function normalizeMapScatterRows(value: unknown[]): ScatterRow[] {
  return value
    .map((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return null;
      const o = row as Record<string, unknown>;
      const name = String(o.name ?? o.label ?? "").trim();
      let lng: number | undefined;
      let lat: number | undefined;
      let size: number | undefined;

      const rawVal = o.value;
      if (Array.isArray(rawVal) && rawVal.length >= 2) {
        lng = finiteNum(rawVal[0], NaN);
        lat = finiteNum(rawVal[1], NaN);
        size = rawVal[2] != null ? finiteNum(rawVal[2], 4) : 4;
      } else if (typeof rawVal === "object" && rawVal && !Array.isArray(rawVal)) {
        const vv = rawVal as Record<string, unknown>;
        lng = finiteNum(vv.lng ?? vv.lon ?? vv.longitude, NaN);
        lat = finiteNum(vv.lat ?? vv.latitude, NaN);
        size = finiteNum(vv.size ?? vv.val, 4);
      } else {
        lng = finiteNum(o.lng ?? o.lon ?? o.longitude, NaN);
        lat = finiteNum(o.lat ?? o.latitude, NaN);
        size = finiteNum(o.size ?? o.val ?? rawVal, 4);
      }

      if (!name || !Number.isFinite(lng) || !Number.isFinite(lat)) return null;
      return { name, value: [lng, lat, size ?? 4] as [number, number, number] };
    })
    .filter((x): x is ScatterRow => x != null);
}
