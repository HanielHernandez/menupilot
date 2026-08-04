import { SITE_BLOCK_TYPES } from "@/lib/site-template";
import * as z from "zod";

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    message: "Enter a valid hex color",
  });

export const siteContentSchema = z.object({
  restaurantId: z.string().min(1),
  templateId: z.string().trim().min(1).default("default"),
  settings: z.object({
    colors: z.object({
      primary: hexColor,
      secondary: hexColor,
      accent: hexColor,
      background: hexColor,
      foreground: hexColor,
    }),
    fonts: z.object({
      header: z
        .string()
        .trim()
        .min(1, { message: "Header font is required" }),
      body: z.string().trim().min(1, { message: "Body font is required" }),
      useHeaderAsBody: z.boolean(),
    }),
    cornerRadius: z
      .enum(["none", "small", "medium", "large", "pill"])
      .default("medium"),
  }),
  media: z.array(
    z.object({
      id: z.string().trim().min(1),
      url: z.url({ message: "Enter a valid image URL" }),
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

export type SaveSiteFormInput = z.infer<typeof siteContentSchema>;
