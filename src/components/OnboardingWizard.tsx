"use client";

import { createRestaurantAction } from "@/app/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
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
  description: z.string().optional(),
  address: z.string().optional(),
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

  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { isSubmitting },
  } = useForm<RestaurantFormSchema>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
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

  const goNext = async () => {
    const fieldsByStep = {
      1: ["name", "description"] as const,
      2: ["address", "phoneNumber", "whatsappNumber"] as const,
      3: [
        "socials.instagram",
        "socials.tiktok",
        "socials.facebook",
        "socials.x",
        "socials.youtube",
        "socials.website",
      ] as const,
    };

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

    const result = await createRestaurantAction(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

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
          <Button size="lg" render={<Link href="/dashboard" />}>
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
                disabled={isSubmitting}
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
