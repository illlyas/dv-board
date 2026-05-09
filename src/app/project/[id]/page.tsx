"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { BoardStudio } from "@/components/board-studio";
import type { ProjectConfig } from "@/lib/projects/project-config";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectConfig | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const loadProject = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
      if (!res.ok) {
        setLoadError(true);
        router.push("/");
        return;
      }
      const data = (await res.json()) as { project: ProjectConfig };
      setProject(data.project);
      setEditName(data.project.name);
    } catch (e) {
      console.error("[ProjectPage] load:", e);
      setLoadError(true);
      router.push("/");
    }
  }, [projectId, router]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  const handleSaveName = async () => {
    if (!project || !editName.trim()) return;

    const newName = editName.trim();
    if (newName === project.name) {
      setIsEditingName(false);
      return;
    }

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        project?: ProjectConfig;
        message?: string;
      };
      if (res.status === 409) {
        alert(data.message ?? "已存在同名展示项目，请使用其他名称。");
        setEditName(project.name);
        setIsEditingName(false);
        return;
      }
      if (!res.ok) {
        throw new Error("update failed");
      }
      if (data.project) {
        setProject(data.project);
      }
    } catch (e) {
      console.error("[ProjectPage] save name:", e);
      setEditName(project.name);
    }

    setIsEditingName(false);
  };

  if (!project && !loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border/50 shrink-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回
        </button>

        <span className="text-border/50">|</span>

        {isEditingName ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSaveName();
            }}
            className="flex items-center gap-2"
          >
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => void handleSaveName()}
              className="text-sm font-medium bg-muted/50 border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </form>
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-sm font-medium hover:text-primary transition-colors"
            title="点击编辑项目名称"
          >
            {project.name}
          </button>
        )}
      </header>

      <div className="flex-1 min-h-0 flex">
        <BoardStudio projectName={project.id} style={project.style ?? ""} />
      </div>
    </div>
  );
}
