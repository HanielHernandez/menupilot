"use client";

import { saveSiteAction } from "@/app/actions/saveSite";
import {
  MediaSelectorModal,
  type MediaSelectorItem,
} from "@/components/MediaSelectorModal";
import { ReplaceableImage } from "@/components/ReplaceableImage";
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
    setValue,
    formState: { isSubmitting, errors },
  } = useFormContext<SiteBuilderValues>();

  const [addMediaOpen, setAddMediaOpen] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "media",
    keyName: "fieldKey",
  });

  const mediaItems = useWatch({ control, name: "media" }) ?? [];

  const handleAddMedia = (items: MediaSelectorItem[]) => {
    for (const item of items) {
      const alreadyAdded = mediaItems.some((media) => media.id === item.id);
      if (alreadyAdded) continue;
      append({ id: item.id, url: item.url });
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
            description="Add or replace images from your media library. Blocks reference these by id."
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={() => setAddMediaOpen(true)}
                >
                  <PlusIcon className="size-4" />
                  Add images
                </Button>
              </div>

              {errors.media?.root?.message || errors.media?.message ? (
                <FieldError>
                  {errors.media.root?.message || errors.media.message}
                </FieldError>
              ) : null}

              {fields.length > 0 ? (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {fields.map((item, index) => (
                    <li
                      key={item.fieldKey}
                      className="flex flex-col gap-2 rounded-lg border border-border p-3"
                    >
                      <ReplaceableImage
                        src={mediaItems[index]?.url}
                        alt={`Media ${index + 1}`}
                        mediaId={mediaItems[index]?.id}
                        disabled={isSubmitting}
                        className="aspect-video size-auto w-full rounded-md"
                        modalTitle="Replace image"
                        modalDescription="Upload a new image or pick one from your library."
                        onReplace={(media) => {
                          setValue(`media.${index}.id`, media.id, {
                            shouldDirty: true,
                          });
                          setValue(`media.${index}.url`, media.url, {
                            shouldDirty: true,
                          });
                        }}
                      />
                      <p className="text-muted-foreground truncate text-xs">
                        id: {mediaItems[index]?.id}
                      </p>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="self-end"
                        disabled={isSubmitting}
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
                  No media yet. Click Add images to upload or pick from your
                  library.
                </p>
              )}
            </div>
          </FormSection>
        </CardContent>

        <CardFooter className="justify-end border-t">
          <Button type="submit" disabled={isSubmitting}>
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

      <MediaSelectorModal
        open={addMediaOpen}
        onOpenChange={setAddMediaOpen}
        multiple
        title="Add site media"
        description="Upload new images or pick existing ones from your library."
        onAccept={handleAddMedia}
      />
    </form>
  );
}
