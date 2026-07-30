"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { uploadImageAndCreateMedia } from "@/lib/media-upload";
import { MenuImageModel } from "@/models/menu-image.model";
import { RestaurantModel as Restaurant } from "@/models/restaurant.model";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export default async function uploadMenuFile(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  await connectDB();

  const restaurant = await Restaurant.findOne({
    ownerId: session.user.id,
    deletedAt: null,
  });

  if (!restaurant) {
    return {
      success: false,
      error: "Restaurant not found",
    };
  }

  const files = formData.getAll("files") as File[];
  const uploaded: Array<{
    _id: string;
    mediaId: string;
    url: string;
    status: string;
    restaurantId: string;
    deletedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    fileName: string;
  }> = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;

    try {
      const media = await uploadImageAndCreateMedia({
        file,
        restaurantId: restaurant._id,
        restaurantSlug: restaurant.slug,
        userId: session.user.id,
        folder: "menu",
      });

      const menuImage = await MenuImageModel.create({
        mediaId: media.id,
        status: "uploaded",
        restaurantId: restaurant._id,
      });

      const plain = menuImage.toObject();

      uploaded.push({
        _id: plain._id?.toString?.() ?? String(plain._id),
        mediaId: media.id,
        url: media.url,
        status: plain.status,
        restaurantId:
          plain.restaurantId?.toString?.() ?? String(plain.restaurantId),
        deletedAt: plain.deletedAt
          ? new Date(plain.deletedAt).toISOString()
          : null,
        createdAt: plain.createdAt
          ? new Date(plain.createdAt).toISOString()
          : null,
        updatedAt: plain.updatedAt
          ? new Date(plain.updatedAt).toISOString()
          : null,
        fileName: media.name || file.name,
      });
    } catch (error) {
      console.error("Failed to upload menu file", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload menu file",
      };
    }
  }

  revalidatePath("/dashboard/menu");

  return {
    success: true,
    files: uploaded,
  };
}
