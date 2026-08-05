"use client";

import { processMenuImagesAction } from "@/app/actions/processMenuImages";
import { useMenuExtract } from "@/components/MenuExtractProvider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RecycleIcon } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";

type ProcessImagesButtonProps = {
  disabled?: boolean;
  restaurantId: string;
  imageIds: string[];
  onProcessingChange?: (isProcessing: boolean) => void;
};

export default function ProcessImagesButton({
  disabled = false,
  restaurantId,
  imageIds,
  onProcessingChange,
}: ProcessImagesButtonProps) {
  const router = useRouter();
  const { setExtractedMenu } = useMenuExtract();
  const [isProcessing, setIsProcessing] = useState(false);

  const setProcessing = (value: boolean) => {
    setIsProcessing(value);
    onProcessingChange?.(value);
  };

  const handleClick = async () => {
    if (isProcessing || disabled || !imageIds.length) return;

    setProcessing(true);
    try {
      const result = await processMenuImagesAction({
        restaurantId,
        imageIds,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to process images");
        return;
      }

      setExtractedMenu(result.menu);

      if (!result.processedCount) {
        toast.error(
          result.errors[0] ||
            "Images were found, but extraction did not complete successfully.",
        );
        router.refresh();
        return;
      }

      if (result.errors.length) {
        toast.warning(
          `Processed ${result.processedCount} image(s), with ${result.errors.length} error(s).`,
        );
      } else {
        toast.success(
          `Processed ${result.processedCount} image${
            result.processedCount === 1 ? "" : "s"
          } successfully.`,
        );
      }

      router.refresh();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || isProcessing || !imageIds.length}
      onClick={handleClick}
    >
      {isProcessing ? (
        <>
          <Spinner className="size-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <RecycleIcon className="size-4" />
          Process images
        </>
      )}
    </Button>
  );
}
