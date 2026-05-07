"use client";

import React from "react";
import { Widget } from "@/components/widget/widget";
import "@/components/widgets"; // 注册所有组件

export default function TestWidgetsPage() {
  // 测试组件配置
  const widgets = {
    kpi1: {
      type: "KPI" as const,
      props: {
        title: "住院人数",
        subtitle: "当前在院",
        icon: "🏥",
        dataKey: "inpatient_count",
        unit: "人",
        trend: true,
        comparison: { type: "yoy" as const, label: "同比" },
        gradient: ["#3b82f6", "#8b5cf6"],
      }
    },
    kpi2: {
      type: "KPI" as const,
      props: {
        title: "门诊量",
        subtitle: "今日累计",
        icon: "👥",
        dataKey: "outpatient_count",
        unit: "人次",
        trend: true,
        gradient: ["#8b5cf6", "#ec4899"],
      }
    },
    chart1: {
      type: "LineChart" as const,
      props: {
        title: "门诊量趋势",
        subtitle: "近30天数据",
        dataKey: "outpatient_trend",
        xAxis: { field: "date", label: "日期" },
        yAxis: [
          { field: "value", label: "门诊量", color: "#3b82f6" },
          { field: "value2", label: "急诊量", color: "#ef4444" },
        ],
        showLegend: true,
        showGrid: true,
        smooth: true,
      }
    },
    chart2: {
      type: "BarChart" as const,
      props: {
        title: "各科室负荷率",
        dataKey: "department_load",
        xAxis: { field: "name", label: "科室" },
        yAxis: { field: "value", label: "负荷率", unit: "%" },
        showTarget: true,
        targetValue: 80,
        targetLabel: "目标负荷",
        showGrid: true,
      }
    },
    chart3: {
      type: "PieChart" as const,
      props: {
        title: "患者类型分布",
        dataKey: "patient_type_distribution",
        nameField: "name",
        valueField: "value",
        showPercentage: true,
        showLegend: true,
        legendPosition: "right" as const,
      }
    },
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
      padding: 24,
      overflow: "auto",
    }}>
      <div style={{
        maxWidth: 1920,
        margin: "0 auto",
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 32,
          textAlign: "center",
        }}>Widget 组件测试</h1>

        {/* KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}>
          <div style={{ height: 160 }}>
            <Widget config={widgets.kpi1} />
          </div>
          <div style={{ height: 160 }}>
            <Widget config={widgets.kpi2} />
          </div>
        </div>

        {/* Charts */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}>
          <div style={{ height: 400 }}>
            <Widget config={widgets.chart1} />
          </div>
          <div style={{ height: 400 }}>
            <Widget config={widgets.chart3} />
          </div>
        </div>

        <div style={{ height: 400 }}>
          <Widget config={widgets.chart2} />
        </div>
      </div>
    </div>
  );
}
