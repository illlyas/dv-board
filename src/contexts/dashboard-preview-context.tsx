"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { readFile } from "@/lib/pipeline/file-operations";
import { isBoardTemplatePreviewProject } from "@/lib/board-templates/template-project-name";
import {
  getCachedDashboardStore,
  loadDashboardStoreOnce,
} from "@/lib/dashboard-store-client-cache";
import type { DashboardStoreFile } from "@/types/dashboard-store.types";

export interface DashboardPreviewContextValue {
  projectName: string;
  dashboardFile: string;
  /** store 已从磁盘加载完成（含失败后的空流程，仍视为可继续走 mock） */
  hydrated: boolean;
  /** 始终读当前内存中的整盘 store（与 GET 结果及后续 POST 合并一致） */
  getStore: () => DashboardStoreFile | null;
  getPagesStoryExcerpt: () => string;
}

const DashboardPreviewContext = createContext<DashboardPreviewContextValue | null>(
  null
);

export function useDashboardPreviewOptional(): DashboardPreviewContextValue | null {
  return useContext(DashboardPreviewContext);
}

export function DashboardPreviewProvider({
  projectName,
  dashboardFile,
  children,
}: {
  projectName: string;
  dashboardFile: string;
  children: React.ReactNode;
}) {
  const pagesStoryRef = useRef("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadDashboardStoreOnce(projectName, dashboardFile);
      } catch {
        // 网络失败时不写 cache，getStore 返回 null，slot 可走 mock
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectName, dashboardFile]);

  useEffect(() => {
    if (isBoardTemplatePreviewProject(projectName)) {
      pagesStoryRef.current = "";
      return;
    }
    readFile(`.dv/${projectName}/页面结构/pages-story.md`)
      .then((t) => {
        pagesStoryRef.current = t;
      })
      .catch(() => {
        pagesStoryRef.current = "";
      });
  }, [projectName]);

  const getStore = useCallback(
    () => getCachedDashboardStore(projectName, dashboardFile),
    [projectName, dashboardFile]
  );

  const getPagesStoryExcerpt = useCallback(
    () => pagesStoryRef.current.slice(0, 12000),
    []
  );

  const value = useMemo(
    (): DashboardPreviewContextValue => ({
      projectName,
      dashboardFile,
      hydrated,
      getStore,
      getPagesStoryExcerpt,
    }),
    [projectName, dashboardFile, hydrated, getStore, getPagesStoryExcerpt]
  );

  return (
    <DashboardPreviewContext.Provider value={value}>
      {children}
    </DashboardPreviewContext.Provider>
  );
}
