"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readFile, saveFile } from "@/lib/pipeline/file-operations";
import type { ViTokensJson } from "@/lib/board/vi-tokens-inject";
import { viTokensToInjectStyleVars } from "@/lib/board/vi-tokens-inject";

const TOKENS_REL_PATH = (projectName: string) => `.dv/${projectName}/品牌VI/vi-tokens.json`;

function cloneDoc(raw: string): ViTokensJson | null {
  try {
    return JSON.parse(raw) as ViTokensJson;
  } catch {
    return null;
  }
}

function ensureCssVariables(doc: ViTokensJson): Record<string, string> {
  if (!doc.cssVariables || typeof doc.cssVariables !== "object") {
    doc.cssVariables = {};
  }
  return doc.cssVariables as Record<string, string>;
}

export function useViTokensTweaks(projectName: string, refreshTrigger: number) {
  const [workingDoc, setWorkingDoc] = useState<ViTokensJson | null>(null);
  const [hasTokensFile, setHasTokensFile] = useState(false);
  const [tokensLoadError, setTokensLoadError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const workingDocRef = useRef<ViTokensJson | null>(null);
  workingDocRef.current = workingDoc;

  const saveGenRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadFromDisk = useCallback(async () => {
    if (!projectName.trim()) {
      setWorkingDoc(null);
      setHasTokensFile(false);
      setTokensLoadError(null);
      setDirty(false);
      return;
    }
    try {
      const raw = await readFile(TOKENS_REL_PATH(projectName));
      const doc = cloneDoc(raw);
      if (!doc) {
        setTokensLoadError("vi-tokens.json 解析失败");
        setWorkingDoc(null);
        setHasTokensFile(false);
        setDirty(false);
        return;
      }
      setWorkingDoc(JSON.parse(JSON.stringify(doc)) as ViTokensJson);
      setHasTokensFile(true);
      setTokensLoadError(null);
      setDirty(false);
      setSaveError(null);
    } catch {
      setWorkingDoc(null);
      setHasTokensFile(false);
      setTokensLoadError(null);
      setDirty(false);
    }
  }, [projectName]);

  useEffect(() => {
    void loadFromDisk();
  }, [loadFromDisk, refreshTrigger]);

  const injectVars = viTokensToInjectStyleVars(workingDoc);

  const performSave = useCallback(async (): Promise<boolean> => {
    const doc = workingDocRef.current;
    if (!projectName.trim() || !doc) return true;
    const gen = ++saveGenRef.current;
    setIsSaving(true);
    setSaveError(null);
    try {
      const content = JSON.stringify(doc, null, 2);
      await saveFile(projectName, "品牌VI", "vi-tokens.json", content);
      if (gen === saveGenRef.current) {
        setDirty(false);
      }
      return true;
    } catch (e) {
      if (gen === saveGenRef.current) {
        setSaveError(e instanceof Error ? e.message : String(e));
      }
      return false;
    } finally {
      if (gen === saveGenRef.current) {
        setIsSaving(false);
      }
    }
  }, [projectName]);

  useEffect(() => {
    if (!dirty || !hasTokensFile || !workingDoc) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      void performSave().then((ok) => {
        if (!ok) {
          /* 错误已写入 saveError；dirty 保持 true 供重试 */
        }
      });
    }, 400);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [workingDoc, dirty, hasTokensFile, performSave]);

  const setCssVariable = useCallback((storageKey: string, value: string) => {
    setWorkingDoc((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as ViTokensJson;
      const css = ensureCssVariables(next);
      css[storageKey] = value;
      return next;
    });
    setDirty(true);
  }, []);

  const flushSave = useCallback(async (): Promise<boolean> => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (!dirty || !workingDocRef.current || !hasTokensFile) return true;
    return performSave();
  }, [dirty, hasTokensFile, performSave]);

  const retrySave = useCallback(() => {
    void performSave();
  }, [performSave]);

  return {
    injectVars,
    workingDoc,
    hasTokensFile,
    tokensLoadError,
    dirty,
    isSaving,
    saveError,
    setCssVariable,
    flushSave,
    retrySave,
    reloadFromDisk: loadFromDisk,
  };
}
