/**
 * 风电智慧运营 — 模板三层 + AI 填空（与仓库方案一致）
 *
 * 结构层：本文件 — 布局骨架、`widgets` 平台组件、`useStoreData` 绑定；局部展示子组件以同文件内 `function` 写在文件末尾（函数声明提升，勿改顺序依赖）。
 * 数据层：dashboard.store.json — 与 `dataSlotId` / useStoreData 路径对齐。
 * 视觉层：vi-tokens.json — CSS 变量。
 * 填空协议：slots.schema.json。
 * 私有展示组件：见 widgets.manifest.json；实现均在本文件内，禁止拆文件或 import 相对路径模块。
 */

function _viParseHex(hex) {
  const h = String(hex || "")
    .replace(/^#/, "")
    .trim();
  if (h.length === 6) {
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  return { r: 95, g: 228, b: 140 };
}

function _viWithAlpha(hex, a) {
  const { r, g, b } = _viParseHex(hex);
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function _viReadCssVar(hostEl, name, fallbackHex) {
  if (typeof window === "undefined" || !hostEl) return fallbackHex;
  const raw = getComputedStyle(hostEl).getPropertyValue(name).trim();
  if (!raw) return fallbackHex;
  if (raw.startsWith("#")) return raw;
  return fallbackHex;
}

function useBoardViPalette(hostRef) {
  const defaults = {
    primary: "#5FE48C",
    accentGold: "#D4B86A",
    accent: "#3AFF9B",
    danger: "#F87171",
    primaryHover: "#86EFAC",
    success: "#22C55E",
    bg: "#03120B",
    textMuted: "#5FA37E",
  };
  const [pal, setPal] = React.useState(defaults);
  React.useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    setPal({
      primary: _viReadCssVar(el, "--color-primary", defaults.primary),
      accentGold: _viReadCssVar(el, "--color-accent-gold", defaults.accentGold),
      accent: _viReadCssVar(el, "--color-accent", defaults.accent),
      danger: _viReadCssVar(el, "--color-danger", defaults.danger),
      primaryHover: _viReadCssVar(el, "--color-primary-hover", defaults.primaryHover),
      success: _viReadCssVar(el, "--color-success", defaults.success),
      bg: _viReadCssVar(el, "--color-bg", defaults.bg),
      textMuted: _viReadCssVar(el, "--color-text-muted", defaults.textMuted),
    });
  }, []);
  return pal;
}

export default function Dashboard() {
  const boardRootRef = React.useRef(null);
  const pal = useBoardViPalette(boardRootRef);

  // --- 平台 Widget 注册表：与 slots.schema.json、dashboard.store.json 对齐；改 KPI/图表配置优先改此对象，勿动布局栅格 ---
  const widgets = React.useMemo(() => ({
  "p0_kpi_farms": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.wind_farms",
      "pageIndex": 0,
      "title": "风电场数量",
      "presetIconId": "kpi-sync-refresh",
      "dataKey": "wind_farms_value",
      "unit": "个",
      "presentation": {
        "layout": "header-inline",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_units": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.wind_units",
      "pageIndex": 0,
      "title": "风电机组数量",
      "presetIconId": "kpi-analytics-bars",
      "dataKey": "wind_units_value",
      "unit": "台",
      "presentation": {
        "layout": "header-inline",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_avail": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.availability",
      "pageIndex": 0,
      "title": "平均可利用率",
      "presetIconId": "kpi-insight-badge",
      "dataKey": "availability_value",
      "unit": "%",
      "presentation": {
        "layout": "header-inline",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_emission": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.emission",
      "pageIndex": 0,
      "title": "年减排量",
      "presetIconId": "kpi-capsule",
      "dataKey": "emission_value",
      "unit": "万kWh",
      "presentation": {
        "layout": "header-inline",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_clean": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.clean_gen",
      "pageIndex": 0,
      "title": "清洁能源发电",
      "presetIconId": "kpi-pharmacy",
      "dataKey": "clean_gen_value",
      "unit": "万kW",
      "presentation": {
        "layout": "header-inline",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_gen_year": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.gen_year",
      "pageIndex": 0,
      "title": "当年",
      "presetIconId": "kpi-sync-refresh",
      "dataKey": "gen_year_value",
      "unit": "MWh",
      "presentation": {
        "layout": "classic",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_gen_month": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.gen_month",
      "pageIndex": 0,
      "title": "当月",
      "presetIconId": "kpi-analytics-bars",
      "dataKey": "gen_month_value",
      "unit": "MWh",
      "presentation": {
        "layout": "classic",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_gen_day": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.gen_day",
      "pageIndex": 0,
      "title": "当日",
      "presetIconId": "kpi-insight-badge",
      "dataKey": "gen_day_value",
      "unit": "MWh",
      "presentation": {
        "layout": "classic",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_chart_hours": {
    "type": "LineChart",
    "props": {
      "dataSlotId": "p0.chart.hours_trend",
      "pageIndex": 0,
      "subtitle": "单位：小时",
      "dataKey": "hours_trend",
      "style": {
        "border": "var(--dv-chart-panel-border)",
        "padding": "var(--dv-chart-panel-padding)",
        "borderRadius": "var(--dv-chart-panel-radius)",
        "background": "var(--dv-chart-panel-bg)"
      },
      "xAxis": {
        "field": "year",
        "label": "年度"
      },
      "yAxis": [
        {
          "field": "equiv_hours",
          "label": "场站等效利用小时",
          "color": "var(--color-primary)"
        },
        {
          "field": "industry_avg_hours",
          "label": "行业平均发电小时",
          "color": "var(--color-accent-gold)"
        }
      ],
      "showLegend": true,
      "showGrid": true,
      "smooth": true,
      "area": true,
      "showPoints": false,
      "lineWidth": 3,
      "colorScheme": [
        "var(--color-primary)",
        "var(--color-accent-gold)"
      ],
      "gridColor": "var(--dv-chart-grid-stroke)",
      "axisColor": "var(--dv-chart-axis-line)",
      "axisTextColor": "var(--dv-chart-tick-label)",
      "legendTextColor": "var(--dv-chart-legend-text)",
      "tooltipBackgroundColor": "var(--dv-chart-tooltip-bg)",
      "tooltipTextColor": "var(--dv-chart-tooltip-fg)",
      "textColor": "var(--color-text-muted)",
      "echartsOptionOverrides": {
        "animationDuration": 600,
        "yAxis": {
          "min": 0,
          "max": 250,
          "interval": 125
        },
        "series": [
          {
            "name": "场站等效利用小时",
            "type": "line",
            "smooth": true,
            "showSymbol": false,
            "lineStyle": {
              "width": 3,
              "color": pal.primary,
              "shadowColor": _viWithAlpha(pal.primary, 0.85),
              "shadowBlur": 12
            },
            "itemStyle": {
              "color": "var(--color-primary)"
            },
            "areaStyle": {
              "opacity": 1,
              "color": {
                "type": "linear",
                "x": 0,
                "y": 0,
                "x2": 0,
                "y2": 1,
                "colorStops": [
                  {
                    "offset": 0,
                    "color": _viWithAlpha(pal.primary, 0.1)
                  },
                  {
                    "offset": 1,
                    "color": _viWithAlpha(pal.primary, 0)
                  }
                ]
              }
            }
          },
          {
            "name": "行业平均发电小时",
            "type": "line",
            "smooth": true,
            "showSymbol": false,
            "lineStyle": {
              "width": 3,
              "color": pal.accentGold,
              "shadowColor": _viWithAlpha(pal.accentGold, 0.75),
              "shadowBlur": 10
            },
            "itemStyle": {
              "color": "var(--color-accent-gold)"
            },
            "areaStyle": {
              "opacity": 1,
              "color": {
                "type": "linear",
                "x": 0,
                "y": 0,
                "x2": 0,
                "y2": 1,
                "colorStops": [
                  {
                    "offset": 0,
                    "color": _viWithAlpha(pal.accentGold, 0.1)
                  },
                  {
                    "offset": 1,
                    "color": _viWithAlpha(pal.accentGold, 0)
                  }
                ]
              }
            }
          }
        ]
      }
    }
  },
  "p0_kpi_capacity": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.capacity_rate",
      "pageIndex": 0,
      "title": "年生产能力",
      "presetIconId": "kpi-capsule",
      "dataKey": "capacity_rate_value",
      "unit": "%",
      "presentation": {
        "layout": "classic",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_plan": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.plan_rate",
      "pageIndex": 0,
      "title": "计划排产量",
      "presetIconId": "kpi-pharmacy",
      "dataKey": "plan_rate_value",
      "unit": "%",
      "presentation": {
        "layout": "classic",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_chart_capacity": {
    "type": "BarChart",
    "props": {
      "dataSlotId": "p0.chart.capacity",
      "pageIndex": 0,
      "dataKey": "capacity_trend",
      "style": {
        "border": "var(--dv-chart-panel-border)",
        "padding": "var(--dv-chart-panel-padding)",
        "borderRadius": "var(--dv-chart-panel-radius)",
        "background": "var(--dv-chart-panel-bg)"
      },
      "xAxis": {
        "field": "year",
        "label": "年度"
      },
      "yAxis": [
        {
          "field": "operating_capacity",
          "label": "在运装机",
          "color": "var(--color-primary)"
        },
        {
          "field": "committed_capacity",
          "label": "在建及规划",
          "color": "var(--color-accent-gold)"
        }
      ],
      "showLegend": true,
      "showGrid": true,
      "colorScheme": [
        "var(--color-primary)",
        "var(--color-accent-gold)"
      ],
      "gridColor": "var(--dv-chart-grid-stroke)",
      "axisColor": "var(--dv-chart-axis-line)",
      "axisTextColor": "var(--dv-chart-tick-label)",
      "legendTextColor": "var(--dv-chart-legend-text)",
      "tooltipBackgroundColor": "var(--dv-chart-tooltip-bg)",
      "tooltipTextColor": "var(--dv-chart-tooltip-fg)",
      "textColor": "var(--color-text-muted)",
      "echartsOptionOverrides": {
        "animationDuration": 400,
        "series": [
          {
            "name": "在运装机",
            "type": "bar",
            "barWidth": 10,
            "itemStyle": {
              "color": {
                "type": "linear",
                "x": 0,
                "y": 0,
                "x2": 0,
                "y2": 1,
                "colorStops": [
                  {
                    "offset": 0,
                    "color": _viWithAlpha(pal.primary, 0.35)
                  },
                  {
                    "offset": 1,
                    "color": _viWithAlpha(pal.primary, 0)
                  }
                ]
              },
              "borderWidth": 0
            }
          },
          {
            "name": "在建及规划",
            "type": "bar",
            "barWidth": 10,
            "itemStyle": {
              "color": {
                "type": "linear",
                "x": 0,
                "y": 0,
                "x2": 0,
                "y2": 1,
                "colorStops": [
                  {
                    "offset": 0,
                    "color": _viWithAlpha(pal.accentGold, 0.35)
                  },
                  {
                    "offset": 1,
                    "color": _viWithAlpha(pal.accentGold, 0)
                  }
                ]
              },
              "borderWidth": 0
            }
          }
        ]
      }
    }
  },
  "p0_kpi_running": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.running_orders",
      "pageIndex": 0,
      "title": "当前在运单数",
      "presetIconId": "kpi-package",
      "dataKey": "running_orders_value",
      "unit": "个",
      "presentation": {
        "layout": "classic",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_abnormal": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.abnormal_orders",
      "pageIndex": 0,
      "title": "异常运单数量",
      "presetIconId": "kpi-pharmacy",
      "dataKey": "abnormal_orders_value",
      "unit": "个",
      "presentation": {
        "layout": "classic",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_chart_device": {
    "type": "DonutChart",
    "props": {
      "dataSlotId": "p0.chart.device_donut",
      "pageIndex": 0,
      "dataKey": "device_donut",
      "nameField": "name",
      "valueField": "value",
      "style": {
        "border": "var(--dv-chart-panel-border)",
        "padding": "var(--dv-chart-panel-padding)",
        "borderRadius": "var(--dv-chart-panel-radius)",
        "background": "var(--dv-chart-panel-bg)"
      },
      "showPercentage": true,
      "showLegend": true,
      "legendPosition": "right",
      "donut": true,
      "innerRadius": 52,
      "outerRadius": 78,
      "colorScheme": [
        "var(--color-primary)",
        "var(--color-accent-gold)",
        "var(--color-danger)",
        "var(--color-primary-hover)"
      ],
      "legendTextColor": "var(--dv-chart-legend-text)",
      "tooltipBackgroundColor": "var(--dv-chart-tooltip-bg)",
      "tooltipTextColor": "var(--dv-chart-tooltip-fg)",
      "echartsOptionOverrides": {
        "animationDuration": 400,
        "color": [
          {
            "type": "linear",
            "x": 0,
            "y": 0,
            "x2": 0,
            "y2": 1,
            "colorStops": [
              {
                "offset": 0,
                "color": _viWithAlpha(pal.primary, 0.35)
              },
              {
                "offset": 1,
                "color": _viWithAlpha(pal.primary, 0)
              }
            ]
          },
          {
            "type": "linear",
            "x": 0,
            "y": 0,
            "x2": 0,
            "y2": 1,
            "colorStops": [
              {
                "offset": 0,
                "color": _viWithAlpha(pal.accentGold, 0.35)
              },
              {
                "offset": 1,
                "color": _viWithAlpha(pal.accentGold, 0)
              }
            ]
          },
          {
            "type": "linear",
            "x": 0,
            "y": 0,
            "x2": 0,
            "y2": 1,
            "colorStops": [
              {
                "offset": 0,
                "color": _viWithAlpha(pal.danger, 0.35)
              },
              {
                "offset": 1,
                "color": _viWithAlpha(pal.danger, 0)
              }
            ]
          },
          {
            "type": "linear",
            "x": 0,
            "y": 0,
            "x2": 0,
            "y2": 1,
            "colorStops": [
              {
                "offset": 0,
                "color": _viWithAlpha(pal.primaryHover, 0.35)
              },
              {
                "offset": 1,
                "color": _viWithAlpha(pal.primaryHover, 0)
              }
            ]
          }
        ],
        "series": [
          {
            "type": "pie",
            "itemStyle": {
              "borderWidth": 0
            }
          }
        ]
      }
    }
  },
  "p0_kpi_util": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.util_hours",
      "pageIndex": 0,
      "title": "等效利用小时数",
      "presetIconId": "kpi-sync-refresh",
      "dataKey": "util_hours_value",
      "unit": "小时",
      "presentation": {
        "layout": "classic",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_mldt": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.mldt",
      "pageIndex": 0,
      "title": "平均故障相应时间 (MLDT)",
      "presetIconId": "kpi-analytics-bars",
      "dataKey": "mldt_value",
      "unit": "小时",
      "presentation": {
        "layout": "classic",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p0_kpi_mttr": {
    "type": "KPI",
    "props": {
      "dataSlotId": "p0.kpi.mttr",
      "pageIndex": 0,
      "title": "平均故障修复时间 (MTTR)",
      "presetIconId": "kpi-pharmacy",
      "dataKey": "mttr_value",
      "unit": "小时",
      "presentation": {
        "layout": "classic",
        "surface": "none",
        "valueGlow": "inherit"
      }
    }
  },
  "p1_chart_power_realtime": {
    "type": "LineChart",
    "props": {
      "dataSlotId": "p1.chart.power_realtime",
      "pageIndex": 1,
      "subtitle": "单位：MW",
      "dataKey": "power_realtime",
      "style": {
        "border": "var(--dv-chart-panel-border)",
        "padding": "var(--dv-chart-panel-padding)",
        "borderRadius": "var(--dv-chart-panel-radius)",
        "background": "var(--dv-chart-panel-bg)"
      },
      "xAxis": {
        "field": "time",
        "label": "时间"
      },
      "yAxis": [
        {
          "field": "value",
          "label": "实时功率",
          "color": "var(--color-primary)"
        },
        {
          "field": "plan_power",
          "label": "计划功率",
          "color": "var(--color-accent-gold)"
        }
      ],
      "showLegend": true,
      "showGrid": true,
      "smooth": true,
      "area": true,
      "showPoints": false,
      "lineWidth": 2,
      "colorScheme": [
        "var(--color-primary)",
        "var(--color-accent-gold)"
      ],
      "gridColor": "var(--dv-chart-grid-stroke)",
      "axisColor": "var(--dv-chart-axis-line)",
      "axisTextColor": "var(--dv-chart-tick-label)",
      "legendTextColor": "var(--dv-chart-legend-text)",
      "tooltipBackgroundColor": "var(--dv-chart-tooltip-bg)",
      "tooltipTextColor": "var(--dv-chart-tooltip-fg)",
      "textColor": "var(--color-text-muted)",
      "echartsOptionOverrides": {
        "animationDuration": 600,
        "series": [
          {
            "name": "实时功率",
            "type": "line",
            "smooth": true,
            "showSymbol": false,
            "lineStyle": {
              "width": 2,
              "color": "var(--color-primary)"
            },
            "itemStyle": {
              "color": "var(--color-primary)"
            },
            "areaStyle": {
              "opacity": 1,
              "color": {
                "type": "linear",
                "x": 0,
                "y": 0,
                "x2": 0,
                "y2": 1,
                "colorStops": [
                  {
                    "offset": 0,
                    "color": _viWithAlpha(pal.primary, 0.12)
                  },
                  {
                    "offset": 1,
                    "color": _viWithAlpha(pal.primary, 0)
                  }
                ]
              }
            }
          },
          {
            "name": "计划功率",
            "type": "line",
            "smooth": true,
            "showSymbol": false,
            "lineStyle": {
              "width": 2,
              "color": pal.accentGold,
              "type": "dashed"
            },
            "itemStyle": {
              "color": "var(--color-accent-gold)"
            },
            "areaStyle": {
              "opacity": 0
            }
          }
        ]
      }
    }
  },
  "p1_chart_wind_speed": {
    "type": "LineChart",
    "props": {
      "dataSlotId": "p1.chart.wind_speed",
      "pageIndex": 1,
      "subtitle": "单位：m/s",
      "dataKey": "wind_speed",
      "style": {
        "border": "var(--dv-chart-panel-border)",
        "padding": "var(--dv-chart-panel-padding)",
        "borderRadius": "var(--dv-chart-panel-radius)",
        "background": "var(--dv-chart-panel-bg)"
      },
      "xAxis": {
        "field": "time",
        "label": "时间"
      },
      "yAxis": [
        {
          "field": "value",
          "label": "风速",
          "color": "var(--color-accent)"
        }
      ],
      "showLegend": false,
      "showGrid": true,
      "smooth": true,
      "area": true,
      "showPoints": false,
      "lineWidth": 2,
      "colorScheme": [
        "var(--color-accent)"
      ],
      "gridColor": "var(--dv-chart-grid-stroke)",
      "axisColor": "var(--dv-chart-axis-line)",
      "axisTextColor": "var(--dv-chart-tick-label)",
      "tooltipBackgroundColor": "var(--dv-chart-tooltip-bg)",
      "tooltipTextColor": "var(--dv-chart-tooltip-fg)",
      "textColor": "var(--color-text-muted)",
      "echartsOptionOverrides": {
        "animationDuration": 600,
        "series": [
          {
            "name": "风速",
            "type": "line",
            "smooth": true,
            "showSymbol": false,
            "lineStyle": {
              "width": 2,
              "color": pal.accent
            },
            "itemStyle": {
              "color": pal.accent
            },
            "areaStyle": {
              "opacity": 1,
              "color": {
                "type": "linear",
                "x": 0,
                "y": 0,
                "x2": 0,
                "y2": 1,
                "colorStops": [
                  {
                    "offset": 0,
                    "color": _viWithAlpha(pal.accent, 0.1)
                  },
                  {
                    "offset": 1,
                    "color": _viWithAlpha(pal.accent, 0)
                  }
                ]
              }
            }
          }
        ]
      }
    }
  },
  "p1_chart_alarm_bar": {
    "type": "BarChart",
    "props": {
      "dataSlotId": "p1.chart.alarm_bar",
      "pageIndex": 1,
      "dataKey": "alarm_bar",
      "style": {
        "border": "var(--dv-chart-panel-border)",
        "padding": "var(--dv-chart-panel-padding)",
        "borderRadius": "var(--dv-chart-panel-radius)",
        "background": "var(--dv-chart-panel-bg)"
      },
      "xAxis": {
        "field": "name",
        "label": "告警类型"
      },
      "yAxis": [
        {
          "field": "value",
          "label": "数量",
          "color": "var(--color-danger)"
        }
      ],
      "showLegend": false,
      "showGrid": true,
      "colorScheme": [
        "var(--color-danger)"
      ],
      "gridColor": "var(--dv-chart-grid-stroke)",
      "axisColor": "var(--dv-chart-axis-line)",
      "axisTextColor": "var(--dv-chart-tick-label)",
      "tooltipBackgroundColor": "var(--dv-chart-tooltip-bg)",
      "tooltipTextColor": "var(--dv-chart-tooltip-fg)",
      "textColor": "var(--color-text-muted)",
      "echartsOptionOverrides": {
        "animationDuration": 400,
        "series": [
          {
            "name": "数量",
            "type": "bar",
            "barWidth": 14,
            "itemStyle": {
              "color": {
                "type": "linear",
                "x": 0,
                "y": 0,
                "x2": 0,
                "y2": 1,
                "colorStops": [
                  {
                    "offset": 0,
                    "color": _viWithAlpha(pal.danger, 0.6)
                  },
                  {
                    "offset": 1,
                    "color": _viWithAlpha(pal.danger, 0.05)
                  }
                ]
              },
              "borderRadius": [
                3,
                3,
                0,
                0
              ]
            }
          }
        ]
      }
    }
  },
  "p1_chart_device_status": {
    "type": "DonutChart",
    "props": {
      "dataSlotId": "p1.chart.device_status",
      "pageIndex": 1,
      "dataKey": "device_status",
      "nameField": "name",
      "valueField": "value",
      "style": {
        "border": "var(--dv-chart-panel-border)",
        "padding": "var(--dv-chart-panel-padding)",
        "borderRadius": "var(--dv-chart-panel-radius)",
        "background": "var(--dv-chart-panel-bg)"
      },
      "showPercentage": true,
      "showLegend": true,
      "legendPosition": "right",
      "donut": true,
      "innerRadius": 52,
      "outerRadius": 78,
      "colorScheme": [
        "var(--color-primary)",
        "var(--color-warning)",
        "var(--color-danger)",
        "var(--color-primary-hover)"
      ],
      "legendTextColor": "var(--dv-chart-legend-text)",
      "tooltipBackgroundColor": "var(--dv-chart-tooltip-bg)",
      "tooltipTextColor": "var(--dv-chart-tooltip-fg)",
      "echartsOptionOverrides": {
        "animationDuration": 400,
        "series": [
          {
            "type": "pie",
            "itemStyle": {
              "borderWidth": 0
            }
          }
        ]
      }
    }
  }
  }), [pal]);

  // ===== 从 store 读取所有面板数据 =====
  const genProgress = useStoreData("p0.config.gen_progress") || { items: [] };
  const productionBase = useStoreData("p0.config.production_base") || {
    capacity: { label: "", current: 0, total: 0 },
    capacityBars: [],
    plan: { label: "", current: 0, total: 0 },
    planBars: [],
  };
  const transitSummary = useStoreData("p0.config.transit_summary") || {
    running: { iconId: "kpi-package", title: "", value: "", unit: "" },
    abnormal: { iconId: "kpi-insight-badge", title: "", value: "", unit: "" },
  };
  const dailyOrders = useStoreData("p0.config.daily_orders") || { title: "", bars: [] };
  const maintenanceMetrics = useStoreData("p0.config.maintenance_metrics") || { items: [] };
  const workOrders = useStoreData("p0.config.work_orders") || { items: [] };
  const powerKpi = useStoreData("p1.config.power_kpi") || { items: [] };
  const windKpi = useStoreData("p1.config.wind_kpi") || { items: [] };

  const chartCell = (child) => (
    <div style={{ height: "100%", width: "100%", minHeight: 0, minWidth: 0, overflow: "hidden", boxSizing: "border-box" }}>
      {child}
    </div>
  );

  const [now, setNow] = React.useState(() => new Date("2023-08-11T17:01:03"));
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad2 = (n) => String(n).padStart(2, "0");
  const dateStr = `${now.getFullYear()}.${pad2(now.getMonth() + 1)}.${pad2(now.getDate())}`;
  const weekStr = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][now.getDay()];
  const timeStr = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

  // ---- 地图数据（从 store 读取） ----
  const provinceConfig = useStoreData("p0.config.province_data") || {
    defaultProvince: "四川省",
    provinces: {},
    header: { city: "", weather: "" },
    mapLegend: { on: "● 设施点位", off: "○ 监测点位" },
    regionCard: {
      volumeLabel: "总发电量",
      volumeUnit: "kWh",
      scaleLabel: "区域装机",
      scaleUnit: "MW",
      sitesLabel: "场站数量",
      sitesUnit: "个",
      rateLabel: "可利用率",
      rateUnit: "%",
      logsColumnLabel: "区域",
    },
  };
  const provinceDataMap = provinceConfig.provinces || {};
  const mapScatterData = useStoreData("p0.config.map_scatter") || [];
  const headerChrome = provinceConfig.header || {};
  const mapLegendChrome = provinceConfig.mapLegend || {};
  const regionCardLabels = provinceConfig.regionCard || {};

  const [activeProvince, setActiveProvince] = React.useState(provinceConfig.defaultProvince || "四川省");
  const provinceInfo = provinceDataMap[activeProvince] || { power: 0, capacity: 0, farms: 0, rate: 0 };

  const [currentPage, setCurrentPage] = React.useState(0);
  const pageChangedRef = React.useRef(false);
  const handlePageChange = (page) => {
    if (page !== currentPage) {
      pageChangedRef.current = true;
      setCurrentPage(page);
    }
  };

  // 实时数据流（第二页面积图） - 初始种子数据从 store 读取，运行时持续追加
  const maxPoints = 30;
  const powerSeed = useStoreData("p1.chart.power_realtime_seed");
  const windSeed = useStoreData("p1.chart.wind_speed_seed");
  const [realtimePower, setRealtimePower] = React.useState([]);
  const [realtimeWind, setRealtimeWind] = React.useState([]);

  const powerSeedKey = React.useMemo(() => JSON.stringify(powerSeed ?? null), [powerSeed]);
  const windSeedKey = React.useMemo(() => JSON.stringify(windSeed ?? null), [windSeed]);

  // store 种子变更时重置曲线（装配/替换 template-fill 后须反映新数据）
  React.useEffect(() => {
    if (Array.isArray(powerSeed)) {
      setRealtimePower(powerSeed.length > 0 ? powerSeed : []);
    } else {
      setRealtimePower([]);
    }
  }, [powerSeedKey]);
  React.useEffect(() => {
    if (Array.isArray(windSeed)) {
      setRealtimeWind(windSeed.length > 0 ? windSeed : []);
    } else {
      setRealtimeWind([]);
    }
  }, [windSeedKey]);

  const realtimePowerBounds = React.useMemo(() => {
    const rows = Array.isArray(powerSeed) ? powerSeed : [];
    if (!rows.length) return { vmin: 400, vmax: 1100, pmin: 600, pmax: 900 };
    const vals = rows.map((r) => Number(r.value)).filter((n) => Number.isFinite(n));
    const plans = rows
      .map((r) => Number(r.plan_power != null ? r.plan_power : r.orders))
      .filter((n) => Number.isFinite(n));
    const ext = (ns) => {
      const lo = Math.min(...ns);
      const hi = Math.max(...ns);
      const s = Math.max(hi - lo, 1e-6);
      return { lo: lo - s * 0.15, hi: hi + s * 0.15 };
    };
    const ve = ext(vals);
    const pe = ext(plans);
    return { vmin: ve.lo, vmax: ve.hi, pmin: pe.lo, pmax: pe.hi };
  }, [powerSeed]);

  const realtimeWindBounds = React.useMemo(() => {
    const rows = Array.isArray(windSeed) ? windSeed : [];
    if (!rows.length) return { vmin: 2, vmax: 18 };
    const vals = rows.map((r) => Number(r.value)).filter((n) => Number.isFinite(n));
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const s = Math.max(hi - lo, 0.5);
    return { vmin: Math.max(0, lo - s * 0.2), vmax: hi + s * 0.2 };
  }, [windSeed]);

  React.useEffect(() => {
    if (currentPage !== 1) return;
    const interval = setInterval(() => {
      setRealtimePower((prev) => {
        if (!prev || prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const parts = last.time.split(":");
        const m = (parseInt(parts[1], 10) + 1) % 60;
        const h = m === 0 ? (parseInt(parts[0], 10) + 1) % 24 : parseInt(parts[0], 10);
        const lastPlan = last.plan_power != null ? last.plan_power : last.orders;
        const next = {
          time: `${h}:${String(m).padStart(2, "0")}`,
          value: Math.max(
            realtimePowerBounds.vmin,
            Math.min(realtimePowerBounds.vmax, last.value + Math.floor((Math.random() - 0.48) * 60))
          ),
          plan_power: Math.max(
            realtimePowerBounds.pmin,
            Math.min(realtimePowerBounds.pmax, lastPlan + Math.floor((Math.random() - 0.5) * 20))
          ),
        };
        const arr = [...prev, next];
        return arr.length > maxPoints ? arr.slice(arr.length - maxPoints) : arr;
      });
      setRealtimeWind((prev) => {
        if (!prev || prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const parts = last.time.split(":");
        const m = (parseInt(parts[1], 10) + 1) % 60;
        const h = m === 0 ? (parseInt(parts[0], 10) + 1) % 24 : parseInt(parts[0], 10);
        const lv = parseFloat(last.value);
        const next = {
          time: `${h}:${String(m).padStart(2, "0")}`,
          value: +Math.max(
            realtimeWindBounds.vmin,
            Math.min(realtimeWindBounds.vmax, lv + (Math.random() - 0.47) * 2)
          ).toFixed(1),
        };
        const arr = [...prev, next];
        return arr.length > maxPoints ? arr.slice(arr.length - maxPoints) : arr;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [currentPage, realtimePowerBounds, realtimeWindBounds]);

  return (
    <div ref={boardRootRef} style={{
      position: "relative",
      width: 2560,
      height: 900,
      display: "flex",
      flexDirection: "column",
      background: "var(--color-bg)",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      overflow: "hidden",
      boxSizing: "border-box"
    }}>
      {/* 全局样式：滑竿右侧光点呼吸动画 */}
      <style>{`
        @keyframes dv-knob-breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
            box-shadow:
              0 0 8px color-mix(in srgb, var(--dv-knob-accent) 80%, transparent),
              0 0 16px color-mix(in srgb, var(--dv-knob-accent) 45%, transparent),
              inset 0 0 4px color-mix(in srgb, var(--dv-knob-accent) 50%, transparent);
          }
          50% {
            transform: scale(1.22);
            opacity: 0.9;
            box-shadow:
              0 0 12px var(--dv-knob-accent),
              0 0 28px color-mix(in srgb, var(--dv-knob-accent) 75%, transparent),
              inset 0 0 6px color-mix(in srgb, var(--dv-knob-accent) 70%, transparent);
          }
        }
        @keyframes dv-knob-dot-breathe {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.35); }
        }
        @keyframes dv-kpi-ring-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes dv-slide-in-left {
          from { transform: translateX(-60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes dv-slide-out-left {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-60px); opacity: 0; }
        }
        @keyframes dv-slide-in-right {
          from { transform: translateX(60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes dv-slide-out-right {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(60px); opacity: 0; }
        }
        .dv-page-enter-left {
          animation: dv-slide-in-left 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .dv-page-enter-right {
          animation: dv-slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .dv-glowbar-knob,
          .dv-glowbar-knob-dot {
            animation: none !important;
          }
        }
      `}</style>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <img
          src="/wind_power_bg.png"
          alt=""
          aria-hidden
          style={{ width: "100%", height: "100%", objectFit: "fill", display: "block",filter:"brightness(110%) contrast(120%) hue-rotate(215deg) saturate(15%)" }}
        />
      </div>

      {/* ============ Header ============ */}
      <header style={{
        position: "relative",
        zIndex: 1,
        height: 72,
        flexShrink: 0,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        background: "transparent",
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <BoardHeroBackdrop id="hero-default" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        {/* 左：天气 */}
        <div style={{
          position: "absolute",
          left: "var(--space-4)",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          color: "var(--color-text-secondary)",
          fontSize: "var(--font-size-sm)"
        }}>
          <span style={{
            padding: "2px var(--space-2)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-primary)",
            fontFamily: "var(--font-display)",
            fontWeight: "var(--font-weight-semibold)",
            letterSpacing: "var(--letter-spacing-wide)"
          }}>{headerChrome.city || "—"}</span>
          <span>{headerChrome.weather || ""}</span>
        </div>
        {/* 中：主标题 */}
        <h1
          data-widget-key="title"
          data-widget-type="Title"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            margin: 0,
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-bold)",
            fontFamily: "var(--font-display)",
            letterSpacing: "var(--letter-spacing-wide)",
            color: "var(--color-text-primary)",
            lineHeight: "var(--line-height-tight)",
            textAlign: "center",
            pointerEvents: "none",
            textShadow: "0 0 16px color-mix(in srgb, var(--color-primary) 55%, transparent), 0 1px 2px color-mix(in srgb, var(--color-bg) 60%, transparent)",
            zIndex: 1
          }}
        >
        
          {"风电智慧运营"}
        </h1>
        {/* 右：日期时间 */}
        <div style={{
          position: "absolute",
          right: "var(--space-4)",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          color: "var(--color-text-secondary)",
          fontSize: "var(--font-size-sm)",
          fontFamily: "var(--font-display)",
          letterSpacing: "var(--letter-spacing-wide)"
        }}>
          <span>{dateStr}</span>
          <span>{weekStr}</span>
          <span style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-primary)",
            textShadow: "0 0 8px color-mix(in srgb, var(--color-primary) 55%, transparent)"
          }}>{timeStr}</span>
        </div>
      </header>

      {/* ============ Main ============ */}
      <main style={{
        position: "relative",
        zIndex: 1,
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
        gap: "var(--space-3)",
        padding: "var(--space-3)"
      }}>
        {/* ============ 左栏 ============ */}
        <div style={{
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          position: "relative"
        }}>
          {/* Page 0 · 左栏内容 */}
          <div key={"left-p0-" + currentPage} className={currentPage === 0 && pageChangedRef.current ? "dv-page-enter-left" : undefined} style={{
            position: "absolute",
            inset: 0,
            display: currentPage === 0 ? "grid" : "none",
            gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "var(--space-3)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden"
          }}>
          {/* 左·Panel 1 · 发电量完成情况 */}
          {<PanelShell headerTitle={"发电量完成情况"}>
<div style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "200px minmax(0, 1fr)",
              gap: "var(--space-2)",
              minHeight: 0,
              minWidth: 0
            }}>
              {/* 3 个发电量 KPI 纵向 */}
              <div style={{
                display: "grid",
                gridTemplateRows: "repeat(3, minmax(0, 1fr))",
                gap: "var(--space-2)",
                minHeight: 0,
                minWidth: 0
              }}>
                {(genProgress.items || []).map((bar, i) => (
                  <div key={i} style={{ minHeight: 0, minWidth: 0, overflow: "hidden", display: "flex", alignItems: "center" }}>
                    {<KpiGlowBar {...bar} />}
                  </div>
                ))}
              </div>
              {/* 折线趋势 */}
              {chartCell(<Widget config={widgets.p0_chart_hours} />)}
            </div>
</PanelShell>}

          {/* 左·Panel 2 · 生产基地项目情况 + 装机容量 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "var(--space-3)",
            minHeight: 0,
            minWidth: 0
          }}>
            {/* 生产基地项目情况 */}
            {<PanelShell headerTitle={"生产基地项目情况"}>
<div style={{
                flex: 1,
                display: "grid",
                gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
                gap: "var(--space-2)",
                minHeight: 0
              }}>
                {/* Row 1 · 绿色 */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "160px minmax(0, 1fr)",
                  gap: "var(--space-3)",
                  alignItems: "center",
                  minHeight: 0,
                  minWidth: 0,
                  overflow: "hidden"
                }}>
                  <div style={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}>
                    <KpiPercentStat
                      tone="success"
                      label={productionBase.capacity?.label}
                      current={productionBase.capacity?.current}
                      total={productionBase.capacity?.total}
                    />
                  </div>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                    minHeight: 0,
                    minWidth: 0,
                    overflow: "hidden",
                    justifyContent: "center"
                  }}>
                    {(productionBase.capacityBars || []).map((b, i) => (
                      <React.Fragment key={i}><KpiGlowBar {...b} tone="success" /></React.Fragment>
                    ))}
                  </div>
                </div>
                {/* Row 2 · 琥珀色 */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "160px minmax(0, 1fr)",
                  gap: "var(--space-3)",
                  alignItems: "center",
                  minHeight: 0,
                  minWidth: 0,
                  overflow: "hidden"
                }}>
                  <div style={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}>
                    <KpiPercentStat
                      tone="warning"
                      label={productionBase.plan?.label}
                      current={productionBase.plan?.current}
                      total={productionBase.plan?.total}
                    />
                  </div>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                    minHeight: 0,
                    minWidth: 0,
                    overflow: "hidden",
                    justifyContent: "center"
                  }}>
                    {(productionBase.planBars || []).map((b, i) => (
                      <React.Fragment key={i}><KpiGlowBar {...b} tone="warning" /></React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
</PanelShell>}
            {/* 装机容量 */}
            {<PanelShell headerTitle={"装机容量"}>
              {chartCell(<Widget config={widgets.p0_chart_capacity} />)}
            </PanelShell>}
          </div>
          </div>

          {/* Page 1 · 左栏内容 · 实时监控 */}
          <div key={"left-p1-" + currentPage} className={currentPage === 1 && pageChangedRef.current ? "dv-page-enter-left" : undefined} style={{
            position: "absolute",
            inset: 0,
            display: currentPage === 1 ? "grid" : "none",
            gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "var(--space-3)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden"
          }}>
            {/* 左·P1·Panel 1 · 实时功率曲线 */}
            {<PanelShell headerTitle={"实时功率监控"}>
<div style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-2)", minHeight: 0 }}>
                  {(powerKpi.items || []).map((b, i) => (
                    <div key={i} style={{ minHeight: 0, minWidth: 0, overflow: "hidden", display: "flex", alignItems: "center" }}>
                      {<KpiGlowBar {...b} />}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
                  {chartCell(<Widget config={{
                    ...widgets.p1_chart_power_realtime,
                    props: { ...widgets.p1_chart_power_realtime.props, staticData: realtimePower, dataKey: undefined }
                  }} />)}
                </div>
              </div>
</PanelShell>}

            {/* 左·P1·Panel 2 · 风速监测 */}
            {<PanelShell headerTitle={"风速实时监测"}>
<div style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-2)", minHeight: 0 }}>
                  {(windKpi.items || []).map((b, i) => (
                    <div key={i} style={{ minHeight: 0, minWidth: 0, overflow: "hidden", display: "flex", alignItems: "center" }}>
                      {<KpiGlowBar {...b} />}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
                  {chartCell(<Widget config={{
                    ...widgets.p1_chart_wind_speed,
                    props: { ...widgets.p1_chart_wind_speed.props, staticData: realtimeWind, dataKey: undefined }
                  }} />)}
                </div>
              </div>
</PanelShell>}
          </div>
        </div>

        {/* ============ 中栏 ============ */}
        <div style={{
          display: "grid",
          gridTemplateRows: "104px minmax(0, 1fr)",
          gap: "var(--space-3)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          {/* 中·顶·5 个核心 KPI */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "var(--space-2)",
            minHeight: 0,
            minWidth: 0
          }}>
            {[widgets.p0_kpi_farms, widgets.p0_kpi_units, widgets.p0_kpi_avail, widgets.p0_kpi_emission, widgets.p0_kpi_clean].map((w, i) => (
              <div key={i} style={{ minHeight: 0, minWidth: 0, overflow: "hidden", position: "relative", display: "flex", alignItems: "center" }}>
                {/* 旋转圆环装饰 */}
                <div style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 44,
                  height: 44,
                  pointerEvents: "none",
                  zIndex: 2
                }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" style={{ animation: "dv-kpi-ring-spin 4s linear infinite", display: "block" }}>
                    <circle cx="22" cy="22" r="20" fill="none" stroke="color-mix(in srgb, var(--color-primary) 15%, transparent)" strokeWidth="1.5" />
                    <circle cx="22" cy="22" r="20" fill="none" stroke="color-mix(in srgb, var(--color-primary) 80%, transparent)" strokeWidth="1.5" strokeDasharray="18 108" strokeLinecap="round" />
                  </svg>
                </div>
                <Widget config={w} />
              </div>
            ))}
          </div>

          {/* 中·主视觉·GEO 地图 */}
          <div style={{
            position: "relative",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
            borderRadius: "var(--radius-sm)",
            background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 70%)"
          }}>
            <Widget config={{
              type: "GeoMap",
              props: {
                geoJsonPath: "/map/100000.json",
                mapName: "china",
                areaColor: _viWithAlpha(pal.bg, 0.4),
                borderColor: _viWithAlpha(pal.primary, 0.22),
                emphasisAreaColor: _viWithAlpha(pal.success, 0.55),
                emphasisBorderColor: pal.primary,
                labelColor: _viWithAlpha(pal.textMuted, 0.8),
                backgroundColor: "transparent",
                autoHighlight: true,
                highlightInterval: 3000,
                onHighlightChange: setActiveProvince,
                scatterColor: pal.primary,
                scatterSize: 4,
                scatterData: mapScatterData
              }
            }} />
            {/* 底部锚点示例（设施点位 / 监测点位 tabs） */}
            <div style={{
              position: "absolute",
              left: "var(--space-3)",
              bottom: "var(--space-3)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-1)",
              zIndex: 1
            }}>
              <span style={{
                padding: "4px var(--space-2)",
                background: "color-mix(in srgb, var(--color-primary) 18%, transparent)",
                border: "1px solid var(--color-primary)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-primary)",
                fontSize: "var(--font-size-xs)",
                letterSpacing: "var(--letter-spacing-wide)"
              }}>{mapLegendChrome.on || "● 设施点位"}</span>
              <span style={{
                padding: "4px var(--space-2)",
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-xs)",
                letterSpacing: "var(--letter-spacing-wide)"
              }}>{mapLegendChrome.off || "○ 监测点位"}</span>
            </div>
            {/* 右下角区域信息卡（同步高亮省份） */}
            <div style={{
              position: "absolute",
              right: "var(--space-3)",
              bottom: "var(--space-3)",
              minWidth: 200,
              padding: "var(--space-2) var(--space-3)",
              background: "color-mix(in srgb, var(--color-surface) 90%, transparent)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-sm)",
              zIndex: 1
            }}>
              <div style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-display)",
                fontWeight: "var(--font-weight-semibold)",
                fontSize: "var(--font-size-md)",
                marginBottom: "var(--space-1)"
              }}>{activeProvince}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                <div>{regionCardLabels.volumeLabel || "总发电量"} <span style={{ color: "var(--color-text-primary)" }}>{localeNum(provinceInfo.power)} {regionCardLabels.volumeUnit || "kWh"}</span></div>
                <div>{regionCardLabels.scaleLabel || "区域装机"} <span style={{ color: "var(--color-text-primary)" }}>{localeNum(provinceInfo.capacity)} {regionCardLabels.scaleUnit || "MW"}</span></div>
                <div>{regionCardLabels.sitesLabel || "场站数量"} <span style={{ color: "var(--color-text-primary)" }}>{localeNum(provinceInfo.farms)} {regionCardLabels.sitesUnit || "个"}</span></div>
                <div>{regionCardLabels.rateLabel || "可利用率"} <span style={{ color: "var(--color-primary)" }}>{localeNum(provinceInfo.rate)} {regionCardLabels.rateUnit || "%"}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ 右栏 ============ */}
        <div style={{
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          position: "relative"
        }}>
          {/* Page 0 · 右栏内容 */}
          <div key={"right-p0-" + currentPage} className={currentPage === 0 && pageChangedRef.current ? "dv-page-enter-right" : undefined} style={{
            position: "absolute",
            inset: 0,
            display: currentPage === 0 ? "grid" : "none",
            gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "var(--space-3)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden"
          }}>
          {/* 右·Panel 1 · 业务系统智慧物流 */}
          {<PanelShell headerTitle={"业务系统智慧物流"}>
<div style={{
              flex: 1,
              display: "grid",
              gridTemplateRows: "112px minmax(0, 1fr)",
              gap: "var(--space-2)",
              minHeight: 0
            }}>
              {/* 顶：2 KPI */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-2)",
                minHeight: 0
              }}>
                <div style={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}>
                  {<FramedStat tone="success" {...transitSummary.running} />}
                </div>
                <div style={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}>
                  {<FramedStat tone="warning" {...transitSummary.abnormal} />}
                </div>
              </div>
              {/* 底：进度条 + 环形图 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
                gap: "var(--space-3)",
                minHeight: 0
              }}>
                {/* 当日运单数情况 · 进度条组 */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                  padding: "var(--space-2) var(--space-3)",
                  background: "transparent",
                  minHeight: 0,
                  overflow: "hidden"
                }}>
                  {/* 区块标题：左圆环图标 + 文案 + 长横线 + 右尾装饰 */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)"
                  }}>
                    <span aria-hidden style={{
                      width: 16,
                      height: 16,
                      borderRadius: "var(--radius-pill)",
                      border: "1.5px solid var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "var(--shadow-md)"
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: "var(--radius-pill)",
                        background: "var(--color-primary)",
                        boxShadow: "0 0 4px var(--color-primary)"
                      }} />
                    </span>
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--font-size-md)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-primary)",
                      letterSpacing: "var(--letter-spacing-wide)",
                      flexShrink: 0
                    }}>{dailyOrders.title}</span>
                    <span style={{
                      flex: 1,
                      height: 1,
                      background: "linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 45%, transparent) 0%, transparent 100%)"
                    }} />
                    <span aria-hidden style={{
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--font-size-md)",
                      lineHeight: 1,
                      flexShrink: 0,
                      textShadow: "0 0 4px color-mix(in srgb, var(--color-primary) 60%, transparent)"
                    }}>◀◀</span>
                  </div>

                  {/* 两条指标进度条 */}
                  {(dailyOrders.bars || []).map((b, i) => (
                    <div key={i}>{<KpiGlowBar {...b} />}</div>
                  ))}
                </div>
                {/* 在途设备占比 · 环形图 */}
                {chartCell(<Widget config={widgets.p0_chart_device} />)}
              </div>
            </div>
