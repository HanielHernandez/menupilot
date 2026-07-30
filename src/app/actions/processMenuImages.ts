"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  createEmptyExtractedMenu,
  mergeExtractedMenus,
  parseExtractedMenu,
  type ExtractedMenu,
} from "@/lib/menu-extract";
import { extractMenuFromImage } from "@/lib/openai";
import { MediaModel } from "@/models/media.model";
import { MenuImageModel } from "@/models/menu-image.model";
import { RestaurantModel } from "@/models/restaurant.model";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type ProcessMenuImagesResult =
  | {
      success: true;
      processedCount: number;
      menu: ExtractedMenu;
      errors: string[];
    }
  | {
      success: false;
      error: string;
    };

type ProcessMenuImagesInput = {
  restaurantId?: string;
  imageIds?: string[];
};

export async function processMenuImagesAction(
  input: ProcessMenuImagesInput = {},
): Promise<ProcessMenuImagesResult> {
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

  const restaurantQuery = input.restaurantId
    ? {
        _id: input.restaurantId,
        ownerId: session.user.id,
        deletedAt: null,
      }
    : {
        ownerId: session.user.id,
        deletedAt: null,
      };

  const restaurant = await RestaurantModel.findOne(restaurantQuery);

  if (!restaurant) {
    return {
      success: false,
      error: "Restaurant not found",
    };
  }

  const imageObjectIds = (input.imageIds ?? [])
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const images = await MenuImageModel.find({
    restaurantId: restaurant._id,
    ...(imageObjectIds.length
      ? { _id: { $in: imageObjectIds } }
      : { status: "uploaded" }),
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
  });

  const uploadedImages = images.filter((image) => image.status === "uploaded");

  if (!uploadedImages.length) {
    return {
      success: false,
      error: "No uploaded images to process",
    };
  }

  const mediaIds = uploadedImages
    .map((image) => image.mediaId)
    .filter(Boolean);

  const mediaDocs = await MediaModel.find({
    _id: { $in: mediaIds },
    deletedAt: null,
  }).lean();

  const mediaById = new Map(
    mediaDocs.map((doc) => [doc._id.toString(), doc]),
  );

  let menu = createEmptyExtractedMenu();
  const errors: string[] = [];
  let processedCount = 0;

  for (const image of uploadedImages) {
    const media = mediaById.get(image.mediaId.toString());
    const imageUrl = media?.url;
    const label = media?.name || media?.key || image._id.toString();

    if (!imageUrl) {
      errors.push(`Missing media for menu image ${image._id}`);
      continue;
    }

    await MenuImageModel.findByIdAndUpdate(image._id, {
      status: "processing",
    });
    revalidatePath("/dashboard/menu");

    try {
      const raw = await extractMenuFromImage(imageUrl);
      const extracted = parseExtractedMenu(raw);
      menu = mergeExtractedMenus(menu, extracted);

      await MenuImageModel.findByIdAndUpdate(image._id, {
        status: "extracted",
      });
      processedCount += 1;
    } catch (error) {
      console.error("Failed to extract menu from image", image._id, error);
      errors.push(
        `Failed to process ${label}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );

      await MenuImageModel.findByIdAndUpdate(image._id, {
        status: "uploaded",
      });
    }

    revalidatePath("/dashboard/menu");
  }

  return {
    success: true,
    processedCount,
    menu,
    errors,
  };
}
