"use server";

import { auth } from "@/lib/auth";
import { config } from "@/lib/config";
import { connectDB } from "@/lib/db";
import { getPublicObjectUrl, getS3Client } from "@/lib/s3";
import { RestaurantModel } from "@/models/restaurant.model";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { headers } from "next/headers";

export type UploadSiteMediaResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadSiteMediaAction(
  formData: FormData,
): Promise<UploadSiteMediaResult> {
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

  const safeName = file.name.replace(/[/\\]/g, "_");
  const key = `menupilot/${restaurant.slug}/site/${Date.now()}-${safeName}`;
  const s3 = getS3Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || undefined,
    }),
  );

  return {
    success: true,
    url: getPublicObjectUrl(key),
  };
}
