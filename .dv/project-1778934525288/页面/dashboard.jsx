/** @dv-template: wind-power-emerald-ops */
/**
 * 风电智慧运营 — 布局骨架 + 私有面板组件
 * widgets 见 widgets.json（props.widgets）；PanelShell 标题见 slots.schema.json panelHeaders（props.panelHeaders）。
 * 各面板组件在内部 useStoreData 管理数据；Dashboard 仅保留分页与布局状态。
 */

function _viParseHex(hex) {
  const h = String(hex || "")
    .replace(/^#/, "")
    .trim();
  if (h.length === 6) {
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  return { r: 95, g: 228, b: 140 };
}

function _viWithAlpha(hex, a) {
  const { r, g, b } = _viParseHex(hex);
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function _viReadCssVar(hostEl, name, fallbackHex) {
  if (typeof window === "undefined" || !hostEl) return fallbackHex;
  const raw = getComputedStyle(hostEl).getPropertyValue(name).trim();
  if (!raw) return fallbackHex;
  if (raw.startsWith("#")) return raw;
  return fallbackHex;
}

function useBoardViPalette(hostRef) {
  const defaults = {
    primary: "#5FE48C",
    accentGold: "#D4B86A",
    accent: "#3AFF9B",
    danger: "#F87171",
    primaryHover: "#86EFAC",
    success: "#22C55E",
    bg: "#03120B",
    textMuted: "#5FA37E",
  };
  const [pal, setPal] = React.useState(defaults);
  React.useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    setPal({
      primary: _viReadCssVar(el, "--color-primary", defaults.primary),
      accentGold: _viReadCssVar(el, "--color-accent-gold", defaults.accentGold),
      accent: _viReadCssVar(el, "--color-accent", defaults.accent),
      danger: _viReadCssVar(el, "--color-danger", defaults.danger),
      primaryHover: _viReadCssVar(el, "--color-primary-hover", defaults.primaryHover),
      success: _viReadCssVar(el, "--color-success", defaults.success),
      bg: _viReadCssVar(el, "--color-bg", defaults.bg),
      textMuted: _viReadCssVar(el, "--color-text-muted", defaults.textMuted),
    });
  }, []);
  return pal;
}

export default function Dashboard({ widgets: widgetsProp = null, panelHeaders: panelHeadersProp = null }) {
  const boardRootRef = React.useRef(null);

  const widgets = widgetsProp && typeof widgetsProp === "object" ? widgetsProp : {};
  const panelHeaders = panelHeadersProp && typeof panelHeadersProp === "object" ? panelHeadersProp : {};

  const [currentPage, setCurrentPage] = React.useState(0);
  const pageChangedRef = React.useRef(false);
  const handlePageChange = (page) => {
    if (page !== currentPage) {
      pageChangedRef.current = true;
      setCurrentPage(page);
    }
  };

  const chartCell = (child) => (
    <div style={{ height: "100%", width: "100%", minHeight: 0, minWidth: 0, overflow: "hidden", boxSizing: "border-box" }}>
      {child}
    </div>
  );

  return (
    <div ref={boardRootRef} style={{
      position: "relative",
      width: 2560,
      height: 900,
      display: "flex",
      flexDirection: "column",
      background: "var(--color-bg)",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      overflow: "hidden",
      boxSizing: "border-box"
    }}>
      {/* 全局样式：滑竿右侧光点呼吸动画 */}
      <style>{`
        @keyframes dv-knob-breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
            box-shadow:
              0 0 8px color-mix(in srgb, var(--dv-knob-accent) 80%, transparent),
              0 0 16px color-mix(in srgb, var(--dv-knob-accent) 45%, transparent),
              inset 0 0 4px color-mix(in srgb, var(--dv-knob-accent) 50%, transparent);
          }
          50% {
            transform: scale(1.22);
            opacity: 0.9;
            box-shadow:
              0 0 12px var(--dv-knob-accent),
              0 0 28px color-mix(in srgb, var(--dv-knob-accent) 75%, transparent),
              inset 0 0 6px color-mix(in srgb, var(--dv-knob-accent) 70%, transparent);
          }
        }
        @keyframes dv-knob-dot-breathe {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.35); }
        }
        @keyframes dv-kpi-ring-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes dv-slide-in-left {
          from { transform: translateX(-60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes dv-slide-out-left {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-60px); opacity: 0; }
        }
        @keyframes dv-slide-in-right {
          from { transform: translateX(60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes dv-slide-out-right {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(60px); opacity: 0; }
        }
        .dv-page-enter-left {
          animation: dv-slide-in-left 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .dv-page-enter-right {
          animation: dv-slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .dv-glowbar-knob,
          .dv-glowbar-knob-dot {
            animation: none !important;
          }
        }
      `}</style>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <img
          src="/wind_power_bg.png"
          alt=""
          aria-hidden
          style={{ width: "100%", height: "100%", objectFit: "fill", display: "block",filter:"brightness(110%) contrast(120%) hue-rotate(215deg) saturate(15%)" }}
        />
      </div>

      {/* ============ Header ============ */}
      <header style={{
        position: "relative",
        zIndex: 1,
        height: 72,
        flexShrink: 0,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        background: "transparent",
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <BoardHeroBackdrop id="hero-default" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <BoardHeaderChrome />
        {/* 中：主标题 */}
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
            letterSpacing: "var(--letter-spacing-wide)",
            color: "var(--color-text-primary)",
            lineHeight: "var(--line-height-tight)",
            textAlign: "center",
            pointerEvents: "none",
            textShadow: "0 0 16px color-mix(in srgb, var(--color-primary) 55%, transparent), 0 1px 2px color-mix(in srgb, var(--color-bg) 60%, transparent)",
            zIndex: 1
          }}
        >
        
          {"智慧工厂运营驾驶舱"}
        </h1>
        <BoardClock />
      </header>

      {/* ============ Main ============ */}
      <main style={{
        position: "relative",
        zIndex: 1,
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
        gap: "var(--space-3)",
        padding: "var(--space-3)"
      }}>
        {/* ============ 左栏 ============ */}
        <div style={{
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          position: "relative"
        }}>
          {/* Page 0 · 左栏内容 */}
          <div key={"left-p0-" + currentPage} className={currentPage === 0 && pageChangedRef.current ? "dv-page-enter-left" : undefined} style={{
            position: "absolute",
            inset: 0,
            display: currentPage === 0 ? "grid" : "none",
            gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "var(--space-3)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden"
          }}>
          <P0GenProgressPanel widgets={widgets} panelHeaders={panelHeaders} chartCell={chartCell} />
          <P0ProductionCapacityPanel widgets={widgets} panelHeaders={panelHeaders} chartCell={chartCell} />
          </div>

          {/* Page 1 · 左栏内容 · 实时监控 */}
          <div key={"left-p1-" + currentPage} className={currentPage === 1 && pageChangedRef.current ? "dv-page-enter-left" : undefined} style={{
            position: "absolute",
            inset: 0,
            display: currentPage === 1 ? "grid" : "none",
            gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "var(--space-3)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden"
          }}>
            <P1PowerRealtimePanel widgets={widgets} panelHeaders={panelHeaders} chartCell={chartCell} active={currentPage === 1} />
            <P1WindRealtimePanel widgets={widgets} panelHeaders={panelHeaders} chartCell={chartCell} active={currentPage === 1} />
          </div>
        </div>

        {/* ============ 中栏 ============ */}
        <div style={{
          display: "grid",
          gridTemplateRows: "104px minmax(0, 1fr)",
          gap: "var(--space-3)",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden"
        }}>
          {/* 中·顶·5 个核心 KPI */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "var(--space-2)",
            minHeight: 0,
            minWidth: 0
          }}>
            {[widgets.p0_kpi_farms, widgets.p0_kpi_units, widgets.p0_kpi_avail, widgets.p0_kpi_emission, widgets.p0_kpi_clean].map((w, i) => (
              <div key={i} style={{ minHeight: 0, minWidth: 0, overflow: "hidden", position: "relative", display: "flex", alignItems: "center" }}>
                {/* 旋转圆环装饰 */}
                <div style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 44,
                  height: 44,
                  pointerEvents: "none",
                  zIndex: 2
                }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" style={{ animation: "dv-kpi-ring-spin 4s linear infinite", display: "block" }}>
                    <circle cx="22" cy="22" r="20" fill="none" stroke="color-mix(in srgb, var(--color-primary) 15%, transparent)" strokeWidth="1.5" />
                    <circle cx="22" cy="22" r="20" fill="none" stroke="color-mix(in srgb, var(--color-primary) 80%, transparent)" strokeWidth="1.5" strokeDasharray="18 108" strokeLinecap="round" />
                  </svg>
                </div>
                <Widget config={w} />
              </div>
            ))}
          </div>

          <WindGeoMapPanel boardRootRef={boardRootRef} />
        </div>

        {/* ============ 右栏 ============ */}
        <div style={{
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          position: "relative"
        }}>
          {/* Page 0 · 右栏内容 */}
          <div key={"right-p0-" + currentPage} className={currentPage === 0 && pageChangedRef.current ? "dv-page-enter-right" : undefined} style={{
            position: "absolute",
            inset: 0,
            display: currentPage === 0 ? "grid" : "none",
            gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "var(--space-3)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden"
          }}>
          <P0TransitLogisticsPanel widgets={widgets} panelHeaders={panelHeaders} chartCell={chartCell} />
          <P0MaintenancePanel panelHeaders={panelHeaders} />
          </div>

          {/* Page 1 · 右栏内容 · 实时监控 */}
          <div key={"right-p1-" + currentPage} className={currentPage === 1 && pageChangedRef.current ? "dv-page-enter-right" : undefined} style={{
            position: "absolute",
            inset: 0,
            display: currentPage === 1 ? "grid" : "none",
            gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "var(--space-3)",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden"
          }}>
            <P1AlarmListTablePanel widgets={widgets} panelHeaders={panelHeaders} />

            {/* 右·P1·Panel 2 · 设备运行日志 */}
            <P1DeviceLogTablePanel panelHeaders={panelHeaders} />

          </div>
        </div>
      </main>

      {/* ============ Footer ============ */}
      <footer
        role="navigation"
        aria-label="分页导航"
        style={{
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
          height: 56,
          boxSizing: "border-box",
          background: "transparent",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <BoardFooterBackdrop id="footer-default" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-6)",
          padding: "0 var(--space-8)"
        }}>
          {[
            { label: "总览", page: 0 },
            { label: "实时监控", page: 1 }
          ].map((it, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePageChange(it.page)}
              style={{
                margin: 0,
                padding: "0 var(--space-3)",
                border: "none",
                borderRadius: 0,
                borderBottom: currentPage === it.page
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
                background: "transparent",
                boxShadow: "none",
                color: currentPage === it.page ? "var(--color-primary)" : "var(--color-text-secondary)",
                fontFamily: "var(--font-display)",
                fontSize: "var(--font-size-sm)",
                fontWeight: currentPage === it.page ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
                letterSpacing: "var(--letter-spacing-wide)",
                textShadow: currentPage === it.page ? "0 0 6px color-mix(in srgb, var(--color-primary) 55%, transparent)" : "none",
                cursor: "pointer"
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

function BoardHeaderChrome() {
  const provinceConfig = useStoreData("p0.config.province_data") || { header: { city: "", weather: "" } };
  const headerChrome = provinceConfig.header || {};
  return (
    <div style={{
      position: "absolute", left: "var(--space-4)", top: "50%", transform: "translateY(-50%)", zIndex: 2,
      display: "flex", alignItems: "center", gap: "var(--space-2)",
      color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)",
    }}>
      <span style={{
        padding: "2px var(--space-2)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)",
        color: "var(--color-primary)", fontFamily: "var(--font-display)", fontWeight: "var(--font-weight-semibold)",
        letterSpacing: "var(--letter-spacing-wide)",
      }}>{headerChrome.city || "—"}</span>
      <span>{headerChrome.weather || ""}</span>
    </div>
  );
}

function BoardClock() {
  const [now, setNow] = React.useState(() => new Date("2023-08-11T17:01:03"));
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad2 = (n) => String(n).padStart(2, "0");
  const dateStr = `${now.getFullYear()}.${pad2(now.getMonth() + 1)}.${pad2(now.getDate())}`;
  const weekStr = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][now.getDay()];
  const timeStr = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  return (
    <div style={{
      position: "absolute", right: "var(--space-4)", top: "50%", transform: "translateY(-50%)", zIndex: 2,
      display: "flex", alignItems: "center", gap: "var(--space-3)",
      color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)",
      fontFamily: "var(--font-display)", letterSpacing: "var(--letter-spacing-wide)",
    }}>
      <span>{dateStr}</span><span>{weekStr}</span>
      <span style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-primary)",
        textShadow: "0 0 8px color-mix(in srgb, var(--color-primary) 55%, transparent)" }}>{timeStr}</span>
    </div>
  );
}

