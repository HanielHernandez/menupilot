"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { deleteObjectFromR2 } from "@/lib/s3";
import { MenuImageModel } from "@/models/menu-image.model";
import { RestaurantModel } from "@/models/restaurant.model";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function deleteMenuImageAction(imageId: string) {
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

  const restaurant = await RestaurantModel.findOne({
    ownerId: session.user.id,
    deletedAt: null,
  });

  if (!restaurant) {
    return {
      success: false,
      error: "Restaurant not found",
    };
  }

  const menuImage = await MenuImageModel.findOne({
    _id: imageId,
    restaurantId: restaurant._id,
    deletedAt: null,
  });

  if (!menuImage) {
    return {
      success: false,
      error: "Menu image not found",
    };
  }

  try {
    if (menuImage.key) {
      await deleteObjectFromR2(menuImage.key);
    }
  } catch (error) {
    console.error("Failed to delete menu image from R2", error);
    return {
      success: false,
      error: "Could not delete file from storage",
    };
  }

  menuImage.deletedAt = new Date();
  await menuImage.save();

  revalidatePath("/dashboard/menu");

  return {
    success: true,
  };
}
