import { connectDB } from "@/lib/db";
import { normalizeTimeHHmm } from "@/lib/restaurant-schedule";
import { slugify } from "@/lib/slug";
import {
  RestaurantModel,
  type Restaurant,
} from "@/models/restaurant.model";

export { slugify };

export type ScheduleEntryInput = {
  day: string;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
};

function normalizeSchedule(schedule?: ScheduleEntryInput[]) {
  if (!schedule?.length) return [];
  return schedule.map((entry) => {
    const isClosed = Boolean(entry.isClosed);
    return {
      day: entry.day.trim(),
      openTime: isClosed ? "" : normalizeTimeHHmm(entry.openTime),
      closeTime: isClosed ? "" : normalizeTimeHHmm(entry.closeTime),
      isClosed,
    };
  });
}

export type CreateRestaurantInput = {
  name: string;
  slug: string;
  description?: string;
  logoMediaId?: string | null;
  address?: string;
  email?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  schedule?: ScheduleEntryInput[];
  socials?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    x?: string;
    youtube?: string;
    website?: string;
  };
  ownerId: string;
};

export async function findRestaurantByOwnerId(ownerId: string) {
  await connectDB();
  return RestaurantModel.findOne({ ownerId, deletedAt: null }).lean();
}

export async function findRestaurantBySlug(slug: string) {
  await connectDB();
  return RestaurantModel.findOne({ slug, deletedAt: null }).lean();
}

export async function createRestaurant(input: CreateRestaurantInput) {
  await connectDB();
  const restaurant = await RestaurantModel.create({
    name: input.name,
    slug: input.slug,
    description: input.description ?? "",
    logoMediaId: input.logoMediaId || null,
    address: input.address ?? "",
    email: input.email ?? "",
    phoneNumber: input.phoneNumber ?? "",
    whatsappNumber: input.whatsappNumber ?? "",
    schedule: normalizeSchedule(input.schedule),
    socials: {
      facebook: input.socials?.facebook ?? "",
      instagram: input.socials?.instagram ?? "",
      tiktok: input.socials?.tiktok ?? "",
      x: input.socials?.x ?? "",
      youtube: input.socials?.youtube ?? "",
      website: input.socials?.website ?? "",
    },
    ownerId: input.ownerId,
  });

  return restaurant.toObject() as Restaurant & { _id: string };
}

export type UpdateRestaurantInput = {
  name: string;
  slug: string;
  description?: string;
  logoMediaId?: string | null;
  address?: string;
  email?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  schedule?: ScheduleEntryInput[];
  socials?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    x?: string;
    youtube?: string;
    website?: string;
  };
};

export async function updateRestaurantByOwnerId(
  ownerId: string,
  input: UpdateRestaurantInput,
) {
  await connectDB();

  const restaurant = await RestaurantModel.findOneAndUpdate(
    { ownerId, deletedAt: null },
    {
      $set: {
        name: input.name.trim(),
        slug: input.slug.trim().toLowerCase(),
        description: input.description?.trim() ?? "",
        logoMediaId: input.logoMediaId?.trim() || null,
        address: input.address?.trim() ?? "",
        email: input.email?.trim().toLowerCase() ?? "",
        phoneNumber: input.phoneNumber?.trim() ?? "",
        whatsappNumber: input.whatsappNumber?.trim() ?? "",
        schedule: normalizeSchedule(input.schedule),
        socials: {
          facebook: input.socials?.facebook?.trim() ?? "",
          instagram: input.socials?.instagram?.trim() ?? "",
          tiktok: input.socials?.tiktok?.trim() ?? "",
          x: input.socials?.x?.trim() ?? "",
          youtube: input.socials?.youtube?.trim() ?? "",
          website: input.socials?.website?.trim() ?? "",
        },
      },
    },
    { new: true, runValidators: true },
  ).lean();

  return restaurant;
}

export async function createUniqueSlug(
  name: string,
  excludeRestaurantId?: string,
) {
  const base = slugify(name) || "restaurant";
  let slug = base;
  let attempt = 1;

  while (true) {
    const existing = await findRestaurantBySlug(slug);
    if (
      !existing ||
      (excludeRestaurantId &&
        existing._id.toString() === excludeRestaurantId)
    ) {
      return slug;
    }
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
}