function P0GenProgressPanel({ widgets, panelHeaders, chartCell }) {
  const genProgress = useStoreData("p0.config.gen_progress") || { items: [] };
  return (
    <PanelShell headerTitle={panelHeaders.gen_completion}>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "200px minmax(0, 1fr)", gap: "var(--space-2)", minHeight: 0, minWidth: 0 }}>
        <div style={{ display: "grid", gridTemplateRows: "repeat(3, minmax(0, 1fr))", gap: "var(--space-2)", minHeight: 0, minWidth: 0 }}>
          {(genProgress.items || []).map((bar, i) => (
            <div key={i} style={{ minHeight: 0, minWidth: 0, overflow: "hidden", display: "flex", alignItems: "center" }}>
              <KpiGlowBar {...bar} />
            </div>
          ))}
        </div>
        {chartCell(<Widget config={widgets.p0_chart_hours} />)}
      </div>
    </PanelShell>
  );
}

function P0ProductionCapacityPanel({ widgets, panelHeaders, chartCell }) {
  const productionBase = useStoreData("p0.config.production_base") || {
    capacity: { label: "", current: 0, total: 0 }, capacityBars: [],
    plan: { label: "", current: 0, total: 0 }, planBars: [],
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "var(--space-3)", minHeight: 0, minWidth: 0 }}>
      <PanelShell headerTitle={panelHeaders.production_base}>
        <div style={{ flex: 1, display: "grid", gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)", gap: "var(--space-2)", minHeight: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "160px minmax(0, 1fr)", gap: "var(--space-3)", alignItems: "center", minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <div style={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}>
              <KpiPercentStat tone="success" label={productionBase.capacity?.label} current={productionBase.capacity?.current} total={productionBase.capacity?.total} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minHeight: 0, minWidth: 0, overflow: "hidden", justifyContent: "center" }}>
              {(productionBase.capacityBars || []).map((b, i) => (<React.Fragment key={i}><KpiGlowBar {...b} tone="success" /></React.Fragment>))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "160px minmax(0, 1fr)", gap: "var(--space-3)", alignItems: "center", minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <div style={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}>
              <KpiPercentStat tone="warning" label={productionBase.plan?.label} current={productionBase.plan?.current} total={productionBase.plan?.total} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minHeight: 0, minWidth: 0, overflow: "hidden", justifyContent: "center" }}>
              {(productionBase.planBars || []).map((b, i) => (<React.Fragment key={i}><KpiGlowBar {...b} tone="warning" /></React.Fragment>))}
            </div>
          </div>
        </div>
      </PanelShell>
      <PanelShell headerTitle={panelHeaders.capacity}>{chartCell(<Widget config={widgets.p0_chart_capacity} />)}</PanelShell>
    </div>
  );
}

