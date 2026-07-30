"use client";

import { saveSiteAction } from "@/app/actions/saveSite";
import { uploadSiteMediaAction } from "@/app/actions/uploadSiteMedia";
import type { SiteBuilderValues } from "@/components/SiteBuilderProvider";
import { useSiteBuilder } from "@/components/SiteBuilderProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DropZone, type DropZoneFile } from "@/components/ui/drop-zone";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { PlusIcon, SaveIcon, Trash2Icon } from "lucide-react";
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

const FONT_OPTIONS = [
  "Plus Jakarta Sans",
  "Inter",
  "DM Sans",
  "Geist",
  "Playfair Display",
  "Georgia",
  "system-ui",
] as const;

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

export default function SiteForm() {
  const { restaurantId } = useSiteBuilder();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useFormContext<SiteBuilderValues>();

  const [mediaUrlDraft, setMediaUrlDraft] = useState("");
  const [pendingUploads, setPendingUploads] = useState<DropZoneFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "media",
    keyName: "fieldKey",
  });

  const mediaItems = useWatch({ control, name: "media" }) ?? [];

  const clearPendingUploads = () => {
    pendingUploads.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setPendingUploads([]);
  };

  const addMediaUrl = () => {
    const url = mediaUrlDraft.trim();
    if (!url) return;
    append({ id: `media-${crypto.randomUUID()}`, url });
    setMediaUrlDraft("");
  };

  const handleMediaUpload = async () => {
    if (pendingUploads.length === 0 || isUploading) return;

    setIsUploading(true);
    try {
      for (const item of pendingUploads) {
        const formData = new FormData();
        formData.append("file", item.file);
        const result = await uploadSiteMediaAction(formData);
        if (!result.success) {
          toast.error(result.error || "Failed to upload image");
          continue;
        }
        append({ id: `media-${crypto.randomUUID()}`, url: result.url });
      }
      clearPendingUploads();
      toast.success("Images uploaded");
    } finally {
      setIsUploading(false);
    }
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

    toast.success("Site settings saved");
  });

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Site settings</CardTitle>
          <CardDescription>
            Edit template settings, media, and block content.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
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
            description="Choose the font family for your site."
          >
            <Controller
              control={control}
              name="settings.fontFamily"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Font family</FieldLabel>
                  <Input
                    list="site-font-options"
                    placeholder="Plus Jakarta Sans"
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={Boolean(fieldState.error)}
                    style={{ fontFamily: field.value }}
                  />
                  <datalist id="site-font-options">
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font} />
                    ))}
                  </datalist>
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
            description="Upload images or paste image URLs used by blocks."
          >
            <div className="flex flex-col gap-4">
              <DropZone
                files={pendingUploads}
                onFilesChange={setPendingUploads}
                multiple
                maxFiles={8}
                accept={[
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "image/gif",
                ]}
                acceptAttr="image/jpeg,image/png,image/webp,image/gif"
                disabled={isUploading}
                label={isUploading ? "Uploading…" : "Drop site images"}
                description="JPEG, PNG, WebP, or GIF"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={isUploading || pendingUploads.length === 0}
                onClick={() => void handleMediaUpload()}
              >
                {isUploading ? (
                  <>
                    <Spinner />
                    Uploading…
                  </>
                ) : (
                  "Upload selected"
                )}
              </Button>

              <div className="flex items-end gap-2">
                <Field className="flex-1">
                  <FieldLabel>Image URL</FieldLabel>
                  <Input
                    value={mediaUrlDraft}
                    onChange={(event) => setMediaUrlDraft(event.target.value)}
                    placeholder="https://…"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addMediaUrl();
                      }
                    }}
                  />
                </Field>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addMediaUrl}
                  disabled={!mediaUrlDraft.trim()}
                >
                  <PlusIcon className="size-4" />
                  Add
                </Button>
              </div>

              {errors.media?.root?.message || errors.media?.message ? (
                <FieldError>
                  {errors.media.root?.message || errors.media.message}
                </FieldError>
              ) : null}

              {fields.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {fields.map((item, index) => (
                    <li
                      key={item.fieldKey}
                      className="flex flex-col gap-2 rounded-lg border border-border p-3"
                    >
                      <div className="bg-muted aspect-video overflow-hidden rounded-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mediaItems[index]?.url}
                          alt=""
                          className="size-full object-cover"
                        />
                      </div>
                      <p className="text-muted-foreground text-xs">
                        id: {mediaItems[index]?.id}
                      </p>
                      <Controller
                        control={control}
                        name={`media.${index}.url`}
                        render={({ field, fieldState }) => (
                          <Field>
                            <Input
                              value={field.value}
                              onChange={field.onChange}
                              aria-invalid={Boolean(fieldState.error)}
                            />
                            {fieldState.error ? (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            ) : null}
                          </Field>
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="self-end"
                        onClick={() => remove(index)}
                      >
                        <Trash2Icon className="size-4" />
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No media yet. Upload files or add a URL.
                </p>
              )}
            </div>
          </FormSection>
        </CardContent>

        <CardFooter className="justify-end border-t">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <>
                <Spinner />
                Saving…
              </>
            ) : (
              <>
                <SaveIcon className="size-4" />
                Save site
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
