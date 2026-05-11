"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePipeline } from "@/hooks/use-pipeline";
import { useAgent } from "@/hooks/use-agent";
import { useDashboardEditor } from "@/hooks/use-dashboard-editor";
import { useMarkdownRefine } from "@/hooks/use-markdown-refine";
import { useViTokensTweaks } from "@/hooks/use-vi-tokens-tweaks";
import { listProjectFiles } from "@/lib/pipeline/file-operations";
import type { FileItem } from "@/types/board-studio.types";
import { TaskProgress } from "./board-studio/task-progress";
import { ChatPanel } from "./board-studio/chat-panel";
import { FilePanel, type DashboardTweaksPanelData } from "./board-studio/file-panel";
import { FloatingEditDialog } from "./board-studio/floating-edit-dialog";
import { MarkdownAgentDialog } from "./board-studio/markdown-agent-dialog";
import { useTabManager } from "./board-studio/use-tab-manager";
import type { SelectedWidget } from "./board-studio/editable-preview";
import type { PipelineStep } from "@/types/pipeline.types";
import type { VisualAssetsBlock } from "@/lib/visual-assets/types";
import { getScreenPreset } from "@/lib/board/screen-presets";
import type { ProjectConfig } from "@/lib/projects/project-config";

interface BoardStudioProps {
  projectName?: string;
  style?: string;
}

