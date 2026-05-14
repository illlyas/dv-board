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

export interface CreateProjectPayload {
  name: string;
  style: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  onSubmit: (payload: CreateProjectPayload) => void | Promise<void>;
}

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

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setStyle("");
      setStylesErr(null);
      setSubmitting(false);
    }
  }, [open, defaultName]);

  useEffect(() => {
    if (!open) return;
    let aborted = false;
    setLoadingStyles(true);
    setStylesErr(null);
    fetch("/api/design-systems/list?viMode=dark")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ styles: string[] }>;
      })
      .then((data) => {
        if (aborted) return;
        const list = Array.isArray(data.styles) ? data.styles : [];
        setStyles(list);
        const prefer =
          list.find((s) => s === "big-screen-emerald-ops") ??
          list.find((s) => s === "default") ??
          list[0] ??
          "";
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
    trimmed.length > 0 && style.length > 0 && !loadingStyles && !submitting;

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmed,
        style,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建数据看板项目</DialogTitle>
          <DialogDescription>
            看板布局与画布尺寸由「风电智慧运营」固定模板装配；此处仅需项目名称，以及用于生成品牌 CSS Token 的深色主题风格（design-systems 中已落盘 vi-tokens.json 且 mode=dark 的条目）。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">项目名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：华东风电运营看板"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) handleConfirm();
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">深色 Token 主题（design-systems）</label>
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
              <p className="text-xs text-muted-foreground">未找到含深色 vi-tokens.json 的风格目录</p>
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
