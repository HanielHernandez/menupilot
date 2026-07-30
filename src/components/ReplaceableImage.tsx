"use client";

import {
  MediaSelectorModal,
  type MediaSelectorItem,
} from "@/components/MediaSelectorModal";
import { cn } from "@/lib/utils";
import { ImageIcon, PencilIcon } from "lucide-react";
import { useState } from "react";

export type ReplaceableImageProps = {
  src?: string | null;
  alt: string;
  /** Currently selected media id (pre-selected in the modal). */
  mediaId?: string | null;
  onReplace: (media: Pick<MediaSelectorItem, "id" | "url">) => void;
  className?: string;
  imageClassName?: string;
  disabled?: boolean;
  modalTitle?: string;
  modalDescription?: string;
};

export function ReplaceableImage({
  src,
  alt,
  mediaId,
  onReplace,
  className,
  imageClassName,
  disabled = false,
  modalTitle = "Select image",
  modalDescription = "Upload a new image or pick one from your library.",
}: ReplaceableImageProps) {
  const [open, setOpen] = useState(false);
  const hasImage = Boolean(src?.trim());

  const handleAccept = (items: MediaSelectorItem[]) => {
    const item = items[0];
    if (!item) return;
    onReplace({ id: item.id, url: item.url });
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-label={`Edit ${alt}`}
        className={cn(
          "group relative size-32 shrink-0 overflow-hidden rounded-full border bg-muted outline-none transition-shadow",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt={alt}
            className={cn("size-full object-cover", imageClassName)}
          />
        ) : (
          <span className="text-muted-foreground flex size-full items-center justify-center">
            <ImageIcon className="size-8 opacity-60" />
          </span>
        )}

        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/45 text-white",
            "opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-black/35 ring-1 ring-white/30">
            <PencilIcon className="size-4" />
          </span>
        </span>
      </button>

      <MediaSelectorModal
        open={open}
        onOpenChange={setOpen}
        multiple={false}
        title={modalTitle}
        description={modalDescription}
        initialSelectedIds={mediaId ? [mediaId] : []}
        onAccept={handleAccept}
      />
    </>
  );
}
