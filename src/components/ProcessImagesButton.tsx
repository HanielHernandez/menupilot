"use client";

import { processMenuImagesAction } from "@/app/actions/processMenuImages";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RecycleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProcessImagesButtonProps = {
  disabled?: boolean;
};

export default function ProcessImagesButton({
  disabled = false,
}: ProcessImagesButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (isProcessing || disabled) return;

    setIsProcessing(true);
    try {
      const result = await processMenuImagesAction();

      if (!result.success) {
        alert(result.error || "Failed to process images");
        return;
      }

      if (!result.processedCount) {
        alert("No uploaded images to process");
        return;
      }

      router.refresh();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || isProcessing}
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
