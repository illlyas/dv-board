import type { DashboardStoreFile, DashboardStorePayload } from "@/types/dashboard-store.types";
import type { TemplateFill } from "@/lib/board/template-fill-schema";
import { WIND_PANEL_DEFAULT_TITLES, type WindPanelHeaderKey } from "@/lib/board/wind-panels";
import { WIND_TEMPLATE_MARKER } from "@/lib/board/wind-template-id";

const DEFAULT_HERO_TITLE = "风电智慧运营";

export type SlotsSchemaFile = {
  slots: Array<{
    slotId: string;
    widgetKey?: string;
    kind?: string;
  }>;
};

export function slotIdToWidgetKeyMap(schema: SlotsSchemaFile): Map<string, string> {
  const m = new Map<string, string>();
  for (const s of schema.slots) {
    if (s.widgetKey) m.set(s.slotId, s.widgetKey);
  }
  return m;
}

function ensureTemplateMarker(jsx: string): string {
  if (jsx.includes("@dv-template:")) return jsx;
  return `${WIND_TEMPLATE_MARKER}\n${jsx}`;
}

function extractWidgetPropsObject(
  jsx: string,
  widgetKey: string
): { before: string; props: string; after: string } | null {
  const anchor = `"${widgetKey}"`;
  const a = jsx.indexOf(anchor);
  if (a < 0) return null;
  const propsKey = '"props":';
  const p = jsx.indexOf(propsKey, a);
  if (p < 0 || p > a + 12000) return null;
  const open = jsx.indexOf("{", p + propsKey.length);
  if (open < 0) return null;
  let depth = 0;
  let i = open;
  for (; i < jsx.length; i++) {
    const c = jsx[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        return {
          before: jsx.slice(0, open),
          props: jsx.slice(open, i + 1),
          after: jsx.slice(i + 1),
        };
      }
    }
  }
  return null;
}

function spliceBack(jsx: string, widgetKey: string, newProps: string): string {
  const ex = extractWidgetPropsObject(jsx, widgetKey);
  if (!ex) return jsx;
  return ex.before + newProps + ex.after;
}

function replaceFirstStringPropInObject(objStr: string, key: string, value: string | undefined): string {
  if (value === undefined) return objStr;
  const re = new RegExp(`("${key}"\\s*:\\s*)"((?:[^"\\\\]|\\\\.)*)"`);
  return objStr.replace(re, (_m, g1: string) => `${g1}${JSON.stringify(value)}`);
}

/** 仅替换 props 对象内、且位于首个 `"yAxis": [` 数组中的各轴对象的第一次 "label" */
function patchYAxisLabelsInPropsProps(propsStr: string, labels: string[] | undefined): string {
  if (!labels?.length) return propsStr;
  const yk = '"yAxis":';
  const y0 = propsStr.indexOf(yk);
  if (y0 < 0) return propsStr;
  const lb = propsStr.indexOf("[", y0);
  if (lb < 0) return propsStr;
  let depth = 0;
  let i = lb;
  for (; i < propsStr.length; i++) {
    const c = propsStr[i];
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) {
        const arrEnd = i + 1;
        let sub = propsStr.slice(lb, arrEnd);
        for (const lab of labels) {
          sub = sub.replace(/"label"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"/, `"label":${JSON.stringify(lab)}`);
        }
        return propsStr.slice(0, lb) + sub + propsStr.slice(arrEnd);
      }
    }
  }
  return propsStr;
}

/** 替换 `"xAxis": { ... "label": "..." ...}` 中的 label（首个 xAxis 块） */
function patchXAxisLabelInPropsProps(propsStr: string, label: string | undefined): string {
  if (!label) return propsStr;
  const xk = '"xAxis":';
  const x0 = propsStr.indexOf(xk);
  if (x0 < 0) return propsStr;
  const open = propsStr.indexOf("{", x0);
  if (open < 0) return propsStr;
  let depth = 0;
  let j = open;
  for (; j < propsStr.length; j++) {
    const c = propsStr[j];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        const inner = propsStr.slice(open, j + 1);
        const nextInner = replaceFirstStringPropInObject(inner, "label", label);
        return propsStr.slice(0, open) + nextInner + propsStr.slice(j + 1);
      }
    }
  }
  return propsStr;
}

