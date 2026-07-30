"use client";

import type { SiteBuilderValues } from "@/components/SiteBuilderProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SiteBlock } from "@/lib/site-template";
import { ChevronLeftIcon, ChevronRightIcon, PanelsRightBottomIcon } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
  type Path,
} from "react-hook-form";

function blockHasTitle(
  block: SiteBlock,
): block is SiteBlock & { title: string } {
  return "title" in block && typeof block.title === "string";
}

function blockHasDescription(
  block: SiteBlock,
): block is SiteBlock & { description: string } {
  return "description" in block && typeof block.description === "string";
}

type SiteBlockEditorProps = {
  className?: string;
};

export default function SiteBlockEditor({ className }: SiteBlockEditorProps) {
  const [open, setOpen] = useState(true);
  const { control } = useFormContext<SiteBuilderValues>();

  const { fields } = useFieldArray({
    control,
    name: "blocks",
    keyName: "fieldKey",
  });

  const blocks = useWatch({ control, name: "blocks" }) ?? [];

  if (!open) {
    return (
      <div className={cn("shrink-0", className)}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:sticky lg:top-6"
          aria-label="Open block editor"
          onClick={() => setOpen(true)}
        >
          <PanelsRightBottomIcon className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "w-full shrink-0 lg:sticky lg:top-6 lg:w-[320px]",
        className,
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle>Blocks</CardTitle>
          <CardDescription>
            Edit section titles and descriptions.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Collapse block editor"
          onClick={() => setOpen(false)}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="max-h-[80vh] overflow-y-auto">
        <ul className="flex flex-col gap-4">
          {fields.map((item, index) => {
            const block = blocks[index] as SiteBlock | undefined;
            if (!block) return null;

            return (
              <li
                key={item.fieldKey}
                className="flex flex-col gap-3 rounded-lg border border-border p-3"
              >
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {block.type}
                </p>

                {blockHasTitle(block) ? (
                  <Controller
                    control={control}
                    name={`blocks.${index}.title` as Path<SiteBuilderValues>}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Title</FieldLabel>
                        <Input
                          value={String(field.value ?? "")}
                          onChange={field.onChange}
                        />
                      </Field>
                    )}
                  />
                ) : null}

                {blockHasDescription(block) ? (
                  <Controller
                    control={control}
                    name={
                      `blocks.${index}.description` as Path<SiteBuilderValues>
                    }
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Description</FieldLabel>
                        <Textarea
                          value={String(field.value ?? "")}
                          onChange={field.onChange}
                          rows={3}
                        />
                      </Field>
                    )}
                  />
                ) : null}

                {block.type === "footer" ? (
                  <Controller
                    control={control}
                    name={`blocks.${index}.tagline` as Path<SiteBuilderValues>}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Tagline</FieldLabel>
                        <Input
                          value={String(field.value ?? "")}
                          onChange={field.onChange}
                        />
                      </Field>
                    )}
                  />
                ) : null}

                {block.type === "inviteForm" ? (
                  <Controller
                    control={control}
                    name={
                      `blocks.${index}.submitLabel` as Path<SiteBuilderValues>
                    }
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Submit label</FieldLabel>
                        <Input
                          value={String(field.value ?? "")}
                          onChange={field.onChange}
                        />
                      </Field>
                    )}
                  />
                ) : null}

                {block.type === "hero" ? (
                  <Controller
                    control={control}
                    name={
                      `blocks.${index}.ctaLabel` as Path<SiteBuilderValues>
                    }
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>CTA label</FieldLabel>
                        <Input
                          value={String(field.value ?? "")}
                          onChange={field.onChange}
                        />
                      </Field>
                    )}
                  />
                ) : null}

                {block.type === "navbar" ? (
                  <p className="text-muted-foreground text-sm">
                    Navigation links are fixed in this template.
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>

        <Button
          type="button"
          variant="secondary"
          className="mt-4 w-full lg:hidden"
          onClick={() => setOpen(false)}
        >
          <ChevronLeftIcon className="size-4" />
          Collapse
        </Button>
      </CardContent>
    </Card>
  );
}
