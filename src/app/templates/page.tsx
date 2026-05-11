"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BoardTemplateMeta } from "@/lib/board-templates/types";

export default function TemplatesMarketPage() {
  const [templates, setTemplates] = useState<BoardTemplateMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/board-templates");
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { templates: BoardTemplateMeta[] };
        if (!cancelled) setTemplates(data.templates ?? []);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : String(e));
          setTemplates([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border/50 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/"
            className="text-xs font-medium text-muted-foreground hover:text-foreground shrink-0"
          >
            ← 首页
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-sm leading-tight">模板市场</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">
              预设大屏由 vi-tokens、dashboard.jsx、dashboard.store.json 组成；可全屏预览
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : err ? (
          <p className="text-sm text-destructive text-center py-12">{err}</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">暂无模板</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
            {templates.map((t) => (
              <Link
                key={t.id}
                href={`/templates/${encodeURIComponent(t.id)}/preview`}
                className="group rounded-xl border border-border/50 bg-card/30 p-5 hover:border-primary/40 hover:bg-card/50 transition-colors"
              >
                <div className="aspect-[16/10] rounded-lg bg-muted/25 border border-border/40 mb-4 flex items-center justify-center overflow-hidden">
                  <span className="text-[11px] text-muted-foreground/80 px-3 text-center">
                    点击进入全屏预览
                  </span>
                </div>
                <h2 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                  {t.title}
                </h2>
                {t.description ? (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.description}</p>
                ) : null}
                {t.tags && t.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
