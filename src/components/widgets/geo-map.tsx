"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import type { WidgetComponentProps } from "@/types/widget-registry.types";
import { registerWidget } from "@/components/widget/registry";

export interface GeoMapProps {
  /** GeoJSON 数据文件路径（相对于 public 目录） */
  geoJsonPath?: string;
  /** 地图注册名称 */
  mapName?: string;
  /** 区域颜色（默认透明） */
  areaColor?: string;
  /** 区域边框颜色 */
  borderColor?: string;
  /** 高亮区域颜色 */
  emphasisAreaColor?: string;
  /** 高亮边框颜色 */
  emphasisBorderColor?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** 标签颜色 */
  labelColor?: string;
  /** 散点数据：[{ name, value: [lng, lat, val] }] */
  scatterData?: Array<{ name: string; value: [number, number, number?] }>;
  /** 散点颜色 */
  scatterColor?: string;
  /** 散点大小 */
  scatterSize?: number;
  /** 是否自动循环高亮省份 */
  autoHighlight?: boolean;
  /** 循环间隔（ms） */
  highlightInterval?: number;
  /** 高亮变化回调：传入省份名称 */
  onHighlightChange?: (name: string) => void;
  /** echarts option 覆盖 */
  echartsOptionOverrides?: EChartsOption;
  /** 样式 */
  style?: React.CSSProperties;
}

