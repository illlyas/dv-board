export default function Dashboard() {
  const [page, setPage] = React.useState(0);

  const ph = (type, label) => React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255,255,255,0.05)",
      border: "1px dashed rgba(255,255,255,0.2)",
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }
  },
    React.createElement("span", { style: { fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 } }, type),
    React.createElement("span", { style: { fontSize: 15, color: "rgba(255,255,255,0.75)", fontWeight: 600 } }, label)
  );

  const renderPage0 = () => React.createElement("div", {
    style: { width: 1920, height: 1080, display: "flex", flexDirection: "column", backgroundColor: "#0f172a", overflow: "hidden" }
  },
    // 顶部标题栏 60px
    React.createElement("div", {
      style: { height: 60, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)" }
    },
      React.createElement("span", { style: { fontSize: 20, fontWeight: 700, color: "#fff" } }, "智慧医院运营总览"),
      React.createElement("div", { style: { display: "flex", gap: 12 } },
        React.createElement("span", { style: { fontSize: 12, color: "rgba(255,255,255,0.5)", padding: "4px 12px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12 } }, "院区筛选器"),
        React.createElement("span", { style: { fontSize: 12, color: "rgba(255,255,255,0.5)", padding: "4px 12px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12 } }, "时间颗粒: 实时")
      )
    ),
    // 内容区 flex:1  grid
    React.createElement("div", {
      style: {
        flex: 1,
        display: "grid",
        gridTemplateRows: "120px 1fr",
        gridTemplateColumns: "2fr 1fr",
        gap: 16,
        padding: "16px 32px 16px"
      }
    },
      // 第一行 KPI 跨两列
      React.createElement("div", { style: { gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 } },
        ph("pixel", "住院人数/床位使用率"),
        ph("pixel", "门诊量 (实时/累计)"),
        ph("pixel", "手术数量/成功率"),
        ph("pixel", "患者满意度评分")
      ),
      // 第二行左侧折线图
      React.createElement("div", {}, ph("line", "门诊/手术实时趋势")),
      // 第二行右侧上下
      React.createElement("div", { style: { display: "grid", gridTemplateRows: "1fr 1fr", gap: 16 } },
        ph("pie", "当前在院患者类型分布"),
        ph("rank", "各科室负荷排名")
      )
    ),
    // 底部导航 40px
    React.createElement("div", {
      style: { height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }
    },
      [0,1,2].map(i => React.createElement("button", {
        key: i,
        onClick: () => setPage(i),
        style: {
          width: page === i ? 24 : 8,
          height: 8,
          borderRadius: 4,
          border: "none",
          cursor: "pointer",
          backgroundColor: page === i ? "#3b82f6" : "rgba(255,255,255,0.3)",
          transition: "all 0.2s"
        }
      }))
    )
  );

  const renderPage1 = () => React.createElement("div", {
    style: { width: 1920, height: 1080, display: "flex", flexDirection: "column", backgroundColor: "#0f172a", overflow: "hidden" }
  },
    React.createElement("div", {
      style: { height: 60, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)" }
    },
      React.createElement("span", { style: { fontSize: 20, fontWeight: 700, color: "#fff" } }, "趋势与目标对比"),
      React.createElement("div", { style: { display: "flex", gap: 16 } },
        React.createElement("span", { style: { fontSize: 12, color: "#fff", padding: "4px 12px", backgroundColor: "rgba(59,130,246,0.2)", borderRadius: 12 } }, "关键指标汇总")
      )
    ),
    React.createElement("div", {
      style: {
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 16,
        padding: "16px 32px 16px"
      }
    },
      // 左上
      React.createElement("div", {}, ph("line", "门诊量日趋势 (含同比/环比)")),
      // 右上
      React.createElement("div", {}, ph("line", "床位使用率日趋势 (含目标线)")),
      // 左下
      React.createElement("div", {}, ph("bar", "各院区手术量 vs 目标对比")),
      // 右下
      React.createElement("div", {}, ph("table", "关键指标明细表"))
    ),
    React.createElement("div", {
      style: { height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }
    },
      [0,1,2].map(i => React.createElement("button", {
        key: i,
        onClick: () => setPage(i),
        style: {
          width: page === i ? 24 : 8,
          height: 8,
          borderRadius: 4,
          border: "none",
          cursor: "pointer",
          backgroundColor: page === i ? "#3b82f6" : "rgba(255,255,255,0.3)",
          transition: "all 0.2s"
        }
      }))
    )
  );

  const renderPage2 = () => React.createElement("div", {
    style: { width: 1920, height: 1080, display: "flex", flexDirection: "column", backgroundColor: "#0f172a", overflow: "hidden" }
  },
    React.createElement("div", {
      style: { height: 60, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)" }
    },
      React.createElement("span", { style: { fontSize: 20, fontWeight: 700, color: "#fff" } }, "精细化诊断与根因分析"),
      React.createElement("div", { style: { display: "flex", gap: 12 } },
        React.createElement("span", { style: { fontSize: 12, color: "#fff", padding: "4px 12px", backgroundColor: "rgba(59,130,246,0.2)", borderRadius: 12 } }, "AI诊断准确率全局概况")
      )
    ),
    React.createElement("div", {
      style: {
        flex: 1,
        display: "grid",
        gridTemplateRows: "1fr 1fr 180px",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        padding: "16px 32px 16px"
      }
    },
      // 第一行左
      React.createElement("div", {}, ph("bar", "各科室AI诊断准确率对比")),
      // 第一行右
      React.createElement("div", {}, ph("bar", "各科室医护负荷率 vs 目标")),
      // 第二行左
      React.createElement("div", {}, ph("pie", "AI辅助诊断类型分布")),
      // 第二行右
      React.createElement("div", {}, ph("rank", "设备利用率最低前5名")),
      // 第三行跨两列
      React.createElement("div", { style: { gridColumn: "1 / -1" } }, ph("table", "重点设备运行状态明细"))
    ),
    React.createElement("div", {
      style: { height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }
    },
      [0,1,2].map(i => React.createElement("button", {
        key: i,
        onClick: () => setPage(i),
        style: {
          width: page === i ? 24 : 8,
          height: 8,
          borderRadius: 4,
          border: "none",
          cursor: "pointer",
          backgroundColor: page === i ? "#3b82f6" : "rgba(255,255,255,0.3)",
          transition: "all 0.2s"
        }
      }))
    )
  );

  const pages = [renderPage0(), renderPage1(), renderPage2()];
  return pages[page];
}