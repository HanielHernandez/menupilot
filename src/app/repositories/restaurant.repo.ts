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
