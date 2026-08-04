import { connectDB } from "@/lib/db";
import { getUtcDayKey } from "@/lib/usage-limits";
import { MediaModel } from "@/models/media.model";
import { UsageEventModel } from "@/models/usage-event.model";
import mongoose from "mongoose";

export async function getRestaurantStorageBytes(
  restaurantId: string,
): Promise<number> {
  await connectDB();

  if (!mongoose.isValidObjectId(restaurantId)) {
    return 0;
  }

  const [result] = await MediaModel.aggregate<{ totalBytes: number }>([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        deletedAt: null,
        size: { $type: "number", $gte: 0 },
      },
    },
    {
      $group: {
        _id: null,
        totalBytes: { $sum: "$size" },
      },
    },
  ]);

  return result?.totalBytes ?? 0;
}

export async function getMenuProcessCountToday(
  restaurantId: string,
  dayKey: string = getUtcDayKey(),
): Promise<number> {
  await connectDB();

  if (!mongoose.isValidObjectId(restaurantId)) {
    return 0;
  }

  return UsageEventModel.countDocuments({
    restaurantId,
    type: "menu_process",
    dayKey,
  });
}

export async function recordMenuProcess(input: {
  restaurantId: string;
  userId: string;
  imageCount?: number;
}) {
  await connectDB();

  return UsageEventModel.create({
    restaurantId: input.restaurantId,
    userId: input.userId,
    type: "menu_process",
    dayKey: getUtcDayKey(),
    meta:
      typeof input.imageCount === "number"
        ? { imageCount: input.imageCount }
        : null,
  });
}
