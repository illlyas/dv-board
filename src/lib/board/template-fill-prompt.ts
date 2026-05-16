import type { SlotsSchemaFile } from "@/lib/board/wind-template-assembler";
import { WIND_PANEL_HEADER_KEYS } from "@/lib/board/wind-panels-keys";

function slotStoreHint(s: SlotsSchemaFile["slots"][number]): string {
  if (s.kind === "config") {
    if (s.slotId.endsWith("province_data")) {
      return [
        "provinceData（整对象替换，禁止沿用运营示例）",
        "defaultProvince 必须为 GeoJSON 省级全称（如「广东省」「四川省」）",
        "provinces 键为省级全称；值为 { power, capacity, farms, rate } 四类指标（语义随 Story，如产量/产能/产线数/达成率）",
        "mapLegend: { on, off }；regionCard: { volumeLabel,volumeUnit,scaleLabel,scaleUnit,sitesLabel,sitesUnit,rateLabel,rateUnit,logsColumnLabel }",
        "禁止使用 CN-44、adcode、{ name,value,color } 等简写结构",
      ].join("；");
    }
    if (s.slotId.endsWith("map_scatter")) {
      return "seedSeriesRows：{ name, value:[经度,纬度,散点大小] }[]，≥8 点，点位名与 Story 行业一致（工厂/车间/站点，勿用运营场站名）";
    }
    if (s.slotId.includes("realtime_primary_kpi") || s.slotId.includes("realtime_secondary_kpi")) {
      return "kpiGlowItems：KpiGlowBar 项 { label,value,max,unit,dir?,iconId? }[]，3 项";
    }
    if (s.slotId.endsWith("maintenance_metrics")) {
      return "configValue.items：KpiGaugeStat 三项，每项必含 **title**（指标名，勿用 label）、value（字符串或数字）、unit、iconId（kpi-sync-refresh/kpi-analytics-bars/kpi-pharmacy）、tone（success|warning|neutral）；语义对齐 Story 运维区左侧三指标";
    }
    return "configValue：整对象 → payload.value；production_base 须含 capacity/plan 为 { label,current,total }，另含 capacityBars/planBars 数组";
  }
  if (s.kind === "seed") {
    return "seedSeriesRows：行对象键名必须与同名 panel 的 widget 槽（p1.chart.realtime_primary / p1.chart.realtime_secondary）在 widgets 阶段锁定的 xAxis.field、yAxis[].field 一致；≥12 行";
  }
  if (s.surface?.includes("Table")) {
    return "tableRows：行对象数组（字段见 notes）";
  }
  if (s.widgetKey) {
    const t = s.surface ?? "";
    if (t.includes("KPI") || t.includes("Metric")) {
      return 'payload:{ kind:"kpiValue", value:{ value,trend,trendValue,comparison,subtitle? } }';
    }
    if (t.includes("Chart") || t.includes("Donut") || t.includes("Pie")) {
      return 'payload:{ kind:"seriesRows", value:[行…] }，字段与 widgets 轴 field 一致，≥8 行';
    }
    return "payload：按组件类型 kpiValue 或 seriesRows";
  }
  return s.dataShape ?? "payload 或别名见 slots.schema fill";
}