/** 从 widgets.json 条目解析笛卡尔图 x/y 字段名（与 LineChart 取数一致） */
function chartAxisFieldsFromWidget(widgetEntry) {
  const props = widgetEntry?.props ?? {};
  let xField = "time";
  const xa = props.xAxis;
  if (typeof xa === "string" && xa.trim()) xField = xa.trim();
  else if (xa && typeof xa === "object" && !Array.isArray(xa) && xa.field) xField = String(xa.field);

  const yFields = [];
  const ya = props.yAxis;
  if (Array.isArray(ya)) {
    for (const item of ya) {
      if (typeof item === "string" && item.trim()) yFields.push(item.trim());
      else if (item && typeof item === "object" && !Array.isArray(item) && item.field) {
        yFields.push(String(item.field));
      }
    }
  } else if (typeof ya === "string" && ya.trim()) yFields.push(ya.trim());
  else if (ya && typeof ya === "object" && !Array.isArray(ya) && ya.field) yFields.push(String(ya.field));

  if (!yFields.length) yFields.push("value");
  return { xField, yFields };
}

function rowNumeric(row, field) {
  if (!row || field == null) return NaN;
  const n = Number(row[field]);
  return Number.isFinite(n) ? n : NaN;
}

function extNumRange(nums) {
  if (!nums.length) return { lo: 0, hi: 1 };
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  const s = Math.max(hi - lo, 1e-6);
  return { lo: lo - s * 0.15, hi: hi + s * 0.15 };
}