</PanelShell>}

          {/* 右·Panel 2 · 业务系统运维 */}
          {<PanelShell headerTitle={"业务系统运维"}>
<div style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
              gap: "var(--space-3)",
              minHeight: 0
            }}>
              {/* 左：3 KPI 横向并列 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "var(--space-2)",
                minHeight: 0,
                alignItems: "center"
              }}>
                {(maintenanceMetrics.items || []).map((it, i) => (
                  <div key={i} style={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}>
                    {<KpiGaugeStat {...it} />}
                  </div>
                ))}
              </div>
              {/* 右：3 个金色环形工单计数 */}
              <div style={{
                minHeight: 0,
                minWidth: 0,
                overflow: "hidden",
                padding: "var(--space-2)",
                background: "transparent",
                border: "none",
                borderRadius: 0,
                display: "grid",
                gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                columnGap: "var(--space-2)",
                rowGap: "var(--space-2)",
                boxSizing: "border-box"
              }}>
                {(workOrders.items || []).map((it, i) => {
                  const layout =
                    i === 0
                      ? { gridRow: "1 / 2", gridColumn: "1 / 3" }
                      : i === 1
                        ? { gridRow: "2 / 3", gridColumn: "1 / 2" }
                        : { gridRow: "2 / 3", gridColumn: "2 / 3" };
                  return (
                    <div key={i} style={{
                      ...layout,
                      minHeight: 0,
                      minWidth: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{ aspectRatio: "1 / 1", height: "100%", maxWidth: "100%" }}>
                        {<RingStat {...it} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
</PanelShell>}
          </div>

          {/* Page 1 · 右栏内容 · 实时监控 */}
          <div key={"right-p1-" + currentPage} className={currentPage === 1 && pageChangedRef.current ? "dv-page-enter-right" : undefined} style={{
            position: "absolute",
            inset: 0,
            display: currentPage === 1 ? "grid" : "none",
            gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "var(--space-3)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden"
          }}>
            {/* 右·P1·Panel 1 · 实时告警列表 */}
            {<PanelShell headerTitle={"实时告警列表"}>
<Widget config={{
                  type: "Table",
                  props: {
                    dataSlotId: "p1.table.alarm_list",
                    pageIndex: 1,
                    dataKey: "alarm_list",
                    columns: [
                      { field: "triggered_at", label: "时间", width: 120 },
                      { field: "name", label: "设备", width: 100 },
                      { field: "metric", label: "告警类型" },
                      { field: "trend", label: "等级", cellType: "tag", tagVariantMap: { "上升": "danger", "下降": "warning", "持平": "info" } }
                    ],
                    size: "small",
                    striped: true,
                    showIndex: false,
                    autoScroll: true,
                    autoScrollSpeed: 25,
                    showFooter: false,
                    style: {
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      borderRadius: 0
                    }
                  }
                }} />
</PanelShell>}

            {/* 右·P1·Panel 2 · 设备运行日志 */}
            {<PanelShell headerTitle={"设备运行日志"}>
<Widget config={{
                  type: "Table",
                  props: {
                    dataSlotId: "p1.table.device_log",
                    pageIndex: 1,
                    dataKey: "device_log_list",
                    columns: [
                      { field: "triggered_at", label: "时间", width: 120 },
                      { field: "department", label: regionCardLabels.logsColumnLabel || "区域" },
                      { field: "name", label: "事件" },
                      { field: "value", label: "功率", format: "number", unit: "kW", align: "right" }
                    ],
                    size: "small",
                    striped: true,
                    showIndex: false,
                    autoScroll: true,
                    autoScrollSpeed: 40,
                    showFooter: false,
                    style: {
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      borderRadius: 0
                    }
                  }
                }} />
</PanelShell>}
          </div>
        </div>
      </main>

      {/* ============ Footer ============ */}
      <footer
        role="navigation"
        aria-label="分页导航"
        style={{
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
          height: 56,
          boxSizing: "border-box",
          background: "transparent",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <BoardFooterBackdrop id="footer-default" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-6)",
          padding: "0 var(--space-8)"
        }}>
          {[
            { label: "总览", page: 0 },
            { label: "实时监控", page: 1 }
          ].map((it, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePageChange(it.page)}
              style={{
                margin: 0,
                padding: "0 var(--space-3)",
                border: "none",
                borderRadius: 0,
                borderBottom: currentPage === it.page
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
                background: "transparent",
                boxShadow: "none",
                color: currentPage === it.page ? "var(--color-primary)" : "var(--color-text-secondary)",
                fontFamily: "var(--font-display)",
                fontSize: "var(--font-size-sm)",
                fontWeight: currentPage === it.page ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
                letterSpacing: "var(--letter-spacing-wide)",
                textShadow: currentPage === it.page ? "0 0 6px color-mix(in srgb, var(--color-primary) 55%, transparent)" : "none",
                cursor: "pointer"
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

function scalarForUi(value) {
  if (value == null) return "";
  const t = typeof value;
  if (t === "number") return Number.isFinite(value) ? String(value) : "";
  if (t === "string") return value;
  if (t === "boolean" || t === "bigint") return String(value);
  return "";
}

/** 图表/指标数值：避免 NaN 作为 React 子节点 */
function localeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString() : "—";
}

function KpiGlowBar({ label, value, unit = "", max, dir = "up", iconId, tone = "success" }) {
  const accent = tone === "warning" ? "var(--color-accent-gold)" : "var(--color-primary)";
  const safeMax = Math.max(1, Number(max) || 1);
  const pct = Math.max(0, Math.min(100, Math.round((Number(value) / safeMax) * 100)));
  const formatted =
    typeof value === "number" && Number.isFinite(value)
      ? value.toLocaleString()
      : scalarForUi(value) || "—";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: 0, width: "100%" }}>
      {iconId ? (
        <div
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            color: accent,
            filter: `drop-shadow(0 0 6px color-mix(in srgb, ${accent} 55%, transparent))`,
          }}
        >
          <BoardPresetIcon id={iconId} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
      ) : null}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "var(--space-2)",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-md)",
              color: "var(--color-text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {scalarForUi(label)}
          </span>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4, flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: "var(--font-weight-bold)",
                fontSize: "var(--font-size-xl)",
                color: "var(--color-text-primary)",
                lineHeight: 1,
              }}
            >
              {formatted}
            </span>
            {unit ? (
              <span
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: accent,
                  textShadow: `0 0 4px color-mix(in srgb, ${accent} 55%, transparent)`,
                }}
              >
                {scalarForUi(unit)}
              </span>
            ) : null}
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                color: accent,
                textShadow: `0 0 4px color-mix(in srgb, ${accent} 55%, transparent)`,
              }}
            >
              {dir === "up" ? "↑" : dir === "down" ? "↓" : ""}
            </span>
          </span>
        </div>
        <div style={{ position: "relative", height: 14, display: "flex", alignItems: "center" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 2,
              background: `color-mix(in srgb, ${accent} 12%, transparent)`,
              borderRadius: "var(--radius-pill)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              width: `${pct}%`,
              height: 3,
              background: accent,
              boxShadow: `0 0 8px color-mix(in srgb, ${accent} 65%, transparent), 0 0 2px color-mix(in srgb, ${accent} 90%, transparent)`,
              borderRadius: "var(--radius-pill)",
            }}
          />
          <div
            className="dv-glowbar-knob"
            style={{
              position: "absolute",
              left: `calc(${pct}% - 7px)`,
              width: 14,
              height: 14,
              borderRadius: "var(--radius-pill)",
              border: `2px solid ${accent}`,
              background: "transparent",
              ["--dv-knob-color"]: accent,
              ["--dv-knob-accent"]: accent,
              boxShadow: `0 0 8px color-mix(in srgb, ${accent} 80%, transparent), 0 0 16px color-mix(in srgb, ${accent} 45%, transparent), inset 0 0 4px color-mix(in srgb, ${accent} 50%, transparent)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "dv-knob-breathe 1.8s ease-in-out infinite",
              willChange: "transform, box-shadow, opacity",
            }}
          >
            <span
              className="dv-glowbar-knob-dot"
              style={{
                width: 4,
                height: 4,
                borderRadius: "var(--radius-pill)",
                background: accent,
                boxShadow: `0 0 4px ${accent}`,
                animation: "dv-knob-dot-breathe 1.8s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RingStat({ label, value, unit = "", tone = "success" }) {
  const accent =
    tone === "warning"
      ? "var(--color-accent-gold)"
      : tone === "neutral"
        ? "var(--color-text-muted)"
        : "var(--color-primary)";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        borderRadius: "var(--radius-pill)",
        background: `radial-gradient(circle at 50% 45%, color-mix(in srgb, ${accent} 28%, transparent) 0%, color-mix(in srgb, ${accent} 8%, transparent) 55%, transparent 100%)`,
        border: `1.5px solid color-mix(in srgb, ${accent} 75%, transparent)`,
        boxShadow: `inset 0 0 24px color-mix(in srgb, ${accent} 25%, transparent), 0 0 16px color-mix(in srgb, ${accent} 35%, transparent), 0 0 32px color-mix(in srgb, ${accent} 18%, transparent)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-1)",
        padding: "var(--space-3)",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: "var(--radius-pill)",
          border: `1px solid color-mix(in srgb, ${accent} 35%, transparent)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-primary)",
          letterSpacing: "var(--letter-spacing-wide)",
          lineHeight: 1.35,
          textAlign: "center",
          maxWidth: "85%",
          wordBreak: "break-word",
          position: "relative",
          zIndex: 1,
        }}
      >
        {scalarForUi(label)}
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          gap: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-text-primary)",
            lineHeight: 1,
            textShadow: `0 0 10px color-mix(in srgb, ${accent} 70%, transparent), 0 0 24px color-mix(in srgb, ${accent} 35%, transparent)`,
          }}
        >
          {scalarForUi(value)}
        </span>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>{scalarForUi(unit)}</span>
      </div>
    </div>
  );
}

function KpiPercentStat({ tone = "success", label, current, total, percent }) {
  const accent = tone === "warning" ? "var(--color-accent-gold)" : "var(--color-primary)";
  const rawPct =
    percent != null ? Number(percent) : Math.round((Number(current) / Math.max(1, Number(total))) * 100);
  const pctDisplay = Number.isFinite(rawPct) ? rawPct : "—";

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-1)",
        padding: "var(--space-2)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--font-weight-bold)",
            fontSize: "var(--font-size-3xl)",
            color: "var(--color-text-primary)",
            lineHeight: 1,
            letterSpacing: "var(--letter-spacing-wide)",
            textShadow: `0 0 10px color-mix(in srgb, ${accent} 45%, transparent)`,
          }}
        >
          {pctDisplay}
        </span>
        <span
          style={{
            fontSize: "var(--font-size-lg)",
            color: accent,
            textShadow: `0 0 6px color-mix(in srgb, ${accent} 55%, transparent)`,
          }}
        >
          %
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--font-size-md)",
          color: "var(--color-text-secondary)",
          letterSpacing: "var(--letter-spacing-wide)",
          lineHeight: 1.2,
        }}
      >
        <span style={{ color: accent }}>{localeNum(current)}</span>
        <span style={{ margin: "0 6px", color: "var(--color-text-muted)" }}>/</span>
        <span>{localeNum(total)}</span>
      </div>
      {label ? (
        <div
          style={{
            marginTop: "var(--space-1)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
            letterSpacing: "var(--letter-spacing-wide)",
            lineHeight: "var(--line-height-normal)",
            textAlign: "center",
          }}
        >
          {scalarForUi(label)}
        </div>
      ) : null}
    </div>
  );
}

function FramedStat({ tone = "success", iconId, title, value, unit }) {
  const accent = tone === "warning" ? "var(--color-warning)" : "var(--color-primary)";
  const boxSize = 88;
  const cornerSize = 14;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-2)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: boxSize,
          height: boxSize,
          flexShrink: 0,
          border: `1px solid color-mix(in srgb, ${accent} 60%, transparent)`,
          borderRadius: "var(--radius-sm)",
          background: `radial-gradient(ellipse at center, color-mix(in srgb, ${accent} 18%, transparent) 0%, transparent 70%)`,
          boxShadow: `inset 0 0 16px color-mix(in srgb, ${accent} 22%, transparent), 0 0 8px color-mix(in srgb, ${accent} 18%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: -1,
            left: -1,
            width: cornerSize,
            height: cornerSize,
            borderTop: `2px solid ${accent}`,
            borderLeft: `2px solid ${accent}`,
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: -1,
            right: -1,
            width: cornerSize,
            height: cornerSize,
            borderTop: `2px solid ${accent}`,
            borderRight: `2px solid ${accent}`,
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: -1,
            left: -1,
            width: cornerSize,
            height: cornerSize,
            borderBottom: `2px solid ${accent}`,
            borderLeft: `2px solid ${accent}`,
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: cornerSize,
            height: cornerSize,
            borderBottom: `2px solid ${accent}`,
            borderRight: `2px solid ${accent}`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: 48,
            height: 48,
            filter: `drop-shadow(0 0 6px color-mix(in srgb, ${accent} 70%, transparent))`,
          }}
        >
          <BoardPresetIcon id={iconId} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "var(--space-1)",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-md)",
            color: "var(--color-text-secondary)",
            letterSpacing: "var(--letter-spacing-wide)",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {scalarForUi(title)}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-1)" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--font-size-3xl)",
              fontWeight: "var(--font-weight-bold)",
              color: accent,
              lineHeight: 1,
              letterSpacing: "var(--letter-spacing-wide)",
              textShadow: `0 0 12px color-mix(in srgb, ${accent} 60%, transparent), 0 0 24px color-mix(in srgb, ${accent} 35%, transparent)`,
            }}
          >
            {scalarForUi(value)}
          </span>
          {unit ? (
            <span style={{ fontSize: "var(--font-size-sm)", color: accent, opacity: 0.85 }}>{scalarForUi(unit)}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function KpiGaugeStat({ iconId, title, value, unit, tone = "success" }) {
  const accent = tone === "warning" ? "var(--color-accent-gold)" : "var(--color-primary)";
  const iconSize = 68;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        padding: "var(--space-2)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: iconSize + 40,
          height: iconSize + 16,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 14,
            background: `radial-gradient(ellipse at 50% 100%, color-mix(in srgb, ${accent} 55%, transparent) 0%, color-mix(in srgb, ${accent} 0%, transparent) 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 2,
            width: iconSize + 10,
            height: 16,
            transform: "translateX(-50%) perspective(80px) rotateX(60deg)",
            background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 45%, transparent), color-mix(in srgb, ${accent} 8%, transparent))`,
            border: `1px solid color-mix(in srgb, ${accent} 55%, transparent)`,
            boxShadow: `0 0 12px color-mix(in srgb, ${accent} 45%, transparent)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            width: iconSize,
            height: iconSize,
            color: accent,
            filter: `drop-shadow(0 0 8px color-mix(in srgb, ${accent} 75%, transparent))`,
          }}
        >
          <BoardPresetIcon id={iconId} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
      </div>

      {title ? (
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
            letterSpacing: "var(--letter-spacing-wide)",
            lineHeight: 1.35,
            textAlign: "center",
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          {scalarForUi(title)}
        </div>
      ) : null}

      <div style={{ display: "inline-flex", alignItems: "baseline", gap: "var(--space-1)" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--font-weight-bold)",
            fontSize: "var(--font-size-2xl)",
            color: "var(--color-text-primary)",
            lineHeight: 1,
            letterSpacing: "var(--letter-spacing-wide)",
            textShadow: `0 0 10px color-mix(in srgb, ${accent} 45%, transparent)`,
          }}
        >
          {typeof value === "number" && Number.isFinite(value)
            ? value.toLocaleString()
            : scalarForUi(value)}
        </span>
        {unit ? (
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{scalarForUi(unit)}</span>
        ) : null}
      </div>
    </div>
  );
}

function PanelShell({ headerTitle, style, children }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        background: "transparent",
        border: "none",
        borderRadius: 0,
        boxShadow: "none",
        ...(style || {}),
      }}
    >
      {headerTitle ? (
        <div
          style={{
            height: 32,
            flexShrink: 0,
            display: "flex",
            alignItems: "stretch",
            gap: "var(--space-1)",
            background: "transparent",
          }}
        >
          <span
            style={{
              width: 4,
              alignSelf: "stretch",
              background: "var(--color-primary)",
              boxShadow: "0 0 6px var(--color-primary)",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              padding: "0 var(--space-3)",
              backgroundImage:
                "linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 100%)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                letterSpacing: "var(--letter-spacing-wide)",
              }}
            >
              {scalarForUi(headerTitle)}
            </span>
          </div>
        </div>
      ) : null}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          padding: "var(--space-2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
