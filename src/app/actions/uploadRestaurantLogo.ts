"use server";

import type { MediaRecord } from "@/app/repositories/media.repo";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { uploadImageAndCreateMedia } from "@/lib/media-upload";
import { RestaurantModel } from "@/models/restaurant.model";
import { headers } from "next/headers";

export type UploadRestaurantLogoResult =
  | { success: true; mediaId: string; url: string; media: MediaRecord }
  | { success: false; error: string };

export async function uploadRestaurantLogoAction(
  formData: FormData,
): Promise<UploadRestaurantLogoResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  await connectDB();

  const restaurant = await RestaurantModel.findOne({
    ownerId: session.user.id,
    deletedAt: null,
  });

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
      folder: "logo",
    });

    return {
      success: true,
      mediaId: media.id,
      url: media.url,
      media,
    };
  } catch (error) {
    console.error("Failed to upload restaurant logo", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload logo",
    };
  }
}
