"use client";

import { updateRestaurantAction } from "@/app/actions/restaurant";
import { ReplaceableImage } from "@/components/ReplaceableImage";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  isValidTimeHHmm,
  normalizeTimeHHmm,
} from "@/lib/restaurant-schedule";
import { slugify } from "@/lib/slug";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState, type ReactNode } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || z.url().safeParse(value).success, {
    message: "Enter a valid URL",
  });

const optionalMediaId = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^[a-f\d]{24}$/i.test(value), {
    message: "Enter a valid media id",
  });

const scheduleEntrySchema = z
  .object({
    day: z.string().trim().min(1, { message: "Day is required" }),
    openTime: z.string().trim().optional(),
    closeTime: z.string().trim().optional(),
    isClosed: z.boolean().optional(),
  })
  .superRefine((entry, ctx) => {
    if (entry.isClosed) return;
    if (!isValidTimeHHmm(entry.openTime)) {
      ctx.addIssue({
        code: "custom",
        path: ["openTime"],
        message: "Open time is required",
      });
    }
    if (!isValidTimeHHmm(entry.closeTime)) {
      ctx.addIssue({
        code: "custom",
        path: ["closeTime"],
        message: "Close time is required",
      });
    }
  });

const restaurantSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  slug: z
    .string()
    .trim()
    .min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  logoMediaId: optionalMediaId,
  address: z.string().optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.email().safeParse(value).success, {
      message: "Enter a valid email address",
    }),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  schedule: z.array(scheduleEntrySchema),
  socials: z.object({
    instagram: optionalUrl,
    tiktok: optionalUrl,
    facebook: optionalUrl,
    x: optionalUrl,
    youtube: optionalUrl,
    website: optionalUrl,
  }),
});

type RestaurantFormSchema = z.infer<typeof restaurantSchema>;

