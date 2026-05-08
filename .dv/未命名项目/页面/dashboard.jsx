export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);
  const chartColors = ["#F5F5F5","#D4D4D4","#A3A3A3","#737373","#525252","#292929"];

  const cardStyle = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
    padding: "var(--space-4)",
    boxSizing: "border-box",
  };

  const widgets = {
    kpi_total_production: {
      type: "KPI",
      props: {
        title: "总产量",
        dataKey: "total_production",
        unit: "件",
        trend: true,
        trendDirection: "up",
        trendValue: "+5.2%",
        icon: "🏭",
      },
    },
    kpi_yield_rate: {
      type: "KPI",
      props: {
        title: "良品率",
        dataKey: "yield_rate",
        unit: "%",
        trend: true,
        trendDirection: "down",
        trendValue: "-0.3%",
        icon: "✅",
      },
    },
    kpi_oee: {
      type: "KPI",
      props: {
        title: "OEE",
        dataKey: "oee",
        unit: "%",
        trend: true,
        trendDirection: "up",
        trendValue: "+2.1%",
        icon: "⚙️",
      },
    },
    kpi_energy: {
      type: "KPI",
      props: {
        title: "今日能耗",
        dataKey: "energy_consumption",
        unit: "kWh",
        trend: true,
        trendDirection: "up",
        trendValue: "+1.8%",
        icon: "⚡",
        comparison: { type: "yoy", label: "同比" },
      },
    },
    donut_oee_target: {
      type: "DonutChart",
      props: {
        title: "OEE目标达成",
        dataKey: "oee_target",
        nameField: "type",
        valueField: "value",
        showPercentage: true,
        showLegend: true,
        colorScheme: chartColors,
        backgroundColor: "var(--color-surface)",
        gridColor: "var(--color-grid)",
        axisColor: "var(--color-border)",
        axisTextColor: "var(--color-text-secondary)",
        legendTextColor: "var(--color-text-secondary)",
        titleColor: "var(--color-text-primary)",
        textColor: "var(--color-text-secondary)",
      },
    },
    line_production_trend: {
      type: "LineChart",
      props: {
        title: "产量趋势",
        dataKey: "production_trend",
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "actual", label: "实际产量", color: "#F5F5F5" },
          { field: "plan", label: "计划产量", color: "#737373" },
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: chartColors,
        backgroundColor: "var(--color-surface)",
        gridColor: "var(--color-grid)",
        axisColor: "var(--color-border)",
        axisTextColor: "var(--color-text-secondary)",
        legendTextColor: "var(--color-text-secondary)",
        titleColor: "var(--color-text-primary)",
        textColor: "var(--color-text-secondary)",
      },
    },
    table_alerts: {
      type: "Table",
      props: {
        title: "当前预警列表",
        dataKey: "alerts",
        columns: [
          { field: "level", label: "等级", width: 60 },
          { field: "time", label: "触发时间", width: 120 },
          { field: "object", label: "对象", width: 100 },
          { field: "description", label: "描述", width: 200 },
          { field: "action", label: "建议行动", width: 150 },
        ],
        pagination: true,
        pageSize: 5,
        showIndex: true,
        striped: true,
      },
    },
    filter_date_range: {
      type: "DateRangePicker",
      props: {
        label: "日期范围",
        defaultValue: "today",
        presets: [
          { label: "今天", value: "today" },
          { label: "近7天", value: "last_7_days" },
          { label: "近30天", value: "last_30_days" },
        ],
      },
    },
    filter_workshop: {
      type: "Select",
      props: {
        label: "车间/区域",
        placeholder: "全部",
        options: [
          { label: "冲压车间", value: "1" },
          { label: "焊接车间", value: "2" },
          { label: "总装车间", value: "3" },
        ],
      },
    },
    filter_batch: {
      type: "Select",
      props: {
        label: "批次号",
        placeholder: "全部",
        options: [
          { label: "B2024001", value: "B1" },
          { label: "B2024002", value: "B2" },
        ],
      },
    },
    bar_oee_by_line: {
      type: "BarChart",
      props: {
        title: "产线OEE对比",
        dataKey: "oee_by_line",
        xAxis: { field: "line", label: "产线" },
        yAxis: { field: "oee", label: "OEE", unit: "%" },
        showTarget: true,
        targetValue: 85,
        showGrid: true,
        colorScheme: chartColors,
        backgroundColor: "var(--color-surface)",
        gridColor: "var(--color-grid)",
        axisColor: "var(--color-border)",
        axisTextColor: "var(--color-text-secondary)",
        legendTextColor: "var(--color-text-secondary)",
        titleColor: "var(--color-text-primary)",
        textColor: "var(--color-text-secondary)",
      },
    },
    bar_fault_rate_rank: {
      type: "BarChart",
      props: {
        title: "设备故障率排名(Top10)",
        dataKey: "fault_rate_rank",
        xAxis: { field: "device", label: "设备" },
        yAxis: { field: "fault_rate", label: "故障率", unit: "%" },
        showGrid: true,
        colorScheme: chartColors,
        backgroundColor: "var(--color-surface)",
        gridColor: "var(--color-grid)",
        axisColor: "var(--color-border)",
        axisTextColor: "var(--color-text-secondary)",
        legendTextColor: "var(--color-text-secondary)",
        titleColor: "var(--color-text-primary)",
        textColor: "var(--color-text-secondary)",
      },
    },
    line_oee_trend: {
      type: "LineChart",
      props: {
        title: "选定设备OEE趋势(近24h)",
        dataKey: "device_oee_trend",
        xAxis: { field: "time", label: "时间" },
        yAxis: [{ field: "oee", label: "OEE", color: "#F5F5F5" }],
        showLegend: true,
        showGrid: true,
        colorScheme: chartColors,
        backgroundColor: "var(--color-surface)",
        gridColor: "var(--color-grid)",
        axisColor: "var(--color-border)",
        axisTextColor: "var(--color-text-secondary)",
        legendTextColor: "var(--color-text-secondary)",
        titleColor: "var(--color-text-primary)",
        textColor: "var(--color-text-secondary)",
      },
    },
    table_device_events: {
      type: "Table",
      props: {
        title: "设备事件明细(当前班次)",
        dataKey: "device_events",
        columns: [
          { field: "time", label: "时间", width: 80 },
          { field: "type", label: "类型", width: 80 },
          { field: "duration", label: "时长(分钟)", width: 90 },
          { field: "status", label: "状态", width: 70 },
        ],
        pagination: true,
        pageSize: 8,
        showIndex: true,
      },
    },
    line_yield_trend: {
      type: "LineChart",
      props: {
        title: "良品率趋势(近7天)",
        dataKey: "yield_trend",
        xAxis: { field: "date", label: "日期" },
        yAxis: [{ field: "yield", label: "良品率", color: "#F5F5F5" }],
        showLegend: true,
        showGrid: true,
        colorScheme: chartColors,
        backgroundColor: "var(--color-surface)",
        gridColor: "var(--color-grid)",
        axisColor: "var(--color-border)",
        axisTextColor: "var(--color-text-secondary)",
        legendTextColor: "var(--color-text-secondary)",
        titleColor: "var(--color-text-primary)",
        textColor: "var(--color-text-secondary)",
      },
    },
    bar_defect_pareto: {
      type: "BarChart",
      props: {
        title: "缺陷分类帕累托图",
        dataKey: "defect_pareto",
        xAxis: { field: "process", label: "工序" },
        yAxis: { field: "count", label: "缺陷数量" },
        showGrid: true,
        colorScheme: chartColors,
        backgroundColor: "var(--color-surface)",
        gridColor: "var(--color-grid)",
        axisColor: "var(--color-border)",
        axisTextColor: "var(--color-text-secondary)",
        legendTextColor: "var(--color-text-secondary)",
        titleColor: "var(--color-text-primary)",
        textColor: "var(--color-text-secondary)",
      },
    },
    table_batch_trace: {
      type: "Table",
      props: {
        title: "批次追溯明细",
        dataKey: "batch_trace",
        columns: [
          { field: "batch", label: "批次号", width: 100 },
          { field: "process", label: "工序", width: 80 },
          { field: "time", label: "时间", width: 120 },
          { field: "operator", label: "操作员", width: 70 },
          { field: "result", label: "质检结果", width: 70 },
        ],
        pagination: true,
        pageSize: 8,
        showIndex: true,
      },
    },
    donut_defect_by_model: {
      type: "DonutChart",
      props: {
        title: "缺陷产品型号分布",
        dataKey: "defect_by_model",
        nameField: "model",
        valueField: "count",
        showPercentage: true,
        showLegend: true,
        colorScheme: chartColors,
        backgroundColor: "var(--color-surface)",
        gridColor: "var(--color-grid)",
        axisColor: "var(--color-border)",
        axisTextColor: "var(--color-text-secondary)",
        legendTextColor: "var(--color-text-secondary)",
        titleColor: "var(--color-text-primary)",
        textColor: "var(--color-text-secondary)",
      },
    },
    line_energy_trend: {
      type: "LineChart",
      props: {
        title: "电能耗趋势(当日)",
        dataKey: "energy_trend",
        xAxis: { field: "time", label: "时间" },
        yAxis: [
          { field: "actual", label: "实际电耗", color: "#F5F5F5" },
          { field: "limit", label: "计划上限", color: "#737373" },
        ],
        showLegend: true,
        showGrid: true,
        colorScheme: chartColors,
        backgroundColor: "var(--color-surface)",
        gridColor: "var(--color-grid)",
        axisColor: "var(--color-border)",
        axisTextColor: "var(--color-text-secondary)",
        legendTextColor: "var(--color-text-secondary)",
        titleColor: "var(--color-text-primary)",
        textColor: "var(--color-text-secondary)",
      },
    },
    bar_unit_energy: {
      type: "BarChart",
      props: {
        title: "单位产品能耗对比",
        dataKey: "unit_energy",
        xAxis: { field: "workshop", label: "车间" },
        yAxis: { field: "energy", label: "单位能耗", unit: "kWh/件" },
        showTarget: true,
        targetValue: 5,
        showGrid: true,
        colorScheme: chartColors,
        backgroundColor: "var(--color-surface)",
        gridColor: "var(--color-grid)",
        axisColor: "var(--color-border)",
        axisTextColor: "var(--color-text-secondary)",
        legendTextColor: "var(--color-text-secondary)",
        titleColor: "var(--color-text-primary)",
        textColor: "var(--color-text-secondary)",
      },
    },
    table_energy_saving: {
      type: "Table",
      props: {
        title: "节能模式触发历史",
        dataKey: "energy_saving_events",
        columns: [
          { field: "time", label: "时间", width: 120 },
          { field: "type", label: "类型", width: 70 },
          { field: "saving", label: "节能量(kWh)", width: 100 },
        ],
        pagination: true,
        pageSize: 8,
        showIndex: true,
      },
    },
    kpi_water_gas: {
      type: "KPI",
      props: {
        title: "水/气能耗摘要",
        dataKey: "water_gas_summary",
        prefix: "水:",
        suffix: "吨 / 气: m³",
        icon: "💧",
      },
    },
  };

  const pageDefs = [
    { key: "overview", title: "全局总览" },
    { key: "equipment", title: "产线/设备" },
    { key: "quality", title: "质量追溯" },
    { key: "energy", title: "能耗诊断" },
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

  const FiltersRow = ({ filters }) => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-3)",
        alignItems: "center",
        height: 48,
        minHeight: 0,
        overflow: "hidden",
        padding: "0 var(--space-2)",
      }}
    >
      {filters.map((fKey, idx) => (
        <Widget key={idx} config={widgets[fKey]} />
      ))}
    </div>
  );

  const Page1 = () => {
    const filters = ["filter_date_range", "filter_workshop"];
    return (
      <main
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateRows: "48px 140px 480px 180px",
          gap: "var(--space-4)",
          padding: "var(--space-4)",
        }}
      >
        <FiltersRow filters={filters} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "var(--space-3)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Widget config={widgets.kpi_total_production} />
          <Widget config={widgets.kpi_yield_rate} />
          <Widget config={widgets.kpi_oee} />
          <Widget config={widgets.kpi_energy} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-4)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.donut_oee_target} />
          </div>
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.line_production_trend} />
          </div>
        </div>
        <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
          <Widget config={widgets.table_alerts} />
        </div>
      </main>
    );
  };

  const Page2 = () => {
    const filters = ["filter_date_range", "filter_workshop"];
    return (
      <main
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateRows: "48px 420px 420px",
          gap: "var(--space-4)",
          padding: "var(--space-4)",
        }}
      >
        <FiltersRow filters={filters} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-4)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.bar_oee_by_line} />
          </div>
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.bar_fault_rate_rank} />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-4)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.line_oee_trend} />
          </div>
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.table_device_events} />
          </div>
        </div>
      </main>
    );
  };

  const Page3 = () => {
    const filters = ["filter_date_range", "filter_batch"];
    return (
      <main
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateRows: "48px 400px 400px",
          gap: "var(--space-4)",
          padding: "var(--space-4)",
        }}
      >
        <FiltersRow filters={filters} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr minmax(0, 1fr)",
            gap: "var(--space-4)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.line_yield_trend} />
          </div>
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.bar_defect_pareto} />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-4)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.table_batch_trace} />
          </div>
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.donut_defect_by_model} />
          </div>
        </div>
      </main>
    );
  };

  const Page4 = () => {
    const filters = ["filter_date_range", "filter_workshop"];
    return (
      <main
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateRows: "48px 400px 400px",
          gap: "var(--space-4)",
          padding: "var(--space-4)",
        }}
      >
        <FiltersRow filters={filters} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-4)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.line_energy_trend} />
          </div>
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.bar_unit_energy} />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-4)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.table_energy_saving} />
          </div>
          <div style={{ ...cardStyle, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Widget config={widgets.kpi_water_gas} />
          </div>
        </div>
      </main>
    );
  };

  const pageRenders = [
    <Page1 key="p1" />,
    <Page2 key="p2" />,
    <Page3 key="p3" />,
    <Page4 key="p4" />,
  ];

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-body)",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          height: 72,
          padding: "0 var(--space-6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h1
          data-widget-key="page_title"
          data-widget-type="Title"
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-bold)",
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          智慧工厂生产运营看板
        </h1>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {pageDefs.map((p, i) => tabButton(i, p.title))}
        </div>
      </header>
      {pageRenders[currentPage]}
    </div>
  );
}
