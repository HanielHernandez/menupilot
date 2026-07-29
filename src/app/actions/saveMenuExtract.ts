"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import type { ExtractedCategory } from "@/lib/menu-extract";
import { CategoryModel } from "@/models/category.model";
import { MenuItemModel } from "@/models/menu-item.model";
import { RestaurantModel } from "@/models/restaurant.model";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type SaveMenuExtractResult =
  | {
      success: true;
      categoriesSaved: number;
      categoriesUpdated: number;
      itemsSaved: number;
      itemsUpdated: number;
    }
  | {
      success: false;
      error: string;
    };

type SaveMenuExtractInput = {
  restaurantId: string;
  categories: ExtractedCategory[];
};

export async function saveMenuExtractAction(
  input: SaveMenuExtractInput,
): Promise<SaveMenuExtractResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (!input.categories.length) {
    return { success: false, error: "No categories to save" };
  }

  await connectDB();

  const restaurant = await RestaurantModel.findOne({
    _id: input.restaurantId,
    ownerId: session.user.id,
    deletedAt: null,
  });

  if (!restaurant) {
    return { success: false, error: "Restaurant not found" };
  }

  let categoriesSaved = 0;
  let categoriesUpdated = 0;
  let itemsSaved = 0;
  let itemsUpdated = 0;

  try {
    for (const [index, category] of input.categories.entries()) {
      const name = category.name.trim();
      if (!name) continue;

      const sort = category.sort ?? index;
      const description = category.description?.trim() ?? "";
      let categoryDoc = null;

      if (category.id && mongoose.isValidObjectId(category.id)) {
        categoryDoc = await CategoryModel.findOneAndUpdate(
          {
            _id: category.id,
            restaurantId: restaurant._id,
            deletedAt: null,
          },
          {
            $set: {
              name,
              description,
              sort,
            },
          },
          { new: true },
        );

        if (categoryDoc) {
          categoriesUpdated += 1;
        }
      }

      if (!categoryDoc) {
        categoryDoc = await CategoryModel.create({
          name,
          description,
          sort,
          restaurantId: restaurant._id,
        });
        categoriesSaved += 1;
      }

      for (const item of category.items) {
        const itemName = item.name.trim();
        if (!itemName) continue;

        const price = Number(item.price) || 0;
        const itemDescription = item.description?.trim() ?? "";
        let itemDoc = null;

        if (item.id && mongoose.isValidObjectId(item.id)) {
          itemDoc = await MenuItemModel.findOneAndUpdate(
            {
              _id: item.id,
              restaurantId: restaurant._id,
              deletedAt: null,
            },
            {
              $set: {
                name: itemName,
                description: itemDescription,
                price,
                categoryId: categoryDoc._id,
              },
            },
            { new: true },
          );

          if (itemDoc) {
            itemsUpdated += 1;
          }
        }

        if (!itemDoc) {
          await MenuItemModel.create({
            name: itemName,
            description: itemDescription,
            price,
            categoryId: categoryDoc._id,
            restaurantId: restaurant._id,
          });
          itemsSaved += 1;
        }
      }
    }
  } catch (error) {
    console.error("Failed to save extracted menu", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not save menu. Please try again.",
    };
  }

  revalidatePath("/dashboard/menu");

  return {
    success: true,
    categoriesSaved,
    categoriesUpdated,
    itemsSaved,
    itemsUpdated,
  };
}
