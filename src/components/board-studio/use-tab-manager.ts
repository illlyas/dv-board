import { useState, useCallback } from "react";
import type { FileItem, OpenTab } from "@/types/board-studio.types";
import { FILES_TAB_ID } from "./tab-bar";

export function useTabManager() {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>(FILES_TAB_ID);

  const handleFileOpen = useCallback((file: FileItem) => {
    const id = file.path;
    setOpenTabs((prev) => {
      if (prev.find((t) => t.id === id)) return prev;
      return [...prev, { id, file }];
    });
    setActiveTabId(id);
  }, []);

  const handleTabClose = useCallback(
    (id: string) => {
      setOpenTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === id);
        const next = prev.filter((t) => t.id !== id);
        
        if (activeTabId === id) {
          const newActive = next[idx - 1]?.id ?? next[0]?.id ?? FILES_TAB_ID;
          setActiveTabId(newActive);
        }
        return next;
      });
    },
    [activeTabId]
  );

  return {
    openTabs,
    activeTabId,
    setActiveTabId,
    handleFileOpen,
    handleTabClose,
  };
}
