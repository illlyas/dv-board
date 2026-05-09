"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog, type CreateProjectPayload } from "@/components/create-project-dialog";
import type { ProjectConfig } from "@/lib/projects/project-config";

type ViewMode = "recent" | "my-designs";

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("my-designs");
  const [dialogOpen, setDialogOpen] = useState(false);

  const refreshProjects = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { projects: ProjectConfig[] };
      setProjects(data.projects ?? []);
    } catch (e) {
      console.error("[Home] list projects:", e);
      setProjects([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  // 计算一个唯一的默认项目名（如果重名则加序号）
  const computeUniqueName = (base: string): string => {
    const existing = new Set(projects.map((p) => p.name));
    if (!existing.has(base)) return base;
    let counter = 1;
    while (existing.has(`${base} ${counter}`)) counter++;
    return `${base} ${counter}`;
  };

  // 打开新建对话框
  const handleOpenCreateDialog = () => {
    setDialogOpen(true);
  };

  const handleCreateProject = async ({ name, style }: CreateProjectPayload) => {
    const finalName = computeUniqueName(name);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: finalName, style }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { project: ProjectConfig };
      setDialogOpen(false);
      await refreshProjects();
      router.push(`/project/${data.project.id}`);
    } catch (e) {
      console.error("[Home] create project:", e);
      alert(e instanceof Error ? e.message : "创建失败");
    }
  };

  // 打开项目
  const handleOpenProject = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  // 删除项目（同时删除 .dv/ 目录下的文件）
  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("确定要删除这个项目吗？此操作不可恢复。")) return;

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refreshProjects();
    } catch (err) {
      console.error("[Home] delete project:", err);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* 顶部导航栏 */}
      <header className="border-b border-border/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">Open Design</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                AI 数据看板
              </p>
            </div>
          </div>

          {/* 视图切换 */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
            <button
              onClick={() => setViewMode("my-designs")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                viewMode === "my-designs"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              我的设计
            </button>
            <button
              onClick={() => setViewMode("recent")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                viewMode === "recent"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              最近
            </button>
          </div>
        </div>

        {/* 新建按钮 */}
        <Button onClick={handleOpenCreateDialog} size="sm" className="gap-1.5">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          新建
        </Button>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {listLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            // 空状态
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/30 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">还没有项目</h3>
                <p className="text-sm text-muted-foreground">
                  点击右上角"新建"按钮开始创建你的第一个数据看板
                </p>
              </div>
            </div>
          ) : (
            // 项目网格
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className="group cursor-pointer"
                >
                  {/* 缩略图卡片 */}
                  <div className="relative aspect-[4/3] rounded-xl bg-muted/20 border border-border/50 overflow-hidden mb-3 hover:border-border transition-all">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-muted-foreground/30"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* 删除按钮 */}
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-background/90 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive hover:border-destructive hover:text-destructive-foreground"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* 项目信息 */}
                  <div className="px-1">
                    <h3 className="font-medium text-sm mb-1 truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(project.updatedAt).toLocaleDateString(
                          "zh-CN",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span>·</span>
                      <span>已同步</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 新建项目对话框 */}
      <CreateProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultName={computeUniqueName("未命名项目")}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
