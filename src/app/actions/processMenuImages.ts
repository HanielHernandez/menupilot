"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { MenuImageModel } from "@/models/menu-image.model";
import { RestaurantModel } from "@/models/restaurant.model";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function processMenuImagesAction() {
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

  const result = await MenuImageModel.updateMany(
    {
      restaurantId: restaurant._id,
      status: "uploaded",
      deletedAt: null,
    },
    {
      $set: { status: "processing" },
    },
  );

  revalidatePath("/dashboard/menu");

  return {
    success: true,
    processedCount: result.modifiedCount,
  };
}