/** 按 widgets 轴字段从种子行计算实时滚动边界 */
function computeRealtimeBounds(rows, xField, yFields) {
  if (!rows.length) {
    const y0 = yFields[0] ?? "value";
    const y1 = yFields[1];
    if (y1) return { axes: [{ field: y0, vmin: 0, vmax: 100 }, { field: y1, vmin: 0, vmax: 100 }] };
    return { axes: [{ field: y0, vmin: yFields[0] === "value" ? 2 : 0, vmax: yFields[0] === "value" ? 18 : 100 }] };
  }
  const axes = yFields.map((yf, i) => {
    const nums = rows.map((r) => rowNumeric(r, yf)).filter((n) => Number.isFinite(n));
    if (!nums.length) return { field: yf, vmin: 0, vmax: 100 };
    const { lo, hi } = extNumRange(nums);
    const pad = i === 0 && yFields.length === 1 ? 0.2 : 0.15;
    const span = Math.max(hi - lo, 1e-6);
    return { field: yf, vmin: lo - span * pad, vmax: hi + span * pad };
  });
  return { axes, xField };
}

function nextTimeTickLabel(prevX) {
  const s = String(prevX ?? "0:00");
  const parts = s.split(":");
  if (parts.length < 2) return s;
  const m = (parseInt(parts[1], 10) + 1) % 60;
  const h = m === 0 ? (parseInt(parts[0], 10) + 1) % 24 : parseInt(parts[0], 10);
  return `${h}:${String(m).padStart(2, "0")}`;
}