function GeoMapWidget({
  config,
  data,
  loading,
}: WidgetComponentProps<{ type: "GeoMap"; props: GeoMapProps }>) {
  const props = config.props;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<any>(null);
  const [mapRegistered, setMapRegistered] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [regionNames, setRegionNames] = React.useState<string[]>([]);
  const highlightIndexRef = React.useRef(0);
  const onHighlightChangeRef = React.useRef(props.onHighlightChange);
  onHighlightChangeRef.current = props.onHighlightChange;

  const mapName = props.mapName || "china";
  const geoJsonPath = props.geoJsonPath || "/map/100000.json";

  // 加载并注册 GeoJSON
  React.useEffect(() => {
    let cancelled = false;

    async function loadGeoJson() {
      try {
        const resp = await fetch(geoJsonPath);
        if (!resp.ok) {
          throw new Error(`Failed to load GeoJSON: ${resp.status}`);
        }
        const geoJson = await resp.json();
        if (cancelled) return;
        echarts.registerMap(mapName, geoJson);
        // 提取省份名称列表
        const names = (geoJson.features || []).map((f: any) => f.properties?.name).filter(Boolean);
        setRegionNames(names);
        setMapRegistered(true);
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || "加载地图数据失败");
        }
      }
    }

    loadGeoJson();
    return () => { cancelled = true; };
  }, [geoJsonPath, mapName]);

  // 自动循环高亮
  React.useEffect(() => {
    if (!props.autoHighlight || !mapRegistered || regionNames.length === 0) return;

    const interval = props.highlightInterval || 3000;
    let prevIndex = -1;

    function doHighlight() {
      const chart = chartRef.current?.getEchartsInstance?.();
      if (!chart) return;

      // 取消上一个高亮
      if (prevIndex >= 0) {
        chart.dispatchAction({ type: "downplay", seriesIndex: 0, dataIndex: prevIndex });
      }

      const idx = highlightIndexRef.current % regionNames.length;
      chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex: idx });

      if (onHighlightChangeRef.current) {
        onHighlightChangeRef.current(regionNames[idx]);
      }

      prevIndex = idx;
      highlightIndexRef.current = idx + 1;
    }

    // 立即执行一次
    doHighlight();
    const timer = setInterval(doHighlight, interval);

    return () => {
      clearInterval(timer);
      const chart = chartRef.current?.getEchartsInstance?.();
      if (chart && prevIndex >= 0) {
        chart.dispatchAction({ type: "downplay", seriesIndex: 0, dataIndex: prevIndex });
      }
    };
  }, [mapRegistered, regionNames, props.autoHighlight, props.highlightInterval]);

  const option: EChartsOption = React.useMemo(() => {
    if (!mapRegistered) return {};

    const baseOption: EChartsOption = {
      backgroundColor: props.backgroundColor || "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(0, 20, 12, 0.85)",
        borderColor: "rgba(95, 228, 140, 0.4)",
        textStyle: {
          color: "#fff",
          fontSize: 12,
        },
      },
      geo: {
        map: mapName,
        roam: false,
        zoom: 1.2,
        center: [104.5, 36],
        silent: true,
        itemStyle: {
          areaColor: props.areaColor || "rgba(40, 60, 50, 0.4)",
          borderColor: props.borderColor || "rgba(95, 228, 140, 0.3)",
          borderWidth: 0.8,
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowBlur: 4,
        },
        emphasis: {
          disabled: true,
        },
        label: {
          show: true,
          color: props.labelColor || "rgba(255,255,255,0.55)",
          fontSize: 10,
        },
      },
      series: [
        // map series 用于高亮控制
        {
          type: "map",
          map: mapName,
          geoIndex: -1,
          roam: false,
          zoom: 1.2,
          center: [104.5, 36],
          selectedMode: false,
          itemStyle: {
            areaColor: props.areaColor || "rgba(40, 60, 50, 0.4)",
            borderColor: props.borderColor || "rgba(95, 228, 140, 0.3)",
            borderWidth: 0.8,
          },
          emphasis: {
            label: {
              show: true,
              color: "#fff",
              fontSize: 12,
              fontWeight: "bold",
            },
            itemStyle: {
              areaColor: props.emphasisAreaColor || "rgba(34, 197, 94, 0.6)",
              borderColor: props.emphasisBorderColor || "#5FE48C",
              borderWidth: 2,
              shadowColor: "rgba(95, 228, 140, 0.6)",
              shadowBlur: 20,
            },
          },
          label: {
            show: true,
            color: props.labelColor || "rgba(255,255,255,0.55)",
            fontSize: 10,
          },
          data: regionNames.map((name) => ({ name, value: 0 })),
        },
        // 散点 series
        ...(props.scatterData && props.scatterData.length > 0
          ? [
              {
                type: "effectScatter" as const,
                coordinateSystem: "geo" as const,
                data: props.scatterData,
                symbolSize: props.scatterSize || 5,
                rippleEffect: {
                  brushType: "stroke" as const,
                  scale: 3,
                  period: 4,
                },
                itemStyle: {
                  color: props.scatterColor || "#5FE48C",
                  shadowColor: props.scatterColor || "rgba(95, 228, 140, 0.6)",
                  shadowBlur: 6,
                },
              },
            ]
          : []),
      ],
    };

    // 合并 overrides
    if (props.echartsOptionOverrides) {
      const patch = props.echartsOptionOverrides as any;
      const merged = { ...baseOption, ...patch };
      if (patch.geo) {
        merged.geo = { ...(baseOption.geo as object), ...patch.geo };
      }
      if (patch.series) {
        merged.series = patch.series;
      } else {
        merged.series = baseOption.series;
      }
      return merged;
    }

    return baseOption;
  }, [mapRegistered, regionNames, mapName, props.backgroundColor, props.areaColor, props.borderColor, props.emphasisAreaColor, props.emphasisBorderColor, props.labelColor, props.scatterData, props.scatterColor, props.scatterSize, props.echartsOptionOverrides]);

  if (error) {
    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          fontSize: "var(--font-size-sm)",
          ...(props.style || {}),
        }}
      >
        {error}
      </div>
    );
  }

  if (!mapRegistered) {
    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          fontSize: "var(--font-size-sm)",
          ...(props.style || {}),
        }}
      >
        加载地图...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 0, minWidth: 0, ...(props.style || {}) }}
    >
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}

registerWidget("GeoMap", GeoMapWidget);

export default GeoMapWidget;
