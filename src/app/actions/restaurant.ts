"use server";

import {
  createRestaurant,
  createUniqueSlug,
  findRestaurantByOwnerId,
  findRestaurantBySlug,
  updateRestaurantByOwnerId,
} from "@/app/repositories/restaurant.repo";
import { auth } from "@/lib/auth";
import {
  isValidTimeHHmm,
  normalizeTimeHHmm,
} from "@/lib/restaurant-schedule";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
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
  .transform((entry) => {
    const isClosed = Boolean(entry.isClosed);
    return {
      day: entry.day.trim(),
      isClosed,
      openTime: isClosed ? "" : normalizeTimeHHmm(entry.openTime),
      closeTime: isClosed ? "" : normalizeTimeHHmm(entry.closeTime),
    };
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

const restaurantFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  slug: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: "Slug must be lowercase letters, numbers, and hyphens",
    }),
  description: z.string().trim().optional(),
  logoMediaId: optionalMediaId,
  address: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.email().safeParse(value).success, {
      message: "Enter a valid email address",
    }),
  phoneNumber: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
  schedule: z.array(scheduleEntrySchema).optional().default([]),
  socials: z.object({
    instagram: optionalUrl,
    tiktok: optionalUrl,
    facebook: optionalUrl,
    x: optionalUrl,
    youtube: optionalUrl,
    website: optionalUrl,
  }),
});

export type CreateRestaurantFormInput = z.input<typeof restaurantFormSchema>;
export type UpdateRestaurantFormInput = z.input<typeof restaurantFormSchema>;

export type CreateRestaurantResult =
  | { success: true; slug: string }
  | { success: false; error: string };

export type UpdateRestaurantResult =
  | { success: true }
  | { success: false; error: string };

export type SuggestUniqueSlugResult =
  | { success: true; slug: string }
  | { success: false; error: string };

/** Returns a unique public site slug derived from a restaurant name. */
export async function suggestUniqueSlugAction(
  name: string,
): Promise<SuggestUniqueSlugResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "You must be signed in" };
  }

  const base = slugify(name);
  if (!base) {
    return { success: false, error: "Enter a restaurant name first" };
  }

  try {
    const slug = await createUniqueSlug(base);
    return { success: true, slug };
  } catch (error) {
    console.error("Failed to suggest slug", error);
    return { success: false, error: "Could not check slug availability" };
  }
}

export async function createRestaurantAction(
  input: CreateRestaurantFormInput,
): Promise<CreateRestaurantResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "You must be signed in" };
  }

  const parsed = restaurantFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid restaurant details",
    };
  }

  const existing = await findRestaurantByOwnerId(session.user.id);
  if (existing) {
    return { success: true, slug: existing.slug };
  }

  try {
    const slug = await createUniqueSlug(
      parsed.data.slug ? slugify(parsed.data.slug) : parsed.data.name,
    );

    await createRestaurant({
      ...parsed.data,
      slug,
      ownerId: session.user.id,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/site/${slug}`);
    return { success: true, slug };
  } catch (error) {
    console.error("Failed to create restaurant", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return {
        success: false,
        error: "A restaurant with this name or slug already exists",
      };
    }

    return {
      success: false,
      error: "Could not create restaurant. Please try again.",
    };
  }
}

export async function updateRestaurantAction(
  input: UpdateRestaurantFormInput,
): Promise<UpdateRestaurantResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "You must be signed in" };
  }

  const parsed = restaurantFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid restaurant details",
    };
  }

  const existing = await findRestaurantByOwnerId(session.user.id);
  if (!existing) {
    return { success: false, error: "Restaurant not found" };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) {
    return { success: false, error: "Slug is required" };
  }

  const slugOwner = await findRestaurantBySlug(slug);
  if (
    slugOwner &&
    slugOwner._id.toString() !== existing._id.toString()
  ) {
    return {
      success: false,
      error: "This slug is already taken",
    };
  }

  const previousSlug = existing.slug;

  try {
    await updateRestaurantByOwnerId(session.user.id, {
      ...parsed.data,
      slug,
    });
  } catch (error) {
    console.error("Failed to update restaurant", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return {
        success: false,
        error: "A restaurant with this name or slug already exists",
      };
    }

    return {
      success: false,
      error: "Could not update restaurant. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/restaurant");
  revalidatePath("/dashboard/site");
  revalidatePath(`/site/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/site/${previousSlug}`);
  }

  return { success: true };
}
