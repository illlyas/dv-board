export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);

  // ===== 组件配置区 =====
  const widgets = {
    // ===== P1 总览驾驶舱 =====
    kpi_outpatient: {
      type: "KPI",
      props: {
        title: "今日门诊量",
        subtitle: "同比昨日",
        icon: "👥",
        dataKey: "outpatient_count",
        unit: "人次",
        trend: true,
        comparison: { type: "yoy", label: "同比" },
        gradient: ["#0071e3", "#0066cc"]
      }
    },
    kpi_inpatient: {
      type: "KPI",
      props: {
        title: "在院人数",
        subtitle: "当前在院",
        icon: "🏥",
        dataKey: "inpatient_count",
        unit: "人",
        trend: true,
        gradient: ["#0066cc", "#2997ff"]
      }
    },
    kpi_bed_usage: {
      type: "KPI",
      props: {
        title: "病床使用率",
        subtitle: "实时",
        icon: "🛏️",
        dataKey: "bed_usage_rate",
        unit: "%",
        trend: true,
        threshold: 95,
        gradient: ["#0071e3", "#2997ff"]
      }
    },
    kpi_surgery_success: {
      type: "KPI",
      props: {
        title: "手术成功率",
        subtitle: "本月累计",
        icon: "🔬",
        dataKey: "surgery_success_rate",
        unit: "%",
        trend: true,
        comparison: { type: "mom", label: "环比" },
        gradient: ["#0071e3", "#34c759"]
      }
    },
    kpi_ai_accuracy: {
      type: "KPI",
      props: {
        title: "AI辅助诊断准确率",
        subtitle: "当日",
        icon: "🤖",
        dataKey: "ai_diagnosis_accuracy",
        unit: "%",
        trend: true,
        target: 98,
        gradient: ["#0071e3", "#5e5ce6"]
      }
    },
    kpi_iot_coverage: {
      type: "KPI",
      props: {
        title: "物联网设备覆盖率",
        subtitle: "全院",
        icon: "📡",
        dataKey: "iot_device_coverage",
        unit: "%",
        trend: true,
        target: 80,
        gradient: ["#0071e3", "#30d158"]
      }
    },
    kpi_revenue: {
      type: "KPI",
      props: {
        title: "医疗收入",
        subtitle: "本月累计",
        icon: "💰",
        dataKey: "medical_revenue",
        unit: "万元",
        trend: true,
        comparison: { type: "yoy", label: "同比" },
        gradient: ["#0071e3", "#5856d6"]
      }
    },
    kpi_cost: {
      type: "KPI",
      props: {
        title: "医疗成本",
        subtitle: "本月累计",
        icon: "📊",
        dataKey: "medical_cost",
        unit: "万元",
        trend: true,
        comparison: { type: "yoy", label: "同比" },
        gradient: ["#ff3b30", "#ff9500"]
      }
    },
    chart_trend: {
      type: "LineChart",
      props: {
        title: "门诊量 / 住院人数趋势",
        subtitle: "近30天数据",
        dataKey: "outpatient_inpatient_trend",
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "outpatient", label: "门诊量", color: "#0071e3" },
          { field: "inpatient", label: "住院人数", color: "#0066cc" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colorScheme: ["#0071e3", "#0066cc"],
        gridColor: "rgba(255,255,255,0.12)",
        axisTextColor: "#86868b",
        legendTextColor: "#f5f5f7",
        tooltipBackgroundColor: "#272729",
        tooltipTextColor: "#ffffff",
        backgroundColor: "transparent"
      }
    },
    chart_revenue_cost: {
      type: "BarChart",
      props: {
        title: "各科室收入与成本对比",
        dataKey: "department_revenue_cost",
        xAxis: { field: "department", label: "科室" },
        yAxis: [
          { field: "revenue", label: "收入", color: "#0071e3" },
          { field: "cost", label: "成本", color: "#ff3b30" }
        ],
        showLegend: true,
        showGrid: true,
        colorScheme: ["#0071e3", "#ff3b30"],
        gridColor: "rgba(255,255,255,0.12)",
        axisTextColor: "#86868b",
        legendTextColor: "#f5f5f7",
        backgroundColor: "transparent"
      }
    },
    chart_ai_trend: {
      type: "LineChart",
      props: {
        title: "AI辅助诊断准确率趋势",
        subtitle: "近12周全院及核心科室",
        dataKey: "ai_accuracy_trend",
        xAxis: { field: "week", label: "周次" },
        yAxis: [
          { field: "overall", label: "全院", color: "#0071e3" },
          { field: "internal", label: "内科", color: "#5856d6" },
          { field: "surgery", label: "外科", color: "#34c759" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        targetLine: 98,
        colorScheme: ["#0071e3", "#5856d6", "#34c759"],
        gridColor: "rgba(255,255,255,0.12)",
        axisTextColor: "#86868b",
        legendTextColor: "#f5f5f7",
        tooltipBackgroundColor: "#272729",
        tooltipTextColor: "#ffffff",
        backgroundColor: "transparent"
      }
    },
    chart_iot_coverage: {
      type: "BarChart",
      props: {
        title: "各科室物联网设备覆盖率",
        dataKey: "iot_coverage_by_dept",
        xAxis: { field: "department", label: "科室" },
        yAxis: { field: "coverage", label: "覆盖率", unit: "%" },
        showTarget: true,
        targetValue: 80,
        targetLabel: "目标值",
        showGrid: true,
        colorScheme: ["#0071e3"],
        gridColor: "rgba(255,255,255,0.12)",
        axisTextColor: "#86868b",
        legendTextColor: "#f5f5f7",
        backgroundColor: "transparent"
      }
    },
    chart_surgery_success: {
      type: "BarChart",
      props: {
        title: "各科室手术成功率",
        dataKey: "surgery_success_by_dept",
        xAxis: { field: "department", label: "科室" },
        yAxis: { field: "success_rate", label: "成功率", unit: "%" },
        showTarget: true,
        targetValue: 90,
        targetLabel: "目标值",
        showGrid: true,
        colorScheme: ["#0071e3"],
        gridColor: "rgba(255,255,255,0.12)",
        axisTextColor: "#86868b",
        legendTextColor: "#f5f5f7",
        backgroundColor: "transparent"
      }
    },
    chart_bed_usage: {
      type: "BarChart",
      props: {
        title: "各科室床位使用率预警",
        dataKey: "bed_usage_by_dept",
        xAxis: { field: "department", label: "科室" },
        yAxis: { field: "usage_rate", label: "使用率", unit: "%" },
        showTarget: true,
        targetValue: 80,
        targetLabel: "理想上限",
        showGrid: true,
        threshold: { warning: 98, danger: 100 },
        colorScheme: ["#0071e3"],
        gridColor: "rgba(255,255,255,0.12)",
        axisTextColor: "#86868b",
        legendTextColor: "#f5f5f7",
        backgroundColor: "transparent"
      }
    },
    chart_complaint_reason: {
      type: "DonutChart",
      props: {
        title: "投诉原因分布",
        dataKey: "complaint_reasons",
        nameField: "reason",
        valueField: "count",
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colorScheme: ["#0071e3", "#0066cc", "#2997ff", "#5856d6", "#86868b"],
        labelColor: "#f5f5f7",
        percentageColor: "#86868b",
        backgroundColor: "transparent"
      }
    },
    chart_cost_structure: {
      type: "BarChart",
      props: {
        title: "医疗成本结构分析",
        dataKey: "cost_structure",
        xAxis: { field: "category", label: "成本类别" },
        yAxis: [
          { field: "labor", label: "人力", color: "#0071e3" },
          { field: "drug", label: "药品", color: "#ff3b30" },
          { field: "consumable", label: "耗材", color: "#34c759" },
          { field: "depreciation", label: "设备折旧", color: "#ff9500" }
        ],
        showLegend: true,
        showGrid: true,
        colorScheme: ["#0071e3", "#ff3b30", "#34c759", "#ff9500"],
        gridColor: "rgba(255,255,255,0.12)",
        axisTextColor: "#86868b",
        legendTextColor: "#f5f5f7",
        backgroundColor: "transparent"
      }
    },
    table_research: {
      type: "Table",
      props: {
        title: "科研论文/专利数量排名",
        dataKey: "research_ranking",
        columns: [
          { field: "rank", label: "排名", width: 60, align: "center" },
          { field: "department", label: "科室", width: 120 },
          { field: "papers", label: "论文数", width: 80, sortable: true },
          { field: "patents", label: "专利数", width: 80, sortable: true },
          { field: "composite_score", label: "综合得分", width: 100, sortable: true, unit: "分" }
        ],
        pagination: true,
        pageSize: 5,
        showIndex: false,
        striped: true,
        headerBackgroundColor: "#272729",
        headerTextColor: "#ffffff",
        rowTextColor: "#f5f5f7",
        stripedColor: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.08)"
      }
    },
    table_anomalies: {
      type: "Table",
      props: {
        title: "异常指标列表",
        dataKey: "anomaly_indicators",
        columns: [
          { field: "indicator", label: "指标名称", width: 150 },
          { field: "current_value", label: "当前值", width: 100 },
          { field: "threshold", label: "阈值", width: 100 },
          { field: "status", label: "状态", width: 80, render: (v) => v === "over" ? "🔴 超标" : "🟢 正常" },
          { field: "trend", label: "环比变化", width: 80, sortable: true, unit: "%" }
        ],
        pagination: true,
        pageSize: 6,
        showIndex: true,
        striped: true,
        headerBackgroundColor: "#272729",
        headerTextColor: "#ffffff",
        rowTextColor: "#f5f5f7",
        stripedColor: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.08)"
      }
    },
    filter_date_range: {
      type: "DateRangePicker",
      props: {
        label: "时间范围",
        defaultValue: "last_30_days",
        presets: [
          { label: "今天", value: "today" },
          { label: "最近7天", value: "last_7_days" },
          { label: "最近30天", value: "last_30_days" },
          { label: "最近90天", value: "last_90_days" }
        ]
      }
    },
    filter_department: {
      type: "MultiSelect",
      props: {
        label: "科室",
        placeholder: "全部科室",
        options: [
          { label: "内科", value: "internal" },
          { label: "外科", value: "surgery" },
          { label: "妇产科", value: "obgyn" },
          { label: "儿科", value: "pediatrics" },
          { label: "急诊科", value: "emergency" },
          { label: "医技科", value: "medical_tech" }
        ]
      }
    },
    filter_tech_type: {
      type: "MultiSelect",
      props: {
        label: "技术类别",
        placeholder: "全部技术",
        options: [
          { label: "AI诊断", value: "ai_diag" },
          { label: "物联网", value: "iot" },
          { label: "手术机器人", value: "surgery_robot" },
          { label: "远程医疗", value: "telemedicine" }
        ]
      }
    },
    filter_time_range_p3: {
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
    }
  };

  const pageStyle = {
    width: 1920,
    height: 1080,
    display: "flex",
    flexDirection: "column",
    background: "#000000",
    overflow: "hidden",
    fontFamily: ["-apple-system", "BlinkMacSystemFont", "\"SF Pro Display\"", "\"Helvetica Neue\"", "Arial", "sans-serif"].join(",")
  };

  const headerStyle = {
    height: 56,
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    backgroundColor: "rgba(0,0,0,0.8)"
  };

  const footerStyle = {
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderTop: "1px solid rgba(255,255,255,0.08)"
  };

  const cardStyle = {
    backgroundColor: "#272729",
    borderRadius: 16,
    border: "1px solid #424245",
    padding: 16,
    transition: "all 0.2s ease"
  };

  const dotStyle = (active) => ({
    width: active ? 32 : 8,
    height: 8,
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    backgroundColor: active ? "#0071e3" : "rgba(255,255,255,0.2)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  });

  const Page1 = () => (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#ffffff", margin: 0, letterSpacing: "0.216px" }}>智慧医院先进技术全景看板</h1>
          <span style={{ fontSize: 14, color: "#86868b", padding: "4px 12px", backgroundColor: "rgba(0,113,227,0.2)", borderRadius: 20 }}>总览驾驶舱</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Widget config={widgets.filter_date_range} />
          <Widget config={widgets.filter_department} />
        </div>
      </header>
      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 20,
        padding: 24
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16
        }}>
          {[widgets.kpi_outpatient, widgets.kpi_inpatient, widgets.kpi_bed_usage, widgets.kpi_surgery_success,
            widgets.kpi_ai_accuracy, widgets.kpi_iot_coverage, widgets.kpi_revenue, widgets.kpi_cost].map((w, i) => (
            <div key={i} style={cardStyle}>
              <Widget config={w} />
            </div>
          ))}
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr",
          gap: 20,
          marginTop: 40
        }}>
          <div style={{ ...cardStyle, height: 380 }}>
            <Widget config={widgets.chart_trend} />
          </div>
          <div style={{ ...cardStyle, height: 380 }}>
            <Widget config={widgets.chart_revenue_cost} />
          </div>
        </div>
      </main>
      <footer style={footerStyle}>
        {[0, 1, 2].map(i => (
          <button key={i} onClick={() => setCurrentPage(i)} style={dotStyle(currentPage === i)} />
        ))}
      </footer>
    </div>
  );

  const Page2 = () => (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#ffffff", margin: 0, letterSpacing: "0.216px" }}>技术与质量详情</h1>
          <span style={{ fontSize: 14, color: "#86868b", padding: "4px 12px", backgroundColor: "rgba(52,199,89,0.2)", borderRadius: 20 }}>分析视图</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Widget config={widgets.filter_department} />
          <Widget config={widgets.filter_tech_type} />
        </div>
      </header>
      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateRows: "380px 1fr",
        gap: 20,
        padding: 24
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.2fr 1.2fr",
          gap: 20
        }}>
          <div style={{ ...cardStyle, height: 380 }}>
            <Widget config={widgets.chart_ai_trend} />
          </div>
          <div style={{ ...cardStyle, height: 380 }}>
            <Widget config={widgets.chart_iot_coverage} />
          </div>
          <div style={{ ...cardStyle, height: 380 }}>
            <Widget config={widgets.chart_surgery_success} />
          </div>
        </div>
        <div style={{ ...cardStyle, height: 400 }}>
          <Widget config={widgets.table_research} />
        </div>
      </main>
      <footer style={footerStyle}>
        {[0, 1, 2].map(i => (
          <button key={i} onClick={() => setCurrentPage(i)} style={dotStyle(currentPage === i)} />
        ))}
      </footer>
    </div>
  );

  const Page3 = () => (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#ffffff", margin: 0, letterSpacing: "0.216px" }}>运营诊断与决策</h1>
          <span style={{ fontSize: 14, color: "#86868b", padding: "4px 12px", backgroundColor: "rgba(255,59,48,0.2)", borderRadius: 20 }}>诊断视图</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Widget config={widgets.filter_time_range_p3} />
          <Widget config={widgets.filter_department} />
        </div>
      </header>
      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateRows: "380px 1fr",
        gap: 20,
        padding: 24
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr",
          gap: 20
        }}>
          <div style={{ ...cardStyle, height: 380 }}>
            <Widget config={widgets.table_anomalies} />
          </div>
          <div style={{ ...cardStyle, height: 380 }}>
            <Widget config={widgets.chart_bed_usage} />
          </div>
          <div style={{ ...cardStyle, height: 380 }}>
            <Widget config={widgets.chart_complaint_reason} />
          </div>
        </div>
        <div style={{ ...cardStyle, height: 400 }}>
          <Widget config={widgets.chart_cost_structure} />
        </div>
      </main>
      <footer style={footerStyle}>
        {[0, 1, 2].map(i => (
          <button key={i} onClick={() => setCurrentPage(i)} style={dotStyle(currentPage === i)} />
        ))}
      </footer>
    </div>
  );

  const pages = [<Page1 key="p1" />, <Page2 key="p2" />, <Page3 key="p3" />];
  return pages[currentPage];
}