export function BoardStudio({ projectName = "", style = "" }: BoardStudioProps) {
  const [isAgentMode, setIsAgentMode] = useState<boolean | null>(null);

  useEffect(() => {
    if (!projectName) {
      setIsAgentMode(false);
      return;
    }
    listProjectFiles(projectName).then((data) => {
      const hasFiles = Object.values(data.categories).some((files) => (files as unknown[]).length > 0);
      setIsAgentMode(hasFiles);
    }).catch(() => {
      setIsAgentMode(false);
    });
  }, [projectName]);

  const [editingDashboard, setEditingDashboard] = useState<FileItem | null>(null);
  const [selectedWidgets, setSelectedWidgets] = useState<SelectedWidget[]>([]);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const currentCodeRef = useRef<string>("");

  useEffect(() => {
    setTweaksOpen(false);
  }, [projectName]);

  const pipelineHook = usePipeline();
  const agentHook = useAgent();

  const { openTabs, activeTabId, setActiveTabId, handleFileOpen, handleTabClose, updateTabFile } = useTabManager();

  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);

  const viTweaks = useViTokensTweaks(projectName, fileRefreshTrigger);

  const [visualAssetsBlock, setVisualAssetsBlock] = useState<VisualAssetsBlock | null>(null);
  const [visualAssetsLoading, setVisualAssetsLoading] = useState(() => Boolean(projectName.trim()));
  const [visualAssetsFetchError, setVisualAssetsFetchError] = useState<string | null>(null);
  const defaultScreen = useMemo(() => getScreenPreset(undefined), []);
  const [boardCanvasWidth, setBoardCanvasWidth] = useState(defaultScreen.width);
  const [boardCanvasHeight, setBoardCanvasHeight] = useState(defaultScreen.height);

  useEffect(() => {
    if (!projectName.trim()) {
      setVisualAssetsBlock(null);
      setVisualAssetsLoading(false);
      setVisualAssetsFetchError(null);
      setBoardCanvasWidth(defaultScreen.width);
      setBoardCanvasHeight(defaultScreen.height);
      return;
    }
    let cancelled = false;
    setVisualAssetsLoading(true);
    setVisualAssetsFetchError(null);
    fetch(`/api/projects/${encodeURIComponent(projectName)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`project fetch failed (${r.status})`);
        return r.json() as Promise<{ project: ProjectConfig }>;
      })
      .then((d) => {
        if (cancelled) return;
        setVisualAssetsBlock(d.project.visualAssets ?? null);
        const sp = getScreenPreset(d.project.screenPresetId);
        setBoardCanvasWidth(sp.width);
        setBoardCanvasHeight(sp.height);
      })
      .catch((e) => {
        if (!cancelled) {
          setVisualAssetsBlock(null);
          setVisualAssetsFetchError(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        if (!cancelled) setVisualAssetsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectName, fileRefreshTrigger, defaultScreen]);

  const retryVisualAssetsConfig = useCallback(() => {
    setVisualAssetsFetchError(null);
    setFileRefreshTrigger((n) => n + 1);
  }, []);

  const handleVisualAssetsSaved = useCallback((next: VisualAssetsBlock) => {
    setVisualAssetsBlock(next);
    setFileRefreshTrigger((n) => n + 1);
  }, []);

  const dashboardEditor = useDashboardEditor(
    useCallback((updatedFile: FileItem) => {
      updateTabFile(updatedFile);
      setActiveTabId(updatedFile.path);
      setSelectedWidgets([]);
    }, [updateTabFile, setActiveTabId])
  );

  const markdownRefine = useMarkdownRefine(
    useCallback(
      (updatedFile: FileItem) => {
        updateTabFile(updatedFile);
        setActiveTabId(updatedFile.path);
        setFileRefreshTrigger((n) => n + 1);
      },
      [updateTabFile, setActiveTabId, setFileRefreshTrigger]
    )
  );

  const {
    runRefine: runMdRefine,
    resetStatus: resetMdRefineStatus,
    isRunning: mdRefineRunning,
    lastError: mdRefineLastError,
  } = markdownRefine;

  const [mdAgentTabId, setMdAgentTabId] = useState<string | null>(null);
  const [mdDialog, setMdDialog] = useState<{ file: FileItem; selectedText: string } | null>(null);

  useEffect(() => {
    if (mdAgentTabId && !openTabs.some((t) => t.id === mdAgentTabId)) {
      setMdAgentTabId(null);
      setMdDialog(null);
    }
  }, [openTabs, mdAgentTabId]);

  // chatbot 使用的 hook（非编辑模式）
  const chatHook = isAgentMode ? agentHook : pipelineHook;
  const { state, messages, isRunning, runPipeline, submitFormAnswers, clear } = chatHook;
  const [input, setInput] = useState("");

  const prevStepRef = useRef<PipelineStep>(state.step);

  useEffect(() => {
    if (prevStepRef.current !== state.step) {
      prevStepRef.current = state.step;
      setFileRefreshTrigger((n) => n + 1);
    }
  }, [state.step]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isRunning || isAgentMode === null) return;
    setInput("");
    runPipeline(trimmed, projectName, style);
  }, [input, isRunning, isAgentMode, runPipeline, projectName, style]);

  const handleStartEdit = useCallback((file: FileItem) => {
    dashboardEditor.startEditing(file);
    setEditingDashboard(file);
    setSelectedWidgets([]);
    setTweaksOpen(true);
  }, [dashboardEditor]);

  const handleExitEdit = useCallback(async () => {
    const ok = await viTweaks.flushSave();
    if (!ok) return;
    dashboardEditor.stopEditing();
    setEditingDashboard(null);
    setSelectedWidgets([]);
    setTweaksOpen(false);
  }, [dashboardEditor, viTweaks.flushSave]);

  const dashboardTweaks: DashboardTweaksPanelData = useMemo(
    () => ({
      hasTokensFile: viTweaks.hasTokensFile,
      workingCssVariables: viTweaks.workingDoc?.cssVariables ?? {},
      onTokenChange: viTweaks.setCssVariable,
      isSaving: viTweaks.isSaving,
      dirty: viTweaks.dirty,
      saveError: viTweaks.saveError,
      onRetrySave: viTweaks.retrySave,
    }),
    [
      viTweaks.hasTokensFile,
      viTweaks.workingDoc,
      viTweaks.setCssVariable,
      viTweaks.isSaving,
      viTweaks.dirty,
      viTweaks.saveError,
      viTweaks.retrySave,
    ]
  );

  const handleEditSubmit = useCallback((message: string) => {
    dashboardEditor.runEdit(message, projectName, selectedWidgets, currentCodeRef.current);
  }, [dashboardEditor, projectName, selectedWidgets]);

  const handleCodeLoad = useCallback((code: string) => {
    currentCodeRef.current = code;
  }, []);

  const handleStartMdAgent = useCallback(() => {
    const tab = openTabs.find((t) => t.id === activeTabId);
    if (!tab) return;
    if (!["design-story.md", "pages-story.md", "vi-system.md"].includes(tab.file.name)) return;
    setMdAgentTabId(activeTabId);
  }, [activeTabId, openTabs]);

  const handleExitMdAgent = useCallback(() => {
    setMdAgentTabId(null);
    setMdDialog(null);
  }, []);

  const handleMdAgentSelectText = useCallback(
    (text: string) => {
      const tab = openTabs.find((t) => t.id === activeTabId);
      if (!tab) return;
      setMdDialog({ file: tab.file, selectedText: text });
    },
    [openTabs, activeTabId]
  );

  const handleMdDialogSubmit = useCallback(
    async (userMessage: string) => {
      if (!mdDialog || !projectName.trim()) return;
      try {
        await runMdRefine({
          projectName,
          file: mdDialog.file,
          selectedText: mdDialog.selectedText,
          userMessage,
        });
        setMdDialog(null);
        resetMdRefineStatus();
      } catch {
        /* 错误态留在 hook，用户可重试 */
      }
    },
    [mdDialog, projectName, runMdRefine, resetMdRefineStatus]
  );

  const editingTabId = editingDashboard
    ? openTabs.find(t => t.file.name === editingDashboard.name)?.id
    : undefined;

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden bg-white">
      {/* Left: Chatbot */}
      <div
        className="flex flex-col border-r border-gray-100 min-h-0"
        style={{ width: "480px", minWidth: "400px", maxWidth: "560px" }}
      >
        <TaskProgress currentStep={state.step} tasks={chatHook.tasks} />
        <ChatPanel
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onFormSubmit={submitFormAnswers}
          isRunning={isRunning}
          currentStep={state.step}
          currentForm={state.currentForm}
          onClear={clear}
        />
      </div>

      {/* Right: File panel */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0 relative">
        {mdRefineLastError && (
          <div className="shrink-0 px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-800 flex gap-2 items-start">
            <span className="flex-1 whitespace-pre-wrap break-words">文档微调失败：{mdRefineLastError}</span>
            <button
              type="button"
              className="shrink-0 text-red-700 underline"
              onClick={() => resetMdRefineStatus()}
            >
              关闭
            </button>
          </div>
        )}
        <FilePanel
          projectName={projectName}
          refreshTrigger={fileRefreshTrigger}
          onFileOpen={handleFileOpen}
          openTabs={openTabs}
          activeTabId={activeTabId}
          onTabSelect={setActiveTabId}
          onTabClose={handleTabClose}
          editingTabId={editingTabId}
          onStartEdit={handleStartEdit}
          onExitEdit={handleExitEdit}
          selectedWidgets={selectedWidgets}
          onSelectionChange={setSelectedWidgets}
          onCodeLoad={handleCodeLoad}
          mdAgentTabId={mdAgentTabId}
          onStartMdAgent={handleStartMdAgent}
          onExitMdAgent={handleExitMdAgent}
          onMdAgentSelectText={handleMdAgentSelectText}
          visualAssetsBlock={visualAssetsBlock}
          visualAssetsLoading={visualAssetsLoading}
          visualAssetsFetchError={visualAssetsFetchError}
          onRetryVisualAssetsConfig={retryVisualAssetsConfig}
          onVisualAssetsSaved={handleVisualAssetsSaved}
          previewCssVariables={viTweaks.injectVars}
          boardCanvasWidth={boardCanvasWidth}
          boardCanvasHeight={boardCanvasHeight}
          tweaksOpen={tweaksOpen}
          setTweaksOpen={setTweaksOpen}
          dashboardTweaks={dashboardTweaks}
        />

        {/* 浮动编辑对话框（编辑模式下，有选中元素时显示） */}
        {editingDashboard && (
          <FloatingEditDialog
            selectedWidgets={selectedWidgets}
            isRunning={dashboardEditor.isRunning}
            onSubmit={handleEditSubmit}
            onClearSelection={() => setSelectedWidgets([])}
          />
        )}

        <MarkdownAgentDialog
          open={!!mdDialog}
          selectedText={mdDialog?.selectedText ?? ""}
          isRunning={mdRefineRunning}
          onClose={() => !mdRefineRunning && setMdDialog(null)}
          onSubmit={handleMdDialogSubmit}
        />
      </div>
    </div>
  );
}
