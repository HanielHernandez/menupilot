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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { currencies, DEFAULT_CURRENCY } from "@/lib/currencies";
import type { SiteBlock } from "@/lib/site-template";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PanelsRightBottomIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
  type Path,
} from "react-hook-form";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

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
      <div className={cn("flex h-full shrink-0 items-start", className)}>
        <Button
          type="button"
          variant="outline"
          size="icon"
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
        "h-full min-h-0 w-full shrink-0 lg:w-[320px]",
        className,
      )}
    >
      <CardHeader className="shrink-0 flex-row items-start justify-between gap-2 space-y-0 border-b">
        <div className="flex flex-col gap-1">
          <CardTitle>Blocks</CardTitle>
          <CardDescription>
            Edit section content and menu display options.
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
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
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
                        <FieldLabel>Button label</FieldLabel>
                        <Input
                          value={String(field.value ?? "")}
                          onChange={field.onChange}
                        />
                      </Field>
                    )}
                  />
                ) : null}

                {block.type === "menu" ? (
                  <>
                    <Controller
                      control={control}
                      name={
                        `blocks.${index}.layout` as Path<SiteBuilderValues>
                      }
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>Display</FieldLabel>
                          <select
                            className={selectClassName}
                            value={
                              field.value === "tabs" ? "tabs" : "list"
                            }
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          >
                            <option value="list">Stacked lists</option>
                            <option value="tabs">Category tabs</option>
                          </select>
                        </Field>
                      )}
                    />
                    <Controller
                      control={control}
                      name={
                        `blocks.${index}.columns` as Path<SiteBuilderValues>
                      }
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>Columns</FieldLabel>
                          <select
                            className={selectClassName}
                            value={Number(field.value) === 2 ? 2 : 1}
                            onChange={(event) =>
                              field.onChange(Number(event.target.value))
                            }
                          >
                            <option value={1}>One column</option>
                            <option value={2}>Two columns</option>
                          </select>
                        </Field>
                      )}
                    />
                    <Controller
                      control={control}
                      name={
                        `blocks.${index}.boldItems` as Path<SiteBuilderValues>
                      }
                      render={({ field }) => (
                        <div className="flex items-center justify-between gap-3">
                          <Label htmlFor={`menu-bold-${index}`}>
                            Bold item names
                          </Label>
                          <Switch
                            id={`menu-bold-${index}`}
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      control={control}
                      name={
                        `blocks.${index}.coin` as Path<SiteBuilderValues>
                      }
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>Currency</FieldLabel>
                          <select
                            className={selectClassName}
                            value={
                              typeof field.value === "string" && field.value
                                ? field.value
                                : DEFAULT_CURRENCY
                            }
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          >
                            {currencies.map((currency) => (
                              <option
                                key={currency.value}
                                value={currency.value}
                              >
                                {currency.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                      )}
                    />
                  </>
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
