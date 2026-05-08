"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BoardStudio } from "@/components/board-studio";

interface Project {
  id: string;
  name: string;
  style: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("dv-projects");
    if (stored) {
      try {
        const projects: Project[] = JSON.parse(stored);
        const found = projects.find((p) => p.id === projectId);
        if (found) {
          setProject(found);
          setEditName(found.name);
        } else {
          // 项目不存在，返回首页
          router.push("/");
        }
      } catch (e) {
        console.error("Failed to parse projects:", e);
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [projectId, router]);

  const handleSaveName = () => {
    if (!project || !editName.trim()) return;

    const stored = localStorage.getItem("dv-projects");
    if (!stored) return;

    try {
      const projects: Project[] = JSON.parse(stored);

      const newName = editName.trim();
      const isDuplicate = projects.some(
        (p) => p.id !== projectId && p.name === newName
      );

      if (isDuplicate) {
        alert(`已存在名为"${newName}"的项目，请使用其他名称。`);
        setEditName(project.name);
        setIsEditingName(false);
        return;
      }

      const oldName = project.name;
      const updated = projects.map((p) =>
        p.id === projectId
          ? { ...p, name: newName, updatedAt: new Date().toISOString() }
          : p
      );
      localStorage.setItem("dv-projects", JSON.stringify(updated));
      setProject((prev) => prev ? { ...prev, name: newName } : null);

      // 如果名称变了，重命名 .dv/ 目录
      if (oldName !== newName) {
        fetch("/api/files/rename-project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldName, newName }),
        }).catch((err) => console.error("Failed to rename project dir:", err));
      }
    } catch (e) {
      console.error("Failed to save project name:", e);
    }

    setIsEditingName(false);
  };

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* 顶部导航栏 */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border/50 shrink-0">
        {/* 返回按钮 */}
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

        {/* 项目名称（可编辑） */}
        {isEditingName ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveName();
            }}
            className="flex items-center gap-2"
          >
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
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

      {/* 工作台主体 */}
      <div className="flex-1 min-h-0 flex">
        <BoardStudio projectName={project.name} style={project.style ?? ""} />
      </div>
    </div>
  );
}
