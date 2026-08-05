"use client";

import uploadMenuFile from "@/app/actions/uploadMenuFile";
import { Button } from "@/components/ui/button";
import { DropZone, type DropZoneFile } from "@/components/ui/drop-zone";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "nextjs-toploader/app";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

type ImageUploaderProps = {
  submitLabel?: string;
  disabled?: boolean;
};

export default function ImageUploader({
  submitLabel = "Upload",
  disabled = false,
}: ImageUploaderProps) {
  const router = useRouter();
  const [files, setFiles] = useState<DropZoneFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFiles = () => {
    files.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setFiles([]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files.length || isSubmitting || disabled) return;

    setIsSubmitting(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file.file);
    });

    try {
      const res = await uploadMenuFile(formData);

      if (!res.success) {
        toast.error(res.error || "Failed to upload files");
        return;
      }

      clearFiles();
      router.refresh();
      toast.success("Files uploaded successfully");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <DropZone
        files={files}
        onFilesChange={setFiles}
        disabled={disabled || isSubmitting}
      />

      <Button
        type="submit"
        size="lg"
        disabled={disabled || isSubmitting || files.length === 0}
      >
        {isSubmitting ? (
          <>
            <Spinner className="size-4 animate-spin" />
            Uploading...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
