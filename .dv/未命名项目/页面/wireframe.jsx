export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);

  const widgets = {
    // ===== P1 总览驾驶舱 ===== //
    kpi_outpatient: {
      type: "KPI",
      props: {
        title: "门诊量",
        subtitle: "今日累计",
        icon: "🏥",
        dataKey: "outpatient_today",
        unit: "人次",
        trend: true,
        comparison: { type: "yoy", label: "同比" },
        gradient: ["#3b82f6", "#8b5cf6"]
      }
    },
    kpi_bed_usage: {
      type: "KPI",
      props: {
        title: "病床使用率",
        subtitle: "当前在院",
        icon: "🛏️",
        dataKey: "bed_usage_rate",
        unit: "%",
        trend: true,
        comparison: { type: "target", label: "目标85%" },
        gradient: ["#ef4444", "#f97316"]
      }
    },
    kpi_surgery_success: {
      type: "KPI",
      props: {
        title: "手术成功率",
        subtitle: "月度",
        icon: "🔬",
        dataKey: "surgery_success_rate",
        unit: "%",
        trend: true,
        comparison: { type: "mom", label: "环比" },
        gradient: ["#22c55e", "#16a34a"]
      }
    },
    kpi_ai_accuracy: {
      type: "KPI",
      props: {
        title: "AI辅助诊断准确率",
        subtitle: "今日",
        icon: "🤖",
        dataKey: "ai_diagnosis_accuracy",
        unit: "%",
        trend: true,
        comparison: { type: "target", label: "目标98%" },
        gradient: ["#a855f7", "#d946ef"]
      }
    },
    kpi_iot_coverage: {
      type: "KPI",
      props: {
        title: "物联网设备覆盖率",
        subtitle: "全院",
        icon: "📡",
        dataKey: "iot_coverage",
        unit: "%",
        trend: true,
        comparison: { type: "target", label: "目标90%" },
        gradient: ["#06b6d4", "#0891b2"]
      }
    },
    chart_trend: {
      type: "LineChart",
      props: {
        title: "门诊量 & 住院人数趋势",
        subtitle: "近30天",
        dataKey: "outpatient_inpatient_trend",
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "outpatient", label: "门诊量", color: "#3b82f6" },
          { field: "inpatient", label: "住院人数", color: "#ef4444" }
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
          { field: "revenue", label: "收入(万元)", color: "#22c55e" },
          { field: "cost", label: "成本(万元)", color: "#f97316" }
        ],
        showLegend: true,
        showGrid: true,
        direction: "vertical"
      }
    },

    // ===== P2 技术与质量详情 ===== //
    chart_ai_trend: {
      type: "LineChart",
      props: {
        title: "AI诊断准确率趋势",
        subtitle: "近12周",
        dataKey: "ai_accuracy_trend",
        xAxis: { field: "week", label: "周" },
        yAxis: [
          { field: "whole_hospital", label: "全院", color: "#3b82f6" },
          { field: "internal", label: "内科", color: "#ef4444" },
          { field: "surgery", label: "外科", color: "#22c55e" }
        ],
        showLegend: true,
        showGrid: true,
        smooth: true
      }
    },
    chart_iot_department: {
      type: "BarChart",
      props: {
        title: "各科室物联网覆盖率",
        dataKey: "department_iot_coverage",
        xAxis: { field: "department", label: "科室" },
        yAxis: { field: "coverage", label: "覆盖率", unit: "%" },
        showTarget: true,
        targetValue: 90,
        targetLabel: "目标90%",
        showGrid: true
      }
    },
    chart_surgery_department: {
      type: "BarChart",
      props: {
        title: "各科室手术成功率",
        dataKey: "department_surgery_success",
        xAxis: { field: "department", label: "科室" },
        yAxis: { field: "rate", label: "成功率", unit: "%" },
        showTarget: true,
        targetValue: 95,
        targetLabel: "目标95%",
        showGrid: true
      }
    },
    table_research: {
      type: "Table",
      props: {
        title: "科研论文/专利数量排名",
        dataKey: "research_ranking",
        columns: [
          { field: "department", label: "科室", width: 120 },
          { field: "papers", label: "论文数", width: 100, sortable: true },
          { field: "patents", label: "专利数", width: 100, sortable: true },
          { field: "score", label: "综合得分", width: 100, sortable: true }
        ],
        pagination: true,
        pageSize: 8,
        showIndex: true,
        striped: true
      }
    },
    select_department: {
      type: "Select",
      props: {
        label: "科室",
        placeholder: "全部科室",
        multiple: false,
        options: [
          { label: "内科", value: "internal" },
          { label: "外科", value: "surgery" },
          { label: "妇产科", value: "obs" },
          { label: "儿科", value: "pediatrics" },
          { label: "急诊科", value: "emergency" }
        ]
      }
    },
    multi_tech: {
      type: "MultiSelect",
      props: {
        label: "技术类别",
        placeholder: "全部技术",
        options: [
          { label: "AI诊断", value: "ai" },
          { label: "物联网", value: "iot" },
          { label: "手术机器人", value: "surgery_robot" }
        ]
      }
    },

    // ===== P3 运营诊断与决策 ===== //
    table_anomaly: {
      type: "Table",
      props: {
        title: "异常指标列表",
        dataKey: "anomaly_indicators",
        columns: [
          { field: "name", label: "指标名", width: 140 },
          { field: "current", label: "当前值", width: 100 },
          { field: "threshold", label: "阈值", width: 100 },
          { field: "status", label: "预警", width: 80 },
          { field: "change", label: "环比变化", width: 100, sortable: true }
        ],
        pagination: true,
        pageSize: 5,
        showIndex: true,
        striped: true
      }
    },
    chart_bed_alert: {
      type: "BarChart",
      props: {
        title: "各科室床位使用率预警",
        dataKey: "department_bed_usage",
        xAxis: { field: "department", label: "科室" },
        yAxis: { field: "usage_rate", label: "使用率", unit: "%" },
        showTarget: true,
        targetValue: 98,
        targetLabel: "超限警戒",
        showGrid: true
      }
    },
    chart_complaint: {
      type: "DonutChart",
      props: {
        title: "投诉原因分布",
        dataKey: "complaint_reasons",
        nameField: "reason",
        valueField: "count",
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        donut: true
      }
    },
    chart_cost_structure: {
      type: "BarChart",
      props: {
        title: "医疗成本结构分析",
        dataKey: "cost_structure",
        xAxis: { field: "category", label: "成本类别" },
        yAxis: { field: "amount", label: "金额(万元)" },
        showLegend: true,
        direction: "horizontal"
      }
    },
    date_picker: {
      type: "DateRangePicker",
      props: {
        label: "时间范围",
        defaultValue: "last_30_days",
        presets: [
          { label: "今天", value: "today" },
          { label: "最近7天", value: "last_7_days" },
          { label: "最近30天", value: "last_30_days" },
          { label: "本月", value: "this_month" }
        ]
      }
    },
    multi_department: {
      type: "MultiSelect",
      props: {
        label: "科室",
        placeholder: "全部科室",
        options: [
          { label: "内科", value: "internal" },
          { label: "外科", value: "surgery" },
          { label: "妇产科", value: "obs" },
          { label: "儿科", value: "pediatrics" },
          { label: "急诊科", value: "emergency" }
        ]
      }
    }
  };

  // ===== 页面1：总览驾驶舱 ===== //
  const Page1 = () => (
    <div style={{
      width: 1920,
      height: 1080,
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
      overflow: "hidden"
    }}>
      {/* Header */}
      <header style={{
        height: 72,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)"
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", margin: 0 }}>
          智慧医院先进技术全景看板 - 总览驾驶舱
        </h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Widget config={widgets.date_picker} />
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 24,
        padding: 24,
        overflowY: "auto",
        overflowX: "hidden"
      }}>
        {/* KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16
        }}>
          <Widget config={widgets.kpi_outpatient} />
          <Widget config={widgets.kpi_bed_usage} />
          <Widget config={widgets.kpi_surgery_success} />
          <Widget config={widgets.kpi_ai_accuracy} />
          <Widget config={widgets.kpi_iot_coverage} />
        </div>

        {/* Charts */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 24,
          height: "100%"
        }}>
          <div style={{ height: "100%" }}>
            <Widget config={widgets.chart_trend} />
          </div>
          <div style={{ height: "100%" }}>
            <Widget config={widgets.chart_revenue_cost} />
          </div>
        </div>
      </main>

      {/* Footer */}
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

  // ===== 页面2：技术与质量详情 ===== //
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
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", margin: 0 }}>
          技术与质量详情
        </h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Widget config={widgets.select_department} />
          <Widget config={widgets.multi_tech} />
        </div>
      </header>

      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateRows: "1fr 1fr 1fr",
        gap: 16,
        padding: 24,
        overflow: "hidden"
      }}>
        {/* 第一行：两个图表 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          height: "100%"
        }}>
          <div style={{ height: "100%" }}>
            <Widget config={widgets.chart_ai_trend} />
          </div>
          <div style={{ height: "100%" }}>
            <Widget config={widgets.chart_iot_department} />
          </div>
        </div>
        {/* 第二行：手术成功率和表格 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          height: "100%"
        }}>
          <div style={{ height: "100%" }}>
            <Widget config={widgets.chart_surgery_department} />
          </div>
          <div style={{ height: "100%" }}>
            <Widget config={widgets.table_research} />
          </div>
        </div>
        {/* 第三行：空白或扩展（保留空间） */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)" }}>
          下钻区域（可添加病种分析等）
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

  // ===== 页面3：运营诊断与决策 ===== //
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
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", margin: 0 }}>
          运营诊断与决策
        </h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Widget config={widgets.date_picker} />
          <Widget config={widgets.multi_department} />
        </div>
      </header>

      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateRows: "1fr 1fr",
        gap: 24,
        padding: 24,
        overflow: "hidden"
      }}>
        {/* 第一行：异常指标表和床位预警 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 24,
          height: "100%"
        }}>
          <div style={{ height: "100%" }}>
            <Widget config={widgets.table_anomaly} />
          </div>
          <div style={{ height: "100%" }}>
            <Widget config={widgets.chart_bed_alert} />
          </div>
        </div>
        {/* 第二行：投诉分布和成本结构 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          height: "100%"
        }}>
          <div style={{ height: "100%" }}>
            <Widget config={widgets.chart_complaint} />
          </div>
          <div style={{ height: "100%" }}>
            <Widget config={widgets.chart_cost_structure} />
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

  const pages = [<Page1 key="page1" />, <Page2 key="page2" />, <Page3 key="page3" />];
  return pages[currentPage];
}