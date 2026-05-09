export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);

  const chartColors = ["#E879F9","#818CF8","#22D3EE","#4ADE80","#FBBF24","#FB7185"];

  const widgets = {
    // ========== Page 0 (生产全域总览) ==========
    p0_kpi1: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.output",
        pageIndex: 0,
        title: "产量",
        dataKey: "p0_output",
        presetIconId: "preset-icon-1",
        unit: "件",
        format: "number",
        trend: true,
        trendDirection: "up",
        trendValue: "+5.2%",
        comparison: { type: "yoy", label: "同比" }
      }
    },
    p0_kpi2: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.yield",
        pageIndex: 0,
        title: "良品率",
        dataKey: "p0_yield",
        presetIconId: "preset-icon-2",
        unit: "%",
        format: "percentage",
        trend: true,
        trendDirection: "down",
        trendValue: "-0.3%",
        comparison: { type: "target", label: "目标99%" }
      }
    },
    p0_kpi3: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.oee",
        pageIndex: 0,
        title: "OEE",
        dataKey: "p0_oee",
        presetIconId: "preset-icon-3",
        unit: "%",
        format: "percentage",
        trend: true,
        trendDirection: "up",
        trendValue: "+1.1%",
        comparison: { type: "target", label: "目标85%" }
      }
    },
    p0_kpi4: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.completion",
        pageIndex: 0,
        title: "工单完成率",
        dataKey: "p0_completion",
        presetIconId: "preset-icon-4",
        unit: "%",
        format: "percentage",
        trend: true,
        trendDirection: "up",
        trendValue: "+2%",
        comparison: { type: "target", label: "目标95%" }
      }
    },
    p0_chart_main: {
      type: "LineChart",
      props: {
        dataSlotId: "p0.chart.trend",
        pageIndex: 0,
        title: "产量与良品率趋势",
        dataKey: "p0_trend",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "hour", label: "小时" },
        yAxis: [
          { field: "output", label: "产量", color: "#818CF8" },
          { field: "yield", label: "良品率", unit: "%", color: "#4ADE80" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: [chartColors[1], chartColors[3]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p0_chart_left1: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.bar_lines",
        pageIndex: 0,
        title: "产线绩效对比",
        dataKey: "p0_line_perf",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "line", label: "产线" },
        yAxis: { field: "value", label: "绩效" },
        showLegend: true,
        showGrid: true,
        colorScheme: chartColors.slice(0,4),
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p0_chart_left2: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.downtime",
        pageIndex: 0,
        title: "停机时间分布",
        dataKey: "p0_downtime",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "section", label: "工段" },
        yAxis: { field: "duration", label: "停机时长", unit: "min" },
        showGrid: true,
        colorScheme: [chartColors[2]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p0_chart_right1: {
      type: "PieChart",
      props: {
        dataSlotId: "p0.chart.heatmap",
        pageIndex: 0,
        title: "质量异常产线热力图",
        dataKey: "p0_heatmap",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        nameField: "line",
        valueField: "count",
        showPercentage: true,
        showLegend: true,
        legendPosition: "bottom",
        colorScheme: chartColors.slice(0,5),
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        legendTextColor: "var(--dv-chart-legend-text)"
      }
    },
    p0_chart_right2: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.alerts",
        pageIndex: 0,
        title: "当前告警概览",
        dataKey: "p0_alerts_count",
        presetIconId: "preset-icon-5",
        unit: "条",
        format: "number",
        trend: true,
        trendDirection: "down",
        trendValue: "-2",
        comparison: { type: "target", label: "预警阈值<5" }
      }
    },

    // ========== Page 1 (质量追溯与根因分析) ==========
    p1_kpi1: {
      type: "KPI",
      props: {
        dataSlotId: "p1.kpi.yield",
        pageIndex: 1,
        title: "选定区域良品率",
        dataKey: "p1_yield",
        presetIconId: "preset-icon-1",
        unit: "%",
        format: "percentage",
        trend: true,
        trendDirection: "down",
        trendValue: "-1.2%",
        comparison: { type: "target", label: "目标98%" }
      }
    },
    p1_kpi2: {
      type: "KPI",
      props: {
        dataSlotId: "p1.kpi.batch_yield",
        pageIndex: 1,
        title: "批次良品率",
        dataKey: "p1_batch_yield",
        presetIconId: "preset-icon-2",
        unit: "%",
        format: "percentage",
        trend: true,
        trendDirection: "down",
        trendValue: "-0.8%",
        comparison: { type: "target", label: "目标99%" }
      }
    },
    p1_kpi3: {
      type: "KPI",
      props: {
        dataSlotId: "p1.kpi.defect_count",
        pageIndex: 1,
        title: "不良原因总数",
        dataKey: "p1_defect_total",
        presetIconId: "preset-icon-3",
        unit: "件",
        format: "number",
        trend: true,
        trendDirection: "up",
        trendValue: "+15",
        comparison: { type: "yoy", label: "同比" }
      }
    },
    p1_chart_main: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.heatmap",
        pageIndex: 1,
        title: "工序良品率分布热力图",
        dataKey: "p1_heatmap",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "process", label: "工序" },
        yAxis: { field: "yield", label: "良品率", unit: "%" },
        showLegend: true,
        showGrid: true,
        colorScheme: ["#E879F9","#818CF8","#22D3EE","#4ADE80","#FBBF24","#FB7185"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p1_chart_left1: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.defect_reasons",
        pageIndex: 1,
        title: "不良原因TOP5",
        dataKey: "p1_defect_top5",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "reason", label: "原因" },
        yAxis: { field: "ratio", label: "占比", unit: "%" },
        showGrid: true,
        colorScheme: chartColors.slice(0,5),
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p1_chart_left2: {
      type: "Table",
      props: {
        dataSlotId: "p1.table.batch_detail",
        pageIndex: 1,
        title: "物料批次明细",
        dataKey: "p1_batch_detail",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        columns: [
          { field: "batch", label: "批次", width: 80 },
          { field: "yield", label: "良品率", width: 70, unit: "%" },
          { field: "defect", label: "不良数", width: 70 },
          { field: "firstCheck", label: "首件检验", width: 90 }
        ],
        pagination: true,
        pageSize: 5,
        showIndex: true,
        striped: true
      }
    },
    p1_chart_left3: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.param_compare",
        pageIndex: 1,
        title: "工序参数对比",
        dataKey: "p1_param_compare",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "param", label: "参数" },
        yAxis: { field: "value", label: "值" },
        showLegend: true,
        showGrid: true,
        colorScheme: [chartColors[0], chartColors[4]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p1_chart_right1: {
      type: "LineChart",
      props: {
        dataSlotId: "p1.chart.batch_trend",
        pageIndex: 1,
        title: "物料批次历史趋势",
        dataKey: "p1_batch_trend",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "hour", label: "小时" },
        yAxis: [{ field: "yield", label: "良品率", unit: "%", color: "#E879F9" }],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: [chartColors[0]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p1_chart_right2: {
      type: "AreaChart",
      props: {
        dataSlotId: "p1.chart.history_compare",
        pageIndex: 1,
        title: "同工序不良历史对比",
        dataKey: "p1_history_compare",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "date", label: "日期" },
        yAxis: [{ field: "good", label: "良品率", unit: "%", color: "#4ADE80" }, { field: "bad", label: "不良率", unit: "%", color: "#FB7185" }],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: [chartColors[3], chartColors[5]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },

    // ========== Page 2 (设备效率与能耗诊断) ==========
    p2_kpi1: {
      type: "KPI",
      props: {
        dataSlotId: "p2.kpi.oee",
        pageIndex: 2,
        title: "当日OEE",
        dataKey: "p2_oee",
        presetIconId: "preset-icon-1",
        unit: "%",
        format: "percentage",
        trend: true,
        trendDirection: "up",
        trendValue: "+0.5%",
        comparison: { type: "target", label: "目标85%" }
      }
    },
    p2_kpi2: {
      type: "KPI",
      props: {
        dataSlotId: "p2.kpi.downtime",
        pageIndex: 2,
        title: "总停机时间",
        dataKey: "p2_downtime",
        presetIconId: "preset-icon-2",
        unit: "min",
        format: "number",
        trend: true,
        trendDirection: "up",
        trendValue: "+10%",
        comparison: { type: "target", label: "阈值<30" }
      }
    },
    p2_kpi3: {
      type: "KPI",
      props: {
        dataSlotId: "p2.kpi.takt",
        pageIndex: 2,
        title: "生产节拍",
        dataKey: "p2_takt",
        presetIconId: "preset-icon-3",
        unit: "s",
        format: "number",
        trend: true,
        trendDirection: "down",
        trendValue: "-5%",
        comparison: { type: "target", label: "标准30s" }
      }
    },
    p2_kpi4: {
      type: "KPI",
      props: {
        dataSlotId: "p2.kpi.energy",
        pageIndex: 2,
        title: "单位产量能耗",
        dataKey: "p2_energy",
        presetIconId: "preset-icon-4",
        unit: "kWh/件",
        format: "decimal",
        trend: true,
        trendDirection: "up",
        trendValue: "+8%",
        comparison: { type: "target", label: "目标0.5" }
      }
    },
    p2_chart_main: {
      type: "BarChart",
      props: {
        dataSlotId: "p2.chart.oee_breakdown",
        pageIndex: 2,
        title: "OEE拆解树状图",
        dataKey: "p2_oee_breakdown",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "line", label: "产线/机台" },
        yAxis: { field: "loss", label: "损耗占比", unit: "%" },
        showLegend: true,
        showGrid: true,
        colorScheme: [chartColors[2], chartColors[3], chartColors[5]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p2_chart_left1: {
      type: "LineChart",
      props: {
        dataSlotId: "p2.chart.scatter",
        pageIndex: 2,
        title: "能耗与产量散点图",
        dataKey: "p2_scatter",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "output", label: "产量" },
        yAxis: [{ field: "energy", label: "单位能耗", unit: "kWh/件", color: "#FBBF24" }],
        showLegend: true,
        showGrid: true,
        smooth: false,
        colorScheme: [chartColors[4]],
        echartsOptionOverrides: {
          series: [{
            type: "scatter",
            symbolSize: 10,
            itemStyle: { opacity: 0.7 }
          }]
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p2_chart_left2: {
      type: "BarChart",
      props: {
        dataSlotId: "p2.chart.takt_compare",
        pageIndex: 2,
        title: "生产节拍对比",
        dataKey: "p2_takt_compare",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "station", label: "工位" },
        yAxis: { field: "takt", label: "节拍", unit: "s" },
        showTarget: true,
        targetValue: 30,
        showLegend: true,
        showGrid: true,
        colorScheme: [chartColors[1]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p2_chart_left3: {
      type: "BarChart",
      props: {
        dataSlotId: "p2.chart.team_compare",
        pageIndex: 2,
        title: "班组OEE与能耗对比",
        dataKey: "p2_team_compare",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "team", label: "班组" },
        yAxis: { field: "value", label: "指标" },
        showLegend: true,
        showGrid: true,
        colorScheme: [chartColors[2], chartColors[4]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    p2_chart_right1: {
      type: "LineChart",
      props: {
        dataSlotId: "p2.chart.energy_trend",
        pageIndex: 2,
        title: "能耗趋势与停机关联",
        dataKey: "p2_energy_trend",
        titleBackdrop: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)"
        },
        xAxis: { field: "hour", label: "小时" },
        yAxis: [
          { field: "energy", label: "能耗", unit: "kWh", color: "#FBBF24" },
          { field: "downtime", label: "停机时间", unit: "min", color: "#FB7185" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: [chartColors[4], chartColors[5]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },

    // 筛选器
    p_filter_date: {
      type: "DateRangePicker",
      props: {
        label: "时间范围",
        defaultValue: "last_30_days",
        presets: [
          { label: "今天", value: "today" },
          { label: "最近7天", value: "last_7_days" },
          { label: "最近30天", value: "last_30_days" }
        ]
      }
    },
    p_filter_line: {
      type: "Select",
      props: {
        label: "产线",
        placeholder: "全部产线",
        multiple: false,
        options: [
          { label: "产线A", value: "A" },
          { label: "产线B", value: "B" },
          { label: "产线C", value: "C" }
        ]
      }
    }
  };

  const cardStyle = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
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
    { key: "overview", title: "总览" },
    { key: "trace", title: "追溯分析" },
    { key: "diagnose", title: "设备能耗" }
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

  // ===== Page 0 =====
  const Page0 = () => (
    <main style={{
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      display: "grid",
      gridTemplateRows: "120px minmax(0, 1fr)",
      gap: "var(--space-3)",
      padding: "var(--space-3)"
    }}>
      {/* 顶部KPI横条 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "var(--space-3)",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden"
      }}>
        <Widget config={widgets.p0_kpi1} />
        <Widget config={widgets.p0_kpi2} />
        <Widget config={widgets.p0_kpi3} />
        <Widget config={widgets.p0_kpi4} />
      </div>
      {/* 三栏主视觉区 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 5fr) minmax(0, 2fr)",
        gap: "var(--space-3)",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden"
      }}>
        {/* 左栏：两个BarChart垂直均分 */}
        <div style={{
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-3)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p0_chart_left1} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p0_chart_left2} />
          </div>
        </div>
        {/* 中栏：主视觉LineChart */}
        <div style={chartPanelShellStyle}>
          <Widget config={widgets.p0_chart_main} />
        </div>
        {/* 右栏：PieChart + KPI垂直均分 */}
        <div style={{
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-3)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p0_chart_right1} />
          </div>
          <div style={{...chartPanelShellStyle, ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden"}}>
            <Widget config={widgets.p0_chart_right2} />
          </div>
        </div>
      </div>
    </main>
  );

  // ===== Page 1 =====
  const Page1 = () => (
    <main style={{
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      display: "grid",
      gridTemplateRows: "120px minmax(0, 1fr)",
      gap: "var(--space-3)",
      padding: "var(--space-3)"
    }}>
      {/* 顶部KPI横条 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "var(--space-3)",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden"
      }}>
        <Widget config={widgets.p1_kpi1} />
        <Widget config={widgets.p1_kpi2} />
        <Widget config={widgets.p1_kpi3} />
      </div>
      {/* 三栏主视觉区 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 5fr) minmax(0, 2fr)",
        gap: "var(--space-3)",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden"
      }}>
        {/* 左栏：三个组件垂直均分 */}
        <div style={{
          display: "grid",
          gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          gap: "var(--space-3)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p1_chart_left1} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p1_chart_left2} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p1_chart_left3} />
          </div>
        </div>
        {/* 中栏：主视觉BarChart（热力图） */}
        <div style={chartPanelShellStyle}>
          <Widget config={widgets.p1_chart_main} />
        </div>
        {/* 右栏：两个组件垂直均分 */}
        <div style={{
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-3)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p1_chart_right1} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p1_chart_right2} />
          </div>
        </div>
      </div>
    </main>
  );

  // ===== Page 2 =====
  const Page2 = () => (
    <main style={{
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      display: "grid",
      gridTemplateRows: "120px minmax(0, 1fr)",
      gap: "var(--space-3)",
      padding: "var(--space-3)"
    }}>
      {/* 顶部KPI横条 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "var(--space-3)",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden"
      }}>
        <Widget config={widgets.p2_kpi1} />
        <Widget config={widgets.p2_kpi2} />
        <Widget config={widgets.p2_kpi3} />
        <Widget config={widgets.p2_kpi4} />
      </div>
      {/* 三栏主视觉区 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 5fr) minmax(0, 2fr)",
        gap: "var(--space-3)",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden"
      }}>
        {/* 左栏：三个组件垂直均分 */}
        <div style={{
          display: "grid",
          gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          gap: "var(--space-3)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p2_chart_left1} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p2_chart_left2} />
          </div>
          <div style={chartPanelShellStyle}>
            <Widget config={widgets.p2_chart_left3} />
          </div>
        </div>
        {/* 中栏：主视觉BarChart（OEE拆解） */}
        <div style={chartPanelShellStyle}>
          <Widget config={widgets.p2_chart_main} />
        </div>
        {/* 右栏：一个组件占满 */}
        <div style={chartPanelShellStyle}>
          <Widget config={widgets.p2_chart_right1} />
        </div>
      </div>
    </main>
  );

  const pageRenders = [<Page0 key="p0" />, <Page1 key="p1" />, <Page2 key="p2" />];

  return (
    <div style={{
      position: "relative",
      width: 1920,
      height: 1080,
      display: "flex",
      flexDirection: "column",
      background: "var(--color-bg)",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      overflow: "hidden",
      boxSizing: "border-box"
    }}>
      {/* 整页画布底纹 */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <BoardPageBackdrop id="page-default" style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {/* 顶栏 Header */}
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
            智慧工厂质量管控追溯看板
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
              padding: "var(--space-1) var(--space-3) 0",
              borderTopLeftRadius: "var(--radius-md)",
              borderTopRightRadius: "var(--radius-md)",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              border: "1px solid var(--color-border)",
              borderBottom: "none",
              boxSizing: "border-box"
            }}
          >
            <Widget config={widgets.p_filter_date} enableData={false} />
            <Widget config={widgets.p_filter_line} enableData={false} />
          </div>
        </div>
      </header>

      {/* 页面主体 */}
      {pageRenders[currentPage]}

      {/* 多分页底部 footer */}
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