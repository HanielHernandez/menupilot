import { findMenuForRestaurant } from "@/app/repositories/menu.repo";
import { findRestaurantBySlug } from "@/app/repositories/restaurant.repo";
import {
  findPublishedSiteByRestaurantId,
  toSiteTemplate,
} from "@/app/repositories/site.repo";
import SiteTemplateRenderer from "@/components/blocks/SiteTemplateRenderer";
import type { SiteBuilderRestaurant } from "@/components/SiteBuilderProvider";
import { connectDB } from "@/lib/db";
import { normalizeSiteSettings, type SiteBlock } from "@/lib/site-template";
import { MediaModel } from "@/models/media.model";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PublicSitePageProps = {
  params: Promise<{ slug: string }>;
};

async function getPublicSiteData(slug: string) {
  await connectDB();

  const restaurant = await findRestaurantBySlug(slug.trim().toLowerCase());
  if (!restaurant) {
    return null;
  }

  const site = await findPublishedSiteByRestaurantId(restaurant._id.toString());
  if (!site?.publishedAt) {
    return null;
  }

  const logoMediaId = restaurant.logoMediaId?.toString() ?? null;
  const logoMedia = logoMediaId
    ? await MediaModel.findOne({
        _id: logoMediaId,
        deletedAt: null,
      }).lean()
    : null;

  const restaurantView: SiteBuilderRestaurant = {
    id: restaurant._id.toString(),
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description ?? "",
    logoMediaId,
    logoUrl: logoMedia?.url ?? "",
    address: restaurant.address ?? "",
    phoneNumber: restaurant.phoneNumber ?? "",
    whatsappNumber: restaurant.whatsappNumber ?? "",
    socials: {
      facebook: restaurant.socials?.facebook ?? "",
      instagram: restaurant.socials?.instagram ?? "",
      tiktok: restaurant.socials?.tiktok ?? "",
      x: restaurant.socials?.x ?? "",
      youtube: restaurant.socials?.youtube ?? "",
      website: restaurant.socials?.website ?? "",
    },
  };

  const template = toSiteTemplate(site);
  const menuCategories = await findMenuForRestaurant(
    restaurant._id.toString(),
  );

  return {
    restaurant: restaurantView,
    settings: normalizeSiteSettings(template.settings),
    media: template.media,
    blocks: template.blocks as SiteBlock[],
    menuCategories,
  };
}

export async function generateMetadata({
  params,
}: PublicSitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicSiteData(slug);

  if (!data) {
    return {
      title: "Site not found",
    };
  }

  return {
    title: data.restaurant.name,
    description:
      data.restaurant.description || `${data.restaurant.name} — powered by MenuPilot`,
  };
}

export default async function PublicSitePage({ params }: PublicSitePageProps) {
  const { slug } = await params;
  const data = await getPublicSiteData(slug);

  if (!data) {
    notFound();
  }

  return (
    <SiteTemplateRenderer
      variant="public"
      blocks={data.blocks}
      media={data.media}
      settings={data.settings}
      restaurant={data.restaurant}
      menuCategories={data.menuCategories}
    />
  );
}
