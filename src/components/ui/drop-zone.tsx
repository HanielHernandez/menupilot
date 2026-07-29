"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

const DEFAULT_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

const DEFAULT_ACCEPT_ATTR = "image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf";

export type DropZoneFile = {
  id: string;
  file: File;
  previewUrl?: string;
};

type DropZoneProps = {
  files?: DropZoneFile[];
  onFilesChange?: (files: DropZoneFile[]) => void;
  accept?: readonly string[];
  acceptAttr?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedType(file: File, accept: readonly string[]) {
  if (accept.includes(file.type)) return true;
  if (file.type === "" && file.name.toLowerCase().endsWith(".pdf")) {
    return accept.includes("application/pdf");
  }
  return false;
}

function createDropZoneFile(file: File): DropZoneFile {
  const isImage = file.type.startsWith("image/");
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    previewUrl: isImage ? URL.createObjectURL(file) : undefined,
  };
}

function revokePreview(item: DropZoneFile) {
  if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
}

export function DropZone({
  files: controlledFiles,
  onFilesChange,
  accept = DEFAULT_ACCEPT,
  acceptAttr = DEFAULT_ACCEPT_ATTR,
  multiple = true,
  maxFiles = 20,
  maxSizeMb = 10,
  disabled = false,
  className,
  label = "Drop files here",
  description = "Images (JPG, PNG, WebP, GIF) or PDF",
}: DropZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalFiles, setInternalFiles] = useState<DropZoneFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const files = controlledFiles ?? internalFiles;

  const setFiles = useCallback(
    (next: DropZoneFile[]) => {
      if (controlledFiles === undefined) {
        setInternalFiles(next);
      }
      onFilesChange?.(next);
    },
    [controlledFiles, onFilesChange],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (!list.length) return;

      setError(null);

      const maxBytes = maxSizeMb * 1024 * 1024;
      const next = multiple ? [...files] : [];
      const rejected: string[] = [];

      for (const file of list) {
        if (!multiple && next.length >= 1) break;
        if (next.length >= maxFiles) {
          rejected.push(`You can upload up to ${maxFiles} files`);
          break;
        }
        if (!isAcceptedType(file, accept)) {
          rejected.push(`${file.name} is not an image or PDF`);
          continue;
        }
        if (file.size > maxBytes) {
          rejected.push(`${file.name} exceeds ${maxSizeMb} MB`);
          continue;
        }
        const alreadyAdded = next.some(
          (item) =>
            item.file.name === file.name &&
            item.file.size === file.size &&
            item.file.lastModified === file.lastModified,
        );
        if (alreadyAdded) continue;

        next.push(createDropZoneFile(file));
      }

      if (rejected.length) {
        setError(rejected[0] ?? null);
      }

      setFiles(next);
    },
    [accept, files, maxFiles, maxSizeMb, multiple, setFiles],
  );

  const removeFile = useCallback(
    (id: string) => {
      const target = files.find((item) => item.id === id);
      if (target) revokePreview(target);
      setFiles(files.filter((item) => item.id !== id));
      setError(null);
    },
    [files, setFiles],
  );

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    addFiles(event.dataTransfer.files);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
    }
    event.target.value = "";
  };

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={`${inputId}-hint`}
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/20 px-6 py-8 text-center transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          isDragging && "border-ring bg-muted/40 ring-3 ring-ring/30",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <div className="bg-background flex size-10 items-center justify-center rounded-full border">
          <UploadIcon className="text-muted-foreground size-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <p id={`${inputId}-hint`} className="text-muted-foreground text-xs">
            {description}
            {multiple ? " · multiple files" : ""} · max {maxSizeMb} MB each
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Browse files
        </Button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={acceptAttr}
          multiple={multiple}
          disabled={disabled}
          onChange={onInputChange}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((item) => {
            const isPdf =
              item.file.type === "application/pdf" ||
              item.file.name.toLowerCase().endsWith(".pdf");
            const isImage = item.file.type.startsWith("image/");

            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
              >
                <div className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
                  {isImage && item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="size-full object-cover"
                    />
                  ) : isPdf ? (
                    <FileTextIcon className="text-muted-foreground size-4" />
                  ) : (
                    <FileIcon className="text-muted-foreground size-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    {isImage ? (
                      <ImageIcon className="size-3" />
                    ) : (
                      <FileTextIcon className="size-3" />
                    )}
                    {formatBytes(item.file.size)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${item.file.name}`}
                  disabled={disabled}
                  onClick={() => removeFile(item.id)}
                >
                  <XIcon />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