export type RestaurantEditFormValues = {
  name: string;
  slug: string;
  description: string;
  logoMediaId: string;
  logoUrl?: string;
  address: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  schedule: Array<{
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
  socials: {
    instagram: string;
    tiktok: string;
    facebook: string;
    x: string;
    youtube: string;
    website: string;
  };
};

const socialFields = [
  {
    name: "socials.instagram" as const,
    label: "Instagram",
    placeholder: "https://instagram.com/yourrestaurant",
  },
  {
    name: "socials.tiktok" as const,
    label: "TikTok",
    placeholder: "https://tiktok.com/@yourrestaurant",
  },
  {
    name: "socials.facebook" as const,
    label: "Facebook",
    placeholder: "https://facebook.com/yourrestaurant",
  },
  {
    name: "socials.x" as const,
    label: "X",
    placeholder: "https://x.com/yourrestaurant",
  },
  {
    name: "socials.youtube" as const,
    label: "YouTube",
    placeholder: "https://youtube.com/@yourrestaurant",
  },
  {
    name: "socials.website" as const,
    label: "Website",
    placeholder: "https://yourrestaurant.com",
  },
];

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

type RestaurantEditFormProps = {
  initialValues: RestaurantEditFormValues;
};

export default function RestaurantEditForm({
  initialValues,
}: RestaurantEditFormProps) {
  const router = useRouter();
  const [sameAsPhone, setSameAsPhone] = useState(
    Boolean(
      initialValues.phoneNumber &&
        initialValues.phoneNumber === initialValues.whatsappNumber,
    ),
  );
  const [logoUrl, setLogoUrl] = useState(initialValues.logoUrl ?? "");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<RestaurantFormSchema>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      ...initialValues,
      schedule: initialValues.schedule ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedule",
  });

  const phoneNumber = useWatch({ control, name: "phoneNumber" });
  const logoMediaId = useWatch({ control, name: "logoMediaId" });
  const restaurantName = useWatch({ control, name: "name" }) ?? "Restaurant";
  const scheduleValues = useWatch({ control, name: "schedule" }) ?? [];

  const logoPreview =
    logoUrl.trim() ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurantName)}&size=256&background=random`;

  const onSubmit = handleSubmit(
    async (values) => {
      const result = await updateRestaurantAction({
        ...values,
        whatsappNumber: sameAsPhone
          ? values.phoneNumber
          : values.whatsappNumber,
        schedule: (values.schedule ?? []).map((entry) => {
          const isClosed = Boolean(entry.isClosed);
          return {
            day: entry.day.trim(),
            isClosed,
            openTime: isClosed ? "" : normalizeTimeHHmm(entry.openTime),
            closeTime: isClosed ? "" : normalizeTimeHHmm(entry.closeTime),
          };
        }),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Restaurant updated");
      router.refresh();
    },
    () => {
      toast.error("Please fix the highlighted fields before saving.");
    },
  );

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>My restaurant</CardTitle>
          <CardDescription>
            Update your restaurant profile, contact details, and social links.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <FormSection
            title="Logo"
            description="Click the logo to upload or pick an image. It appears on your dashboard and public site."
          >
            <div className="flex justify-center">
              <ReplaceableImage
                src={logoPreview}
                alt={restaurantName}
                mediaId={logoMediaId || null}
                disabled={isSubmitting}
                modalTitle="Select logo"
                modalDescription="Upload a square logo or choose one from your media library."
                onReplace={(media) => {
                  setValue("logoMediaId", media.id, { shouldDirty: true });
                  setLogoUrl(media.url);
                }}
              />
            </div>
          </FormSection>

          <Separator />

          <FormSection
            title="Basics"
            description="Name and description used across your dashboard and site."
          >
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      field.onChange(event);
                      setValue("slug", slugify(event.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="slug"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Slug</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      field.onChange(slugify(event.target.value));
                    }}
                    placeholder="my-restaurant"
                  />
                  <p className="text-muted-foreground text-xs">
                    Used in your public URL: /site/{field.value || "your-slug"}
                  </p>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea {...field} value={field.value ?? ""} rows={4} />
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
          </FormSection>

          <Separator />

          <FormSection
            title="Contact"
            description="Address, email, and phone numbers used on your public site and table requests."
          >
            <Controller
              control={control}
              name="address"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Address</FieldLabel>
                  <Textarea {...field} value={field.value ?? ""} rows={2} />
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    {...field}
                    value={field.value ?? ""}
                    placeholder="reservations@yourrestaurant.com"
                  />
                  <p className="text-muted-foreground text-xs">
                    Table reservation requests from your site are sent here.
                  </p>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Phone number</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      field.onChange(event);
                      if (sameAsPhone) {
                        setValue("whatsappNumber", event.target.value);
                      }
                    }}
                  />
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={sameAsPhone}
                onCheckedChange={(checked) => {
                  setSameAsPhone(checked);
                  if (checked) {
                    setValue("whatsappNumber", phoneNumber ?? "");
                  }
                }}
              />
              <Label>Use phone number for WhatsApp</Label>
            </div>
            <Controller
              control={control}
              name="whatsappNumber"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>WhatsApp number</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={sameAsPhone}
                  />
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
          </FormSection>

          <Separator />

          <FormSection
            title="Hours"
            description="Opening hours shown on your public location section. Use day ranges like Mon - Fri."
          >
            {fields.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hours yet. Add rows for weekdays, weekends, or closed days.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {fields.map((field, index) => {
                  const isClosed = Boolean(scheduleValues[index]?.isClosed);
                  return (
                    <li
                      key={field.id}
                      className="flex flex-col gap-3 rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Controller
                          control={control}
                          name={`schedule.${index}.day`}
                          render={({ field: dayField, fieldState }) => (
                            <Field className="min-w-0 flex-1">
                              <FieldLabel>Day</FieldLabel>
                              <Input
                                {...dayField}
                                value={dayField.value ?? ""}
                                placeholder="Mon - Fri"
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
                          variant="ghost"
                          size="icon-sm"
                          className="mt-6"
                          aria-label={`Remove schedule row ${index + 1}`}
                          onClick={() => remove(index)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>

                      <Controller
                        control={control}
                        name={`schedule.${index}.isClosed`}
                        render={({ field: closedField }) => (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={Boolean(closedField.value)}
                              onCheckedChange={(checked) => {
                                closedField.onChange(checked);
                                if (checked) {
                                  setValue(`schedule.${index}.openTime`, "");
                                  setValue(`schedule.${index}.closeTime`, "");
                                }
                              }}
                            />
                            <Label>Closed</Label>
                          </div>
                        )}
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Controller
                          control={control}
                          name={`schedule.${index}.openTime`}
                          render={({ field: openField, fieldState }) => (
                            <Field>
                              <FieldLabel>Open</FieldLabel>
                              <Input
                                type="time"
                                {...openField}
                                value={openField.value ?? ""}
                                disabled={isClosed}
                              />
                              {fieldState.error ? (
                                <FieldError>
                                  {fieldState.error.message}
                                </FieldError>
                              ) : null}
                            </Field>
                          )}
                        />
                        <Controller
                          control={control}
                          name={`schedule.${index}.closeTime`}
                          render={({ field: closeField, fieldState }) => (
                            <Field>
                              <FieldLabel>Close</FieldLabel>
                              <Input
                                type="time"
                                {...closeField}
                                value={closeField.value ?? ""}
                                disabled={isClosed}
                              />
                              {fieldState.error ? (
                                <FieldError>
                                  {fieldState.error.message}
                                </FieldError>
                              ) : null}
                            </Field>
                          )}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  day: "",
                  openTime: "09:00",
                  closeTime: "17:00",
                  isClosed: false,
                })
              }
            >
              <PlusIcon className="size-4" />
              Add hours
            </Button>
          </FormSection>

          <Separator />

          <FormSection
            title="Socials"
            description="Links shown in your site header and footer."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {socialFields.map((social) => (
                <Controller
                  key={social.name}
                  control={control}
                  name={social.name}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>{social.label}</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder={social.placeholder}
                      />
                      {fieldState.error ? (
                        <FieldError>{fieldState.error.message}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />
              ))}
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
                Save changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