/**
 * 将填空应用到模板 dashboard.jsx 字符串（结构不变，仅改白名单字符串字段）。
 */
export function applyTemplateFillToDashboardJsx(
  jsx: string,
  fill: TemplateFill,
  slotToWidget: Map<string, string>
): string {
  let out = ensureTemplateMarker(jsx);

  out = out.replace(
    new RegExp(`\\{\\s*"${escapeRegExp(DEFAULT_HERO_TITLE)}"\\s*\\}`),
    `{${JSON.stringify(fill.themeDocumentTitle)}}`
  );

  if (fill.panelHeaders) {
    for (const k of Object.keys(fill.panelHeaders) as WindPanelHeaderKey[]) {
      const nv = fill.panelHeaders[k];
      if (!nv) continue;
      const def = WIND_PANEL_DEFAULT_TITLES[k];
      if (!def) continue;
      const from = `headerTitle={${JSON.stringify(def)}}`;
      const to = `headerTitle={${JSON.stringify(nv)}}`;
      if (out.includes(from)) out = out.split(from).join(to);
    }
  }

  for (const [slotId, slotFill] of Object.entries(fill.slots)) {
    const wk = slotToWidget.get(slotId);
    if (!wk) continue;
    const ex = extractWidgetPropsObject(out, wk);
    if (!ex) continue;
    let props = ex.props;
    props = replaceFirstStringPropInObject(props, "title", slotFill.title);
    props = replaceFirstStringPropInObject(props, "subtitle", slotFill.subtitle);
    props = replaceFirstStringPropInObject(props, "unit", slotFill.unit);
    props = patchXAxisLabelInPropsProps(props, slotFill.xAxisLabel);
    props = patchYAxisLabelsInPropsProps(props, slotFill.yAxisLabels);
    out = spliceBack(out, wk, props);
  }

  return out;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function mergeTemplateFillIntoDashboardStore(
  store: DashboardStoreFile,
  fill: TemplateFill
): DashboardStoreFile {
  const next: DashboardStoreFile = structuredClone(store);
  next.updatedAt = new Date().toISOString();

  for (const page of next.pages) {
    for (const comp of page.components) {
      const sf = fill.slots[comp.slotId];
      if (!sf) continue;

      if (sf.title != null || sf.unit != null || sf.subtitle != null || sf.xAxisLabel != null) {
        comp.propsSnapshot = { ...comp.propsSnapshot };
        if (sf.title != null) comp.propsSnapshot.title = sf.title;
        if (sf.unit != null) comp.propsSnapshot.unit = sf.unit;
        if (sf.subtitle != null) comp.propsSnapshot.subtitle = sf.subtitle;
        if (sf.xAxisLabel != null) {
          const xa = comp.propsSnapshot.xAxis;
          if (xa && typeof xa === "object" && !Array.isArray(xa)) {
            comp.propsSnapshot.xAxis = { ...(xa as Record<string, unknown>), label: sf.xAxisLabel };
          } else {
            comp.propsSnapshot.xAxis = { label: sf.xAxisLabel };
          }
        }
      }
    }
  }

  return next;
}

/**
 * 装配落盘前：去掉可由各 Widget / mock-slot 在预览时回填的 payload；
 * 保留 Config 槽位自带的结构数据（手写区 useStoreData 依赖）。
 */
export function stripStorePayloadsForRuntimeAgentFill(store: DashboardStoreFile): DashboardStoreFile {
  const next: DashboardStoreFile = structuredClone(store);
  next.updatedAt = new Date().toISOString();
  for (const page of next.pages) {
    for (const comp of page.components) {
      if (comp.widgetType !== "Config") {
        const c = comp as { payload?: DashboardStorePayload };
        delete c.payload;
      }
    }
  }
  return next;
}

export function countStoreComponents(store: DashboardStoreFile): number {
  return store.pages.reduce((n, p) => n + p.components.length, 0);
}
