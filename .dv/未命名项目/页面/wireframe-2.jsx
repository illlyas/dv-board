export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);

  // ===== 组件配置区 =====
  const widgets = {
    // ===== P1 总览驾驶舱 =====
    // KPI 卡片
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
        gradient: ["#3b82f6", "#8b5cf6"]
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
        gradient: ["#8b5cf6", "#ec4899"]
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
        gradient: ["#f59e0b", "#ef4444"]
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
        gradient: ["#10b981", "#34d399"]
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
        gradient: ["#6366f1", "#8b5cf6"]
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
        gradient: ["#14b8a6", "#06b6d4"]
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
        gradient: ["#3b82f6", "#1d4ed8"]
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
        gradient: ["#ef4444", "#dc2626"]
      }
    },
    // P1 图表
    chart_trend: {
      type: "LineChart",
      props: {
        title: "门诊量 / 住院人数趋势",
        subtitle: "近30天数据",
        dataKey: "outpatient_inpatient_trend",
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "outpatient", label: "门诊量", color: "#3b82f6" },
          { field: "inpatient", label: "住院人数", color: "#ec4899" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true
      }
    },
    chart_revenue_cost: {
      type: "BarChart",
      props: {
        title: "各科室收入与成本对比",
        dataKey: "department_revenue_cost",
        xAxis: { field: "department", label: "科室" },
        yAxis: [
          { field: "revenue", label: "收入", color: "#3b82f6" },
          { field: "cost", label: "成本", color: "#ef4444" }
        ],
        showLegend: true,
        showGrid: true
      }
    },
    // P1 筛选器
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

    // ===== P2 技术与质量详情 =====
    chart_ai_trend: {
      type: "LineChart",
      props: {
        title: "AI辅助诊断准确率趋势",
        subtitle: "近12周全院及核心科室",
        dataKey: "ai_accuracy_trend",
        xAxis: { field: "week", label: "周次" },
        yAxis: [
          { field: "overall", label: "全院", color: "#3b82f6" },
          { field: "internal", label: "内科", color: "#ef4444" },
          { field: "surgery", label: "外科", color: "#10b981" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        targetLine: 98
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
        showGrid: true
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
        showGrid: true
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
        striped: true
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

    // ===== P3 运营诊断与决策 =====
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
        striped: true
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
        // 自定义颜色阈值（在组件内部根据值变色）
        threshold: { warning: 98, danger: 100 }
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
        legendPosition: "right"
      }
    },
    chart_cost_structure: {
      type: "BarChart",
      props: {
        title: "医疗成本结构分析",
        dataKey: "cost_structure",
        xAxis: { field: "category", label: "成本类别" },
        yAxis: [
          { field: "labor", label: "人力", color: "#3b82f6" },
          { field: "drug", label: "药品", color: "#ef4444" },
          { field: "consumable", label: "耗材", color: "#10b981" },
          { field: "depreciation", label: "设备折旧", color: "#f59e0b" }
        ],
        showLegend: true,
        showGrid: true
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

  // ===== 页面布局 =====
  const cardStyle = {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    padding: 16,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  };

  const hoverStyle = {
    transition: "transform 0.2s, box-shadow 0.2s"
  };

  const Page1 = () => (
    <div style={{
      width: 1920,
      height: 1080,
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
      overflow: "hidden"
    }}>
      <header style={{
        height: 72,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", margin: 0 }}>智慧医院先进技术全景看板</h1>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", padding: "4px 12px", background: "rgba(59,130,246,0.2)", borderRadius: 20 }}>总览驾驶舱</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Widget config={widgets.filter_date_range} />
          <Widget config={widgets.filter_department} />
        </div>
      </header>
      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateRows: "160px 380px",
        gap: 24,
        padding: 24
      }}>
        {/* KPI 卡片 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16
        }}>
          <div style={{ ...cardStyle, ...hoverStyle }}>
            <Widget config={widgets.kpi_outpatient} />
          </div>
          <div style={{ ...cardStyle, ...hoverStyle }}>
            <Widget config={widgets.kpi_inpatient} />
          </div>
          <div style={{ ...cardStyle, ...hoverStyle }}>
            <Widget config={widgets.kpi_bed_usage} />
          </div>
          <div style={{ ...cardStyle, ...hoverStyle }}>
            <Widget config={widgets.kpi_surgery_success} />
          </div>
          <div style={{ ...cardStyle, ...hoverStyle }}>
            <Widget config={widgets.kpi_ai_accuracy} />
          </div>
          <div style={{ ...cardStyle, ...hoverStyle }}>
            <Widget config={widgets.kpi_iot_coverage} />
          </div>
          <div style={{ ...cardStyle, ...hoverStyle }}>
            <Widget config={widgets.kpi_revenue} />
          </div>
          <div style={{ ...cardStyle, ...hoverStyle }}>
            <Widget config={widgets.kpi_cost} />
          </div>
        </div>
        {/* 图表 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr",
          gap: 24
        }}>
          <div style={{ ...cardStyle, height: 380 }}>
            <Widget config={widgets.chart_trend} />
          </div>
          <div style={{ ...cardStyle, height: 380 }}>
            <Widget config={widgets.chart_revenue_cost} />
          </div>
        </div>
      </main>
      <footer style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderTop: "1px solid rgba(255,255,255,0.08)"
      }}>
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            style={{
              width: currentPage === i ? 32 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              background: currentPage === i
                ? "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"
                : "rgba(255,255,255,0.2)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
        ))}
      </footer>
    </div>
  );

  const Page2 = () => (
    <div style={{
      width: 1920,
      height: 1080,
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
      overflow: "hidden"
    }}>
      <header style={{
        height: 72,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", margin: 0 }}>技术与质量详情</h1>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", padding: "4px 12px", background: "rgba(16,185,129,0.2)", borderRadius: 20 }}>分析视图</span>
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
        gap: 24,
        padding: 24
      }}>
        {/* 第一行：折线图 + 两个柱状图 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.2fr 1.2fr",
          gap: 24
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
        {/* 第二行：表格 */}
        <div style={{ ...cardStyle, height: 400 }}>
          <Widget config={widgets.table_research} />
        </div>
      </main>
      <footer style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderTop: "1px solid rgba(255,255,255,0.08)"
      }}>
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            style={{
              width: currentPage === i ? 32 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              background: currentPage === i
                ? "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"
                : "rgba(255,255,255,0.2)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
        ))}
      </footer>
    </div>
  );

  const Page3 = () => (
    <div style={{
      width: 1920,
      height: 1080,
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
      overflow: "hidden"
    }}>
      <header style={{
        height: 72,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", margin: 0 }}>运营诊断与决策</h1>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", padding: "4px 12px", background: "rgba(239,68,68,0.2)", borderRadius: 20 }}>诊断视图</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Widget config={widgets.filter_time_range_p3} />
          <Widget config={widgets.filter_department} />
        </div>
      </header>
      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateRows: "380px 400px",
        gap: 24,
        padding: 24
      }}>
        {/* 第一行：表格 + 柱状图 + 饼图 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr",
          gap: 24
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
        {/* 第二行：成本结构 */}
        <div style={{ ...cardStyle, height: 400 }}>
          <Widget config={widgets.chart_cost_structure} />
        </div>
      </main>
      <footer style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderTop: "1px solid rgba(255,255,255,0.08)"
      }}>
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            style={{
              width: currentPage === i ? 32 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              background: currentPage === i
                ? "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"
                : "rgba(255,255,255,0.2)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
        ))}
      </footer>
    </div>
  );

  const pages = [<Page1 key="p1" />, <Page2 key="p2" />, <Page3 key="p3" />];
  return pages[currentPage];
}