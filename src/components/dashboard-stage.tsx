"use client";

import { LayoutGrid } from "lucide-react";

import { LOCAL_STORAGE_KEY } from "@/lib/dashboard-schema";
import { resolveActivePage } from "@/lib/dashboard-helpers";
import type { StreamedVisdocModel } from "@/lib/dashboard-helpers";
import { PageCanvas } from "@/components/dashboard/page-canvas";

// ─── Props ────────────────────────────────────────────────

type StageProps = {
  board?: StreamedVisdocModel;
  isLoading: boolean;
  activePageId?: string;
  onPageChange?: (pageId: string) => void;
};

// ══════════════════════════════════════════════════════════
// ─── Main Export: DashboardStage ─────────────────────────
// ══════════════════════════════════════════════════════════

export function DashboardStage({
  board,
  isLoading,
  activePageId,
  onPageChange,
}: StageProps) {
  const { pages, activePage } = resolveActivePage(board, activePageId);

  // 是否有有效数据
  const hasData = !!board?.name && !!pages.length;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* ── 纯画布区域（无预设 chrome）── */}
      {!hasData ? (
        /* 空状态 */
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-10 text-center">
            <LayoutGrid className="mx-auto mb-4 h-12 w-12 text-white/[0.12]" />
            <p className="text-base font-medium text-white/48">暂无看板数据</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/28">
              在左侧输入框描述你想要的数据可视化看板，
              <br />AI 将自动生成分页文档并在此处渲染。
            </p>
            <button
              type="button"
              className="mt-5 cursor-pointer rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm text-white/56 transition hover:bg-white/[0.10] hover:text-white/78"
              onClick={() => {
                try {
                  const demoRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
                  if (demoRaw) {
                    window.dispatchEvent(new CustomEvent("dv-board-load-demo"));
                  }
                } catch { /* ignore */ }
              }}
            >
              或加载示例看板预览效果 →
            </button>
          </div>
        </div>
      ) : (
        /* 有数据时显示画布 */
        <PageCanvas board={board!} page={activePage} />
      )}

      {/* ── 极简分页浮层（仅多页时显示，非 header/footer）── */}
      {hasData && pages.length > 1 && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
          <nav className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/40 px-2 py-1.5 backdrop-blur-md">
            {pages.map((pg, idx) =>
              pg?.id ? (
                <button
                  key={pg.id}
                  type="button"
                  onClick={() => onPageChange?.(pg.id as string)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    pg.id === activePage?.id
                      ? "bg-[#f97316] text-[#140a00]"
                      : "text-white/58 hover:text-white/82"
                  }`}
                >
                  {String(pg.name ?? `P${idx + 1}`)}
                </button>
              ) : null,
            )}
          </nav>
        </div>
      )}

      {/* ── 加载状态浮层 ── */}
      {isLoading && hasData && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-20">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-4 py-2 backdrop-blur-md">
            <span className="text-xs text-white/56">AI 更新中…</span>
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-yellow-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
