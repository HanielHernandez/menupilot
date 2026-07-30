"use server";

import { upsertSite } from "@/app/repositories/site.repo";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { SITE_BLOCK_TYPES } from "@/lib/site-template";
import { RestaurantModel } from "@/models/restaurant.model";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import * as z from "zod";

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    message: "Enter a valid hex color",
  });

const saveSiteSchema = z.object({
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

export type SaveSiteFormInput = z.infer<typeof saveSiteSchema>;

export type SaveSiteResult =
  | { success: true }
  | { success: false; error: string };

export async function saveSiteAction(
  input: SaveSiteFormInput,
): Promise<SaveSiteResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "You must be signed in" };
  }

  const parsed = saveSiteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid site details",
    };
  }

  await connectDB();

  const restaurant = await RestaurantModel.findOne({
    _id: parsed.data.restaurantId,
    ownerId: session.user.id,
    deletedAt: null,
  });

  if (!restaurant) {
    return { success: false, error: "Restaurant not found" };
  }

  try {
    await upsertSite({
      restaurantId: restaurant._id.toString(),
      templateId: parsed.data.templateId,
      settings: parsed.data.settings,
      media: parsed.data.media,
      blocks: parsed.data.blocks as UpsertBlocks,
    });
  } catch (error) {
    console.error("Failed to save site", error);
    return {
      success: false,
      error: "Could not save site. Please try again.",
    };
  }

  revalidatePath("/dashboard/site");
  return { success: true };
}

type UpsertBlocks = Parameters<typeof upsertSite>[0]["blocks"];
