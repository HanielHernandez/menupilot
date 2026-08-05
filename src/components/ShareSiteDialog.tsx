"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type ShareSiteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantSlug: string;
  restaurantName: string;
};

export function ShareSiteDialog({
  open,
  onOpenChange,
  restaurantSlug,
  restaurantName,
}: ShareSiteDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [menuUrl, setMenuUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setMenuUrl(`${window.location.origin}/site/${restaurantSlug}#menu`);
    setCopied(false);
  }, [open, restaurantSlug]);

  const fileName = useMemo(() => {
    const safe = restaurantSlug.replace(/[^a-z0-9-]/gi, "-") || "menu";
    return `${safe}-menu-qr.png`;
  }, [restaurantSlug]);

  const handleCopy = async () => {
    if (!menuUrl) return;
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("QR code is not ready yet");
      return;
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = fileName;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share menu</DialogTitle>
          <DialogDescription>
            QR code and link for {restaurantName}&apos;s menu section.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <div className="rounded-xl border bg-white p-4">
            {menuUrl ? (
              <QRCodeCanvas
                ref={canvasRef}
                value={menuUrl}
                size={200}
                level="M"
                marginSize={1}
                title={`QR code for ${restaurantName} menu`}
              />
            ) : (
              <div className="size-50 animate-pulse rounded-md bg-muted" />
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDownload}
            disabled={!menuUrl}
          >
            <DownloadIcon className="size-4" />
            Download QR code
          </Button>

          <div className="flex w-full gap-2">
            <Input
              readOnly
              value={menuUrl}
              aria-label="Menu page URL"
              className="font-mono text-xs"
              onFocus={(event) => event.currentTarget.select()}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={copied ? "Copied" : "Copy link"}
              onClick={() => void handleCopy()}
              disabled={!menuUrl}
            >
              {copied ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