function useRealtimeSeries(seed, active, bounds, maxPoints, axisFields) {
  const { xField, yFields } = axisFields;
  const [rows, setRows] = React.useState([]);
  const seedKey = React.useMemo(() => JSON.stringify(seed ?? null), [seed]);
  const axisKey = React.useMemo(() => JSON.stringify(axisFields), [xField, yFields.join("\0")]);

  React.useEffect(() => {
    if (Array.isArray(seed)) setRows(seed.length > 0 ? seed : []);
    else setRows([]);
  }, [seedKey]);

  React.useEffect(() => {
    if (!active || !yFields.length) return;
    const primary = yFields[0];
    const secondary = yFields[1];
    const b0 = bounds.axes?.find((a) => a.field === primary) ?? bounds.axes?.[0];
    const b1 = secondary ? bounds.axes?.find((a) => a.field === secondary) ?? bounds.axes?.[1] : null;
    const span0 = Math.max((b0?.vmax ?? 100) - (b0?.vmin ?? 0), 1);
    const span1 = b1 ? Math.max(b1.vmax - b1.vmin, 1) : 1;

    const interval = setInterval(() => {
      setRows((prev) => {
        if (!prev || prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const prevX = last[xField];
        const useTimeTick =
          xField === "time" || (typeof prevX === "string" && /^\d{1,2}:\d{2}$/.test(prevX.trim()));
        const nextX = useTimeTick ? nextTimeTickLabel(prevX) : prevX;

        const lv = rowNumeric(last, primary);
        const step0 = Math.max(0.1, span0 * (yFields.length > 1 ? 0.02 : 0.04));
        const next = { ...last, [xField]: nextX };
        next[primary] = +Math.max(
          b0.vmin,
          Math.min(b0.vmax, (Number.isFinite(lv) ? lv : b0.vmin) + (Math.random() - 0.47) * step0 * 2)
        ).toFixed(1);

        if (secondary && b1) {
          const lv2 = rowNumeric(last, secondary);
          const step1 = Math.max(0.1, span1 * 0.02);
          next[secondary] = +Math.max(
            b1.vmin,
            Math.min(b1.vmax, (Number.isFinite(lv2) ? lv2 : b1.vmin) + (Math.random() - 0.5) * step1 * 2)
          ).toFixed(1);
        }

        const arr = [...prev, next];
        return arr.length > maxPoints ? arr.slice(arr.length - maxPoints) : arr;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [active, bounds, maxPoints, axisKey, xField, yFields]);

  return rows;
}

/** P1 实时面积图：有运行时序列用 staticData，否则从 store 种子槽拉取 */
function p1LiveChartConfig(widgetEntry, seedSlotId, liveRows) {
  if (!widgetEntry) return null;
  const hasLive = Array.isArray(liveRows) && liveRows.length > 0;
  return {
    ...widgetEntry,
    props: {
      ...widgetEntry.props,
      dataKey: undefined,
      dataSlotId: hasLive ? undefined : seedSlotId,
      staticData: hasLive ? liveRows : undefined,
    },
  };
}

function P1PowerRealtimePanel({ widgets, panelHeaders, chartCell, active }) {
  const chartWidget = widgets.p1_chart_power_realtime;
  const axisFields = React.useMemo(() => chartAxisFieldsFromWidget(chartWidget), [chartWidget]);
  const powerKpi = useStoreData("p1.config.power_kpi") || { items: [] };
  const powerSeed = useStoreData("p1.chart.power_realtime_seed");
  const bounds = React.useMemo(() => {
    const rows = Array.isArray(powerSeed) ? powerSeed : [];
    return computeRealtimeBounds(rows, axisFields.xField, axisFields.yFields);
  }, [powerSeed, axisFields.xField, axisFields.yFields.join("\0")]);
  const realtimePower = useRealtimeSeries(powerSeed, active, bounds, 30, axisFields);
  return (
    <PanelShell headerTitle={panelHeaders.power_realtime}>
      <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-2)", minHeight: 0 }}>
          {(powerKpi.items || []).map((b, i) => (
            <div key={i} style={{ minHeight: 0, minWidth: 0, overflow: "hidden", display: "flex", alignItems: "center" }}><KpiGlowBar {...b} /></div>
          ))}
        </div>
        <div style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          {chartCell(<Widget config={p1LiveChartConfig(chartWidget, "p1.chart.power_realtime_seed", realtimePower)} />)}
        </div>
      </div>
    </PanelShell>
  );
}

function P1WindRealtimePanel({ widgets, panelHeaders, chartCell, active }) {
  const chartWidget = widgets.p1_chart_wind_speed;
  const axisFields = React.useMemo(() => chartAxisFieldsFromWidget(chartWidget), [chartWidget]);
  const windKpi = useStoreData("p1.config.wind_kpi") || { items: [] };
  const windSeed = useStoreData("p1.chart.wind_speed_seed");
  const bounds = React.useMemo(() => {
    const rows = Array.isArray(windSeed) ? windSeed : [];
    return computeRealtimeBounds(rows, axisFields.xField, axisFields.yFields);
  }, [windSeed, axisFields.xField, axisFields.yFields.join("\0")]);
  const realtimeWind = useRealtimeSeries(windSeed, active, bounds, 30, axisFields);
  return (
    <PanelShell headerTitle={panelHeaders.wind_speed}>
      <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-2)", minHeight: 0 }}>
          {(windKpi.items || []).map((b, i) => (
            <div key={i} style={{ minHeight: 0, minWidth: 0, overflow: "hidden", display: "flex", alignItems: "center" }}><KpiGlowBar {...b} /></div>
          ))}
        </div>
        <div style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          {chartCell(<Widget config={p1LiveChartConfig(chartWidget, "p1.chart.wind_speed_seed", realtimeWind)} />)}
        </div>
      </div>
    </PanelShell>
  );
}

function WindGeoMapPanel({ boardRootRef }) {
  const pal = useBoardViPalette(boardRootRef);
  const provinceConfig = useStoreData("p0.config.province_data") || {
    defaultProvince: "", provinces: {},
    mapLegend: { on: "● 业务点位", off: "○ 监测点位" },
    regionCard: { volumeLabel: "区域指标", volumeUnit: "", scaleLabel: "规模指标", scaleUnit: "", sitesLabel: "点位数量", sitesUnit: "个", rateLabel: "达成率", rateUnit: "%" },
  };
  const provinceDataMap = provinceConfig.provinces || {};
  const mapScatterData = useStoreData("p0.config.map_scatter") || [];
  const mapLegendChrome = provinceConfig.mapLegend || {};
  const regionCardLabels = provinceConfig.regionCard || {};
  const [activeProvince, setActiveProvince] = React.useState(provinceConfig.defaultProvince || "");
  const provinceInfo = provinceDataMap[activeProvince] || { power: 0, capacity: 0, farms: 0, rate: 0 };
  return (
    <div style={{ position: "relative", minHeight: 0, minWidth: 0, overflow: "hidden", borderRadius: "var(--radius-sm)",
      background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 70%)" }}>
      <Widget config={{
        type: "GeoMap",
        props: {
          geoJsonPath: "/map/100000.json", mapName: "china",
          areaColor: _viWithAlpha(pal.bg, 0.4), borderColor: _viWithAlpha(pal.primary, 0.22),
          emphasisAreaColor: _viWithAlpha(pal.success, 0.55), emphasisBorderColor: pal.primary,
          labelColor: _viWithAlpha(pal.textMuted, 0.8), backgroundColor: "transparent",
          autoHighlight: true, highlightInterval: 3000, onHighlightChange: setActiveProvince,
          scatterColor: pal.primary, scatterSize: 4, scatterData: mapScatterData,
        },
      }} />
      <div style={{ position: "absolute", left: "var(--space-3)", bottom: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-1)", zIndex: 1 }}>
        <span style={{ padding: "4px var(--space-2)", background: "color-mix(in srgb, var(--color-primary) 18%, transparent)", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-sm)", color: "var(--color-text-primary)", fontSize: "var(--font-size-xs)", letterSpacing: "var(--letter-spacing-wide)" }}>{mapLegendChrome.on || "● 业务点位"}</span>
        <span style={{ padding: "4px var(--space-2)", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text-secondary)", fontSize: "var(--font-size-xs)", letterSpacing: "var(--letter-spacing-wide)" }}>{mapLegendChrome.off || "○ 监测点位"}</span>
      </div>
      <div style={{ position: "absolute", right: "var(--space-3)", bottom: "var(--space-3)", minWidth: 200, padding: "var(--space-2) var(--space-3)",
        background: "color-mix(in srgb, var(--color-surface) 90%, transparent)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-sm)", zIndex: 1 }}>
        <div style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)", fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)", marginBottom: "var(--space-1)" }}>{activeProvince}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
          <div>{regionCardLabels.volumeLabel || "区域指标"} <span style={{ color: "var(--color-text-primary)" }}>{localeNum(provinceInfo.power)} {regionCardLabels.volumeUnit || ""}</span></div>
          <div>{regionCardLabels.scaleLabel || "规模指标"} <span style={{ color: "var(--color-text-primary)" }}>{localeNum(provinceInfo.capacity)} {regionCardLabels.scaleUnit || ""}</span></div>
          <div>{regionCardLabels.sitesLabel || "点位数量"} <span style={{ color: "var(--color-text-primary)" }}>{localeNum(provinceInfo.farms)} {regionCardLabels.sitesUnit || "个"}</span></div>
          <div>{regionCardLabels.rateLabel || "达成率"} <span style={{ color: "var(--color-primary)" }}>{localeNum(provinceInfo.rate)} {regionCardLabels.rateUnit || "%"}</span></div>
        </div>
      </div>
    </div>
  );
}

function P0TransitLogisticsPanel({ widgets, panelHeaders, chartCell }) {
  const transitSummary = useStoreData("p0.config.transit_summary") || {
    running: { iconId: "kpi-package", title: "", value: "", unit: "" },
    abnormal: { iconId: "kpi-insight-badge", title: "", value: "", unit: "" },
  };
  const dailyOrders = useStoreData("p0.config.daily_orders") || { title: "", bars: [] };
  return (
    <PanelShell headerTitle={panelHeaders.logistics}>
      <div style={{ flex: 1, display: "grid", gridTemplateRows: "112px minmax(0, 1fr)", gap: "var(--space-2)", minHeight: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)", minHeight: 0 }}>
          <div style={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}><FramedStat tone="success" {...transitSummary.running} /></div>
          <div style={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}><FramedStat tone="warning" {...transitSummary.abnormal} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)", gap: "var(--space-3)", minHeight: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "var(--space-2) var(--space-3)", background: "transparent", minHeight: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span aria-hidden style={{ width: 16, height: 16, borderRadius: "var(--radius-pill)", border: "1.5px solid var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "var(--shadow-md)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "var(--radius-pill)", background: "var(--color-primary)", boxShadow: "0 0 4px var(--color-primary)" }} />
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", letterSpacing: "var(--letter-spacing-wide)", flexShrink: 0 }}>{dailyOrders.title}</span>
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 45%, transparent) 0%, transparent 100%)" }} />
              <span aria-hidden style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)", fontSize: "var(--font-size-md)", lineHeight: 1, flexShrink: 0, textShadow: "0 0 4px color-mix(in srgb, var(--color-primary) 60%, transparent)" }}>◀◀</span>
            </div>
            {(dailyOrders.bars || []).map((b, i) => (<div key={i}><KpiGlowBar {...b} /></div>))}
          </div>
          {chartCell(<Widget config={widgets.p0_chart_device} />)}
        </div>
      </div>
    </PanelShell>
  );
}

function P0MaintenancePanel({ panelHeaders }) {
  const maintenanceMetrics = useStoreData("p0.config.maintenance_metrics") || { items: [] };
  const workOrders = useStoreData("p0.config.work_orders") || { items: [] };
  return (
    <PanelShell headerTitle={panelHeaders.maintenance}>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)", gap: "var(--space-3)", minHeight: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-2)", minHeight: 0, alignItems: "center" }}>
          {(maintenanceMetrics.items || []).map((it, i) => (
            <div key={i} style={{ minHeight: 0, minWidth: 0, overflow: "hidden" }}><KpiGaugeStat {...it} /></div>
          ))}
        </div>
        <div style={{ minHeight: 0, minWidth: 0, overflow: "hidden", padding: "var(--space-2)", background: "transparent", border: "none", borderRadius: 0, display: "grid", gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", columnGap: "var(--space-2)", rowGap: "var(--space-2)", boxSizing: "border-box" }}>
          {(workOrders.items || []).map((it, i) => {
            const layout = i === 0 ? { gridRow: "1 / 2", gridColumn: "1 / 3" } : i === 1 ? { gridRow: "2 / 3", gridColumn: "1 / 2" } : { gridRow: "2 / 3", gridColumn: "2 / 3" };
            return (
              <div key={i} style={{ ...layout, minHeight: 0, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ aspectRatio: "1 / 1", height: "100%", maxWidth: "100%" }}><RingStat {...it} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </PanelShell>
  );
}

function P1AlarmListTablePanel({ widgets, panelHeaders }) {
  return (
    <PanelShell headerTitle={panelHeaders.alarm_list}>
      <Widget config={widgets.p1_table_alarm_list} />
    </PanelShell>
  );
}

function P1DeviceLogTablePanel({ panelHeaders }) {
  const provinceConfig = useStoreData("p0.config.province_data") || { regionCard: { logsColumnLabel: "区域" } };
  const regionCardLabels = provinceConfig.regionCard || {};
  return (
    <PanelShell headerTitle={panelHeaders.device_log}>
      <Widget config={{
        type: "Table",
        props: {
          dataSlotId: "p1.table.device_log", pageIndex: 1, dataKey: "device_log_list",
          columns: [
            { field: "triggered_at", label: "时间", width: 120 },
            { field: "department", label: regionCardLabels.logsColumnLabel || "区域" },
            { field: "name", label: "事件" },
            { field: "value", label: "功率", format: "number", unit: "kW", align: "right" },
          ],
          size: "small", striped: true, showIndex: false, autoScroll: true, autoScrollSpeed: 40, showFooter: false,
          style: { border: "none", background: "transparent", padding: 0, borderRadius: 0 },
        },
      }} />
    </PanelShell>
  );
}

function scalarForUi(value) {
  if (value == null) return "";
  const t = typeof value;
  if (t === "number") return Number.isFinite(value) ? String(value) : "";
  if (t === "string") return value;
  if (t === "boolean" || t === "bigint") return String(value);
  return "";
}

/** 图表/指标数值：避免 NaN 作为 React 子节点 */
function localeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString() : "—";
}

function KpiGlowBar({ label, value, unit = "", max, dir = "up", iconId, tone = "success" }) {
  const accent = tone === "warning" ? "var(--color-accent-gold)" : "var(--color-primary)";
  const safeMax = Math.max(1, Number(max) || 1);
  const pct = Math.max(0, Math.min(100, Math.round((Number(value) / safeMax) * 100)));
  const formatted =
    typeof value === "number" && Number.isFinite(value)
      ? value.toLocaleString()
      : scalarForUi(value) || "—";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: 0, width: "100%" }}>
      {iconId ? (
        <div
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            color: accent,
            filter: `drop-shadow(0 0 6px color-mix(in srgb, ${accent} 55%, transparent))`,
          }}
        >
          <BoardPresetIcon id={iconId} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
      ) : null}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "var(--space-2)",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-md)",
              color: "var(--color-text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {scalarForUi(label)}
          </span>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4, flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: "var(--font-weight-bold)",
                fontSize: "var(--font-size-xl)",
                color: "var(--color-text-primary)",
                lineHeight: 1,
              }}
            >
              {formatted}
            </span>
            {unit ? (
              <span
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: accent,
                  textShadow: `0 0 4px color-mix(in srgb, ${accent} 55%, transparent)`,
                }}
              >
                {scalarForUi(unit)}
              </span>
            ) : null}
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                color: accent,
                textShadow: `0 0 4px color-mix(in srgb, ${accent} 55%, transparent)`,
              }}
            >
              {dir === "up" ? "↑" : dir === "down" ? "↓" : ""}
            </span>
          </span>
        </div>
        <div style={{ position: "relative", height: 14, display: "flex", alignItems: "center" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 2,
              background: `color-mix(in srgb, ${accent} 12%, transparent)`,
              borderRadius: "var(--radius-pill)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              width: `${pct}%`,
              height: 3,
              background: accent,
              boxShadow: `0 0 8px color-mix(in srgb, ${accent} 65%, transparent), 0 0 2px color-mix(in srgb, ${accent} 90%, transparent)`,
              borderRadius: "var(--radius-pill)",
            }}
          />
          <div
            className="dv-glowbar-knob"
            style={{
              position: "absolute",
              left: `calc(${pct}% - 7px)`,
              width: 14,
              height: 14,
              borderRadius: "var(--radius-pill)",
              border: `2px solid ${accent}`,
              background: "transparent",
              ["--dv-knob-color"]: accent,
              ["--dv-knob-accent"]: accent,
              boxShadow: `0 0 8px color-mix(in srgb, ${accent} 80%, transparent), 0 0 16px color-mix(in srgb, ${accent} 45%, transparent), inset 0 0 4px color-mix(in srgb, ${accent} 50%, transparent)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "dv-knob-breathe 1.8s ease-in-out infinite",
              willChange: "transform, box-shadow, opacity",
            }}
          >
            <span
              className="dv-glowbar-knob-dot"
              style={{
                width: 4,
                height: 4,
                borderRadius: "var(--radius-pill)",
                background: accent,
                boxShadow: `0 0 4px ${accent}`,
                animation: "dv-knob-dot-breathe 1.8s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RingStat({ label, value, unit = "", tone = "success" }) {
  const accent =
    tone === "warning"
      ? "var(--color-accent-gold)"
      : tone === "neutral"
        ? "var(--color-text-muted)"
        : "var(--color-primary)";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        borderRadius: "var(--radius-pill)",
        background: `radial-gradient(circle at 50% 45%, color-mix(in srgb, ${accent} 28%, transparent) 0%, color-mix(in srgb, ${accent} 8%, transparent) 55%, transparent 100%)`,
        border: `1.5px solid color-mix(in srgb, ${accent} 75%, transparent)`,
        boxShadow: `inset 0 0 24px color-mix(in srgb, ${accent} 25%, transparent), 0 0 16px color-mix(in srgb, ${accent} 35%, transparent), 0 0 32px color-mix(in srgb, ${accent} 18%, transparent)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-1)",
        padding: "var(--space-3)",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: "var(--radius-pill)",
          border: `1px solid color-mix(in srgb, ${accent} 35%, transparent)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-primary)",
          letterSpacing: "var(--letter-spacing-wide)",
          lineHeight: 1.35,
          textAlign: "center",
          maxWidth: "85%",
          wordBreak: "break-word",
          position: "relative",
          zIndex: 1,
        }}
      >
        {scalarForUi(label)}
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          gap: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-text-primary)",
            lineHeight: 1,
            textShadow: `0 0 10px color-mix(in srgb, ${accent} 70%, transparent), 0 0 24px color-mix(in srgb, ${accent} 35%, transparent)`,
          }}
        >
          {scalarForUi(value)}
        </span>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>{scalarForUi(unit)}</span>
      </div>
    </div>
  );
}

function KpiPercentStat({ tone = "success", label, current, total, percent }) {
  const accent = tone === "warning" ? "var(--color-accent-gold)" : "var(--color-primary)";
  const rawPct =
    percent != null ? Number(percent) : Math.round((Number(current) / Math.max(1, Number(total))) * 100);
  const pctDisplay = Number.isFinite(rawPct) ? rawPct : "—";

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-1)",
        padding: "var(--space-2)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--font-weight-bold)",
            fontSize: "var(--font-size-3xl)",
            color: "var(--color-text-primary)",
            lineHeight: 1,
            letterSpacing: "var(--letter-spacing-wide)",
            textShadow: `0 0 10px color-mix(in srgb, ${accent} 45%, transparent)`,
          }}
        >
          {pctDisplay}
        </span>
        <span
          style={{
            fontSize: "var(--font-size-lg)",
            color: accent,
            textShadow: `0 0 6px color-mix(in srgb, ${accent} 55%, transparent)`,
          }}
        >
          %
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--font-size-md)",
          color: "var(--color-text-secondary)",
          letterSpacing: "var(--letter-spacing-wide)",
          lineHeight: 1.2,
        }}
      >
        <span style={{ color: accent }}>{localeNum(current)}</span>
        <span style={{ margin: "0 6px", color: "var(--color-text-muted)" }}>/</span>
        <span>{localeNum(total)}</span>
      </div>
      {label ? (
        <div
          style={{
            marginTop: "var(--space-1)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
            letterSpacing: "var(--letter-spacing-wide)",
            lineHeight: "var(--line-height-normal)",
            textAlign: "center",
          }}
        >
          {scalarForUi(label)}
        </div>
      ) : null}
    </div>
  );
}

function FramedStat({ tone = "success", iconId, title, value, unit }) {
  const accent = tone === "warning" ? "var(--color-warning)" : "var(--color-primary)";
  const boxSize = 88;
  const cornerSize = 14;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-2)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: boxSize,
          height: boxSize,
          flexShrink: 0,
          border: `1px solid color-mix(in srgb, ${accent} 60%, transparent)`,
          borderRadius: "var(--radius-sm)",
          background: `radial-gradient(ellipse at center, color-mix(in srgb, ${accent} 18%, transparent) 0%, transparent 70%)`,
          boxShadow: `inset 0 0 16px color-mix(in srgb, ${accent} 22%, transparent), 0 0 8px color-mix(in srgb, ${accent} 18%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: -1,
            left: -1,
            width: cornerSize,
            height: cornerSize,
            borderTop: `2px solid ${accent}`,
            borderLeft: `2px solid ${accent}`,
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: -1,
            right: -1,
            width: cornerSize,
            height: cornerSize,
            borderTop: `2px solid ${accent}`,
            borderRight: `2px solid ${accent}`,
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: -1,
            left: -1,
            width: cornerSize,
            height: cornerSize,
            borderBottom: `2px solid ${accent}`,
            borderLeft: `2px solid ${accent}`,
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: cornerSize,
            height: cornerSize,
            borderBottom: `2px solid ${accent}`,
            borderRight: `2px solid ${accent}`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: 48,
            height: 48,
            filter: `drop-shadow(0 0 6px color-mix(in srgb, ${accent} 70%, transparent))`,
          }}
        >
          <BoardPresetIcon id={iconId} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "var(--space-1)",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-md)",
            color: "var(--color-text-secondary)",
            letterSpacing: "var(--letter-spacing-wide)",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {scalarForUi(title)}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-1)" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--font-size-3xl)",
              fontWeight: "var(--font-weight-bold)",
              color: accent,
              lineHeight: 1,
              letterSpacing: "var(--letter-spacing-wide)",
              textShadow: `0 0 12px color-mix(in srgb, ${accent} 60%, transparent), 0 0 24px color-mix(in srgb, ${accent} 35%, transparent)`,
            }}
          >
            {scalarForUi(value)}
          </span>
          {unit ? (
            <span style={{ fontSize: "var(--font-size-sm)", color: accent, opacity: 0.85 }}>{scalarForUi(unit)}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function KpiGaugeStat({ iconId, title, label, value, unit, tone = "success" }) {
  const displayTitle = title ?? label;
  const accent = tone === "warning" ? "var(--color-accent-gold)" : "var(--color-primary)";
  const iconSize = 68;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        padding: "var(--space-2)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: iconSize + 40,
          height: iconSize + 16,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 14,
            background: `radial-gradient(ellipse at 50% 100%, color-mix(in srgb, ${accent} 55%, transparent) 0%, color-mix(in srgb, ${accent} 0%, transparent) 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 2,
            width: iconSize + 10,
            height: 16,
            transform: "translateX(-50%) perspective(80px) rotateX(60deg)",
            background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 45%, transparent), color-mix(in srgb, ${accent} 8%, transparent))`,
            border: `1px solid color-mix(in srgb, ${accent} 55%, transparent)`,
            boxShadow: `0 0 12px color-mix(in srgb, ${accent} 45%, transparent)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            width: iconSize,
            height: iconSize,
            color: accent,
            filter: `drop-shadow(0 0 8px color-mix(in srgb, ${accent} 75%, transparent))`,
          }}
        >
          <BoardPresetIcon id={iconId} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
      </div>

      {displayTitle ? (
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
            letterSpacing: "var(--letter-spacing-wide)",
            lineHeight: 1.35,
            textAlign: "center",
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          {scalarForUi(displayTitle)}
        </div>
      ) : null}

      <div style={{ display: "inline-flex", alignItems: "baseline", gap: "var(--space-1)" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--font-weight-bold)",
            fontSize: "var(--font-size-2xl)",
            color: "var(--color-text-primary)",
            lineHeight: 1,
            letterSpacing: "var(--letter-spacing-wide)",
            textShadow: `0 0 10px color-mix(in srgb, ${accent} 45%, transparent)`,
          }}
        >
          {typeof value === "number" && Number.isFinite(value)
            ? value.toLocaleString()
            : scalarForUi(value)}
        </span>
        {unit ? (
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{scalarForUi(unit)}</span>
        ) : null}
      </div>
    </div>
  );
}

function PanelShell({ headerTitle, style, children }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        background: "transparent",
        border: "none",
        borderRadius: 0,
        boxShadow: "none",
        ...(style || {}),
      }}
    >
      {headerTitle ? (
        <div
          style={{
            height: 32,
            flexShrink: 0,
            display: "flex",
            alignItems: "stretch",
            gap: "var(--space-1)",
            background: "transparent",
          }}
        >
          <span
            style={{
              width: 4,
              alignSelf: "stretch",
              background: "var(--color-primary)",
              boxShadow: "0 0 6px var(--color-primary)",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              padding: "0 var(--space-3)",
              backgroundImage:
                "linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 100%)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                letterSpacing: "var(--letter-spacing-wide)",
              }}
            >
              {scalarForUi(headerTitle)}
            </span>
          </div>
        </div>
      ) : null}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          padding: "var(--space-2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
