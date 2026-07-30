"use client";

import type { MediaRecord } from "@/app/repositories/media.repo";
import { MediaPreviewDialog } from "@/components/MediaPreviewDialog";
import { MediaSelectorModal } from "@/components/MediaSelectorModal";
import { ImageIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MediaGalleryProps = {
  items: MediaRecord[];
};

export default function MediaGallery({ items }: MediaGalleryProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<MediaRecord | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <li>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/40 flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Add media file"
          >
            <span className="bg-muted flex size-10 items-center justify-center rounded-full border">
              <PlusIcon className="size-5" />
            </span>
            <span className="text-sm font-medium">Add file</span>
          </button>
        </li>

        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setSelected(item)}
              className="group bg-muted relative aspect-square w-full overflow-hidden rounded-xl border text-left outline-none transition-shadow hover:ring-1 hover:ring-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.name}
                className="size-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              <span className="absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-black/70 to-transparent px-2 pb-2 pt-6 text-xs text-white">
                {item.name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 ? (
        <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
          <ImageIcon className="size-4 opacity-60" />
          No media yet. Use Add file to upload your first image.
        </p>
      ) : null}

      <MediaPreviewDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        item={
          selected
            ? {
                url: selected.url,
                name: selected.name,
                id: selected.id,
                size: selected.size,
                createdAt: selected.createdAt,
              }
            : null
        }
      />

      <MediaSelectorModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        multiple
        tabs={["upload"]}
        title="Upload media"
        description="Upload new images to your gallery."
        onAccept={() => {
          router.refresh();
        }}
      />
    </>
  );
}
