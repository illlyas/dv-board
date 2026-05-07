"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import type { QuestionFormData } from "@/types/board-studio.types";

interface FormRendererProps {
  form: QuestionFormData;
  onSubmit: (answers: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function FormRenderer({ form, onSubmit, disabled }: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  const handleChange = (id: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, option: string, checked: boolean) => {
    setValues((prev) => {
      const current = (prev[id] as string[]) ?? [];
      if (checked) return { ...prev, [id]: [...current, option] };
      return { ...prev, [id]: current.filter((v) => v !== option) };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
      {form.questions.map((q) => (
        <div key={q.id} className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            {q.label}
            {q.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {q.type === "radio" && q.options && (
            <div className="space-y-1">
              {q.options.map((opt) => {
                const optValue = typeof opt === "string" ? opt : opt.value;
                const optLabel = typeof opt === "string" ? opt : opt.label;
                return (
                  <label key={optValue} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={q.id}
                      value={optValue}
                      checked={(values[q.id] as string) === optValue}
                      onChange={() => handleChange(q.id, optValue)}
                      disabled={disabled}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-gray-700">{optLabel}</span>
                  </label>
                );
              })}
            </div>
          )}

          {q.type === "checkbox" && q.options && (
            <div className="space-y-1">
              {q.options.map((opt) => {
                const optValue = typeof opt === "string" ? opt : opt.value;
                const optLabel = typeof opt === "string" ? opt : opt.label;
                return (
                  <label key={optValue} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={optValue}
                      checked={((values[q.id] as string[]) ?? []).includes(optValue)}
                      onChange={(e) => handleCheckboxChange(q.id, optValue, e.target.checked)}
                      disabled={disabled}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-gray-700">{optLabel}</span>
                  </label>
                );
              })}
            </div>
          )}

          {q.type === "select" && q.options && (
            <select
              value={(values[q.id] as string) ?? ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              disabled={disabled}
              className="w-full h-8 rounded-lg border border-input bg-white px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <option value="">请选择...</option>
              {q.options.map((opt) => {
                const optValue = typeof opt === "string" ? opt : opt.value;
                const optLabel = typeof opt === "string" ? opt : opt.label;
                return (
                  <option key={optValue} value={optValue}>{optLabel}</option>
                );
              })}
            </select>
          )}
        </div>
      ))}

      <Button type="submit" disabled={disabled} className="w-full">
        提交
      </Button>
    </form>
  );
}
