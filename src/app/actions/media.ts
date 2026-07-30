"use server";

import {
  listMediaByRestaurantId,
  type ListMediaResult,
  type MediaRecord,
} from "@/app/repositories/media.repo";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { uploadImageAndCreateMedia } from "@/lib/media-upload";
import { RestaurantModel } from "@/models/restaurant.model";
import { headers } from "next/headers";

export type ListMediaActionResult =
  | { success: true; data: ListMediaResult }
  | { success: false; error: string };

export type UploadMediaActionResult =
  | { success: true; media: MediaRecord }
  | { success: false; error: string };

async function getOwnedRestaurant(userId: string) {
  await connectDB();
  return RestaurantModel.findOne({
    ownerId: userId,
    deletedAt: null,
  });
}

export async function listMediaAction(
  page = 1,
  pageSize = 25,
): Promise<ListMediaActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const restaurant = await getOwnedRestaurant(session.user.id);
  if (!restaurant) {
    return { success: false, error: "Restaurant not found" };
  }

  const data = await listMediaByRestaurantId({
    restaurantId: restaurant._id.toString(),
    page,
    pageSize,
  });

  return { success: true, data };
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<UploadMediaActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const restaurant = await getOwnedRestaurant(session.user.id);
  if (!restaurant) {
    return { success: false, error: "Restaurant not found" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No file provided" };
  }

  try {
    const media = await uploadImageAndCreateMedia({
      file,
      restaurantId: restaurant._id,
      restaurantSlug: restaurant.slug,
      userId: session.user.id,
      folder: "media",
    });

    return { success: true, media };
  } catch (error) {
    console.error("Failed to upload media", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload media",
    };
  }
}
