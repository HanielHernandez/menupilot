"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

export type MediaPreviewItem = {
  url: string;
  name?: string | null;
  id?: string | null;
  size?: number | null;
  createdAt?: string | null;
  status?: ReactNode;
};

type MediaPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MediaPreviewItem | null;
  title?: string;
  description?: string;
};

function formatBytes(bytes: number | null | undefined) {
  if (bytes == null || Number.isNaN(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadDate(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function MediaPreviewDialog({
  open,
  onOpenChange,
  item,
  title,
  description = "Image details and preview",
}: MediaPreviewDialogProps) {
  const sizeLabel = formatBytes(item?.size);
  const uploadDateLabel = formatUploadDate(item?.createdAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,800px)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="gap-1 border-b p-4 pr-12">
          <DialogTitle className="truncate">
            {item?.name || title || item?.id || "Media preview"}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {item ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:flex-row">
            <div className="bg-muted flex max-h-[min(50vh,420px)] flex-1 items-center justify-center overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.name || item.id || "Media preview"}
                className="max-h-[min(50vh,420px)] w-full object-contain"
              />
            </div>

            <dl className="flex w-full flex-col gap-4 md:max-w-xs">
              {item.name ? (
                <div>
                  <dt className="text-muted-foreground text-xs">Name</dt>
                  <dd className="mt-1 break-all font-medium">{item.name}</dd>
                </div>
              ) : null}
              {item.id ? (
                <div>
                  <dt className="text-muted-foreground text-xs">ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs">{item.id}</dd>
                </div>
              ) : null}
              {uploadDateLabel ? (
                <div>
                  <dt className="text-muted-foreground text-xs">Upload date</dt>
                  <dd className="mt-1 font-medium">{uploadDateLabel}</dd>
                </div>
              ) : null}
              {sizeLabel ? (
                <div>
                  <dt className="text-muted-foreground text-xs">Size</dt>
                  <dd className="mt-1 font-medium">{sizeLabel}</dd>
                </div>
              ) : null}
              {item.status ? (
                <div>
                  <dt className="text-muted-foreground text-xs">Status</dt>
                  <dd className="mt-1 flex items-center gap-2 font-medium uppercase">
                    {item.status}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
