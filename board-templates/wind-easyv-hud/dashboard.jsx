export default function Dashboard() {
  const chartPanelStyle = {
    border: "var(--dv-chart-panel-border)",
    padding: "var(--dv-chart-panel-padding)",
    borderRadius: "var(--dv-chart-panel-radius)",
    background: "var(--dv-chart-panel-bg)",
  };

  const chartChrome = {
    gridColor: "var(--dv-chart-grid-stroke)",
    axisColor: "var(--dv-chart-axis-line)",
    axisTextColor: "var(--dv-chart-tick-label)",
    legendTextColor: "var(--dv-chart-legend-text)",
    tooltipBackgroundColor: "var(--dv-chart-tooltip-bg)",
    tooltipTextColor: "var(--dv-chart-tooltip-fg)",
    textColor: "var(--color-text-muted)",
  };

  const regionTitle = {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-secondary)",
    fontWeight: "var(--font-weight-semibold)",
    letterSpacing: "var(--letter-spacing-wide)",
    marginBottom: "var(--space-1)",
    flexShrink: 0,
  };

  const RingStat = ({ label, value }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-1)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--radius-pill)",
          background: `conic-gradient(var(--color-primary) ${Math.min(100, value) * 3.6}deg, var(--color-muted) 0deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "var(--radius-pill)",
            background: "var(--color-surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-text-primary)",
          }}
        >
          {value}%
        </div>
      </div>
      <span style={{ fontSize: "10px", color: "var(--color-text-muted)", textAlign: "center", maxWidth: 72 }}>
        {label}
      </span>
    </div>
  );

  const widgets = {
    k_gen_year: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.genYear",
        pageIndex: 0,
        title: "当年发电",
        presetIconId: "kpi-sync-refresh",
        dataKey: "gen_year_value",
        unit: "MWh",
        trend: true,
        trendDirection: "up",
        trendValue: "+2.4%",
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" },
      },
    },
    k_gen_month: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.genMonth",
        pageIndex: 0,
        title: "当月发电",
        presetIconId: "kpi-analytics-bars",
        dataKey: "gen_month_value",
        unit: "MWh",
        trend: true,
        trendDirection: "up",
        trendValue: "+1.1%",
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" },
      },
    },
    k_gen_day: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.genDay",
        pageIndex: 0,
        title: "当日发电",
        presetIconId: "kpi-insight-badge",
        dataKey: "gen_day_value",
        unit: "MWh",
        trend: true,
        trendDirection: "down",
        trendValue: "-0.6%",
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" },
      },
    },
    c_equiv_line: {
      type: "LineChart",
      props: {
        dataSlotId: "p0.chart.equivHours",
        pageIndex: 0,
        title: "近五年等效小时数 / 业界均值",
        titleBackdrop: false,
        dataKey: "equiv_hours_trend",
        style: chartPanelStyle,
        xAxis: { field: "year", label: "年" },
        yAxis: [
          { field: "farm_hours", label: "本场 (h)", color: "#4ADE80" },
          { field: "industry_hours", label: "业界 (h)", color: "#FBBF24" },
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: ["#4ADE80", "#FBBF24"],
        ...chartChrome,
        echartsOptionOverrides: { animationDuration: 500 },
      },
    },
    c_project_hbar: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.projectBars",
        pageIndex: 0,
        title: "生产基地项目进度",
        titleBackdrop: false,
        dataKey: "project_progress_rows",
        direction: "horizontal",
        style: chartPanelStyle,
        xAxis: { field: "name", label: "项目" },
        yAxis: { field: "pct", label: "完成率 (%)" },
        showLegend: false,
        showGrid: true,
        colorScheme: ["#4ADE80"],
        ...chartChrome,
        echartsOptionOverrides: { animationDuration: 400 },
      },
    },
    c_capacity_bar: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.capacityMix",
        pageIndex: 0,
        title: "装机容量（陆上 / 海上）",
        titleBackdrop: false,
        dataKey: "capacity_mix_rows",
        style: chartPanelStyle,
        xAxis: { field: "year", label: "年" },
        yAxis: [
          { field: "onshore", label: "陆上 (MW)", color: "#4ADE80" },
          { field: "offshore", label: "海上 (MW)", color: "#38BDF8" },
        ],
        showLegend: true,
        legendPosition: "top",
        showGrid: true,
        colorScheme: ["#4ADE80", "#38BDF8"],
        ...chartChrome,
        echartsOptionOverrides: { animationDuration: 450 },
      },
    },
    k_farms: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.farms",
        pageIndex: 0,
        title: "风电场数量",
        presetIconId: "kpi-capsule",
        dataKey: "farms_count",
        unit: "座",
        trend: true,
        trendDirection: "up",
        trendValue: "+1",
        presentation: { layout: "header-inline", surface: "card", valueGlow: "inherit" },
      },
    },
    k_units: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.units",
        pageIndex: 0,
        title: "风电机组",
        presetIconId: "kpi-sync-refresh",
        dataKey: "units_count",
        unit: "台",
        trend: true,
        trendDirection: "up",
        trendValue: "+12",
        presentation: { layout: "header-inline", surface: "card", valueGlow: "inherit" },
      },
    },
    k_avail: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.availability",
        pageIndex: 0,
        title: "平均可利用率",
        presetIconId: "kpi-analytics-bars",
        dataKey: "availability_value",
        unit: "%",
        format: "percentage",
        trend: true,
        trendDirection: "up",
        trendValue: "+0.3pt",
        presentation: { layout: "header-inline", surface: "card", valueGlow: "inherit" },
      },
    },
    k_emission: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.emission",
        pageIndex: 0,
        title: "年减排量",
        presetIconId: "kpi-insight-badge",
        dataKey: "emission_value",
        unit: "万 tCO₂e",
        trend: true,
        trendDirection: "up",
        trendValue: "+4.2%",
        presentation: { layout: "header-inline", surface: "card", valueGlow: "inherit" },
      },
    },
    k_clean: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.cleanGen",
        pageIndex: 0,
        title: "清洁能源发电",
        presetIconId: "kpi-pharmacy",
        dataKey: "clean_gen_value",
        unit: "GWh",
        trend: true,
        trendDirection: "up",
        trendValue: "+6.8%",
        presentation: { layout: "header-inline", surface: "card", valueGlow: "inherit" },
      },
    },
    k_vehicles: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.vehicles",
        pageIndex: 0,
        title: "在途车辆",
        presetIconId: "kpi-capsule",
        dataKey: "vehicles_value",
        unit: "辆",
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" },
      },
    },
    k_waybills: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.waybills",
        pageIndex: 0,
        title: "异常运单",
        presetIconId: "kpi-insight-badge",
        dataKey: "waybills_value",
        unit: "单",
        trend: true,
        trendDirection: "down",
        trendValue: "-3",
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" },
      },
    },
    c_transit_donut: {
      type: "DonutChart",
      props: {
        dataSlotId: "p0.chart.transitDonut",
        pageIndex: 0,
        title: "在途设备占比",
        titleBackdrop: false,
        dataKey: "transit_mix",
        nameField: "name",
        valueField: "value",
        style: chartPanelStyle,
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colorScheme: ["#4ADE80", "#FBBF24", "#38BDF8", "#A78BFA"],
        ...chartChrome,
        echartsOptionOverrides: { animationDuration: 400 },
      },
    },
    c_blueprint_hbar: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.blueprintBar",
        pageIndex: 0,
        title: "蓝图资源完成",
        titleBackdrop: false,
        dataKey: "blueprint_rows",
        direction: "horizontal",
        style: chartPanelStyle,
        xAxis: { field: "name", label: "" },
        yAxis: { field: "pct", label: "%" },
        showLegend: false,
        showGrid: true,
        colorScheme: ["#FBBF24"],
        ...chartChrome,
        echartsOptionOverrides: { animationDuration: 350 },
      },
    },
    c_docs_hbar: {
      type: "BarChart",
      props: {
        dataSlotId: "p0.chart.docsBar",
        pageIndex: 0,
        title: "交付资料完成",
        titleBackdrop: false,
        dataKey: "docs_rows",
        direction: "horizontal",
        style: chartPanelStyle,
        xAxis: { field: "name", label: "" },
        yAxis: { field: "pct", label: "%" },
        showLegend: false,
        showGrid: true,
        colorScheme: ["#4ADE80"],
        ...chartChrome,
        echartsOptionOverrides: { animationDuration: 350 },
      },
    },
    k_util: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.equivUtil",
        pageIndex: 0,
        title: "等效利用小时",
        presetIconId: "kpi-analytics-bars",
        dataKey: "equiv_util_value",
        unit: "h",
        trend: true,
        trendDirection: "up",
        trendValue: "+18 h",
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" },
      },
    },
    k_mttr: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.mttr",
        pageIndex: 0,
        title: "平均故障响应",
        presetIconId: "kpi-sync-refresh",
        dataKey: "mttr_value",
        unit: "min",
        trend: true,
        trendDirection: "down",
        trendValue: "-2 min",
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" },
      },
    },
    k_mtr: {
      type: "KPI",
      props: {
        dataSlotId: "p0.kpi.mtr",
        pageIndex: 0,
        title: "平均故障修复",
        presetIconId: "kpi-capsule",
        dataKey: "mtr_value",
        unit: "h",
        trend: true,
        trendDirection: "down",
        trendValue: "-0.4 h",
        presentation: { layout: "classic", surface: "card", valueGlow: "inherit" },
      },
    },
    c_ticket_donut: {
      type: "DonutChart",
      props: {
        dataSlotId: "p0.chart.ticketDonut",
        pageIndex: 0,
        title: "当日工单结构",
        titleBackdrop: false,
        dataKey: "ticket_mix",
        nameField: "name",
        valueField: "value",
        style: chartPanelStyle,
        showPercentage: true,
        showLegend: true,
        legendPosition: "bottom",
        colorScheme: ["#4ADE80", "#FBBF24", "#FB923C"],
        ...chartChrome,
        echartsOptionOverrides: { animationDuration: 400 },
      },
    },
  };

  const shell = {
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div
      style={{
        width: 2560,
        height: 760,
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
          flexShrink: 0,
          height: 44,
          padding: "0 var(--space-4)",
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          alignItems: "center",
          gap: "var(--space-3)",
          borderBottom: "var(--border-width-thin) solid var(--color-border)",
          background: "var(--color-surface)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
          <span style={{ color: "var(--color-text-muted)" }}>地区</span> 杭州 ·{" "}
          <span style={{ color: "var(--color-warning)" }}>大雨</span>{" "}
          <span style={{ color: "var(--color-text-muted)" }}>17~28℃</span>
        </div>
        <h1
          data-widget-key="title-main"
          data-widget-type="Title"
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-bold)",
            fontFamily: "var(--font-display)",
            letterSpacing: "var(--letter-spacing-wide)",
            color: "var(--color-text-primary)",
            textShadow: "0 0 14px color-mix(in srgb, var(--color-primary) 35%, transparent)",
          }}
        >
          EASYV 风电智慧运营
        </h1>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-secondary)",
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ color: "var(--color-text-muted)" }}>日期</span> 2026.05.10 ·{" "}
          <span style={{ color: "var(--color-primary)" }}>17:01:03</span>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          minHeight: 0,
          padding: "var(--space-2) var(--space-3)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.2fr) minmax(0, 0.9fr)",
          gap: "var(--space-3)",
          boxSizing: "border-box",
        }}
      >
        {/* 左列 */}
        <section style={{ ...shell, gap: "var(--space-2)" }}>
          <div style={{ ...shell, flex: 1.1, minHeight: 0, gap: "var(--space-2)" }}>
            <div style={regionTitle}>发电量完成情况</div>
            <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "var(--space-2)" }}>
              <div
                style={{
                  width: 148,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-1)",
                  minHeight: 0,
                }}
              >
                <Widget config={widgets.k_gen_year} />
                <Widget config={widgets.k_gen_month} />
                <Widget config={widgets.k_gen_day} />
              </div>
              <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                <Widget config={widgets.c_equiv_line} />
              </div>
            </div>
          </div>
          <div style={{ ...shell, flex: 0.95, minHeight: 0, gap: "var(--space-2)" }}>
            <div style={regionTitle}>生产基地 / 装机容量</div>
            <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "var(--space-2)" }}>
              <div
                style={{
                  width: 132,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 var(--space-1)",
                  border: "var(--border-width-thin) solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface)",
                }}
              >
                <RingStat label="在建占比" value={50} />
                <RingStat label="投产达成" value={48} />
              </div>
              <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Widget config={widgets.c_project_hbar} />
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Widget config={widgets.c_capacity_bar} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 中列 */}
        <section style={{ ...shell, gap: "var(--space-2)" }}>
          <div style={regionTitle}>核心运行指标</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: "var(--space-2)",
              flexShrink: 0,
            }}
          >
            <Widget config={widgets.k_farms} />
            <Widget config={widgets.k_units} />
            <Widget config={widgets.k_avail} />
            <Widget config={widgets.k_emission} />
            <Widget config={widgets.k_clean} />
          </div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              border: "var(--border-width-thin) dashed var(--color-border-strong)",
              borderRadius: "var(--radius-lg)",
              background: "color-mix(in srgb, var(--color-muted) 35%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            地理信息 / 地图区域（预留空白）
          </div>
        </section>

        {/* 右列 */}
        <section style={{ ...shell, gap: "var(--space-2)" }}>
          <div style={{ ...shell, flex: 1.05, minHeight: 0, gap: "var(--space-2)" }}>
            <div style={regionTitle}>业务系统 · 智慧物流</div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Widget config={widgets.k_vehicles} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Widget config={widgets.k_waybills} />
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <Widget config={widgets.c_transit_donut} />
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flex: 0.55, minHeight: 0 }}>
              <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                <Widget config={widgets.c_blueprint_hbar} />
              </div>
              <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                <Widget config={widgets.c_docs_hbar} />
              </div>
            </div>
          </div>
          <div style={{ ...shell, flex: 0.95, minHeight: 0, gap: "var(--space-2)" }}>
            <div style={regionTitle}>业务系统 · 运维</div>
            <div style={{ display: "flex", gap: "var(--space-2)", flex: 1, minHeight: 0 }}>
              <div
                style={{
                  flex: 0.95,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "var(--space-2)",
                  minWidth: 0,
                  minHeight: 0,
                }}
              >
                <Widget config={widgets.k_util} />
                <Widget config={widgets.k_mttr} />
                <Widget config={widgets.k_mtr} />
              </div>
              <div style={{ flex: 1.05, minWidth: 0, minHeight: 0 }}>
                <Widget config={widgets.c_ticket_donut} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
