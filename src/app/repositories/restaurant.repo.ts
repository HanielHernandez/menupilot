import { connectDB } from "@/lib/db";
import {
  RestaurantModel,
  type Restaurant,
} from "@/models/restaurant.model";

export type CreateRestaurantInput = {
  name: string;
  slug: string;
  description?: string;
  logoImage?: string;
  address?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
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
    logoImage: input.logoImage ?? "",
    address: input.address ?? "",
    phoneNumber: input.phoneNumber ?? "",
    whatsappNumber: input.whatsappNumber ?? "",
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
  description?: string;
  logoImage?: string;
  address?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
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
        description: input.description?.trim() ?? "",
        logoImage: input.logoImage?.trim() ?? "",
        address: input.address?.trim() ?? "",
        phoneNumber: input.phoneNumber?.trim() ?? "",
        whatsappNumber: input.whatsappNumber?.trim() ?? "",
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

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createUniqueSlug(name: string) {
  const base = slugify(name) || "restaurant";
  let slug = base;
  let attempt = 1;

  while (await findRestaurantBySlug(slug)) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  return slug;
}