export function buildAllSlotPromptLines(schema: SlotsSchemaFile): string {
  return schema.slots
    .map((s) => {
      const meta = [s.kind ? `kind=${s.kind}` : null, s.surface ? String(s.surface) : null]
        .filter(Boolean)
        .join(" · ");
      const shape = s.dataShape ? `形状：${s.dataShape}` : "";
      const fill =
        typeof s.fill === "string"
          ? s.fill
          : s.fill
            ? JSON.stringify(s.fill)
            : "";
      const notes = s.notes ? `说明：${s.notes}` : "";
      const store = `落盘：${slotStoreHint(s)}`;
      return [
        `- **${s.slotId}**（page ${s.pageIndex ?? 0}${s.widgetKey ? ` · widgetKey \`${s.widgetKey}\`` : ""}）`,
        meta ? `  - ${meta}` : "",
        shape ? `  - ${shape}` : "",
        fill ? `  - ${fill}` : "",
        notes ? `  - ${notes}` : "",
        `  - ${store}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

export function buildPanelHeaderPromptLines(schema: SlotsSchemaFile): string {
  const ph = schema.panelHeaders ?? {};
  return WIND_PANEL_HEADER_KEYS.map((k) => {
    const binding = schema.panelShellBindings?.find((b) => b.key === k);
    const title = ph[k] ?? "";
    const comp = binding ? ` — ${binding.component}（page ${binding.pageIndex}）` : "";
    return `- **${k}**${comp} — 默认「${title}」`;
  }).join("\n");
}

/** 阶段一：widgets.json 字段契约（须含 xAxis.field / yAxis[].field） */
export const WIDGETS_FILL_JSON_EXAMPLE = `{
  "version": 1,
  "phase": "widgets",
  "templateId": "wind-power-emerald-ops",
  "themeDocumentTitle": "与 Design Story 一致的顶栏标题",
  "slots": {
    "p0.kpi.hero_01": { "title": "指标名", "subtitle": "说明", "unit": "个" },
    "p0.chart.capacity": {
      "title": "产线产能对比",
      "subtitle": "各产线实际产出 vs 设计产能",
      "xAxis": { "field": "line", "label": "产线" },
      "yAxis": [
        { "field": "actual", "label": "实际产量" },
        { "field": "capacity", "label": "设计产能" }
      ]
    },
    "p0.chart.device_donut": {
      "title": "设备状态分布",
      "nameField": "status",
      "valueField": "count"
    },
    "p1.table.alarm_list": {
      "columns": [
        { "field": "triggered_at", "label": "时间" },
        { "field": "name", "label": "设备" },
        { "field": "metric", "label": "告警类型" },
        { "field": "trend", "label": "等级" }
      ]
    }
  },
  "panelHeaders": { "capacity": "产能对比" }
}`;

/** 阶段二：store 业务数据（行键名必须与阶段一 field 契约一致） */
export const STORE_FILL_JSON_EXAMPLE = `{
  "version": 1,
  "phase": "store",
  "templateId": "wind-power-emerald-ops",
  "slots": {
    "p0.kpi.hero_01": {
      "payload": { "kind": "kpiValue", "value": { "value": 12, "trend": "up", "trendValue": "+2", "comparison": { "label": "较上期", "value": "+2" } } }
    },
    "p0.chart.capacity": {
      "seedSeriesRows": [
        { "line": "A线", "actual": 1120, "capacity": 1200 },
        { "line": "B线", "actual": 980, "capacity": 1100 }
      ]
    },
    "p0.config.province_data": {
      "provinceData": { "defaultProvince": "广东省", "provinces": { "广东省": { "volume": 2800, "capacity": 3200, "sites": 8, "rate": 96 } } }
    }
  }
}`;

export function buildWidgetSlotPromptLines(schema: SlotsSchemaFile): string {
  return schema.slots
    .filter((s) => s.widgetKey)
    .map((s) => {
      const t = s.surface ?? "";
      let fieldHint = "title/subtitle/unit";
      if (t.includes("LineChart") || t.includes("BarChart")) {
        fieldHint =
          "title/subtitle + **xAxis:{field,label}** + **yAxis:[{field,label},…]**（field 为英文/拼音短键，语义对齐 Story）";
      } else if (t.includes("Donut") || t.includes("Pie")) {
        fieldHint = "title/subtitle + **nameField** + **valueField**";
      } else if (t.includes("Table")) {
        fieldHint = "**columns:[{field,label},…]**（field 为行对象键名）";
      }
      return `- **${s.slotId}** · \`${s.widgetKey}\` · ${t}\n  - 填写：${fieldHint}`;
    })
    .join("\n");
}

export const TEMPLATE_FILL_JSON_EXAMPLE = `{
  "version": 1,
  "templateId": "wind-power-emerald-ops",
  "themeDocumentTitle": "与 Design Story 一致的顶栏标题",
  "slots": {
    "p0.kpi.hero_01": {
      "title": "指标名",
      "subtitle": "说明",
      "unit": "%",
      "payload": { "kind": "kpiValue", "value": { "value": 82.5, "unit": "%", "trend": "up", "trendValue": "+1.2%", "comparison": { "label": "较上期", "value": "+1.2%" } } }
    },
    "p0.config.gen_progress": {
      "configValue": {
        "items": [
          { "label": "当年", "value": 1200, "max": 1500, "unit": "MWh", "dir": "up", "iconId": "kpi-sync-refresh" }
        ]
      }
    },
    "p0.chart.hours_trend": {
      "title": "趋势图标题",
      "xAxisLabel": "时间",
      "yAxisLabels": ["系列A"],
      "seedSeriesRows": [{ "year": 2024, "equiv_hours": 1100 }]
    },
    "p1.table.alarm_list": {
      "tableRows": [{ "triggered_at": "2024-01-15 08:00", "name": "设备A", "metric": "告警类型", "trend": "上升" }]
    },
    "p0.config.province_data": {
      "provinceData": {
        "defaultProvince": "广东省",
        "header": { "city": "深圳", "weather": "晴 22°~28°C" },
        "provinces": {
          "广东省": { "volume": 2800, "capacity": 3200, "sites": 8, "rate": 96 },
          "江苏省": { "volume": 2100, "capacity": 2600, "sites": 6, "rate": 94 }
        },
        "mapLegend": { "on": "● 产线点位", "off": "○ 监测点位" },
        "regionCard": {
          "volumeLabel": "日产量", "volumeUnit": "件",
          "scaleLabel": "在制产能", "scaleUnit": "件/班",
          "sitesLabel": "产线数", "sitesUnit": "条",
          "rateLabel": "排产达成率", "rateUnit": "%",
          "logsColumnLabel": "区域"
        }
      }
    },
    "p0.config.map_scatter": {
      "seedSeriesRows": [
        { "name": "冲压车间", "value": [113.264, 23.129, 8] },
        { "name": "焊接车间", "value": [118.78, 32.04, 6] }
      ]
    }
  },
  "panelHeaders": { "gen_completion": "分区标题" }
}`;
