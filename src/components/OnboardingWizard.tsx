"use client";

import {
  createRestaurantAction,
  suggestUniqueSlugAction,
} from "@/app/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/slug";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || z.url().safeParse(value).success, {
    message: "Enter a valid URL",
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

const TOTAL_STEPS = 3;

const socialFields = [
  {
    name: "socials.instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourrestaurant",
  },
  {
    name: "socials.tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@yourrestaurant",
  },
  {
    name: "socials.facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourrestaurant",
  },
  {
    name: "socials.x",
    label: "X",
    placeholder: "https://x.com/yourrestaurant",
  },
  {
    name: "socials.youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@yourrestaurant",
  },
  {
    name: "socials.website",
    label: "Website",
    placeholder: "https://yourrestaurant.com",
  },
] as const;

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm<RestaurantFormSchema>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      address: "",
      email: "",
      phoneNumber: "",
      whatsappNumber: "",
      socials: {
        instagram: "",
        tiktok: "",
        facebook: "",
        x: "",
        youtube: "",
        website: "",
      },
    },
    mode: "onTouched",
  });

  const phoneNumber = useWatch({ control, name: "phoneNumber" });
  const restaurantName = useWatch({ control, name: "name" }) ?? "";
  const siteSlug = useWatch({ control, name: "slug" }) ?? "";

  useEffect(() => {
    const base = slugify(restaurantName);
    if (!base) {
      setValue("slug", "", { shouldValidate: false });
      setIsCheckingSlug(false);
      return;
    }

    let cancelled = false;
    setIsCheckingSlug(true);

    const timer = setTimeout(() => {
      void (async () => {
        const result = await suggestUniqueSlugAction(restaurantName);
        if (cancelled) return;

        if (result.success) {
          setValue("slug", result.slug, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
        setIsCheckingSlug(false);
      })();
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [restaurantName, setValue]);

  const goNext = async () => {
    const fieldsByStep = {
      1: ["name", "slug", "description"] as const,
      2: ["address", "email", "phoneNumber", "whatsappNumber"] as const,
      3: [
        "socials.instagram",
        "socials.tiktok",
        "socials.facebook",
        "socials.x",
        "socials.youtube",
        "socials.website",
      ] as const,
    };

    if (currentStep === 1 && (isCheckingSlug || !siteSlug)) {
      return;
    }

    const valid = await trigger([...fieldsByStep[currentStep as 1 | 2 | 3]]);
    if (!valid) return;

    setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const handleSameAsPhoneChange = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setValue("whatsappNumber", phoneNumber ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const submitForm = async (data: RestaurantFormSchema) => {
    setServerError(null);

    const result = await createRestaurantAction({
      ...data,
      whatsappNumber: sameAsPhone ? data.phoneNumber : data.whatsappNumber,
    });

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setCreatedSlug(result.slug);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex h-full w-full max-w-xl flex-col items-center justify-center">
        <div className="flex w-full flex-col items-center justify-center gap-5 p-4 text-center">
          <h2 className="text-2xl font-bold">Restaurant created</h2>
          <p className="text-muted-foreground text-sm">
            Your restaurant is ready. Head to the dashboard to keep building.
          </p>
          {createdSlug ? (
            <p className="text-muted-foreground text-sm">
              Public site path:{" "}
              <span className="font-medium text-foreground">
                /site/{createdSlug}
              </span>
            </p>
          ) : null}
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full max-w-xl flex-col items-center justify-center">
      <div className="flex w-full flex-col justify-center gap-5 p-4 text-left">
        <p>Welcome to our platform! Let&apos;s get you started.</p>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="flex flex-col gap-6"
        >
          {currentStep === 1 && (
            <div className="flex flex-col gap-4">
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      className="bg-white"
                      placeholder="Enter restaurant name"
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Field>
                <FieldLabel>Site slug</FieldLabel>
                <div className="bg-muted flex min-h-9 items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <span className="text-muted-foreground shrink-0">
                    /site/
                  </span>
                  {isCheckingSlug ? (
                    <span className="text-muted-foreground inline-flex items-center gap-2">
                      <Spinner />
                      Checking availability…
                    </span>
                  ) : (
                    <span className="font-medium break-all">
                      {siteSlug || "your-restaurant"}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Generated from your restaurant name. If that slug is taken,
                  we&apos;ll add a number to keep it unique.
                </p>
                {errors.slug?.message ? (
                  <FieldError>{errors.slug.message}</FieldError>
                ) : null}
              </Field>

              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      rows={6}
                      className="bg-white"
                      placeholder="Tell guests what makes your place special"
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col gap-4">
              <Controller
                control={control}
                name="address"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Address</FieldLabel>
                    <Textarea
                      rows={3}
                      className="bg-white"
                      placeholder="Street, city, and postal code"
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
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
                      className="bg-white"
                      placeholder="reservations@yourrestaurant.com"
                      {...field}
                    />
                    <p className="text-muted-foreground text-xs">
                      Table reservation requests from your site are sent here.
                    </p>
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
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
                      type="tel"
                      className="bg-white"
                      placeholder="+1 555 000 0000"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        if (sameAsPhone) {
                          setValue("whatsappNumber", event.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <div className="flex items-center gap-3">
                <Switch
                  id="same-as-phone"
                  checked={sameAsPhone}
                  onCheckedChange={handleSameAsPhoneChange}
                />
                <Label htmlFor="same-as-phone">
                  Use phone number for WhatsApp
                </Label>
              </div>

              <Controller
                control={control}
                name="whatsappNumber"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>WhatsApp number</FieldLabel>
                    <Input
                      type="tel"
                      className="bg-white"
                      placeholder="+1 555 000 0000"
                      disabled={sameAsPhone}
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-muted-foreground text-sm">
                Add your social links so guests can find you. You can skip any
                you don&apos;t use.
              </p>

              {socialFields.map((social) => (
                <Controller
                  key={social.name}
                  control={control}
                  name={social.name}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>{social.label}</FieldLabel>
                      <Input
                        type="url"
                        className="bg-white"
                        placeholder={social.placeholder}
                        {...field}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
              ))}
            </div>
          )}

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={goBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              Back
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                size="lg"
                onClick={goNext}
                disabled={
                  isSubmitting ||
                  (currentStep === 1 && (isCheckingSlug || !siteSlug))
                }
              >
                Next
              </Button>
            ) : (
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4 animate-spin" />
                    Creating restaurant...
                  </>
                ) : (
                  "Create restaurant"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
