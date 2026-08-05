"use client";

import { saveSiteAction } from "@/app/actions/saveSite";
import type { SitePublishStatus } from "@/app/repositories/site.repo";
import { MediaPreviewDialog } from "@/components/MediaPreviewDialog";
import {
  MediaSelectorModal,
  type MediaSelectorItem,
} from "@/components/MediaSelectorModal";
import type { SiteBuilderValues } from "@/components/SiteBuilderProvider";
import { useSiteBuilder } from "@/components/SiteBuilderProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  CORNER_RADIUS_OPTIONS,
  FONT_OPTIONS,
  TYPOGRAPHY_PRESETS,
  findTypographyPreset,
} from "@/lib/site-template";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";

const COLOR_FIELDS = [
  { name: "primary", label: "Primary" },
  { name: "secondary", label: "Secondary" },
  { name: "accent", label: "Accent" },
  { name: "background", label: "Background" },
  { name: "foreground", label: "Foreground" },
] as const;

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80";

function ColorField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} color picker`}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#000000"
          aria-invalid={Boolean(error)}
        />
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold leading-none">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function SiteForm({
  onStatusChange,
  className,
}: {
  onStatusChange?: (status: SitePublishStatus) => void;
  className?: string;
}) {
  const { restaurantId } = useSiteBuilder();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useFormContext<SiteBuilderValues>();

  const [editMediaIndex, setEditMediaIndex] = useState<number | null>(null);
  const [previewMediaIndex, setPreviewMediaIndex] = useState<number | null>(
    null,
  );

  const { fields, remove } = useFieldArray({
    control,
    name: "media",
    keyName: "fieldKey",
  });

  const mediaItems = useWatch({ control, name: "media" }) ?? [];
  const useHeaderAsBody = Boolean(
    useWatch({ control, name: "settings.fonts.useHeaderAsBody" }),
  );
  const headerFont = useWatch({ control, name: "settings.fonts.header" }) ?? "";
  const bodyFont = useWatch({ control, name: "settings.fonts.body" }) ?? "";
  const activePreset = findTypographyPreset(
    headerFont,
    bodyFont,
    useHeaderAsBody,
  );

  const applyTypographyPreset = (presetId: string) => {
    const preset = TYPOGRAPHY_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setValue("settings.fonts.header", preset.header, { shouldDirty: true });
    setValue("settings.fonts.body", preset.body, { shouldDirty: true });
    setValue("settings.fonts.useHeaderAsBody", false, { shouldDirty: true });
  };

  const handleReplaceMedia = (items: MediaSelectorItem[]) => {
    const media = items[0];
    if (editMediaIndex == null || !media) return;
    setValue(`media.${editMediaIndex}.id`, media.id, { shouldDirty: true });
    setValue(`media.${editMediaIndex}.url`, media.url, { shouldDirty: true });
    setEditMediaIndex(null);
  };

  const onSubmit = handleSubmit(async (values) => {
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

    onStatusChange?.(result.status);
    toast.success("Draft saved");
  });

  return (
    <form
      id="site-form"
      onSubmit={onSubmit}
      className={cn("flex h-full min-h-0 flex-col", className)}
    >
      <Card className="h-full min-h-0">
        <CardHeader className="shrink-0 border-b">
          <CardTitle>Site settings</CardTitle>
          <CardDescription>
            Edit template settings, media, and block content.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
          <FormSection
            title="Colors"
            description="Theme colors used across your public site."
          >
            <div className="flex flex-col gap-4">
              {COLOR_FIELDS.map((field) => (
                <Controller
                  key={field.name}
                  control={control}
                  name={`settings.colors.${field.name}`}
                  render={({ field: formField, fieldState }) => (
                    <ColorField
                      label={field.label}
                      value={formField.value}
                      onChange={formField.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              ))}
            </div>
          </FormSection>

          <Separator />

          <FormSection
            title="Typography"
            description="Pick a preset pairing, or customize header and body fonts."
          >
            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel>Font combination</FieldLabel>
                <select
                  className={selectClassName}
                  value={activePreset?.id ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) return;
                    applyTypographyPreset(value);
                  }}
                >
                  <option value="" disabled>
                    Custom combination
                  </option>
                  {TYPOGRAPHY_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label} — {preset.header} / {preset.body}
                    </option>
                  ))}
                </select>
                {activePreset ? (
                  <p className="text-muted-foreground text-xs">
                    {activePreset.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    Choose a preset, or set header and body fonts below.
                  </p>
                )}
              </Field>

              <Controller
                control={control}
                name="settings.fonts.header"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Header font</FieldLabel>
                    <select
                      className={selectClassName}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={Boolean(fieldState.error)}
                      style={{ fontFamily: field.value }}
                    >
                      {!FONT_OPTIONS.includes(field.value) && field.value ? (
                        <option value={field.value}>{field.value}</option>
                      ) : null}
                      {FONT_OPTIONS.map((font) => (
                        <option
                          key={font}
                          value={font}
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </option>
                      ))}
                    </select>
                    {fieldState.error ? (
                      <FieldError>{fieldState.error.message}</FieldError>
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="settings.fonts.useHeaderAsBody"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked && headerFont) {
                          setValue("settings.fonts.body", headerFont, {
                            shouldDirty: true,
                          });
                        }
                      }}
                    />
                    <Label>Use header font for body text</Label>
                  </div>
                )}
              />

              <Controller
                control={control}
                name="settings.fonts.body"
                render={({ field, fieldState }) => {
                  const displayValue = useHeaderAsBody
                    ? headerFont
                    : field.value;

                  return (
                    <Field>
                      <FieldLabel>Body font</FieldLabel>
                      <select
                        className={selectClassName}
                        value={displayValue}
                        onChange={field.onChange}
                        disabled={useHeaderAsBody}
                        aria-invalid={Boolean(fieldState.error)}
                        style={{ fontFamily: displayValue }}
                      >
                        {!FONT_OPTIONS.includes(displayValue) &&
                        displayValue ? (
                          <option value={displayValue}>{displayValue}</option>
                        ) : null}
                        {FONT_OPTIONS.map((font) => (
                          <option
                            key={font}
                            value={font}
                            style={{ fontFamily: font }}
                          >
                            {font}
                          </option>
                        ))}
                      </select>
                      {fieldState.error ? (
                        <FieldError>{fieldState.error.message}</FieldError>
                      ) : null}
                    </Field>
                  );
                }}
              />
            </div>
          </FormSection>

          <Separator />

          <FormSection
            title="Corner radius"
            description="Round buttons and sections across your public site."
          >
            <Controller
              control={control}
              name="settings.cornerRadius"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Corner radius</FieldLabel>
                  <select
                    className={selectClassName}
                    value={field.value ?? "medium"}
                    onChange={field.onChange}
                    aria-invalid={Boolean(fieldState.error)}
                  >
                    {CORNER_RADIUS_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
          </FormSection>

          <Separator />

          <FormSection
            title="Media"
            description="Click an image to preview. Use the menu to edit or remove."
          >
            <div className="flex flex-col gap-4">
              {errors.media?.root?.message || errors.media?.message ? (
                <FieldError>
                  {errors.media.root?.message || errors.media.message}
                </FieldError>
              ) : null}

              {fields.length > 0 ? (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {fields.map((item, index) => {
                    const media = mediaItems[index];
                    const imageUrl = media?.url?.trim();

                    return (
                      <li
                        key={item.fieldKey}
                        className="bg-muted relative aspect-4/3 overflow-hidden rounded-xl border"
                      >
                        {imageUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewMediaIndex(index)}
                            className="size-full cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                            aria-label={`Preview media ${index + 1}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt={`Media ${index + 1}`}
                              className="size-full object-cover"
                            />
                          </button>
                        ) : (
                          <div className="text-muted-foreground flex size-full items-center justify-center">
                            <ImageIcon className="size-10 opacity-50" />
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-black/70 to-transparent p-3 pt-10">
                          <p className="truncate text-xs text-white">
                            {media?.id || "No image selected"}
                          </p>

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="secondary"
                                  className="pointer-events-auto shrink-0 bg-white/90 text-foreground hover:bg-white"
                                  disabled={isSubmitting}
                                  aria-label={`Media ${index + 1} options`}
                                />
                              }
                            >
                              <MoreVerticalIcon />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="top">
                              <DropdownMenuItem
                                onClick={() => setEditMediaIndex(index)}
                              >
                                <PencilIcon />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => remove(index)}
                              >
                                <Trash2Icon />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No media slots yet. Default template media will appear here.
                </p>
              )}
            </div>
          </FormSection>
        </CardContent>
      </Card>

      <MediaPreviewDialog
        open={previewMediaIndex !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewMediaIndex(null);
        }}
        title="Media preview"
        description="Selected site media"
        item={
          previewMediaIndex != null && mediaItems[previewMediaIndex]?.url
            ? {
                url: mediaItems[previewMediaIndex].url,
                id: mediaItems[previewMediaIndex].id,
              }
            : null
        }
      />

      <MediaSelectorModal
        open={editMediaIndex !== null}
        onOpenChange={(open) => {
          if (!open) setEditMediaIndex(null);
        }}
        multiple={false}
        title="Select image"
        description="Upload a new image or pick one from your library."
        initialSelectedIds={
          editMediaIndex != null && mediaItems[editMediaIndex]?.id
            ? [mediaItems[editMediaIndex].id]
            : []
        }
        onAccept={handleReplaceMedia}
      />
    </form>
  );
}
