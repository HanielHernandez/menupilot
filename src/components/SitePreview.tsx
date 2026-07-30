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
    <Card className={className}>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>Live site template</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[80vh] overflow-y-auto">
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
