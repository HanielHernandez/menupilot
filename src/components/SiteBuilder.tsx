"use client";

import {
  SiteBuilderProvider,
  type SiteBuilderRestaurant,
} from "@/components/SiteBuilderProvider";
import SiteBlockEditor from "@/components/SiteBlockEditor";
import SiteForm from "@/components/SiteForm";
import SitePreview from "@/components/SitePreview";
import type { SiteTemplate } from "@/lib/site-template";

type SiteBuilderProps = {
  restaurant: SiteBuilderRestaurant;
  initialValues?: Partial<SiteTemplate> & { templateId?: string };
};

export default function SiteBuilder({
  restaurant,
  initialValues,
}: SiteBuilderProps) {
  return (
    <SiteBuilderProvider restaurant={restaurant} initialValues={initialValues}>
      <div className="flex h-full flex-col gap-6 lg:flex-row lg:items-start">
        <div className="w-full shrink-0 lg:w-[350px]">
          <SiteForm />
        </div>
        <SitePreview className="min-w-0 w-full flex-1 lg:sticky lg:top-6" />
        <SiteBlockEditor />
      </div>
    </SiteBuilderProvider>
  );
}
