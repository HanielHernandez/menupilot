"use client";

import { publishSiteAction } from "@/app/actions/publishSite";
import { saveSiteAction } from "@/app/actions/saveSite";
import type { SitePublishStatus } from "@/app/repositories/site.repo";
import SiteBlockEditor from "@/components/SiteBlockEditor";
import {
  SiteBuilderProvider,
  useSiteBuilder,
  type SiteBuilderRestaurant,
  type SiteBuilderValues,
} from "@/components/SiteBuilderProvider";
import SiteForm from "@/components/SiteForm";
import SitePreview from "@/components/SitePreview";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { SiteTemplate } from "@/lib/site-template";
import { cn } from "@/lib/utils";
import { GlobeIcon, SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

type SiteBuilderProps = {
  restaurant: SiteBuilderRestaurant;
  initialValues?: Partial<SiteTemplate> & { templateId?: string };
  initialStatus: SitePublishStatus;
};

function StatusBadge({ status }: { status: SitePublishStatus }) {
  const isPublished = status.status === "published";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
          isPublished
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-900",
        )}
      >
        {status.status}
      </span>
      {isPublished && status.hasUnpublishedChanges ? (
        <span className="text-muted-foreground text-xs">
          Unpublished changes
        </span>
      ) : null}
    </div>
  );
}

function SiteToolbar({
  status,
  onStatusChange,
}: {
  status: SitePublishStatus;
  onStatusChange: (status: SitePublishStatus) => void;
}) {
  const { restaurantId } = useSiteBuilder();
  const { handleSubmit } = useFormContext<SiteBuilderValues>();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const isBusy = isSaving || isPublishing;

  const onSave = handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      const result = await saveSiteAction({
        restaurantId,
        templateId: values.templateId,
        settings: values.settings,
        media: values.media,
        blocks: values.blocks,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onStatusChange(result.status);
      toast.success("Draft saved");
    } finally {
      setIsSaving(false);
    }
  });

  const onPublish = handleSubmit(async (values) => {
    setIsPublishing(true);
    try {
      const result = await publishSiteAction({
        restaurantId,
        templateId: values.templateId,
        settings: values.settings,
        media: values.media,
        blocks: values.blocks,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onStatusChange(result.status);
      toast.success("Site published");
    } finally {
      setIsPublishing(false);
    }
  });

  return (
    <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Site</h2>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          aria-busy={isSaving}
          onClick={() => void onSave()}
        >
          {isSaving ? (
            <>
              <Spinner />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="size-4" />
              Save draft
            </>
          )}
        </Button>
        <Button
          type="button"
          disabled={isBusy}
          aria-busy={isPublishing}
          onClick={() => void onPublish()}
        >
          {isPublishing ? (
            <>
              <Spinner />
              Publishing...
            </>
          ) : (
            <>
              <GlobeIcon className="size-4" />
              Publish
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function SiteBuilder({
  restaurant,
  initialValues,
  initialStatus,
}: SiteBuilderProps) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  return (
    <SiteBuilderProvider restaurant={restaurant} initialValues={initialValues}>
      <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden">
        <SiteToolbar status={status} onStatusChange={setStatus} />

        <p className="text-muted-foreground shrink-0 text-sm">
          Customize colors, typography, and media for {restaurant.name}. Save a
          draft anytime; publish when you want it live.
        </p>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row lg:items-stretch">
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden lg:w-[350px] lg:flex-none">
            <SiteForm onStatusChange={setStatus} className="h-full" />
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <SitePreview className="h-full" />
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden lg:w-auto lg:flex-none">
            <SiteBlockEditor className="h-full" />
          </div>
        </div>
      </div>
    </SiteBuilderProvider>
  );
}
