"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/category.model";
import { MenuItemModel } from "@/models/menu-item.model";
import { RestaurantModel } from "@/models/restaurant.model";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type DeleteCategoryResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteCategoryAction(
  categoryId: string,
  restaurantId: string,
): Promise<DeleteCategoryResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (!mongoose.isValidObjectId(categoryId)) {
    return { success: false, error: "Invalid category" };
  }

  await connectDB();

  const restaurant = await RestaurantModel.findOne({
    _id: restaurantId,
    ownerId: session.user.id,
    deletedAt: null,
  });

  if (!restaurant) {
    return { success: false, error: "Restaurant not found" };
  }

  const category = await CategoryModel.findOneAndUpdate(
    {
      _id: categoryId,
      restaurantId: restaurant._id,
      deletedAt: null,
    },
    { deletedAt: new Date() },
    { new: true },
  );

  if (!category) {
    return { success: false, error: "Category not found" };
  }

  await MenuItemModel.updateMany(
    {
      categoryId: category._id,
      restaurantId: restaurant._id,
      deletedAt: null,
    },
    { deletedAt: new Date() },
  );

  revalidatePath("/dashboard/menu");
  revalidatePath("/dashboard");

  return { success: true };
}
