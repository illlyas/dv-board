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

  // 打开时重置输入
  useEffect(() => {
    if (open) {
      setName(defaultName);
      setStyle("");
      setStylesErr(null);
      setSubmitting(false);
    }
  }, [open, defaultName]);

  // 打开时加载风格列表
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
        // 默认选中第一个（常用的 default / apple 之类）
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
  const canSubmit = trimmed.length > 0 && style.length > 0 && !loadingStyles && !submitting;

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: trimmed, style });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新建数据看板项目</DialogTitle>
          <DialogDescription>
            填写项目名称并选择一套品牌风格，后续会根据该风格生成 CSS Tokens 驱动看板视觉。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              项目名称
            </label>
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              品牌风格（design-systems）
            </label>
            <Select value={style} onValueChange={setStyle} disabled={loadingStyles}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={loadingStyles ? "加载中..." : "请选择一个风格"}
                />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {styles.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stylesErr && (
              <p className="text-xs text-destructive">{stylesErr}</p>
            )}
            {!stylesErr && styles.length === 0 && !loadingStyles && (
              <p className="text-xs text-muted-foreground">
                未找到 design-systems 下的风格子目录
              </p>
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
