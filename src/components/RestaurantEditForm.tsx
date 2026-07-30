"use client";

import { updateRestaurantAction } from "@/app/actions/restaurant";
import { uploadRestaurantLogoAction } from "@/app/actions/uploadRestaurantLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
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
  logoImage: optionalUrl,
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

export type RestaurantEditFormValues = {
  name: string;
  description: string;
  logoImage: string;
  address: string;
  phoneNumber: string;
  whatsappNumber: string;
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

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<RestaurantFormSchema>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: initialValues,
  });

  const phoneNumber = useWatch({ control, name: "phoneNumber" });
  const logoImage = useWatch({ control, name: "logoImage" });
  const restaurantName = useWatch({ control, name: "name" }) ?? "Restaurant";

  const [logoFiles, setLogoFiles] = useState<DropZoneFile[]>([]);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const logoPreview =
    logoImage?.trim() ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurantName)}&size=256&background=random`;

  const initials = restaurantName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const clearLogoFiles = () => {
    logoFiles.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setLogoFiles([]);
  };

  const handleLogoUpload = async () => {
    const file = logoFiles[0];
    if (!file || isUploadingLogo) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file.file);
      const result = await uploadRestaurantLogoAction(formData);
      if (!result.success) {
        toast.error(result.error || "Failed to upload logo");
        return;
      }
      setValue("logoImage", result.url, { shouldDirty: true });
      clearLogoFiles();
      toast.success("Logo uploaded");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateRestaurantAction({
      ...values,
      whatsappNumber: sameAsPhone ? values.phoneNumber : values.whatsappNumber,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Restaurant updated");
    router.refresh();
  });

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
            description="Upload a square logo. It appears on your dashboard and public site."
          >
            <div className="flex flex-col items-center gap-4">
              <Avatar className="size-32 rounded-full">
                <AvatarImage src={logoPreview} alt={restaurantName} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex w-full max-w-md flex-col gap-3">
                <DropZone
                  files={logoFiles}
                  onFilesChange={setLogoFiles}
                  multiple={false}
                  maxFiles={1}
                  accept={[
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                  ]}
                  acceptAttr="image/jpeg,image/png,image/webp,image/gif"
                  disabled={isUploadingLogo || isSubmitting}
                  label={isUploadingLogo ? "Uploading…" : "Drop logo image"}
                  description="JPEG, PNG, WebP, or GIF"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={
                    isUploadingLogo || isSubmitting || logoFiles.length === 0
                  }
                  onClick={() => void handleLogoUpload()}
                >
                  {isUploadingLogo ? (
                    <>
                      <Spinner />
                      Uploading…
                    </>
                  ) : (
                    "Upload logo"
                  )}
                </Button>
              </div>
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
                  <Input {...field} value={field.value ?? ""} />
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
            description="Address and phone numbers shown on your public site."
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
          <Button type="submit" disabled={isSubmitting || isUploadingLogo}>
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
