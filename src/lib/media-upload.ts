import {
  createMedia,
  type MediaRecord,
} from "@/app/repositories/media.repo";
import { getRestaurantStorageBytes } from "@/app/repositories/usage.repo";
import {
  MAX_STORAGE_BYTES,
  storageLimitErrorMessage,
} from "@/lib/usage-limits";
import { headObjectFromR2, uploadObjectToR2 } from "@/lib/s3";
import type { Types } from "mongoose";

export type MediaUploadFolder = "media" | "logo" | "site" | "menu";

export type UploadImageAndCreateMediaInput = {
  file: File;
  restaurantId: string | Types.ObjectId;
  restaurantSlug: string;
  userId: string;
  folder?: MediaUploadFolder;
  weight?: number;
};

/**
 * Upload an image to Cloudflare R2, read size via HeadObject,
 * then persist a Media document (id, url, size, name, key).
 */
export async function uploadImageAndCreateMedia(
  input: UploadImageAndCreateMediaInput,
): Promise<MediaRecord> {
  const { file, restaurantId, restaurantSlug, userId } = input;

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  if (file.size === 0) {
    throw new Error("No file provided");
  }

  const restaurantIdStr = restaurantId.toString();
  const usedBytes = await getRestaurantStorageBytes(restaurantIdStr);
  if (usedBytes + file.size > MAX_STORAGE_BYTES) {
    throw new Error(storageLimitErrorMessage());
  }

  const folder = input.folder ?? "media";
  const safeName = file.name.replace(/[/\\]/g, "_");
  const key = `menupilot/${restaurantSlug}/${folder}/${Date.now()}-${safeName}`;
  const body = Buffer.from(await file.arrayBuffer());

  const url = await uploadObjectToR2({
    key,
    body,
    contentType: file.type || undefined,
  });

  const head = await headObjectFromR2(key);
  const size = head.size ?? file.size;

  return createMedia({
    restaurantId,
    userId,
    weight: input.weight ?? 0,
    name: safeName,
    size,
    url,
    key,
  });
}
