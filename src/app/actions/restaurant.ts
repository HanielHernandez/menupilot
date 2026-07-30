"use server";

import {
  createRestaurant,
  createUniqueSlug,
  findRestaurantByOwnerId,
  updateRestaurantByOwnerId,
} from "@/app/repositories/restaurant.repo";
import { auth } from "@/lib/auth";
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

const restaurantFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  description: z.string().trim().optional(),
  logoMediaId: optionalMediaId,
  address: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
  socials: z.object({
    instagram: optionalUrl,
    tiktok: optionalUrl,
    facebook: optionalUrl,
    x: optionalUrl,
    youtube: optionalUrl,
    website: optionalUrl,
  }),
});

export type CreateRestaurantFormInput = z.infer<typeof restaurantFormSchema>;
export type UpdateRestaurantFormInput = z.infer<typeof restaurantFormSchema>;

export type CreateRestaurantResult =
  | { success: true }
  | { success: false; error: string };

export type UpdateRestaurantResult =
  | { success: true }
  | { success: false; error: string };

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
    return { success: true };
  }

  try {
    const slug = await createUniqueSlug(parsed.data.name);

    await createRestaurant({
      ...parsed.data,
      slug,
      ownerId: session.user.id,
    });
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
        error: "A restaurant with this name already exists",
      };
    }

    return {
      success: false,
      error: "Could not create restaurant. Please try again.",
    };
  }

  return { success: true };
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

  try {
    await updateRestaurantByOwnerId(session.user.id, parsed.data);
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
        error: "A restaurant with this name already exists",
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

  return { success: true };
}
