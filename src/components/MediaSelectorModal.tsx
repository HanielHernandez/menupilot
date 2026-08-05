"use client";

import {
  listMediaAction,
  uploadMediaAction,
} from "@/app/actions/media";
import type { MediaRecord } from "@/app/repositories/media.repo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropZone, type DropZoneFile } from "@/components/ui/drop-zone";
import { Spinner } from "@/components/ui/spinner";
import {
  MAX_UPLOAD_BODY_BYTES,
  MAX_UPLOAD_BODY_MB,
} from "@/lib/usage-limits";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type MediaSelectorItem = MediaRecord;

type MediaSelectorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When false, only one item can be selected. Defaults to false. */
  multiple?: boolean;
  /** Called with the selected media records when Accept is pressed. */
  onAccept: (items: MediaSelectorItem[]) => void;
  title?: string;
  description?: string;
  initialSelectedIds?: string[];
  /** Which tabs to show. Defaults to both upload and library. */
  tabs?: TabId[];
};

type TabId = "upload" | "library";

const ALL_TABS: TabId[] = ["upload", "library"];

const PAGE_SIZE = 25;

const IMAGE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

function buildInitialSelection(
  initialSelectedIds: string[],
): Map<string, MediaSelectorItem> {
  const next = new Map<string, MediaSelectorItem>();
  for (const id of initialSelectedIds) {
    next.set(id, {
      id,
      url: "",
      key: "",
      name: "",
      size: null,
      weight: 0,
      restaurantId: null,
      userId: null,
      createdAt: "",
      updatedAt: "",
    });
  }
  return next;
}

