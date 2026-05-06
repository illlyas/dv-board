"use client";

import React, { useState } from "react";
import type { QuestionForm, Question } from "@/lib/board/data-analysis-model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DynamicFormProps {
  form: QuestionForm;
  onSubmit: (answers: Record<string, unknown>) => void;
  isLoading?: boolean;
}

export function DynamicForm({ form, onSubmit, isLoading = false }: DynamicFormProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // 清除该字段的错误
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填字段
    const newErrors: Record<string, string> = {};
    form.questions.forEach((q) => {
      if (q.required && !answers[q.id]) {
        newErrors[q.id] = "此字段为必填项";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(answers);
  };

  // 标准化 option 为字符串
  const getOptionValue = (option: string | { label: string; value: string }): string => {
    return typeof option === "string" ? option : option.value;
  };

  const getOptionLabel = (option: string | { label: string; value: string }): string => {
    return typeof option === "string" ? option : option.label;
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id];
    const error = errors[question.id];

    switch (question.type) {
      case "text":
        return (
          <Input
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={error ? "border-destructive" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={3}
            className={error ? "border-destructive" : ""}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={(value as number) ?? ""}
            onChange={(e) => handleChange(question.id, parseFloat(e.target.value))}
            placeholder={question.placeholder}
            className={error ? "border-destructive" : ""}
          />
        );

      case "radio":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const optionValue = getOptionValue(option);
              const optionLabel = getOptionLabel(option);
              return (
                <label key={optionValue} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const optionValue = getOptionValue(option);
              const optionLabel = getOptionLabel(option);
              return (
                <label key={optionValue} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={optionValue}
                    checked={((value as string[]) ?? []).includes(optionValue)}
                    onChange={(e) => {
                      const currentValues = (value as string[]) ?? [];
                      const newValues = e.target.checked
                        ? [...currentValues, optionValue]
                        : currentValues.filter((v) => v !== optionValue);
                      handleChange(question.id, newValues);
                    }}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case "select":
        return (
          <select
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(question.id, e.target.value)}
            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
              error ? "border-destructive" : ""
            }`}
          >
            <option value="">请选择...</option>
            {question.options?.map((option) => {
              const optionValue = getOptionValue(option);
              const optionLabel = getOptionLabel(option);
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{form.title}</h2>
        <p className="text-sm text-muted-foreground">{form.description}</p>
      </div>

      <div className="space-y-5">
        {form.questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <label className="block">
              <span className="text-sm font-medium">
                {question.label}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </span>
              {question.description && (
                <span className="block text-xs text-muted-foreground mt-1">
                  {question.description}
                </span>
              )}
            </label>
            {renderQuestion(question)}
            {errors[question.id] && (
              <p className="text-xs text-destructive">{errors[question.id]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              处理中...
            </>
          ) : (
            "提交"
          )}
        </Button>
      </div>
    </form>
  );
}
