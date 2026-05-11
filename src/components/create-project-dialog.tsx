"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BoardLayoutPresetPreview } from "@/components/board-layout-preset-preview";
import { DEFAULT_LAYOUT_PRESET_ID, listLayoutPresets } from "@/lib/board/board-layout-presets";
import { cn } from "@/lib/utils";
import { listAssetKits } from "@/lib/projects/asset-kits";
import type { BoardKind, ThemeMode } from "@/lib/projects/project-config";
import { DEFAULT_SCREEN_PRESET_ID, listScreenPresets } from "@/lib/board/screen-presets";

export interface CreateProjectPayload {
  name: string;
  style: string;
  themeMode: ThemeMode;
  boardKind: BoardKind;
  screenPresetId: string;
  layoutPresetId: string;
  assetKitId: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  onSubmit: (payload: CreateProjectPayload) => void | Promise<void>;
}

const LAYOUT_PRESETS = listLayoutPresets();
const SCREEN_PRESETS = listScreenPresets();
const ASSET_KITS = listAssetKits();

export function CreateProjectDialog({
  open,
  onOpenChange,
  defaultName = "",
  onSubmit,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [style, setStyle] = useState<string>("");
  const [styles, setStyles] = useState<string[]>([]);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [stylesErr, setStylesErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [boardKind, setBoardKind] = useState<BoardKind>("dashboard");
  const [screenPresetId, setScreenPresetId] = useState<string>(DEFAULT_SCREEN_PRESET_ID);
  const [layoutPresetId, setLayoutPresetId] = useState<string>(DEFAULT_LAYOUT_PRESET_ID);
  const [assetKitId, setAssetKitId] = useState<string>("default");

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setStyle("");
      setStylesErr(null);
      setSubmitting(false);
      setThemeMode("dark");
      setBoardKind("dashboard");
      setScreenPresetId(DEFAULT_SCREEN_PRESET_ID);
      setLayoutPresetId(DEFAULT_LAYOUT_PRESET_ID);
      setAssetKitId("default");
    }
  }, [open, defaultName]);

  useEffect(() => {
    if (!open) return;
    let aborted = false;
    setLoadingStyles(true);
    setStylesErr(null);
    fetch("/api/design-systems/list")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ styles: string[] }>;
      })
      .then((data) => {
        if (aborted) return;
        const list = Array.isArray(data.styles) ? data.styles : [];
        setStyles(list);
        const prefer = list.find((s) => s === "default") ?? list[0] ?? "";
        setStyle(prefer);
      })
      .catch((err) => {
        if (aborted) return;
        console.error("[CreateProjectDialog] load styles failed", err);
        setStylesErr("加载风格列表失败");
        setStyles([]);
      })
      .finally(() => {
        if (!aborted) setLoadingStyles(false);
      });
    return () => {
      aborted = true;
    };
  }, [open]);

  const trimmed = name.trim();
  const canSubmit =
    trimmed.length > 0 &&
    style.length > 0 &&
    !loadingStyles &&
    !submitting &&
    Boolean(screenPresetId) &&
    Boolean(layoutPresetId) &&
    Boolean(assetKitId);

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmed,
        style,
        themeMode,
        boardKind,
        screenPresetId,
        layoutPresetId,
        assetKitId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建数据看板项目</DialogTitle>
          <DialogDescription>
            选择主题、看板类型、设计画布尺寸、主区布局与素材套件；design-story / pages-story / generate-jsx 将读取 project.config.json 中的选项。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">项目名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：销售分析看板"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) handleConfirm();
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">主题模式</label>
              <Select
                value={themeMode}
                onValueChange={(v) => setThemeMode(v === "light" ? "light" : "dark")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">深色</SelectItem>
                  <SelectItem value="light">浅色（大屏霓虹默认关闭）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">看板类型</label>
              <Select
                value={boardKind}
                onValueChange={(v) => setBoardKind(v === "wallboard" ? "wallboard" : "dashboard")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">普通看板（扁平卡片 KPI 倾向）</SelectItem>
                  <SelectItem value="wallboard">大屏 wallboard（指标组倾向）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground" id="screen-preset-label">
              设计画布尺寸（像素基准）
            </label>
            <div
              className="grid max-h-[200px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3"
              role="group"
              aria-labelledby="screen-preset-label"
            >
              {SCREEN_PRESETS.map((s) => {
                const selected = screenPresetId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScreenPresetId(s.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col gap-1 rounded-lg border px-2 py-2 text-left transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                        : "border-border bg-card hover:bg-muted/40"
                    )}
                  >
                    <div className="tabular-nums text-sm font-semibold leading-none tracking-tight text-foreground">
                      {s.width}×{s.height}
                    </div>
                    <div className="text-[11px] font-medium leading-tight text-foreground">{s.label}</div>
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{s.tag}</div>
                    <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">{s.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground" id="layout-preset-label">
              主区布局（main 内 KPI 横条下方）
            </label>
            <div
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              role="group"
              aria-labelledby="layout-preset-label"
            >
              {LAYOUT_PRESETS.map((p) => {
                const selected = layoutPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setLayoutPresetId(p.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col gap-2 rounded-lg border p-2.5 text-left transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                        : "border-border bg-card hover:bg-muted/40"
                    )}
                  >
                    <BoardLayoutPresetPreview
                      presetId={p.id}
                      showCaption={false}
                      className="pointer-events-none border-0 bg-transparent p-0"
                    />
                    <div className="min-w-0 px-0.5">
                      <div className="text-xs font-medium leading-snug text-foreground">{p.label}</div>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                        {p.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">素材套件</label>
            <Select value={assetKitId} onValueChange={setAssetKitId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择套件" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_KITS.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {ASSET_KITS.find((k) => k.id === assetKitId)?.description ?? ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">品牌风格（design-systems）</label>
            <Select value={style} onValueChange={setStyle} disabled={loadingStyles}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingStyles ? "加载中..." : "请选择一个风格"} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {styles.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stylesErr && <p className="text-xs text-destructive">{stylesErr}</p>}
            {!stylesErr && styles.length === 0 && !loadingStyles && (
              <p className="text-xs text-muted-foreground">未找到 design-systems 下的风格子目录</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={() => void handleConfirm()} disabled={!canSubmit}>
            {submitting ? "创建中…" : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
