"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuestionFormData } from "@/types/board-studio.types";
import { cn } from "@/lib/utils";
import {
  FORM_OTHER_OPTION_VALUE,
  buildAnswersForPipelineFromForm,
  getSelectableValuesForMulti,
  normalizeQuestionOptions,
} from "@/lib/board/form-tags";

interface FormRendererProps {
  form: QuestionFormData;
  onSubmit: (answers: Record<string, unknown>) => void;
  disabled?: boolean;
}

function isMulti(type: string): boolean {
  return type === "checkbox";
}

function isSingle(type: string): boolean {
  return type === "radio" || type === "select";
}

export function FormRenderer({ form, onSubmit, disabled }: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const normalizedByQuestion = useMemo(() => {
    const map = new Map<string, ReturnType<typeof normalizeQuestionOptions>>();
    for (const q of form.questions) {
      if ((isMulti(q.type) || isSingle(q.type)) && q.options) {
        map.set(q.id, normalizeQuestionOptions(q.options));
      }
    }
    return map;
  }, [form.questions]);

  const toggleSingle = (qId: string, value: string, required: boolean) => {
    setValues((prev) => {
      const cur = (prev[qId] as string) ?? "";
      if (!required && cur === value) {
        const next = { ...prev };
        delete next[qId];
        return next;
      }
      return { ...prev, [qId]: value };
    });
  };

  const toggleMulti = (qId: string, value: string) => {
    setValues((prev) => {
      const cur = ([...(prev[qId] as string[]) ?? []] as string[]);
      const i = cur.indexOf(value);
      if (i >= 0) cur.splice(i, 1);
      else cur.push(value);
      return { ...prev, [qId]: cur };
    });
  };

  const toggleSelectAllMulti = (qId: string) => {
    const opts = normalizedByQuestion.get(qId);
    if (!opts) return;
    const selectable = getSelectableValuesForMulti(opts);
    setValues((prev) => {
      const cur = new Set((prev[qId] as string[]) ?? []);
      const hasOther = cur.has(FORM_OTHER_OPTION_VALUE);
      const allOn = selectable.length > 0 && selectable.every((v) => cur.has(v));
      const nextArr = allOn
        ? [...[...cur].filter((v) => !selectable.includes(v))]
        : [...new Set([...cur, ...selectable])];
      if (hasOther && !nextArr.includes(FORM_OTHER_OPTION_VALUE)) {
        nextArr.push(FORM_OTHER_OPTION_VALUE);
      }
      return { ...prev, [qId]: nextArr };
    });
  };

  const validate = (): string | null => {
    for (const q of form.questions) {
      if (!isMulti(q.type) && !isSingle(q.type)) continue;
      const opts = normalizedByQuestion.get(q.id);
      if (!opts) continue;

      if (isSingle(q.type)) {
        const v = ((values[q.id] as string) ?? "").trim();
        if (q.required && !v) return `请选择「${q.label}」`;
        if (v === FORM_OTHER_OPTION_VALUE && !(otherTexts[q.id] ?? "").trim()) {
          return `「${q.label}」选择了其它，请填写说明`;
        }
        continue;
      }

      const arr = (values[q.id] as string[]) ?? [];
      if (q.required && arr.length === 0) return `请至少选择一项「${q.label}」`;
      if (arr.includes(FORM_OTHER_OPTION_VALUE) && !(otherTexts[q.id] ?? "").trim()) {
        return `「${q.label}」选择了其它，请填写说明`;
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const err = validate();
    if (err) {
      setSubmitError(err);
      return;
    }
    const questionsPayload = form.questions
      .filter((q) => isMulti(q.type) || isSingle(q.type))
      .map((q) => ({
        id: q.id,
        type: q.type as "radio" | "checkbox" | "select",
      }));
    onSubmit(buildAnswersForPipelineFromForm(questionsPayload, values, otherTexts));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-4 rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50/90 to-white shadow-sm"
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900">{form.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{form.description}</p>
      </div>

      {form.questions.map((q) => {
        const opts = normalizedByQuestion.get(q.id);

        if (!opts || (!isMulti(q.type) && !isSingle(q.type))) {
          return (
            <div key={q.id} className="rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 text-xs text-amber-900">
              暂不支持的题型「{q.type}」：{q.label}
            </div>
          );
        }

        const showOtherInput =
          isSingle(q.type)
            ? (values[q.id] as string) === FORM_OTHER_OPTION_VALUE
            : ((values[q.id] as string[]) ?? []).includes(FORM_OTHER_OPTION_VALUE);

        const selectable = getSelectableValuesForMulti(opts);
        const selectedSet = new Set((values[q.id] as string[]) ?? []);
        const allSelectableOn =
          selectable.length > 0 && selectable.every((v) => selectedSet.has(v));

        return (
          <div key={q.id} className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium text-gray-800">{q.label}</span>
              {q.required && <span className="text-red-500 text-xs">*</span>}
            </div>
            {q.description ? (
              <p className="text-[11px] text-gray-500 leading-snug">{q.description}</p>
            ) : null}

            {isMulti(q.type) && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={disabled || selectable.length === 0}
                  onClick={() => toggleSelectAllMulti(q.id)}
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    allSelectableOn
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-dashed border-gray-300 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/50"
                  )}
                >
                  全选
                </button>
                <span className="text-[10px] text-gray-400">（不含「其它」）</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {opts.map((opt) => {
                const selected = isSingle(q.type)
                  ? (values[q.id] as string) === opt.value
                  : ((values[q.id] as string[]) ?? []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      isSingle(q.type)
                        ? toggleSingle(q.id, opt.value, q.required)
                        : toggleMulti(q.id, opt.value)
                    }
                    className={cn(
                      "inline-flex max-w-full items-center rounded-full border px-3 py-1.5 text-left text-xs font-medium transition-colors",
                      selected
                        ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/40"
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {showOtherInput ? (
              <div className="space-y-1 pl-0.5">
                <label className="text-[11px] font-medium text-gray-600">请补充说明（其它）</label>
                <Input
                  type="text"
                  disabled={disabled}
                  placeholder="请输入自定义内容…"
                  value={otherTexts[q.id] ?? ""}
                  onChange={(e) =>
                    setOtherTexts((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  className="h-9 text-sm bg-white"
                />
              </div>
            ) : null}
          </div>
        );
      })}

      {submitError ? (
        <p className="text-xs text-red-600 whitespace-pre-wrap">{submitError}</p>
      ) : null}

      <Button type="submit" disabled={disabled} className="w-full">
        提交
      </Button>
    </form>
  );
}
