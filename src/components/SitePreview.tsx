"use client";

import SiteTemplateRenderer from "@/components/blocks/SiteTemplateRenderer";
import {
  useSiteBuilder,
  type SiteBuilderValues,
} from "@/components/SiteBuilderProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_SITE_TEMPLATE } from "@/lib/site-template";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

type SitePreviewProps = {
  className?: string;
};

export default function SitePreview({ className }: SitePreviewProps) {
  const { control } = useFormContext<SiteBuilderValues>();
  const { restaurant } = useSiteBuilder();
  const settings = useWatch({ control, name: "settings" });
  const media = useWatch({ control, name: "media" });
  const blocks = useWatch({ control, name: "blocks" });

  const template = useMemo(
    () => ({
      settings: settings ?? DEFAULT_SITE_TEMPLATE.settings,
      media: media?.length ? media : DEFAULT_SITE_TEMPLATE.media,
      blocks: blocks?.length ? blocks : DEFAULT_SITE_TEMPLATE.blocks,
    }),
    [settings, media, blocks],
  );

  return (
    <Card className={cn("h-full min-h-0", className)}>
      <CardHeader className="shrink-0 border-b">
        <CardTitle>Preview</CardTitle>
        <CardDescription>Live site template</CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        <SiteTemplateRenderer
          blocks={template.blocks}
          media={template.media}
          settings={template.settings}
          restaurant={restaurant}
        />
      </CardContent>
    </Card>
  );
}
