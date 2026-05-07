export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(0);

  // Apple VI color constants
  const colors = {
    black: "#000000",
    paleGray: "#f5f5f7",
    white: "#ffffff",
    actionBlue: "#0071e3",
    linkBlue: "#0066cc",
    highLuminanceBlue: "#2997ff",
    nearBlack: "#1d1d1f",
    secondaryGray: "#6e6e73",
    softBorder: "#d2d2d7",
    midBorder: "#86868b",
    utilityDark: "#424245",
    graphiteA: "#272729",
    graphiteB: "#262629",
    graphiteC: "#28282b",
    graphiteD: "#2a2a2c",
  };

  // ===== P1 医院运营总览（仅更新视觉属性） =====
  const widgetsP1 = {
    kpi_outpatient_rate: {
      type: "KPI",
      props: {
        title: "门诊率",
        subtitle: "当前",
        icon: "🏥",
        dataKey: "outpatient_rate",
        unit: "%",
        trend: true,
        comparison: { type: "yoy", label: "同比" },
        gradient: ["#0071e3", "#2997ff"],
      },
    },
    kpi_surgery_count: {
      type: "KPI",
      props: {
        title: "手术数量",
        subtitle: "今日累计",
        icon: "🔪",
        dataKey: "surgery_count",
        unit: "台",
        trend: true,
        comparison: { type: "yoy", label: "同比" },
        gradient: ["#0071e3", "#2997ff"],
      },
    },
    kpi_wait_time: {
      type: "KPI",
      props: {
        title: "平均候诊时长",
        subtitle: "当前",
        icon: "⏳",
        dataKey: "wait_time",
        unit: "分钟",
        trend: true,
        comparison: { type: "mom", label: "环比" },
        gradient: ["#0071e3", "#2997ff"],
      },
    },
    kpi_bed_usage: {
      type: "KPI",
      props: {
        title: "床位使用率",
        subtitle: "当前",
        icon: "🛏️",
        dataKey: "bed_usage",
        unit: "%",
        trend: true,
        comparison: { type: "yoy", label: "同比" },
        gradient: ["#0071e3", "#2997ff"],
      },
    },
    chart_outpatient_rate_trend: {
      type: "LineChart",
      props: {
        title: "门诊率实时趋势",
        subtitle: "每15分钟更新",
        dataKey: "outpatient_rate_trend",
        xAxis: { field: "time", label: "时间" },
        yAxis: [
          { field: "rate", label: "门诊率", color: "#0071e3" },
        ],
        showLegend: false,
        showGrid: true,
        smooth: true,
        colors: ["#0071e3"],
      },
    },
    chart_surgery_vs_plan: {
      type: "BarChart",
      props: {
        title: "手术数量与计划对比",
        dataKey: "surgery_vs_plan",
        xAxis: { field: "period", label: "时段" },
        yAxis: { field: "completed", label: "完成手术", unit: "台" },
        showTarget: true,
        targetValue: 120,
        targetLabel: "计划目标",
        showGrid: true,
        colors: ["#0071e3", "#2997ff"],
      },
    },
    chart_dual_trend: {
      type: "LineChart",
      props: {
        title: "门诊率 / 手术数量同比环比",
        subtitle: "近7天",
        dataKey: "dual_trend",
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "outpatient_rate", label: "门诊率", color: "#0071e3" },
          { field: "surgery_count", label: "手术数量", color: "#2997ff" },
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
        colors: ["#0071e3", "#2997ff"],
      },
    },
    table_department_heatmap: {
      type: "Table",
      props: {
        title: "门诊负荷科室热力图",
        dataKey: "department_heatmap",
        columns: [
          { field: "department", label: "科室", width: 120 },
          { field: "visits", label: "门诊人次", width: 90 },
          { field: "capacity", label: "核定接诊量", width: 100 },
          { field: "load", label: "负荷率", width: 80, unit: "%" },
        ],
        pagination: false,
        striped: true,
      },
    },
    table_alert_summary: {
      type: "Table",
      props: {
        title: "预警信息汇总",
        dataKey: "alert_summary",
        columns: [
          { field: "type", label: "预警类型", width: 120 },
          { field: "detail", label: "描述", width: 200 },
          { field: "time", label: "触发时间", width: 150 },
        ],
        pagination: true,
        pageSize: 5,
        showIndex: true,
      },
    },
    filter_date: {
      type: "DateRangePicker",
      props: {
        label: "时间范围",
        presets: [
          { label: "今天", value: "today" },
          { label: "最近7天", value: "last_7_days" },
          { label: "最近30天", value: "last_30_days" },
        ],
      },
    },
    filter_hospital: {
      type: "Select",
      props: {
        label: "院区",
        placeholder: "全部院区",
        options: [
          { label: "本部", value: "main" },
          { label: "东院", value: "east" },
          { label: "西院", value: "west" },
        ],
      },
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
        ],
      },
    },
  };

  // ===== P2 智能手术调度（更新视觉属性） =====
  const widgetsP2 = {
    kpi_surgery_count2: {
      type: "KPI",
      props: {
        title: "手术数量",
        icon: "🔪",
        dataKey: "surgery_count2",
        unit: "台",
        trend: true,
        gradient: ["#0071e3", "#2997ff"],
      },
    },
    kpi_turnover: {
      type: "KPI",
      props: {
        title: "平均周转时间",
        icon: "⏱️",
        dataKey: "turnover_time",
        unit: "分钟",
        trend: true,
        comparison: { type: "yoy", label: "同比" },
        gradient: ["#0071e3", "#2997ff"],
      },
    },
    kpi_clearance: {
      type: "KPI",
      props: {
        title: "手术室腾出率",
        icon: "✅",
        dataKey: "clearance_rate",
        unit: "%",
        trend: true,
        gradient: ["#0071e3", "#2997ff"],
      },
    },
    chart_or_status: {
      type: "DonutChart",
      props: {
        title: "手术室实时状态",
        dataKey: "or_status",
        nameField: "status",
        valueField: "count",
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colors: ["#0071e3", "#2997ff", "#86868b", "#6e6e73"],
      },
    },
    chart_surgery_type: {
      type: "PieChart",
      props: {
        title: "手术类型构成",
        dataKey: "surgery_type",
        nameField: "type",
        valueField: "count",
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colors: ["#0071e3", "#2997ff", "#86868b", "#6e6e73", "#424245"],
      },
    },
    chart_or_turnover_rank: {
      type: "BarChart",
      props: {
        title: "手术室周转时间排行",
        dataKey: "or_turnover_rank",
        xAxis: { field: "or_room", label: "手术室" },
        yAxis: { field: "turnover", label: "周转时间", unit: "分钟" },
        showTarget: true,
        targetValue: 30,
        targetLabel: "30分钟阈值",
        showGrid: true,
        colors: ["#0071e3", "#2997ff"],
      },
    },
    chart_surgery_progress: {
      type: "BarChart",
      props: {
        title: "手术数量日进度",
        dataKey: "surgery_progress",
        xAxis: { field: "hour", label: "小时" },
        yAxis: { field: "completed", label: "完成手术", unit: "台" },
        showTarget: true,
        targetValue: 200,
        targetLabel: "日目标",
        showGrid: true,
        colors: ["#0071e3", "#2997ff"],
      },
    },
    table_delayed_surgery: {
      type: "Table",
      props: {
        title: "延误手术清单",
        dataKey: "delayed_surgery",
        columns: [
          { field: "or_room", label: "手术室", width: 80 },
          { field: "disease", label: "病种", width: 120 },
          { field: "surgeon", label: "主刀医生", width: 100 },
          { field: "reason", label: "延误原因", width: 200 },
        ],
        pagination: true,
        pageSize: 8,
        showIndex: true,
      },
    },
    filter_date2: {
      type: "DateRangePicker",
      props: {
        label: "日期",
        defaultValue: "today",
      },
    },
    filter_hospital2: {
      type: "Select",
      props: {
        label: "院区",
        placeholder: "全部院区",
        options: [
          { label: "本部", value: "main" },
          { label: "东院", value: "east" },
          { label: "西院", value: "west" },
        ],
      },
    },
    filter_or_room: {
      type: "MultiSelect",
      props: {
        label: "手术室",
        placeholder: "全部手术室",
        options: [
          { label: "1号手术室", value: "OR1" },
          { label: "2号手术室", value: "OR2" },
          { label: "3号手术室", value: "OR3" },
          { label: "4号手术室", value: "OR4" },
        ],
      },
    },
  };

  // ===== P3 资源与设备健康（更新视觉属性） =====
  const widgetsP3 = {
    kpi_bed_usage2: {
      type: "KPI",
      props: {
        title: "床位使用率",
        icon: "🛏️",
        dataKey: "bed_usage2",
        unit: "%",
        trend: true,
        gradient: ["#0071e3", "#2997ff"],
      },
    },
    kpi_equipment_health: {
      type: "KPI",
      props: {
        title: "设备完好率",
        icon: "🔧",
        dataKey: "equipment_health",
        unit: "%",
        trend: true,
        gradient: ["#0071e3", "#2997ff"],
      },
    },
    kpi_equipment_occupancy: {
      type: "KPI",
      props: {
        title: "设备占用率",
        icon: "📊",
        dataKey: "equipment_occupancy",
        unit: "%",
        trend: true,
        gradient: ["#0071e3", "#2997ff"],
      },
    },
    chart_bed_trend: {
      type: "LineChart",
      props: {
        title: "床位使用率趋势",
        subtitle: "近7天",
        dataKey: "bed_trend",
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "usage", label: "使用率", color: "#0071e3" },
        ],
        showGrid: true,
        smooth: true,
        colors: ["#0071e3"],
      },
    },
    table_equipment_detail: {
      type: "Table",
      props: {
        title: "设备完好率仪表盘",
        dataKey: "equipment_detail",
        columns: [
          { field: "type", label: "设备类型", width: 120 },
          { field: "health", label: "完好率", width: 80, unit: "%" },
          { field: "status", label: "状态", width: 100 },
        ],
        pagination: false,
        striped: true,
      },
    },
    chart_occupancy_rank: {
      type: "BarChart",
      props: {
        title: "设备占用率排行",
        dataKey: "occupancy_rank",
        xAxis: { field: "device", label: "设备类型" },
        yAxis: { field: "occupancy", label: "占用率", unit: "%" },
        showGrid: true,
        colors: ["#0071e3", "#2997ff"],
      },
    },
    table_doctor_ranking: {
      type: "Table",
      props: {
        title: "医生工作量 Top 10",
        dataKey: "doctor_ranking",
        columns: [
          { field: "rank", label: "排名", width: 50 },
          { field: "name", label: "医生姓名", width: 100 },
          { field: "department", label: "科室", width: 100 },
          { field: "outpatient", label: "门诊量", width: 80 },
          { field: "surgery", label: "手术量", width: 80 },
        ],
        showIndex: false,
        sortable: true,
        pagination: false,
      },
    },
    chart_staff_distribution: {
      type: "DonutChart",
      props: {
        title: "人员负荷分布",
        dataKey: "staff_distribution",
        nameField: "category",
        valueField: "count",
        showPercentage: true,
        showLegend: true,
        legendPosition: "right",
        colors: ["#0071e3", "#2997ff", "#86868b", "#6e6e73"],
      },
    },
    filter_department3: {
      type: "MultiSelect",
      props: {
        label: "科室",
        placeholder: "全部科室",
        options: [
          { label: "内科", value: "internal" },
          { label: "外科", value: "surgery" },
          { label: "妇产科", value: "obgyn" },
          { label: "儿科", value: "pediatric" },
        ],
      },
    },
    filter_device_type: {
      type: "MultiSelect",
      props: {
        label: "设备类型",
        placeholder: "全部设备",
        options: [
          { label: "CT", value: "ct" },
          { label: "MRI", value: "mri" },
          { label: "DR", value: "dr" },
          { label: "超声", value: "ultrasound" },
          { label: "手术机器人", value: "robot" },
        ],
      },
    },
    filter_staff_category: {
      type: "Select",
      props: {
        label: "人员类别",
        placeholder: "全部",
        options: [
          { label: "医生", value: "doctor" },
          { label: "护士", value: "nurse" },
        ],
      },
    },
  };

  // ===== 样式对象 (完全采用VI系统) =====
  const styles = {
    container: {
      width: 1920,
      height: 1080,
      display: "flex",
      flexDirection: "column",
      background: colors.black,
      overflow: "hidden",
      fontFamily: "'SF Pro Text', 'Inter', 'Helvetica Neue', Arial, sans-serif",
    },
    header: {
      height: 72,
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${colors.utilityDark}`,
      backdropFilter: "blur(20px) saturate(180%)",
      background: "rgba(0,0,0,0.8)",
    },
    title: {
      fontSize: 28,
      fontWeight: 600,
      color: colors.white,
      margin: 0,
      letterSpacing: "-0.2px",
      fontFamily: "'SF Pro Display', 'Inter Tight', 'Helvetica Neue', Arial, sans-serif",
    },
    pageIndicator: {
      display: "flex",
      gap: 8,
    },
    pageBtn: {
      padding: "8px 20px",
      borderRadius: 18,
      border: "1px solid",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
      lineHeight: 1.3,
      letterSpacing: "-0.224px",
      fontFamily: "'SF Pro Text', 'Inter', 'Helvetica Neue', Arial, sans-serif",
    },
    main: {
      flex: 1,
      padding: 28,
      overflowY: "auto",
      background: colors.black,
    },
    page: {
      display: "flex",
      flexDirection: "column",
      gap: 24,
      height: "100%",
    },
    filterBar: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap",
      padding: 16,
      background: colors.nearBlack,
      borderRadius: 18,
      border: `1px solid ${colors.utilityDark}`,
    },
    kpiRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 16,
    },
    chartsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 16,
    },
    footer: {
      height: 48,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderTop: `1px solid ${colors.utilityDark}`,
      background: colors.black,
    },
  };

  // ===== 品牌化样式 =====
  const cardStyle = {
    background: colors.graphiteA,
    borderRadius: 16,
    border: `1px solid ${colors.utilityDark}`,
    padding: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    transition: "box-shadow 0.2s, transform 0.2s",
  };

  const filterItemWrapperStyle = {
    background: colors.graphiteB,
    borderRadius: 8,
    border: `1px solid ${colors.midBorder}`,
    padding: "4px 12px",
    minWidth: 160,
    display: "flex",
    alignItems: "center",
  };

  // ===== 页面布局 =====
  const Page1 = () => (
    <div style={styles.page}>
      {/* 筛选器 */}
      <div style={styles.filterBar}>
        <div style={filterItemWrapperStyle}><Widget config={widgetsP1.filter_date} /></div>
        <div style={filterItemWrapperStyle}><Widget config={widgetsP1.filter_hospital} /></div>
        <div style={filterItemWrapperStyle}><Widget config={widgetsP1.filter_department} /></div>
      </div>
      {/* 核心KPI */}
      <div style={styles.kpiRow}>
        <div style={cardStyle}><Widget config={widgetsP1.kpi_outpatient_rate} /></div>
        <div style={cardStyle}><Widget config={widgetsP1.kpi_surgery_count} /></div>
        <div style={cardStyle}><Widget config={widgetsP1.kpi_wait_time} /></div>
        <div style={cardStyle}><Widget config={widgetsP1.kpi_bed_usage} /></div>
      </div>
      {/* 图表区域 */}
      <div style={styles.chartsGrid}>
        <div style={cardStyle}>
          <Widget config={widgetsP1.chart_outpatient_rate_trend} />
        </div>
        <div style={cardStyle}>
          <Widget config={widgetsP1.chart_surgery_vs_plan} />
        </div>
        <div style={cardStyle}>
          <Widget config={widgetsP1.chart_dual_trend} />
        </div>
        <div style={cardStyle}>
          <Widget config={widgetsP1.table_department_heatmap} />
        </div>
      </div>
      {/* 预警汇总 */}
      <div style={cardStyle}>
        <Widget config={widgetsP1.table_alert_summary} />
      </div>
    </div>
  );

  const Page2 = () => (
    <div style={styles.page}>
      <div style={styles.filterBar}>
        <div style={filterItemWrapperStyle}><Widget config={widgetsP2.filter_date2} /></div>
        <div style={filterItemWrapperStyle}><Widget config={widgetsP2.filter_hospital2} /></div>
        <div style={filterItemWrapperStyle}><Widget config={widgetsP2.filter_or_room} /></div>
      </div>
      <div style={styles.kpiRow}>
        <div style={cardStyle}><Widget config={widgetsP2.kpi_surgery_count2} /></div>
        <div style={cardStyle}><Widget config={widgetsP2.kpi_turnover} /></div>
        <div style={cardStyle}><Widget config={widgetsP2.kpi_clearance} /></div>
      </div>
      <div style={styles.chartsGrid}>
        <div style={cardStyle}><Widget config={widgetsP2.chart_or_status} /></div>
        <div style={cardStyle}><Widget config={widgetsP2.chart_surgery_type} /></div>
        <div style={cardStyle}><Widget config={widgetsP2.chart_or_turnover_rank} /></div>
        <div style={cardStyle}><Widget config={widgetsP2.chart_surgery_progress} /></div>
      </div>
      <div style={cardStyle}>
        <Widget config={widgetsP2.table_delayed_surgery} />
      </div>
    </div>
  );

  const Page3 = () => (
    <div style={styles.page}>
      <div style={styles.filterBar}>
        <div style={filterItemWrapperStyle}><Widget config={widgetsP3.filter_department3} /></div>
        <div style={filterItemWrapperStyle}><Widget config={widgetsP3.filter_device_type} /></div>
        <div style={filterItemWrapperStyle}><Widget config={widgetsP3.filter_staff_category} /></div>
      </div>
      <div style={styles.kpiRow}>
        <div style={cardStyle}><Widget config={widgetsP3.kpi_bed_usage2} /></div>
        <div style={cardStyle}><Widget config={widgetsP3.kpi_equipment_health} /></div>
        <div style={cardStyle}><Widget config={widgetsP3.kpi_equipment_occupancy} /></div>
      </div>
      <div style={styles.chartsGrid}>
        <div style={cardStyle}><Widget config={widgetsP3.chart_bed_trend} /></div>
        <div style={cardStyle}><Widget config={widgetsP3.table_equipment_detail} /></div>
        <div style={cardStyle}><Widget config={widgetsP3.chart_occupancy_rank} /></div>
        <div style={cardStyle}><Widget config={widgetsP3.table_doctor_ranking} /></div>
      </div>
      <div style={cardStyle}>
        <Widget config={widgetsP3.chart_staff_distribution} />
      </div>
    </div>
  );

  const pages = [<Page1 key="p1" />, <Page2 key="p2" />, <Page3 key="p3" />];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>智慧医院数字孪生运营看板</h1>
        <div style={styles.pageIndicator}>
          {["总览", "手术调度", "资源健康"].map((label, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              style={{
                ...styles.pageBtn,
                background: currentPage === i ? colors.actionBlue : "rgba(255,255,255,0.1)",
                color: currentPage === i ? colors.white : colors.secondaryGray,
                borderColor: currentPage === i ? colors.actionBlue : colors.utilityDark,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main style={styles.main}>
        {pages[currentPage]}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            style={{
              width: currentPage === i ? 28 : 6,
              height: 6,
              borderRadius: 3,
              border: "none",
              cursor: "pointer",
              background: currentPage === i ? colors.actionBlue : colors.utilityDark,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        ))}
      </footer>
    </div>
  );
}
