"use server";

import { auth } from "@/lib/auth";
import { config } from "@/lib/config";
import { connectDB } from "@/lib/db";
import { getPublicObjectUrl, getS3Client } from "@/lib/s3";
import { MenuImageModel } from "@/models/menu-image.model";
import { RestaurantModel as Restaurant } from "@/models/restaurant.model";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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
    url: string;
    key: string;
    status: string;
    restaurantId: string;
    deletedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    fileName: string;
  }> = [];

  for (const file of files) {
    const { url, key } = await uploadFileToR2(file, restaurant.slug);

    const menuImage = await MenuImageModel.create({
      url,
      key,
      status: "uploaded",
      restaurantId: restaurant._id,
    });

    const plain = menuImage.toObject();

    uploaded.push({
      _id: plain._id?.toString?.() ?? String(plain._id),
      url: plain.url,
      key: plain.key,
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
      fileName: file.name,
    });
  }

  revalidatePath("/dashboard/menu");

  return {
    success: true,
    files: uploaded,
  };
}

const uploadFileToR2 = async (file: File, restaurantSlug: string) => {
  const s3 = getS3Client();
  const safeName = file.name.replace(/[/\\]/g, "_");
  const key = `menupilot/${restaurantSlug}/${safeName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || undefined,
    }),
  );

  return {
    key,
    url: getPublicObjectUrl(key),
  };
};
