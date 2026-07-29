"use client";

import { deleteMenuImageAction } from "@/app/actions/deleteMenuImage";
import { Button } from "@/components/ui/button";
import { CheckIcon, CloudIcon, RecycleIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export type MenuImageListItem = {
  _id: string;
  url: string;
  status: string;
  name?: string;
  fileName?: string;
};

type MenuImagesListProps = {
  items: MenuImageListItem[];
};

function getDisplayName(item: MenuImageListItem) {
  return (
    item.fileName ?? item.name ?? item.url.split("/").pop() ?? "menu-image"
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "uploaded") {
    return (
      <CloudIcon
        className="text-muted-foreground size-4 shrink-0"
        aria-label="Uploaded"
      />
    );
  }

  if (status === "processing") {
    return (
      <RecycleIcon
        className="text-muted-foreground size-4 shrink-0"
        aria-label="Processing"
      />
    );
  }

  if (status === "extracted") {
    return (
      <span
        className="bg-accent text-accent-foreground inline-flex size-5 shrink-0 items-center justify-center rounded-full"
        aria-label="Extracted"
      >
        <CheckIcon className="size-3" />
      </span>
    );
  }

  return null;
}

export default function MenuImagesList({ items }: MenuImagesListProps) {
  const [removedIds, setRemovedIds] = useState(() => new Set<string>());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const visibleItems = items.filter((item) => !removedIds.has(item._id));

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);

    try {
      const result = await deleteMenuImageAction(imageId);

      if (result.success) {
        setRemovedIds((current) => new Set(current).add(imageId));
        toast.success("Image deleted");
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (!visibleItems.length) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
        No menu images uploaded yet.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {visibleItems.map((item) => (
        <li
          key={item._id}
          className="flex min-w-0 items-center justify-between gap-4 rounded-lg border p-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="bg-muted/40 relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
              <Image
                src={item.url}
                alt={getDisplayName(item)}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate font-medium">{getDisplayName(item)}</p>
              </div>
              <p className="text-muted-foreground truncate text-sm">
                {item.url}
              </p>
              <p className="text-muted-foreground flex flex-row gap-2 mt-1 truncate text-xs tracking-wide uppercase">
                <StatusIcon status={item.status} /> {item.status}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={deletingId === item._id}
            onClick={() => handleDelete(item._id)}
          >
            {deletingId === item._id ? "Deleting..." : "Delete"}
          </Button>
        </li>
      ))}
    </ul>
  );
}