function MediaSelectorModalBody({
  multiple,
  onAccept,
  onOpenChange,
  title,
  description,
  initialSelectedIds,
  tabs = ALL_TABS,
}: Omit<MediaSelectorModalProps, "open"> & {
  initialSelectedIds: string[];
  tabs: TabId[];
}) {
  const availableTabs = tabs.length > 0 ? tabs : ALL_TABS;
  const showTabBar = availableTabs.length > 1;
  const libraryEnabled = availableTabs.includes("library");
  const [tab, setTab] = useState<TabId>(availableTabs[0] ?? "upload");
  const [pendingFiles, setPendingFiles] = useState<DropZoneFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selected, setSelected] = useState(() =>
    buildInitialSelection(initialSelectedIds),
  );

  const [libraryItems, setLibraryItems] = useState<MediaRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);

  const clearPendingFiles = useCallback(() => {
    setPendingFiles((current) => {
      current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
  }, []);

  const pendingFilesRef = useRef(pendingFiles);

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  const applyLibraryPage = useCallback((data: {
    items: MediaRecord[];
    page: number;
    totalPages: number;
    total: number;
  }) => {
    setLibraryItems(data.items);
    setPage(data.page);
    setTotalPages(data.totalPages);
    setTotal(data.total);

    setSelected((current) => {
      if (current.size === 0) return current;
      let changed = false;
      const next = new Map(current);
      for (const item of data.items) {
        if (next.has(item.id) && !next.get(item.id)?.url) {
          next.set(item.id, item);
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, []);

  const loadLibrary = useCallback(
    async (nextPage: number) => {
      setIsLoadingLibrary(true);
      try {
        const result = await listMediaAction(nextPage, PAGE_SIZE);
        if (!result.success) {
          toast.error(result.error || "Failed to load media");
          return;
        }
        applyLibraryPage(result.data);
      } finally {
        setIsLoadingLibrary(false);
      }
    },
    [applyLibraryPage],
  );

  useEffect(() => {
    let cancelled = false;

    if (!libraryEnabled) {
      setIsLoadingLibrary(false);
      return () => {
        cancelled = true;
        pendingFilesRef.current.forEach((item) => {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
      };
    }

    void listMediaAction(1, PAGE_SIZE).then((result) => {
      if (cancelled) return;
      if (!result.success) {
        toast.error(result.error || "Failed to load media");
        setIsLoadingLibrary(false);
        return;
      }
      applyLibraryPage(result.data);
      setIsLoadingLibrary(false);
    });

    return () => {
      cancelled = true;
      pendingFilesRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [applyLibraryPage, libraryEnabled]);

  const toggleSelect = (item: MediaSelectorItem) => {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(item.id)) {
        next.delete(item.id);
        return next;
      }
      if (!multiple) {
        next.clear();
      }
      next.set(item.id, item);
      return next;
    });
  };

  const reportUploadError = (message: string) => {
    setUploadError(message);
    toast.error(message);
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0 || isUploading) return;

    setUploadError(null);

    const totalBytes = pendingFiles.reduce(
      (sum, item) => sum + item.file.size,
      0,
    );
    if (totalBytes > MAX_UPLOAD_BODY_BYTES) {
      reportUploadError(
        `Selected files exceed the ${MAX_UPLOAD_BODY_MB} MB upload limit. Remove some files or choose smaller ones.`,
      );
      return;
    }

    const oversized = pendingFiles.find(
      (item) => item.file.size > MAX_UPLOAD_BODY_BYTES,
    );
    if (oversized) {
      reportUploadError(
        `${oversized.file.name} exceeds the ${MAX_UPLOAD_BODY_MB} MB upload limit.`,
      );
      return;
    }

    setIsUploading(true);
    try {
      const uploaded: MediaSelectorItem[] = [];

      for (const item of pendingFiles) {
        const formData = new FormData();
        formData.append("file", item.file);
        const result = await uploadMediaAction(formData);
        if (!result.success) {
          reportUploadError(
            result.error || `Failed to upload ${item.file.name}`,
          );
          return;
        }
        uploaded.push(result.media);
      }

      setSelected((current) => {
        const next = multiple ? new Map(current) : new Map();
        for (const media of uploaded) {
          if (!multiple) next.clear();
          next.set(media.id, media);
          if (!multiple) break;
        }
        return next;
      });

      clearPendingFiles();
      setUploadError(null);
      toast.success(
        uploaded.length === 1
          ? "Media uploaded"
          : `${uploaded.length} files uploaded`,
      );

      if (!libraryEnabled) {
        onAccept(multiple ? uploaded : uploaded.slice(0, 1));
        onOpenChange(false);
        return;
      }

      setTab("library");
      await loadLibrary(1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload media";
      const isBodyLimit =
        /body.*size|Body exceeded|too large|413|payload/i.test(message);
      reportUploadError(
        isBodyLimit
          ? `Upload failed: files exceed the ${MAX_UPLOAD_BODY_MB} MB limit.`
          : message || "Failed to upload media. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleAccept = () => {
    const items = Array.from(selected.values()).filter((item) => item.url);
    if (items.length === 0) {
      toast.error(
        multiple ? "Select at least one media item" : "Select a media item",
      );
      return;
    }
    onAccept(multiple ? items : items.slice(0, 1));
    onOpenChange(false);
  };

  const selectedCount = Array.from(selected.values()).filter(
    (item) => item.url,
  ).length;

  return (
    <>
      <DialogHeader className="gap-1 border-b p-4 pr-12">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      {showTabBar ? (
        <div className="flex gap-1 border-b px-4 pt-3">
          {(
            [
              { id: "upload", label: "Upload" },
              { id: "library", label: "Library" },
            ] as const
          )
            .filter((item) => availableTabs.includes(item.id))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "relative rounded-t-lg px-3 py-2 text-sm font-medium transition-colors",
                  tab === item.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {tab === item.id ? (
                  <span className="bg-foreground absolute inset-x-2 -bottom-px h-0.5 rounded-full" />
                ) : null}
              </button>
            ))}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "upload" ? (
          <div className="flex flex-col gap-4">
            <DropZone
              files={pendingFiles}
              onFilesChange={(next) => {
                setUploadError(null);
                setPendingFiles(next);
              }}
              multiple={multiple}
              maxFiles={multiple ? 20 : 1}
              maxSizeMb={MAX_UPLOAD_BODY_MB}
              maxTotalSizeMb={MAX_UPLOAD_BODY_MB}
              accept={IMAGE_ACCEPT}
              acceptAttr="image/jpeg,image/png,image/webp,image/gif"
              disabled={isUploading}
              label={isUploading ? "Uploading…" : "Drop images here"}
              description="JPEG, PNG, WebP, or GIF"
            />

            {uploadError ? (
              <p className="text-destructive text-sm" role="alert">
                {uploadError}
              </p>
            ) : null}

            {pendingFiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {pendingFiles.map((item) => (
                  <div
                    key={item.id}
                    className="bg-muted relative aspect-square overflow-hidden rounded-lg border"
                  >
                    {item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex size-full items-center justify-center">
                        <ImageIcon className="size-6" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={pendingFiles.length === 0 || isUploading}
                onClick={() => void handleUpload()}
              >
                {isUploading ? (
                  <>
                    <Spinner />
                    Uploading…
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {isLoadingLibrary ? (
              <div className="text-muted-foreground flex min-h-48 items-center justify-center gap-2 text-sm">
                <Spinner />
                Loading media…
              </div>
            ) : libraryItems.length === 0 ? (
              <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-2 text-sm">
                <ImageIcon className="size-8 opacity-50" />
                <p>No media yet. Upload something on the Upload tab.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {libraryItems.map((item) => {
                  const isSelected = selected.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSelect(item)}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-lg border bg-muted text-left outline-none transition-shadow",
                        "focus-visible:ring-3 focus-visible:ring-ring/50",
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "hover:ring-1 hover:ring-foreground/20",
                      )}
                      aria-pressed={isSelected}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt=""
                        className="size-full object-cover"
                      />
                      {isSelected ? (
                        <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-6 items-center justify-center rounded-full shadow">
                          <CheckIcon className="size-3.5" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}

            {total > 0 ? (
              <div className="flex items-center justify-between gap-3 border-t pt-3">
                <p className="text-muted-foreground text-xs">
                  Page {page} of {totalPages} · {total} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isLoadingLibrary}
                    onClick={() => void loadLibrary(page - 1)}
                  >
                    <ChevronLeftIcon />
                    Prev
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || isLoadingLibrary}
                    onClick={() => void loadLibrary(page + 1)}
                  >
                    Next
                    <ChevronRightIcon />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {libraryEnabled || selectedCount > 0 ? (
        <DialogFooter className="mx-0 mb-0 sm:justify-between">
          <p className="text-muted-foreground self-center text-xs">
            {selectedCount === 0
              ? "Nothing selected"
              : selectedCount === 1
                ? "1 item selected"
                : `${selectedCount} items selected`}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleAccept}
            >
              Accept
            </Button>
          </div>
        </DialogFooter>
      ) : (
        <DialogFooter className="mx-0 mb-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      )}
    </>
  );
}

export function MediaSelectorModal({
  open,
  onOpenChange,
  multiple = false,
  onAccept,
  title = "Select media",
  description,
  initialSelectedIds = [],
  tabs = ALL_TABS,
}: MediaSelectorModalProps) {
  const resolvedTabs = tabs.length > 0 ? tabs : ALL_TABS;
  const resolvedDescription =
    description ??
    (resolvedTabs.length === 1 && resolvedTabs[0] === "upload"
      ? "Upload new images to your media library."
      : multiple
        ? "Upload new files or pick from your library."
        : "Upload a new file or pick one from your library.");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        {open ? (
          <MediaSelectorModalBody
            multiple={multiple}
            onAccept={onAccept}
            onOpenChange={onOpenChange}
            title={title}
            description={resolvedDescription}
            initialSelectedIds={initialSelectedIds}
            tabs={resolvedTabs}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
