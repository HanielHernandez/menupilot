"use server";

import {
  createMedia,
  listMediaByRestaurantId,
  type ListMediaResult,
  type MediaRecord,
} from "@/app/repositories/media.repo";
import { auth } from "@/lib/auth";
import { config } from "@/lib/config";
import { connectDB } from "@/lib/db";
import { getPublicObjectUrl, getS3Client } from "@/lib/s3";
import { RestaurantModel } from "@/models/restaurant.model";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "File must be an image" };
  }

  const safeName = file.name.replace(/[/\\]/g, "_");
  const key = `menupilot/${restaurant.slug}/media/${Date.now()}-${safeName}`;
  const s3 = getS3Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || undefined,
    }),
  );

  const url = getPublicObjectUrl(key);
  const media = await createMedia({
    restaurantId: restaurant._id,
    userId: session.user.id,
    weight: 0,
    url,
    key,
  });

  return { success: true, media };
}
