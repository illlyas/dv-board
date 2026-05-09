export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);

  const chartColors = ["#F59E0B","#EA580C","#FBBF24","#84CC16","#38BDF8","#EF4444"];

  const cardStyle = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
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
    { key: "overview", title: "总览" },
    { key: "device", title: "设备与质量" },
    { key: "energy", title: "能耗与安全" },
  ];

  const tabButton = (i, label) => (
    <button
      key={i}
      type="button"
      onClick={() => setCurrentPage(i)}
      data-widget-key={`tab_${i}`}
      data-widget-type="Text"
      style={{
        height: 44,
        padding: "0 var(--space-5)",
        borderRadius: "var(--radius-md)",
        border: currentPage === i ? "none" : "1px solid var(--color-border)",
        background: currentPage === i ? "var(--color-primary)" : "var(--color-surface-2)",
        color: currentPage === i ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-semibold)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  // ---------- Widgets定义开始 ---------- //
  const widgets = {
    // P1
    p1_title: {
      type: "Text",
      props: {
        dataSlotId: "p0.title",
        pageIndex: 0,
        text: "智慧工厂生产运营数字孪生看板",
      },
    },
    p1_kpi_oee: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.oee",
        pageIndex: 0,
        title: "设备综合效率 OEE",
        dataKey: "oee",
        unit: "%",
        format: "percent",
        trend: true,
        trendDirection: "up",
        trendValue: "+2.3%",
        comparison: { type: "prev_shift", label: "上一班次" },
      },
    },
    p1_kpi_yield: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.yield",
        pageIndex: 0,
        title: "良品率",
        dataKey: "yield_rate",
        unit: "%",
        format: "percent",
        trend: true,
        trendDirection: "down",
        trendValue: "-0.8%",
        comparison: { type: "target", label: "目标90%" },
      },
    },
    p1_kpi_capacity: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.capacity",
        pageIndex: 0,
        title: "产能达成率",
        dataKey: "capacity_rate",
        unit: "%",
        format: "percent",
        trend: true,
        trendDirection: "up",
        trendValue: "+5.1%",
        comparison: { type: "plan", label: "计划" },
      },
    },
    p1_kpi_energy: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.energy",
        pageIndex: 0,
        title: "能耗指数",
        dataKey: "energy_index",
        unit: "%",
        format: "percent",
        trend: true,
        trendDirection: "down",
        trendValue: "-1.2%",
        comparison: { type: "baseline", label: "基准" },
      },
    },
    p1_chart_device_status: {
      type: "DonutChart",
      props: {
        dataSlotId: "p0.chart.device_status",
        pageIndex: 0,
        title: "设备状态分布",
        titleBackdrop: true,
        dataKey: "device_status_dist",
        nameField: "status",
        valueField: "count",
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colorScheme: ["#EF4444","#EAB308","#84CC16"],
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
      },
    },
    p1_chart_oee_trend: {
      type: "LineChart",
      props: {
        dataSlotId: "p0.chart.oee_trend",
        pageIndex: 0,
        title: "OEE趋势（近24h）",
        titleBackdrop: true,
        dataKey: "oee_trend_24h",
        xAxis: { field: "hour", label: "小时" },
        yAxis: [
          { field: "oee", label: "OEE(%)", color: chartColors[0] },
        ],
        colorScheme: chartColors,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        smooth: true,
        echartsOptionOverrides: {
          animationDuration: 800,
          yAxis: { max: 100, min: 40 },
        },
      },
    },
    p1_table_alerts: {
      type: "Table",
      props: {
        dataSlotId: "p0.table.alerts",
        pageIndex: 0,
        title: "实时预警",
        titleBackdrop: true,
        dataKey: "alerts",
        columns: [
          { field: "time", label: "时间", width: 160 },
          { field: "type", label: "类型", width: 120 },
          { field: "severity", label: "等级", width: 80 },
          { field: "location", label: "设备/区域", width: 160 },
          { field: "status", label: "状态", width: 100 },
        ],
        pagination: true,
        pageSize: 10,
        showIndex: true,
        striped: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
      },
    },
    // P1筛选器
    p1_filter_date: {
      type: "DateRangePicker",
      props: {
        label: "时间范围",
        defaultValue: "last_24_hours",
        presets: [
          { label: "今日", value: "today" },
          { label: "近24小时", value: "last_24_hours" },
          { label: "本周", value: "this_week" },
        ],
      },
    },
    p1_filter_workshop: {
      type: "MultiSelect",
      props: {
        label: "车间区域",
        placeholder: "全部",
        options: [
          { label: "注塑车间", value: "injection" },
          { label: "装配车间", value: "assembly" },
          { label: "仓储", value: "storage" },
        ],
      },
    },
    // P2
    p2_title: {
      type: "Text",
      props: {
        dataSlotId: "p1.title",
        pageIndex: 1,
        text: "设备与质量深度分析",
      },
    },
    p2_filter_device: {
      type: "Select",
      props: {
        label: "设备编号",
        placeholder: "选择设备",
        options: [
          { label: "设备A-01", value: "A01" },
          { label: "设备B-02", value: "B02" },
          { label: "设备C-03", value: "C03" },
        ],
      },
    },
    p2_filter_line: {
      type: "MultiSelect",
      props: {
        label: "产线/工序",
        placeholder: "全部",
        options: [
          { label: "产线1", value: "line1" },
          { label: "产线2", value: "line2" },
          { label: "工序A", value: "processA" },
        ],
      },
    },
    p2_filter_date: {
      type: "DateRangePicker",
      props: {
        label: "时间范围",
        defaultValue: "this_shift",
        presets: [
          { label: "本班次", value: "this_shift" },
          { label: "今日", value: "today" },
          { label: "本周", value: "this_week" },
        ],
      },
    },
    p2_filter_product: {
      type: "Select",
      props: {
        label: "产品类型",
        placeholder: "全部",
        options: [
          { label: "A型", value: "typeA" },
          { label: "B型", value: "typeB" },
        ],
      },
    },
    p2_chart_oee_rank: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.oee_rank",
        pageIndex: 1,
        title: "设备OEE排名",
        titleBackdrop: true,
        dataKey: "oee_rank",
        xAxis: { field: "device", label: "设备" },
        yAxis: { field: "oee", label: "OEE(%)" },
        colorScheme: chartColors,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: {
          xAxis: { type: "category" },
          yAxis: { max: 100 },
        },
      },
    },
    p2_chart_oee_decomp: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.oee_decomp",
        pageIndex: 1,
        title: "选中设备OEE分解",
        titleBackdrop: true,
        dataKey: "oee_decomp",
        xAxis: { field: "dimension", label: "维度" },
        yAxis: { field: "value", label: "百分比(%)" },
        colorScheme: ["#38BDF8","#84CC16","#F59E0B"],
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: {
          xAxis: { type: "category" },
          yAxis: { max: 100 },
          series: [
            { name: "可用性", stack: "OEE", data: [95] },
            { name: "性能", stack: "OEE", data: [80] },
            { name: "质量", stack: "OEE", data: [98] },
          ],
        },
      },
    },
    p2_chart_ct_trend: {
      type: "LineChart",
      props: {
        dataSlotId: "p1.chart.ct_trend",
        pageIndex: 1,
        title: "CT时间趋势",
        titleBackdrop: true,
        dataKey: "ct_trend_24h",
        xAxis: { field: "time", label: "时间" },
        yAxis: [{ field: "ct", label: "CT(s)", color: chartColors[4] }],
        colorScheme: chartColors,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        smooth: true,
        echartsOptionOverrides: {
          animationDuration: 600,
        },
      },
    },
    p2_chart_fault_freq: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.fault_freq",
        pageIndex: 1,
        title: "故障频次",
        titleBackdrop: true,
        dataKey: "fault_freq",
        xAxis: { field: "device", label: "设备" },
        yAxis: { field: "count", label: "次数" },
        colorScheme: ["#EF4444","#EA580C","#FBBF24"],
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: {
          xAxis: { type: "category" },
        },
      },
    },
    p2_chart_yield_compare: {
      type: "BarChart",
      props: {
        dataSlotId: "p1.chart.yield_compare",
        pageIndex: 1,
        title: "良品率对比（班组/产品）",
        titleBackdrop: true,
        dataKey: "yield_compare",
        xAxis: { field: "category", label: "类别" },
        yAxis: { field: "yield", label: "良品率(%)" },
        colorScheme: ["#84CC16","#38BDF8"],
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: {
          xAxis: { type: "category" },
          yAxis: { max: 100, min: 80 },
          series: [
            { name: "班组A", barGap: "20%" },
            { name: "班组B" },
          ],
        },
      },
    },
    p2_table_device_detail: {
      type: "Table",
      props: {
        dataSlotId: "p1.table.device_detail",
        pageIndex: 1,
        title: "设备详情",
        titleBackdrop: true,
        dataKey: "device_detail",
        columns: [
          { field: "device", label: "设备", width: 120 },
          { field: "model", label: "型号", width: 100 },
          { field: "fault_time", label: "累计故障时长(h)", width: 140 },
          { field: "maintenance", label: "最近维护", width: 160 },
          { field: "status", label: "状态", width: 80 },
        ],
        pagination: true,
        pageSize: 8,
        showIndex: true,
        striped: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
      },
    },
    // P3
    p3_title: {
      type: "Text",
      props: {
        dataSlotId: "p2.title",
        pageIndex: 2,
        text: "能耗与安全诊断",
      },
    },
    p3_filter_workshop: {
      type: "MultiSelect",
      props: {
        label: "车间区域",
        placeholder: "全部",
        options: [
          { label: "注塑车间", value: "injection" },
          { label: "装配车间", value: "assembly" },
          { label: "仓储", value: "storage" },
        ],
      },
    },
    p3_filter_date: {
      type: "DateRangePicker",
      props: {
        label: "时间范围",
        defaultValue: "last_week",
        presets: [
          { label: "今日", value: "today" },
          { label: "本周", value: "this_week" },
          { label: "本月", value: "this_month" },
        ],
      },
    },
    p3_filter_event_type: {
      type: "MultiSelect",
      props: {
        label: "事件类型",
        placeholder: "全部",
        options: [
          { label: "能耗超标", value: "energy_over" },
          { label: "安全事件", value: "safety" },
          { label: "综合", value: "comprehensive" },
        ],
      },
    },
    p3_kpi_energy_overview: {
      type: "KPI",
      props: {
        dataSlotId: "p2.kpi.energy_overview",
        pageIndex: 2,
        title: "能耗总览",
        dataKey: "total_energy",
        unit: "kWh",
        format: "number",
        trend: true,
        trendDirection: "up",
        trendValue: "+3.2%",
        comparison: { type: "prev_day", label: "较前日" },
      },
    },
    p3_chart_energy_curve: {
      type: "LineChart",
      props: {
        dataSlotId: "p2.chart.energy_curve",
        pageIndex: 2,
        title: "分时段能耗曲线",
        titleBackdrop: true,
        dataKey: "energy_curve_24h",
        xAxis: { field: "hour", label: "小时" },
        yAxis: [
          { field: "electric", label: "电(kW)", color: chartColors[0] },
          { field: "water", label: "水(m³)", color: chartColors[2] },
          { field: "gas", label: "气(m³)", color: chartColors[4] },
        ],
        colorScheme: chartColors,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        smooth: true,
        echartsOptionOverrides: {
          animationDuration: 600,
        },
      },
    },
    p3_chart_energy_benchmark: {
      type: "BarChart",
      props: {
        dataSlotId: "p2.chart.energy_benchmark",
        pageIndex: 2,
        title: "单位产品能耗对标",
        titleBackdrop: true,
        dataKey: "energy_benchmark",
        xAxis: { field: "workshop", label: "车间" },
        yAxis: { field: "unit_energy", label: "能耗/基准(%)" },
        colorScheme: ["#38BDF8","#EF4444"],
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        echartsOptionOverrides: {
          xAxis: { type: "category" },
          series: [
            { name: "实际能耗", barGap: "10%" },
            { name: "基准值" },
          ],
        },
      },
    },
    p3_chart_accident_trend: {
      type: "LineChart",
      props: {
        dataSlotId: "p2.chart.accident_trend",
        pageIndex: 2,
        title: "事故率月趋势",
        titleBackdrop: true,
        dataKey: "accident_trend_monthly",
        xAxis: { field: "month", label: "月份" },
        yAxis: [{ field: "rate", label: "事故率(起/百万工时)", color: chartColors[5] }],
        colorScheme: chartColors,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
        smooth: true,
        echartsOptionOverrides: {
          yAxis: { min: 0 },
        },
      },
    },
    p3_chart_hazard_closed: {
      type: "DonutChart",
      props: {
        dataSlotId: "p2.chart.hazard_closed",
        pageIndex: 2,
        title: "隐患排查闭环率",
        titleBackdrop: true,
        dataKey: "hazard_closed",
        nameField: "status",
        valueField: "count",
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colorScheme: ["#84CC16","#EAB308","#EF4444"],
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
        gridColor: "var(--dv-chart-grid-stroke)",
        axisColor: "var(--dv-chart-axis-line)",
        axisTextColor: "var(--dv-chart-tick-label)",
        legendTextColor: "var(--dv-chart-legend-text)",
        tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
        tooltipTextColor: "var(--dv-chart-tooltip-fg)",
        textColor: "var(--color-text-muted)",
      },
    },
    p3_table_events: {
      type: "Table",
      props: {
        dataSlotId: "p2.table.events",
        pageIndex: 2,
        title: "异常事件时间轴",
        titleBackdrop: true,
        dataKey: "anomaly_events",
        columns: [
          { field: "time", label: "时间", width: 160 },
          { field: "type", label: "类型", width: 120 },
          { field: "status", label: "状态", width: 100 },
          { field: "responsible", label: "负责人", width: 100 },
        ],
        pagination: true,
        pageSize: 8,
        showIndex: true,
        striped: true,
        style: {
          border: "var(--dv-chart-panel-border)",
          padding: "var(--dv-chart-panel-padding)",
          borderRadius: "var(--dv-chart-panel-radius)",
          background: "var(--dv-chart-panel-bg)",
        },
      },
    },
  };
  // ---------- Widgets定义结束 ---------- //

  // ---------- 页面组件 ---------- //
  const Page1 = () => (
    <main style={{
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      display: "grid",
      gridTemplateRows: "80px 120px 400px 250px",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
    }}>
      {/* 标题+筛选行 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        minHeight: 0,
        overflow: "hidden",
      }}>
        <h2 data-widget-key="p1_title" data-widget-type="Title" style={{
          margin: 0,
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
          lineHeight: "var(--line-height-tight)",
        }}>
          {widgets.p1_title.props.text}
        </h2>
        <div style={{ flex: 1 }} />
        <Widget config={widgets.p1_filter_date} enableData={false} />
        <Widget config={widgets.p1_filter_workshop} enableData={false} />
      </div>
      {/* KPI行 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "var(--space-3)",
        minHeight: 0,
        overflow: "hidden",
      }}>
        <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}><Widget config={widgets.p1_kpi_oee} /></div>
        <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}><Widget config={widgets.p1_kpi_yield} /></div>
        <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}><Widget config={widgets.p1_kpi_capacity} /></div>
        <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}><Widget config={widgets.p1_kpi_energy} /></div>
      </div>
      {/* 图表行 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
        gap: "var(--space-4)",
        minHeight: 0,
        overflow: "hidden",
      }}>
        <div style={chartPanelShellStyle}><Widget config={widgets.p1_chart_device_status} /></div>
        <div style={chartPanelShellStyle}><Widget config={widgets.p1_chart_oee_trend} /></div>
        <div style={chartPanelShellStyle}><Widget config={widgets.p1_table_alerts} /></div>
      </div>
      {/* 表格行空？但上面用了三列，占满第三行 */}
      <div style={{ display: "none" }} /> {/* 占位 */}
    </main>
  );

  const Page2 = () => (
    <main style={{
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      display: "grid",
      gridTemplateRows: "80px 280px 260px 180px",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
    }}>
      {/* 标题+筛选行 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        minHeight: 0,
        overflow: "hidden",
        flexWrap: "wrap",
      }}>
        <h2 data-widget-key="p2_title" data-widget-type="Title" style={{
          margin: 0,
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
          lineHeight: "var(--line-height-tight)",
        }}>
          {widgets.p2_title.props.text}
        </h2>
        <div style={{ flex: 1 }} />
        <Widget config={widgets.p2_filter_device} enableData={false} />
        <Widget config={widgets.p2_filter_line} enableData={false} />
        <Widget config={widgets.p2_filter_date} enableData={false} />
        <Widget config={widgets.p2_filter_product} enableData={false} />
      </div>
      {/* 第二行：左OEE排名，右良品率对比 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "var(--space-4)",
        minHeight: 0,
        overflow: "hidden",
      }}>
        <div style={chartPanelShellStyle}><Widget config={widgets.p2_chart_oee_rank} /></div>
        <div style={chartPanelShellStyle}><Widget config={widgets.p2_chart_yield_compare} /></div>
      </div>
      {/* 第三行：左OEE分解，中CT趋势，右故障频次 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "var(--space-4)",
        minHeight: 0,
        overflow: "hidden",
      }}>
        <div style={chartPanelShellStyle}><Widget config={widgets.p2_chart_oee_decomp} /></div>
        <div style={chartPanelShellStyle}><Widget config={widgets.p2_chart_ct_trend} /></div>
        <div style={chartPanelShellStyle}><Widget config={widgets.p2_chart_fault_freq} /></div>
      </div>
      {/* 第四行：表格 */}
      <div style={chartPanelShellStyle}><Widget config={widgets.p2_table_device_detail} /></div>
    </main>
  );

  const Page3 = () => (
    <main style={{
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      display: "grid",
      gridTemplateRows: "80px 100px 290px 245px 110px",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
    }}>
      {/* 标题+筛选行 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        minHeight: 0,
        overflow: "hidden",
        flexWrap: "wrap",
      }}>
        <h2 data-widget-key="p3_title" data-widget-type="Title" style={{
          margin: 0,
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
          lineHeight: "var(--line-height-tight)",
        }}>
          {widgets.p3_title.props.text}
        </h2>
        <div style={{ flex: 1 }} />
        <Widget config={widgets.p3_filter_workshop} enableData={false} />
        <Widget config={widgets.p3_filter_date} enableData={false} />
        <Widget config={widgets.p3_filter_event_type} enableData={false} />
      </div>
      {/* 能耗总览KPI */}
      <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
        <Widget config={widgets.p3_kpi_energy_overview} />
      </div>
      {/* 第三行：左能耗曲线，右对标柱状图 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr minmax(0, 1fr)",
        gap: "var(--space-4)",
        minHeight: 0,
        overflow: "hidden",
      }}>
        <div style={chartPanelShellStyle}><Widget config={widgets.p3_chart_energy_curve} /></div>
        <div style={chartPanelShellStyle}><Widget config={widgets.p3_chart_energy_benchmark} /></div>
      </div>
      {/* 第四行：左事故率趋势，右隐患排查闭环率 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "var(--space-4)",
        minHeight: 0,
        overflow: "hidden",
      }}>
        <div style={chartPanelShellStyle}><Widget config={widgets.p3_chart_accident_trend} /></div>
        <div style={chartPanelShellStyle}><Widget config={widgets.p3_chart_hazard_closed} /></div>
      </div>
      {/* 第五行：异常事件表格 */}
      <div style={chartPanelShellStyle}><Widget config={widgets.p3_table_events} /></div>
    </main>
  );

  const pageRenders = [<Page1 key="p1" />, <Page2 key="p2" />, <Page3 key="p3" />];

  return (
    <div style={{
      width: 1920,
      height: 1080,
      display: "flex",
      flexDirection: "column",
      background: "var(--color-bg)",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>
      <header style={{
        position: "relative",
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
          {/* 多分页tab */}
          <div style={{ position: "absolute", top: "var(--space-3)", right: "var(--space-8)", zIndex: 2, display: "flex", gap: "var(--space-2)" }}>
            {pageDefs.map((p, i) => tabButton(i, p.title))}
          </div>
          <h1
            data-widget-key="page_title"
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
            智慧工厂生产运营数字孪生看板
          </h1>
          {/* 筛选区（可另加，但页面内部已有筛选行，这里省略以避免重复） */}
        </div>
      </header>
      {pageRenders[currentPage]}
    </div>
  );
}