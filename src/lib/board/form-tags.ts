/**
 * 数据故事收集表单：Tags 交互、「其它」选项值约定与答案规范化（供前端与 prompt 对齐）。
 */

export const FORM_OTHER_OPTION_VALUE = "__other__";
export const FORM_OTHER_OPTION_LABEL = "其它";

export type NormalizedOption = { label: string; value: string };

function toNormalizedOption(raw: string | { label: string; value: string }): NormalizedOption {
  if (typeof raw === "string") {
    const t = raw.trim();
    const value = t === FORM_OTHER_OPTION_LABEL ? FORM_OTHER_OPTION_VALUE : t;
    return { label: raw, value };
  }
  const label = raw.label.trim();
  const v = raw.value.trim();
  const value =
    v === FORM_OTHER_OPTION_LABEL || label === FORM_OTHER_OPTION_LABEL ? FORM_OTHER_OPTION_VALUE : v;
  return { label: raw.label, value };
}

/** 解析 API 选项，并保证最后一项为「其它」（value 固定为 FORM_OTHER_OPTION_VALUE） */
export function normalizeQuestionOptions(
  options: (string | { label: string; value: string })[] | null | undefined
): NormalizedOption[] {
  if (!options?.length) {
    return [{ label: FORM_OTHER_OPTION_LABEL, value: FORM_OTHER_OPTION_VALUE }];
  }
  const mapped = options.map(toNormalizedOption);
  const withoutDupOther = mapped.filter(
    (o) => o.value !== FORM_OTHER_OPTION_VALUE && o.label.trim() !== FORM_OTHER_OPTION_LABEL
  );
  return [...withoutDupOther, { label: FORM_OTHER_OPTION_LABEL, value: FORM_OTHER_OPTION_VALUE }];
}

export function getSelectableValuesForMulti(options: NormalizedOption[]): string[] {
  return options.filter((o) => o.value !== FORM_OTHER_OPTION_VALUE).map((o) => o.value);
}

/** 将表单 state 转为写入 design-story 的 answers（其它项合并为「其它：…」）；未作答的可选题不传字段 */
export function buildAnswersForPipelineFromForm(
  questions: { id: string; type: "radio" | "checkbox" | "select" }[],
  rawValues: Record<string, unknown>,
  otherTexts: Record<string, string>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const q of questions) {
    const otherDetail = (otherTexts[q.id] ?? "").trim();
    if (q.type === "checkbox") {
      const arr = [...((rawValues[q.id] as string[]) ?? [])];
      const idx = arr.indexOf(FORM_OTHER_OPTION_VALUE);
      if (idx >= 0) {
        arr.splice(idx, 1);
        arr.push(otherDetail ? `其它：${otherDetail}` : "其它（未填写说明）");
      }
      if (arr.length === 0) continue;
      out[q.id] = arr;
      continue;
    }
    const s = ((rawValues[q.id] as string) ?? "").trim();
    if (!s) continue;
    if (s === FORM_OTHER_OPTION_VALUE) {
      out[q.id] = otherDetail ? `其它：${otherDetail}` : "其它（未填写说明）";
    } else {
      out[q.id] = s;
    }
  }
  return out;
}
