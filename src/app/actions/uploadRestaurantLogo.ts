"use server";

import { auth } from "@/lib/auth";
import { config } from "@/lib/config";
import { connectDB } from "@/lib/db";
import { getPublicObjectUrl, getS3Client } from "@/lib/s3";
import { MediaModel } from "@/models/media.model";
import { RestaurantModel } from "@/models/restaurant.model";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { headers } from "next/headers";

export type UploadRestaurantLogoResult =
  | { success: true; mediaId: string; url: string }
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

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Logo must be an image" };
  }

  const safeName = file.name.replace(/[/\\]/g, "_");
  const key = `menupilot/${restaurant.slug}/logo/${Date.now()}-${safeName}`;
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
  const media = await MediaModel.create({
    restaurantId: restaurant._id,
    userId: session.user.id,
    weight: 0,
    url,
    key,
  });

  return {
    success: true,
    mediaId: media._id.toString(),
    url,
  };
}
