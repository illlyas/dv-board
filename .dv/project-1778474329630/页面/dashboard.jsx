export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);

  const chartColors = ["#3B82F6","#0EA5E9","#22C55E","#F59E0B","#A855F7","#EF4444"];

  const widgets = {
    kpiGroupP1: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.group",
        pageIndex: 0,
        title: "生产指标",
        dataKey: "production_metrics",
        groupItems: [
          { id: "m_output", title: "产量", valueKey: "output", unit: "件", presetIconId: "kpi-sync-refresh", trend: true, trendDirection: "up", trendValue: "+5.2%", miniChart: { seriesKey: "spark_output", kind: "line", height: 40 } },
          { id: "m_plan_rate", title: "计划完成率", valueKey: "plan_rate", unit: "%", presetIconId: "kpi-analytics-bars", trend: true, trendDirection: "up", trendValue: "+2.1%", miniChart: { seriesKey: "spark_plan", kind: "line", height: 40 } },
          { id: "m_oee", title: "OEE", valueKey: "oee", unit: "%", presetIconId: "kpi-insight-badge", trend: true, trendDirection: "down", trendValue: "-0.8%", miniChart: { seriesKey: "spark_oee", kind: "line", height: 40 } }
        ],
        presentation: { layout: "metric-group-inline", surface: "hairline", valueGlow: "inherit" }
      }
    },
    chart1: {
      type: "LineChart",
      props: {
        dataSlotId: "p0.chart.output_trend",
        pageIndex: 0,
        title: "产量趋势折线图",
        dataKey: "daily_output_vs_plan",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "actual", label: "实际产量", color: "#3B82F6" },
          { field: "plan", label: "计划产量", color: "#F59E0B" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: ["#3B82F6","#F59E0B"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        echartsOptionOverrides: {
          animationDuration: 600,
          series: [
            { markLine: { data: [{ yAxis: 90, label: { formatter: '目标90%' } }], lineStyle: { type: 'dashed', color: '#EF4444' } } },
            {}
          ]
        }
      }
    },
    chart2: {
      type: "AreaChart",
      props: {
        dataSlotId: "p0.chart.oee_trend",
        pageIndex: 0,
        title: "OEE趋势面积图",
        dataKey: "oee_daily",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "date", label: "日期" },
        yAxis: [{ field: "oee", label: "OEE", color: "#22C55E" }],
        showLegend: true,
        showGrid: true,
        smooth: true,
        area: true,
        colorScheme: ["#22C55E"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        echartsOptionOverrides: {
          series: [{ markLine: { data: [{ yAxis: 85, label: { formatter: '目标85%' } }], lineStyle: { type: 'dashed', color: '#22C55E' } } }]
        }
      }
    },
    chart3: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.production_bar",
        pageIndex: 0,
        title: "产线产量对比柱状图",
        dataKey: "line_output_today",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "line", label: "产线" },
        yAxis: { field: "output", label: "产量", unit: "件" },
        showLegend: false,
        showGrid: true,
        colorScheme: [chartColors[0]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)"
      }
    },
    chart4: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.line_oee",
        pageIndex: 0,
        title: "产线OEE对比柱状图",
        dataKey: "line_oee_today",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "line", label: "产线" },
        yAxis: { field: "oee", label: "OEE", unit: "%" },
        showLegend: false,
        showGrid: true,
        colorScheme: [chartColors[2]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)"
      }
    },
    chart5: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.fault_rate_rank",
        pageIndex: 0,
        title: "设备故障率排行榜",
        dataKey: "device_fault_rate_top10",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "device", label: "设备" },
        yAxis: { field: "fault_rate", label: "故障率", unit: "%" },
        showLegend: false,
        showGrid: true,
        colorScheme: [chartColors[5]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
      }
    },
    table1: {
      type: "Table",
      props: {
        dataSlotId: "p0.table.downtime_top10",
        pageIndex: 0,
        title: "停机时长TOP10表",
        dataKey: "downtime_duration_top10",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        columns: [
          { field: "device", label: "设备", width: 120 },
          { field: "duration", label: "累计时长", width: 100, unit: "min" },
          { field: "count", label: "次数", width: 60 },
          { field: "reason", label: "原因分类", width: 140 }
        ],
        pagination: false,
        striped: true
      }
    },
    donut1: {
      type: "DonutChart",
      props: {
        dataSlotId: "p0.chart.plan_rate_dist",
        pageIndex: 0,
        title: "生产计划完成率达标分布",
        dataKey: "plan_rate_distribution",
        nameField: "status",
        valueField: "count",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colorScheme: [chartColors[2], chartColors[5]],
        echartsOptionOverrides: { tooltip: { trigger: 'item' } }
      }
    },
    kpiGroupP2: {
      type: "KPI",
      props: {
        dataSlotId: "p1.kpi.energy",
        pageIndex: 1,
        title: "能耗指标",
        dataKey: "energy_metrics",
        groupItems: [
          { id: "m_energy_total", title: "能耗总量", valueKey: "total_energy", unit: "kWh", presetIconId: "kpi-capsule", trend: true, trendDirection: "up", trendValue: "+3.1%", miniChart: { seriesKey: "spark_energy", kind: "line", height: 40 } },
          { id: "m_energy_unit", title: "单位能耗", valueKey: "unit_energy", unit: "kWh/件", presetIconId: "kpi-pharmacy", trend: true, trendDirection: "down", trendValue: "-0.5%", miniChart: { seriesKey: "spark_energy_unit", kind: "line", height: 40 } }
        ],
        presentation: { layout: "metric-group-inline", surface: "hairline", valueGlow: "inherit" }
      }
    },
    chart6: {
      type: "LineChart",
      props: {
        dataSlotId: "p1.chart.energy_dual",
        pageIndex: 1,
        title: "能耗总量与单位能耗双轴折线图",
        dataKey: "energy_time_series",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "total", label: "能耗总量(kWh)", color: "#3B82F6" },
          { field: "unit", label: "单位能耗(kWh/件)", color: "#F59E0B" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: ["#3B82F6", "#F59E0B"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        echartsOptionOverrides: {
          animationDuration: 600,
          series: [
            {},
            { yAxisIndex: 1, markLine: { data: [{ yAxis: 10, label: { formatter: '阈值10%' } }], lineStyle: { type: 'dashed', color: '#EF4444' } } }
          ]
        }
      }
    },
    chart7: {
      type: "PieChart",
      props: {
        dataSlotId: "p1.chart.energy_composition",
        pageIndex: 1,
        title: "能耗构成饼图",
        dataKey: "energy_type_distribution",
        nameField: "type",
        valueField: "value",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colorScheme: [chartColors[0], chartColors[1], chartColors[2], chartColors[3], chartColors[4], chartColors[5]],
        echartsOptionOverrides: { tooltip: { trigger: 'item' } }
      }
    },
    chart8: {
      type: "LineChart",
      props: {
        dataSlotId: "p1.chart.quality_dual",
        pageIndex: 1,
        title: "产品合格率与不良率双轴折线图",
        dataKey: "quality_time_series",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "pass_rate", label: "合格率(%)", color: "#22C55E" },
          { field: "defect_rate", label: "不良率(%)", color: "#EF4444" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: ["#22C55E", "#EF4444"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        echartsOptionOverrides: {
          series: [
            { markLine: { data: [{ yAxis: 99, label: { formatter: '目标99%' } }], lineStyle: { type: 'dashed', color: '#22C55E' } } },
            { yAxisIndex: 1, markLine: { data: [{ yAxis: 3, label: { formatter: '警戒3%' } }], lineStyle: { type: 'dashed', color: '#EF4444' } } }
          ]
        }
      }
    },
    chart9: {
      type: "AreaChart",
      props: {
        dataSlotId: "p1.chart.defect_stack",
        pageIndex: 1,
        title: "缺陷分类堆叠面积图",
        dataKey: "defect_daily_stack",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "date", label: "日期" },
        yAxis: [{ field: "count", label: "数量" }],
        showLegend: true,
        showGrid: true,
        smooth: true,
        area: true,
        colorScheme: [chartColors[0], chartColors[3], chartColors[4], chartColors[5]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)"
      }
    },
    chart10: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.process_quality",
        pageIndex: 1,
        title: "工序/班组质量对比柱状图",
        dataKey: "process_pass_rate",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "process", label: "工序/班组" },
        yAxis: { field: "pass_rate", label: "合格率", unit: "%" },
        showLegend: false,
        showGrid: true,
        colorScheme: [chartColors[0]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
      }
    },
    chart11: {
      type: "LineChart",
      props: {
        dataSlotId: "p1.chart.material_trend",
        pageIndex: 1,
        title: "原材料消耗趋势折线图",
        dataKey: "material_consumption_trend",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "date", label: "日期" },
        yAxis: [{ field: "consumption", label: "消耗量", unit: "kg" }],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: [chartColors[0]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
      }
    },
    donut2: {
      type: "DonutChart",
      props: {
        dataSlotId: "p1.chart.qualification_dist",
        pageIndex: 1,
        title: "产品合格率达标分布",
        dataKey: "qualification_distribution",
        nameField: "status",
        valueField: "count",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colorScheme: [chartColors[2], chartColors[5]],
        echartsOptionOverrides: { tooltip: { trigger: 'item' } }
      }
    },
    kpiGroupP3: {
      type: "KPI",
      props: {
        dataSlotId: "p2.kpi.diagnosis",
        pageIndex: 2,
        title: "诊断指标",
        dataKey: "diagnosis_metrics",
        groupItems: [
          { id: "m_cost", title: "成本总额", valueKey: "total_cost", unit: "万元", presetIconId: "kpi-package", trend: true, trendDirection: "up", trendValue: "+2.5%", miniChart: { seriesKey: "spark_cost", kind: "line", height: 40 } },
          { id: "m_profit", title: "利润", valueKey: "total_profit", unit: "万元", presetIconId: "kpi-capsule", trend: true, trendDirection: "down", trendValue: "-1.2%", miniChart: { seriesKey: "spark_profit", kind: "line", height: 40 } },
          { id: "m_oee_p3", title: "OEE", valueKey: "oee_p3", unit: "%", presetIconId: "kpi-insight-badge", trend: true, trendDirection: "down", trendValue: "-0.5%", miniChart: { seriesKey: "spark_oee_p3", kind: "line", height: 40 } }
        ],
        presentation: { layout: "metric-group-inline", surface: "hairline", valueGlow: "inherit" }
      }
    },
    chart12: {
      type: "BarChart",
      props: {
        dataSlotId: "p2.chart.oee_fault_dual",
        pageIndex: 2,
        title: "设备OEE与故障率双轴柱状图",
        dataKey: "device_oee_fault",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "device", label: "设备" },
        yAxis: { field: "oee", label: "OEE", unit: "%" },
        showLegend: true,
        showGrid: true,
        colorScheme: [chartColors[2], chartColors[5]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        echartsOptionOverrides: {
          series: [
            { name: "OEE", type: "bar", yAxisIndex: 0, markLine: { data: [{ yAxis: 85, label: { formatter: '目标85%' } }, { yAxis: 75, label: { formatter: '阈值75%' } }], lineStyle: { type: 'dashed', color: '#22C55E' } } },
            { name: "故障率", type: "bar", yAxisIndex: 1, markLine: { data: [{ yAxis: 5, label: { formatter: '阈值5%' } }, { yAxis: 10, label: { formatter: '阈值10%' } }], lineStyle: { type: 'dashed', color: '#EF4444' } } }
          ]
        }
      }
    },
    chart13: {
      type: "Table",
      props: {
        dataSlotId: "p2.chart.alarm_list",
        pageIndex: 2,
        title: "报警事件滚动列表",
        dataKey: "recent_alarms",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        columns: [
          { field: "time", label: "时间", width: 100 },
          { field: "device", label: "设备", width: 80 },
          { field: "type", label: "类型", width: 60 },
          { field: "level", label: "级别", width: 60 },
          { field: "status", label: "状态", width: 60 }
        ],
        pagination: false,
        striped: true
      }
    },
    chart14: {
      type: "LineChart",
      props: {
        dataSlotId: "p2.chart.cost_profit_dual",
        pageIndex: 2,
        title: "成本总额与利润双轴走势图",
        dataKey: "cost_profit_trend",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "cost", label: "成本总额(万元)", color: "#EF4444" },
          { field: "profit", label: "利润(万元)", color: "#22C55E" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: ["#EF4444", "#22C55E"],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        echartsOptionOverrides: {
          series: [
            {},
            { yAxisIndex: 1 }
          ]
        }
      }
    },
    chart15: {
      type: "PieChart",
      props: {
        dataSlotId: "p2.chart.profit_pie",
        pageIndex: 2,
        title: "利润产线占比饼图",
        dataKey: "profit_line_distribution",
        nameField: "line",
        valueField: "profit",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colorScheme: [chartColors[0], chartColors[1], chartColors[2], chartColors[3], chartColors[4], chartColors[5]],
        echartsOptionOverrides: { tooltip: { trigger: 'item' } }
      }
    },
    chart16: {
      type: "LineChart",
      props: {
        dataSlotId: "p2.chart.inventory_trend",
        pageIndex: 2,
        title: "库存周转率趋势折线图",
        dataKey: "inventory_turnover_trend",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "date", label: "日期" },
        yAxis: [{ field: "turnover", label: "周转率", unit: "次" }],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: [chartColors[0]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
      }
    },
    table2: {
      type: "Table",
      props: {
        dataSlotId: "p2.table.team_perf",
        pageIndex: 2,
        title: "班组绩效排名表",
        dataKey: "team_performance_ranking",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        columns: [
          { field: "rank", label: "排名", width: 40 },
          { field: "team", label: "班组", width: 80 },
          { field: "output", label: "产量", width: 60, unit: "件" },
          { field: "pass_rate", label: "合格率", width: 60, unit: "%" },
          { field: "fault_count", label: "故障次数", width: 60 }
        ],
        pagination: true,
        pageSize: 5,
        striped: true
      }
    },
    table3: {
      type: "Table",
      props: {
        dataSlotId: "p2.table.material_detail",
        pageIndex: 2,
        title: "原材料消耗排行表",
        dataKey: "material_consumption_ranking",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        columns: [
          { field: "line", label: "产线", width: 80 },
          { field: "material", label: "品类", width: 80 },
          { field: "consumption", label: "消耗量", width: 80, unit: "kg" },
          { field: "change", label: "环比", width: 60, unit: "%" }
        ],
        pagination: true,
        pageSize: 5,
        striped: true
      }
    },
    chart17: {
      type: "AreaChart",
      props: {
        dataSlotId: "p2.chart.oee_deep_dive",
        pageIndex: 2,
        title: "关键设备OEE趋势面积图",
        dataKey: "key_device_oee_trend",
        titleBackdrop: true,
        style: { border: "var(--dv-chart-panel-border)", padding: "var(--dv-chart-panel-padding)", borderRadius: "var(--dv-chart-panel-radius)", background: "var(--dv-chart-panel-bg)" },
        xAxis: { field: "date", label: "日期" },
        yAxis: [{ field: "oee", label: "OEE", unit: "%" }],
        showLegend: true,
        showGrid: true,
        smooth: true,
        area: true,
        colorScheme: [chartColors[0], chartColors[5]],
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
      }
    }
  };

  const cardStyle = {
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
    padding: "var(--space-4)",
    boxSizing: "border-box",
  };

  const chartPanelShellStyle = {
    height: "100%",
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
    boxSizing: "border-box",
  };

  const pageDefs = [
    { key: "overview", title: "生产与效率总览" },
    { key: "energy_quality", title: "能耗与质量监控" },
    { key: "diagnosis", title: "设备与运营诊断" },
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
        cursor: "pointer",
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
      gridTemplateRows: "200px minmax(0, 1fr)",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
    }}>
      <div style={{
        display: "flex",
        gap: "var(--space-3)",
        minWidth: 0,
        height: "100%",
        overflow: "hidden",
      }}>
        <div style={{ flex: 1, minWidth: 0, height: "100%" }}><Widget config={widgets.kpiGroupP1} /></div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 4fr) minmax(0, 3fr) minmax(0, 2fr)",
        gridTemplateAreas: "'left center right'",
        gap: "var(--space-4)",
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}>
        <div style={{
          gridArea: "left",
          display: "grid",
          gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart2} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart3} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart4} /></div>
        </div>
        <div style={{ ...chartPanelShellStyle, gridArea: "center" }}>
          <Widget config={widgets.chart1} />
        </div>
        <div style={{
          gridArea: "right",
          display: "grid",
          gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart5} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.table1} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.donut1} /></div>
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
      gridTemplateRows: "200px minmax(0, 1fr)",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
    }}>
      <div style={{
        display: "flex",
        gap: "var(--space-3)",
        minWidth: 0,
        height: "100%",
        overflow: "hidden",
      }}>
        <div style={{ flex: 1, minWidth: 0, height: "100%" }}><Widget config={widgets.kpiGroupP2} /></div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 4fr) minmax(0, 3fr) minmax(0, 2fr)",
        gridTemplateAreas: "'left center right'",
        gap: "var(--space-4)",
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}>
        <div style={{
          gridArea: "left",
          display: "grid",
          gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart7} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart8} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart10} /></div>
        </div>
        <div style={{ ...chartPanelShellStyle, gridArea: "center" }}>
          <Widget config={widgets.chart6} />
        </div>
        <div style={{
          gridArea: "right",
          display: "grid",
          gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart9} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart11} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.donut2} /></div>
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
      gridTemplateRows: "200px minmax(0, 1fr)",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
    }}>
      <div style={{
        display: "flex",
        gap: "var(--space-3)",
        minWidth: 0,
        height: "100%",
        overflow: "hidden",
      }}>
        <div style={{ flex: 1, minWidth: 0, height: "100%" }}><Widget config={widgets.kpiGroupP3} /></div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 4fr) minmax(0, 3fr) minmax(0, 2fr)",
        gridTemplateAreas: "'left center right'",
        gap: "var(--space-4)",
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}>
        <div style={{
          gridArea: "left",
          display: "grid",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart12} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart13} /></div>
        </div>
        <div style={{ ...chartPanelShellStyle, gridArea: "center" }}>
          <Widget config={widgets.chart14} />
        </div>
        <div style={{
          gridArea: "right",
          display: "grid",
          gridTemplateRows: "repeat(5, minmax(0, 1fr))",
          gap: "var(--space-4)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart15} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart16} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.table2} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.table3} /></div>
          <div style={chartPanelShellStyle}><Widget config={widgets.chart17} /></div>
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
      boxSizing: "border-box",
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
        boxSizing: "border-box",
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
          height: "100%",
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
              textShadow: "0 0 12px color-mix(in srgb, var(--color-surface) 85%, transparent), 0 1px 2px color-mix(in srgb, var(--color-bg) 60%, transparent)",
            }}
          >
            智慧工厂运营看板
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
            }}
          >
            <Widget config={{ type: "DateRangePicker", props: { label: "时间范围", defaultValue: "last_30_days" } }} enableData={false} />
            <Widget config={{ type: "Select", props: { label: "产线", placeholder: "全部产线", options: [{ label: "全部", value: "all" }] } }} enableData={false} />
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
          overflow: "hidden",
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
            padding: "0 var(--space-8)",
          }}
        >
          {pageDefs.map((p, i) => tabButton(i, p.title))}
        </div>
      </footer>
    </div>
  );
}