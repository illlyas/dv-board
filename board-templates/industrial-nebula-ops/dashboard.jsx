export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);

  const chartColors = ["#22D3EE","#38BDF8","#818CF8","#34D399","#FBBF24","#FB7185"];

  const widgets = {
    // P1 KPI
    p1_kpi1: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.oee",
        pageIndex: 0,
        title: "OEE",
        presetIconId: "kpi-sync-refresh",
        dataKey: "oee_value",
        unit: "%",
        trend: true,
        trendDirection: "up",
        trendValue: "+1.2%",
        miniChart: { seriesKey: "spark_oee", kind: "line", height: 32 },
        presentation: { layout: "header-inline", surface: "card", valueGlow: "inherit" }
      }
    },
    p1_kpi2: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.output",
        pageIndex: 0,
        title: "产出率",
        presetIconId: "kpi-analytics-bars",
        dataKey: "output_rate_value",
        unit: "件/h",
        trend: true,
        trendDirection: "down",
        trendValue: "-3.5%",
        comparison: { type: "yoy", label: "同比" },
        miniChart: { seriesKey: "spark_output", kind: "line", height: 32 },
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" }
      }
    },
    p1_kpi3: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.yield",
        pageIndex: 0,
        title: "良品率",
        presetIconId: "kpi-insight-badge",
        dataKey: "yield_rate_value",
        unit: "%",
        format: "percentage",
        trend: true,
        trendDirection: "up",
        trendValue: "+0.5%",
        miniChart: { seriesKey: "spark_yield", kind: "line", height: 32 },
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" }
      }
    },
    p1_kpi4: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.order",
        pageIndex: 0,
        title: "订单完成率",
        presetIconId: "kpi-capsule",
        dataKey: "order_completion_value",
        unit: "%",
        trend: true,
        trendDirection: "up",
        trendValue: "+2.1%",
        comparison: { type: "wow", label: "较上日" },
        miniChart: { seriesKey: "spark_order", kind: "line", height: 32 },
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" }
      }
    },
    p1_kpi5: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.failure",
        pageIndex: 0,
        title: "故障率",
        presetIconId: "kpi-pharmacy",
        dataKey: "failure_rate_value",
        unit: "%",
        trend: true,
        trendDirection: "down",
        trendValue: "-0.8%",
        miniChart: { seriesKey: "spark_failure", kind: "line", height: 32 },
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" }
      }
    },
    // P1 核心图表
    p1_chart1: {
      type: "LineChart",
      props: {
        dataSlotId: "p0.chart.oeetrend",
        pageIndex: 0,
        title: "OEE & 产出率趋势",
        titleBackdrop: true,
        dataKey: "oee_output_trend",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "date", label: "时间(小时)" },
        yAxis: [
          { field: "oee", label: "OEE (%)", color: "#22D3EE" },
          { field: "output_rate", label: "产出率 (件/h)", color: "#818CF8" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: ["#22D3EE","#818CF8"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: {
          animationDuration: 600,
          series: [
            {
              name: "OEE",
              type: "line",
              smooth: true,
              lineStyle: { width: 3 },
              itemStyle: { color: "#22D3EE" },
              markLine: { data: [{ yAxis: 85, lineStyle: { color: "#34D399", type: "dashed" } }], label: { formatter: "目标 85%" } }
            },
            {
              name: "产出率",
              type: "line",
              smooth: true,
              yAxisIndex: 1,
              lineStyle: { width: 3 },
              itemStyle: { color: "#818CF8" }
            }
          ]
        }
      }
    },
    p1_chart2: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.failuretop5",
        pageIndex: 0,
        title: "设备故障率 Top5",
        titleBackdrop: true,
        dataKey: "failure_top5",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "device", label: "设备" },
        yAxis: { field: "failure_rate", label: "故障率 (%)" },
        showLegend: false,
        showGrid: true,
        colorScheme: ["#FB7185"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: { animationDuration: 400 }
      }
    },
    p1_chart3: {
      type: "DonutChart",
      props: {
        dataSlotId: "p0.chart.orderdonut",
        pageIndex: 0,
        title: "订单完成率分布",
        titleBackdrop: true,
        dataKey: "order_completion_dist",
        nameField: "status",
        valueField: "count",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colorScheme: ["#34D399","#FB7185","#64748B"],
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        echartsOptionOverrides: { animationDuration: 400 }
      }
    },
    p1_chart4: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.outputbyworkshop",
        pageIndex: 0,
        title: "各车间产出率对比",
        titleBackdrop: true,
        dataKey: "workshop_output",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "workshop", label: "车间" },
        yAxis: { field: "output_rate", label: "产出率 (件/h)" },
        showLegend: false,
        showGrid: true,
        colorScheme: ["#38BDF8"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: { animationDuration: 400 }
      }
    },
    p1_table1: {
      type: "Table",
      props: {
        dataSlotId: "p0.table.alerts",
        pageIndex: 0,
        title: "实时告警列表",
        titleBackdrop: true,
        dataKey: "alerts",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        columns: [
          { field: "time", label: "时间", width: 120 },
          { field: "device", label: "设备", width: 100 },
          { field: "metric", label: "指标", width: 80 },
          { field: "level", label: "级别", width: 70 },
          { field: "status", label: "状态", width: 80 }
        ],
        pagination: true,
        pageSize: 5,
        showIndex: true,
        striped: true
      }
    },

    // P2 KPI
    p2_kpi1: {
      type: "KPI",
      props: {
        dataSlotId: "p1.kpi.output",
        pageIndex: 1,
        title: "产出率",
        presetIconId: "kpi-package",
        dataKey: "output_rate_value",
        unit: "件/h",
        trend: true,
        trendDirection: "up",
        trendValue: "+1.8%",
        miniChart: { seriesKey: "spark_output", kind: "line", height: 32 },
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" }
      }
    },
    p2_kpi2: {
      type: "KPI",
      props: {
        dataSlotId: "p1.kpi.yield",
        pageIndex: 1,
        title: "良品率",
        presetIconId: "kpi-sync-refresh",
        dataKey: "yield_rate_value",
        unit: "%",
        trend: true,
        trendDirection: "down",
        trendValue: "-0.3%",
        miniChart: { seriesKey: "spark_yield", kind: "line", height: 32 },
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" }
      }
    },
    p2_kpi3: {
      type: "KPI",
      props: {
        dataSlotId: "p1.kpi.failure",
        pageIndex: 1,
        title: "故障率",
        presetIconId: "kpi-analytics-bars",
        dataKey: "failure_rate_value",
        unit: "%",
        trend: true,
        trendDirection: "up",
        trendValue: "+0.2%",
        miniChart: { seriesKey: "spark_failure", kind: "line", height: 32 },
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" }
      }
    },
    // P2 核心图表
    p2_chart1: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.outputbyline",
        pageIndex: 1,
        title: "各产线产出率排名",
        titleBackdrop: true,
        dataKey: "line_output_rank",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "line", label: "产线" },
        yAxis: { field: "output_rate", label: "产出率 (件/h)" },
        showLegend: false,
        showGrid: true,
        direction: "horizontal",
        colorScheme: ["#22D3EE"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: { animationDuration: 400 }
      }
    },
    p2_chart2: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.outputbystation",
        pageIndex: 1,
        title: "各工位产出率分布",
        titleBackdrop: true,
        dataKey: "station_output",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "station", label: "工位" },
        yAxis: { field: "output_rate", label: "产出率 (件/h)" },
        showLegend: false,
        showGrid: true,
        colorScheme: ["#818CF8"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: { animationDuration: 400 }
      }
    },
    p2_chart3: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.yieldvoutput",
        pageIndex: 1,
        title: "良品率 vs 产出率分布",
        titleBackdrop: true,
        dataKey: "yield_output_scatter",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "output_rate", label: "产出率" },
        yAxis: { field: "yield_rate", label: "良品率 (%)" },
        showLegend: false,
        showGrid: true,
        colorScheme: ["#FBBF24"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: { animationDuration: 400, series: [{ type: "scatter", symbolSize: 8 }] }
      }
    },
    p2_chart4: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.failuretopbyline",
        pageIndex: 1,
        title: "设备故障率排行榜",
        titleBackdrop: true,
        dataKey: "device_failure_rank",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "device", label: "设备" },
        yAxis: { field: "failure_rate", label: "故障率 (%)" },
        showLegend: false,
        showGrid: true,
        colorScheme: ["#FB7185"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: { animationDuration: 400 }
      }
    },
    p2_chart5: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.yieldbyprodtype",
        pageIndex: 1,
        title: "产品类型良品率对比",
        titleBackdrop: true,
        dataKey: "product_yield",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "product_type", label: "产品类型" },
        yAxis: { field: "yield_rate", label: "良品率 (%)" },
        showLegend: false,
        showGrid: true,
        markLine: { data: [{ yAxis: 95, label: { formatter: "目标 95%" }, lineStyle: { color: "#34D399", type: "dashed" } }] },
        colorScheme: ["#38BDF8"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: { animationDuration: 400 }
      }
    },
    p2_table1: {
      type: "Table",
      props: {
        dataSlotId: "p1.table.batchquality",
        pageIndex: 1,
        title: "物料批次质量明细",
        titleBackdrop: true,
        dataKey: "batch_quality",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        columns: [
          { field: "batch", label: "批次号", width: 120 },
          { field: "product_type", label: "产品类型", width: 100 },
          { field: "line", label: "产线", width: 100 },
          { field: "yield_rate", label: "良品率 (%)", width: 100 },
          { field: "time", label: "时间", width: 120 }
        ],
        pagination: true,
        pageSize: 5,
        showIndex: true,
        striped: true
      }
    },

    // P3 KPI
    p3_kpi1: {
      type: "KPI",
      props: {
        dataSlotId: "p2.kpi.energy",
        pageIndex: 2,
        title: "能耗",
        presetIconId: "kpi-insight-badge",
        dataKey: "energy_value",
        unit: "kWh",
        trend: true,
        trendDirection: "down",
        trendValue: "-5.2%",
        miniChart: { seriesKey: "spark_energy", kind: "line", height: 32 },
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" }
      }
    },
    p3_kpi2: {
      type: "KPI",
      props: {
        dataSlotId: "p2.kpi.auto_control",
        pageIndex: 2,
        title: "自动化控制率",
        presetIconId: "kpi-capsule",
        dataKey: "auto_control_value",
        unit: "%",
        trend: true,
        trendDirection: "up",
        trendValue: "+0.9%",
        comparison: { type: "mom", label: "月环比" },
        miniChart: { seriesKey: "spark_auto", kind: "line", height: 32 },
        presentation: { layout: "header-inline", surface: "card", valueGlow: "inherit" }
      }
    },
    p3_kpi3: {
      type: "KPI",
      props: {
        dataSlotId: "p2.kpi.failure",
        pageIndex: 2,
        title: "故障率",
        presetIconId: "kpi-pharmacy",
        dataKey: "failure_rate_value",
        unit: "%",
        trend: true,
        trendDirection: "up",
        trendValue: "+0.6%",
        miniChart: { seriesKey: "spark_failure", kind: "line", height: 32 },
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" }
      }
    },
    // P3 核心图表
    p3_chart1: {
      type: "AreaChart",
      props: {
        dataSlotId: "p2.chart.energytrend",
        pageIndex: 2,
        title: "能耗按车间趋势与基准",
        titleBackdrop: true,
        dataKey: "energy_trend",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "date", label: "时间(日)" },
        yAxis: [
          { field: "energy_workshopA", label: "车间A (kWh)", color: "#22D3EE" },
          { field: "energy_workshopB", label: "车间B (kWh)", color: "#38BDF8" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        area: true,
        colorScheme: ["#22D3EE","#38BDF8"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: {
          animationDuration: 600,
          markLine: { data: [{ yAxis: 100, lineStyle: { color: "#34D399", type: "dashed" } }], label: { formatter: "基准" } }
        }
      }
    },
    p3_chart2: {
      type: "LineChart",
      props: {
        dataSlotId: "p2.chart.autotrend",
        pageIndex: 2,
        title: "自动化控制率趋势",
        titleBackdrop: true,
        dataKey: "auto_rate_trend",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "date", label: "时间(日)" },
        yAxis: { field: "auto_control", label: "控制率 (%)" },
        showLegend: false,
        showGrid: true,
        smooth: true,
        colorScheme: ["#34D399"],
        markLine: { data: [{ yAxis: 85, label: { formatter: "目标" }, lineStyle: { color: "#818CF8", type: "dashed" } }] },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: { animationDuration: 400 }
      }
    },
    p3_chart3: {
      type: "BarChart",
      props: {
        dataSlotId: "p2.chart.healthscore",
        pageIndex: 2,
        title: "设备健康度评分排行榜",
        titleBackdrop: true,
        dataKey: "health_score_rank",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "device", label: "设备" },
        yAxis: { field: "health_score", label: "健康评分 (0-100)" },
        showLegend: false,
        showGrid: true,
        colorScheme: ["#FBBF24"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: { animationDuration: 400 }
      }
    },
    p3_chart4: {
      type: "BarChart",
      props: {
        dataSlotId: "p2.chart.energymom",
        pageIndex: 2,
        title: "单位能耗环比下降率",
        titleBackdrop: true,
        dataKey: "energy_mom",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "workshop", label: "车间" },
        yAxis: { field: "change_rate", label: "环比变化率 (%)" },
        showLegend: false,
        showGrid: true,
        colorScheme: ["#34D399","#FB7185"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: { animationDuration: 400 }
      }
    },
    p3_table1: {
      type: "Table",
      props: {
        dataSlotId: "p2.table.batchtrace",
        pageIndex: 2,
        title: "物料批次质量追溯表",
        titleBackdrop: true,
        dataKey: "batch_trace",
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        columns: [
          { field: "batch", label: "批次号", width: 120 },
          { field: "product_type", label: "产品类型", width: 100 },
          { field: "line", label: "产线", width: 100 },
          { field: "yield_rate", label: "良品率 (%)", width: 80 },
          { field: "faults", label: "故障记录", width: 120 },
          { field: "time", label: "时间", width: 120 }
        ],
        pagination: true,
        pageSize: 5,
        showIndex: true,
        striped: true
      }
    }
  };

  const cardStyle = {
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
    padding: "var(--space-4)",
    boxSizing: "border-box"
  };

  const chartPanelShellStyle = {
    height: "100%",
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
    boxSizing: "border-box"
  };

  const pageDefs = [
    { key: "overview", title: "总览·核心指标" },
    { key: "detail", title: "产线与质量分析" },
    { key: "diagnose", title: "能耗与设备运维诊断" }
  ];

  const tabButton = (i, label) => (
    <button
      key={i}
      type="button"
      onClick={() => setCurrentPage(i)}
      data-widget-key={`tab_${i}`}
      data-widget-type="Text"
      style={{
        margin: 0,
        padding: "0 var(--space-3)",
        border: "none",
        borderRadius: 0,
        borderBottom: currentPage === i ? "2px solid var(--color-primary)" : "2px solid transparent",
        background: "transparent",
        boxShadow: "none",
        color: currentPage === i ? "var(--color-primary)" : "var(--color-text-secondary)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--font-size-sm)",
        fontWeight: currentPage === i ? "var(--font-weight-semibold)" : "var(--font-weight-normal)",
        cursor: "pointer"
      }}
    >
      {label}
    </button>
  );

  const Page1 = () => (
    <main style={{
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      height: "100%",
      width: "100%",
      display: "grid",
      gridTemplateRows: "220px minmax(0, 1fr)",
      gap: "var(--space-4)",
      padding: "var(--space-4)"
    }}>
      {/* KPI 横条 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: "var(--space-3)",
        minWidth: 0,
        height: "100%",
        overflow: "hidden"
      }}>
        <Widget config={widgets.p1_kpi1} />
        <Widget config={widgets.p1_kpi2} />
        <Widget config={widgets.p1_kpi3} />
        <Widget config={widgets.p1_kpi4} />
        <Widget config={widgets.p1_kpi5} />
      </div>
      {/* 三栏主视觉区 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 4fr) minmax(0, 3fr) minmax(0, 2fr)",
        gridTemplateAreas: "\"left center right\"",
        gap: "var(--space-4)",
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        {/* 左栏 ★主视觉 */}
        <div style={{
          gridArea: "left",
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p1_chart1} />
          </div>
        </div>
        {/* 中栏 */}
        <div style={{
          gridArea: "center",
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p1_chart2} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p1_chart3} />
          </div>
        </div>
        {/* 右栏 */}
        <div style={{
          gridArea: "right",
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p1_chart4} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p1_table1} />
          </div>
        </div>
      </div>
    </main>
  );

  const Page2 = () => (
    <main style={{
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      height: "100%",
      width: "100%",
      display: "grid",
      gridTemplateRows: "220px minmax(0, 1fr)",
      gap: "var(--space-4)",
      padding: "var(--space-4)"
    }}>
      {/* KPI 横条 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "var(--space-3)",
        minWidth: 0,
        height: "100%",
        overflow: "hidden"
      }}>
        <Widget config={widgets.p2_kpi1} />
        <Widget config={widgets.p2_kpi2} />
        <Widget config={widgets.p2_kpi3} />
      </div>
      {/* 三栏主视觉区 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 4fr) minmax(0, 3fr) minmax(0, 2fr)",
        gridTemplateAreas: "\"left center right\"",
        gap: "var(--space-4)",
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        {/* 左栏 ★主视觉 */}
        <div style={{
          gridArea: "left",
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p2_chart1} />
          </div>
        </div>
        {/* 中栏 */}
        <div style={{
          gridArea: "center",
          display: "grid",
          gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p2_chart2} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p2_chart3} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p2_chart4} />
          </div>
        </div>
        {/* 右栏 */}
        <div style={{
          gridArea: "right",
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p2_chart5} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p2_table1} />
          </div>
        </div>
      </div>
    </main>
  );

  const Page3 = () => (
    <main style={{
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      height: "100%",
      width: "100%",
      display: "grid",
      gridTemplateRows: "220px minmax(0, 1fr)",
      gap: "var(--space-4)",
      padding: "var(--space-4)"
    }}>
      {/* KPI 横条 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "var(--space-3)",
        minWidth: 0,
        height: "100%",
        overflow: "hidden"
      }}>
        <Widget config={widgets.p3_kpi1} />
        <Widget config={widgets.p3_kpi2} />
        <Widget config={widgets.p3_kpi3} />
      </div>
      {/* 三栏主视觉区 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 4fr) minmax(0, 3fr) minmax(0, 2fr)",
        gridTemplateAreas: "\"left center right\"",
        gap: "var(--space-4)",
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        {/* 左栏 ★主视觉 */}
        <div style={{
          gridArea: "left",
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p3_chart1} />
          </div>
        </div>
        {/* 中栏 */}
        <div style={{
          gridArea: "center",
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p3_chart2} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p3_chart3} />
          </div>
        </div>
        {/* 右栏 */}
        <div style={{
          gridArea: "right",
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p3_chart4} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p3_table1} />
          </div>
        </div>
      </div>
    </main>
  );

  const pageRenders = [<Page1 key="p1" />, <Page2 key="p2" />, <Page3 key="p3" />];

  return (
    <div style={{
      position: "relative",
      width: 2560,
      height: 1080,
      display: "flex",
      flexDirection: "column",
      background: "var(--color-bg)",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      overflow: "hidden",
      boxSizing: "border-box"
    }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <BoardPageBackdrop id="page-default" style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
      <header style={{
        position: "relative",
        zIndex: 1,
        height: 96,
        padding: "0 var(--space-8)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <BoardHeroBackdrop id="hero-default" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          width: "100%",
          minWidth: 0,
          minHeight: 0,
          height: "100%"
        }}>
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
              letterSpacing: "var(--letter-spacing-tight)",
              color: "var(--color-text-primary)",
              lineHeight: "var(--line-height-tight)",
              textAlign: "center",
              pointerEvents: "none",
              textShadow: "0 0 12px color-mix(in srgb, var(--color-surface) 85%, transparent), 0 1px 2px color-mix(in srgb, var(--color-bg) 60%, transparent)"
            }}
          >
            {"智慧工厂 · 生产运营看板"}
          </h1>
          <div
            role="group"
            aria-label="筛选"
            style={{
              position: "absolute",
              zIndex: 1,
              right: "calc(-1 * var(--space-3))",
              bottom: 0,
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              flexShrink: 0,
              padding: "var(--space-1) var(--space-3) 0"
            }}
          >
            <Widget config={{ type: "DateRangePicker", props: { label: "时间范围", defaultValue: "last_30_days" }}} enableData={false} />
            {currentPage === 0 && (
              <Widget config={{ type: "Select", props: { label: "班次", placeholder: "全部", options: [{ label: "早班", value: "morning" }, { label: "中班", value: "mid" }, { label: "晚班", value: "night" }] }}} enableData={false} />
            )}
            {currentPage === 1 && (
              <>
                <Widget config={{ type: "Select", props: { label: "产线", placeholder: "全部产线", options: [{ label: "产线A", value: "lineA" }, { label: "产线B", value: "lineB" }] }}} enableData={false} />
                <Widget config={{ type: "MultiSelect", props: { label: "产品类型", placeholder: "全部", options: [{ label: "产品X", value: "X" }, { label: "产品Y", value: "Y" }] }}} enableData={false} />
              </>
            )}
            {currentPage === 2 && (
              <>
                <Widget config={{ type: "Select", props: { label: "车间", placeholder: "全部车间", options: [{ label: "车间A", value: "A" }, { label: "车间B", value: "B" }] }}} enableData={false} />
                <Widget config={{ type: "Select", props: { label: "设备类型", placeholder: "全部", options: [{ label: "机器人", value: "robot" }, { label: "数控机床", value: "cnc" }] }}} enableData={false} />
              </>
            )}
          </div>
        </div>
      </header>
      {pageRenders[currentPage]}
      <footer
        role="navigation"
        aria-label="分页"
        style={{
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
          height: 56,
          boxSizing: "border-box",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <BoardFooterBackdrop id="footer-default" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-6)",
            padding: "0 var(--space-8)"
          }}
        >
          {pageDefs.map((p, i) => tabButton(i, p.title))}
        </div>
      </footer>
    </div>
  );
}