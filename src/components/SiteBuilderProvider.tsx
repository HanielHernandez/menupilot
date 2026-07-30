"use client";

import {
  DEFAULT_SITE_TEMPLATE,
  SITE_BLOCK_TYPES,
  type SiteBlock,
  type SiteTemplate,
  type SiteTemplateMedia,
  type SiteTemplateSettings,
} from "@/lib/site-template";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createContext,
  useContext,
  useMemo,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  FormProvider,
  useForm,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import * as z from "zod";

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    message: "Enter a valid hex color",
  });

export const siteBuilderSchema = z.object({
  templateId: z.string().trim().min(1),
  settings: z.object({
    colors: z.object({
      primary: hexColor,
      secondary: hexColor,
      accent: hexColor,
      background: hexColor,
      foreground: hexColor,
    }),
    fontFamily: z.string().trim().min(1, { message: "Font family is required" }),
  }),
  media: z.array(
    z.object({
      id: z.string().trim().min(1),
      url: z
        .string()
        .trim()
        .min(1, { message: "URL is required" })
        .refine((value) => z.url().safeParse(value).success, {
          message: "Enter a valid image URL",
        }),
    }),
  ),
  blocks: z.array(
    z
      .object({
        id: z.string().trim().min(1),
        type: z.enum(SITE_BLOCK_TYPES),
      })
      .passthrough(),
  ),
});

export type SiteBuilderValues = {
  templateId: string;
  settings: SiteTemplateSettings;
  media: SiteTemplateMedia[];
  blocks: SiteBlock[];
};

export type SiteBuilderRestaurant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoImage: string;
  address: string;
  phoneNumber: string;
  whatsappNumber: string;
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
    x: string;
    youtube: string;
    website: string;
  };
};

type SiteBuilderContextValue = {
  restaurant: SiteBuilderRestaurant;
  restaurantId: string;
  form: UseFormReturn<SiteBuilderValues>;
};

const SiteBuilderContext = createContext<SiteBuilderContextValue | null>(null);

type SiteBuilderProviderProps = {
  children: ReactNode;
  restaurant: SiteBuilderRestaurant;
  initialValues?: Partial<SiteTemplate> & { templateId?: string };
};

function buildDefaultValues(
  initialValues?: Partial<SiteTemplate> & { templateId?: string },
): SiteBuilderValues {
  const template = structuredClone(DEFAULT_SITE_TEMPLATE);

  return {
    templateId: initialValues?.templateId ?? "default",
    settings: {
      colors: {
        ...template.settings.colors,
        ...initialValues?.settings?.colors,
      },
      fontFamily:
        initialValues?.settings?.fontFamily ?? template.settings.fontFamily,
    },
    media: initialValues?.media ?? template.media,
    blocks: initialValues?.blocks ?? template.blocks,
  };
}

export function SiteBuilderProvider({
  children,
  restaurant,
  initialValues,
}: SiteBuilderProviderProps) {
  const form = useForm<SiteBuilderValues>({
    resolver: zodResolver(siteBuilderSchema) as unknown as Resolver<SiteBuilderValues>,
    defaultValues: buildDefaultValues(initialValues),
  });

  const value = useMemo(
    () => ({
      restaurant,
      restaurantId: restaurant.id,
      form,
    }),
    [restaurant, form],
  );

  return (
    <SiteBuilderContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </SiteBuilderContext.Provider>
  );
}

export function useSiteBuilder() {
  const context = useContext(SiteBuilderContext);
  if (!context) {
    throw new Error("useSiteBuilder must be used within a SiteBuilderProvider");
  }
  return context;
}

export function withSiteBuilder<P extends object>(
  Component: ComponentType<P>,
  providerProps: Omit<SiteBuilderProviderProps, "children">,
) {
  function WithSiteBuilder(props: P) {
    return (
      <SiteBuilderProvider {...providerProps}>
        <Component {...props} />
      </SiteBuilderProvider>
    );
  }

  WithSiteBuilder.displayName = `withSiteBuilder(${
    Component.displayName || Component.name || "Component"
  })`;

  return WithSiteBuilder;
}
