"use client";

import { ShareSiteDialog } from "@/components/ShareSiteDialog";
import { Button } from "@/components/ui/button";
import { Share2Icon } from "lucide-react";
import { useState } from "react";

type ShareMenuButtonProps = {
  restaurantSlug: string;
  restaurantName: string;
};

export function ShareMenuButton({
  restaurantSlug,
  restaurantName,
}: ShareMenuButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Share2Icon className="size-4" />
        Share
      </Button>
      <ShareSiteDialog
        open={open}
        onOpenChange={setOpen}
        restaurantSlug={restaurantSlug}
        restaurantName={restaurantName}
      />
    </>
  );
}
