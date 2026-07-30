import { connectDB } from "@/lib/db";
import { MediaModel } from "@/models/media.model";
import type { Types } from "mongoose";

export type MediaRecord = {
  id: string;
  url: string;
  key: string;
  name: string;
  size: number | null;
  weight: number;
  restaurantId: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMediaInput = {
  restaurantId?: string | Types.ObjectId | null;
  userId?: string | null;
  weight?: number;
  name?: string;
  size?: number | null;
  url: string;
  key: string;
};

export type ListMediaOptions = {
  restaurantId: string;
  page?: number;
  pageSize?: number;
};

export type ListMediaResult = {
  items: MediaRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function nameFromKey(key: string) {
  const segment = key.split("/").pop() ?? key;
  return segment.replace(/^\d+-/, "");
}

function toMediaRecord(doc: {
  _id: { toString(): string };
  url: string;
  key: string;
  name?: string | null;
  size?: number | null;
  weight: number;
  restaurantId?: { toString(): string } | null;
  userId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}): MediaRecord {
  const name = doc.name?.trim() || nameFromKey(doc.key);

  return {
    id: doc._id.toString(),
    url: doc.url,
    key: doc.key,
    name,
    size: typeof doc.size === "number" ? doc.size : null,
    weight: doc.weight,
    restaurantId: doc.restaurantId?.toString() ?? null,
    userId: doc.userId ?? null,
    createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

export async function createMedia(input: CreateMediaInput): Promise<MediaRecord> {
  await connectDB();

  const media = await MediaModel.create({
    restaurantId: input.restaurantId || null,
    userId: input.userId ?? null,
    weight: input.weight ?? 0,
    name: input.name?.trim() || nameFromKey(input.key),
    size: input.size ?? null,
    url: input.url,
    key: input.key,
  });

  return toMediaRecord(media);
}

export async function listMediaByRestaurantId(
  options: ListMediaOptions,
): Promise<ListMediaResult> {
  await connectDB();

  const pageSize = Math.min(Math.max(options.pageSize ?? 25, 1), 100);
  const page = Math.max(options.page ?? 1, 1);
  const skip = (page - 1) * pageSize;

  const filter = {
    restaurantId: options.restaurantId,
    deletedAt: null,
  };

  const [total, docs] = await Promise.all([
    MediaModel.countDocuments(filter),
    MediaModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
  ]);

  return {
    items: docs.map(toMediaRecord),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
