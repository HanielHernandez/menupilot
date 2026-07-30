import { connectDB } from "@/lib/db";
import {
  cloneDefaultSiteTemplate,
  SiteModel,
  type Site,
} from "@/models/site.model";
import type {
  SiteBlock,
  SiteTemplate,
  SiteTemplateMedia,
  SiteTemplateSettings,
} from "@/lib/site-template";
import mongoose from "mongoose";

export type UpsertSiteInput = {
  restaurantId: string;
  templateId?: string;
  settings: SiteTemplateSettings;
  media: SiteTemplateMedia[];
  blocks: SiteBlock[];
};

export type SiteRecord = Site & {
  _id: mongoose.Types.ObjectId;
};

type LegacySiteDoc = Partial<SiteRecord> & {
  _id: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId | string;
  colors?: SiteTemplateSettings["colors"];
  fontFamily?: string;
  settings?: SiteTemplateSettings;
  media?: SiteTemplateMedia[];
  blocks?: SiteBlock[];
  templateId?: string;
};

function isCompleteSite(site: LegacySiteDoc | null): site is SiteRecord {
  return Boolean(
    site?.settings?.colors &&
      typeof site.settings.fontFamily === "string" &&
      site.settings.fontFamily.length > 0 &&
      Array.isArray(site.media) &&
      Array.isArray(site.blocks),
  );
}

export async function findSiteByRestaurantId(restaurantId: string) {
  await connectDB();
  return SiteModel.findOne({
    restaurantId,
    deletedAt: null,
  }).lean<LegacySiteDoc>();
}

/** Returns existing site or creates/migrates one from the default template. */
export async function getOrCreateSiteForRestaurant(
  restaurantId: string,
): Promise<SiteRecord> {
  await connectDB();

  const existing = await findSiteByRestaurantId(restaurantId);
  if (isCompleteSite(existing)) {
    return existing;
  }

  const template = cloneDefaultSiteTemplate();
  const settings: SiteTemplateSettings = {
    colors: { ...template.settings.colors },
    fontFamily: template.settings.fontFamily,
  };

  const media =
    existing?.media?.length && existing.media.every((item) => item?.id && item?.url)
      ? existing.media
      : template.media;

  const blocks =
    existing?.blocks?.length && existing.blocks.every((item) => item?.id && item?.type)
      ? existing.blocks
      : template.blocks;

  // Prefer legacy root colors if present while migrating.
  if (existing?.colors && existing.fontFamily) {
    settings.colors = { ...existing.colors };
    settings.fontFamily = existing.fontFamily;
  }

  const updated = await SiteModel.findOneAndUpdate(
    {
      restaurantId,
      deletedAt: null,
    },
    {
      $set: {
        templateId: existing?.templateId || "default",
        settings,
        media,
        blocks,
      },
      $unset: {
        colors: 1,
        fontFamily: 1,
      },
      $setOnInsert: {
        restaurantId,
        deletedAt: null,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).lean<SiteRecord>();

  if (!updated || !isCompleteSite(updated)) {
    throw new Error("Failed to create or migrate site");
  }

  return updated;
}

export async function upsertSite(input: UpsertSiteInput) {
  await connectDB();

  const site = await SiteModel.findOneAndUpdate(
    {
      restaurantId: input.restaurantId,
      deletedAt: null,
    },
    {
      $set: {
        templateId: input.templateId ?? "default",
        settings: input.settings,
        media: input.media.map((item) => ({
          id: item.id.trim(),
          url: item.url.trim(),
        })),
        blocks: input.blocks,
      },
      $unset: {
        colors: 1,
        fontFamily: 1,
      },
      $setOnInsert: {
        restaurantId: input.restaurantId,
        deletedAt: null,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  ).lean<SiteRecord>();

  return site;
}

export function toSiteTemplate(site: SiteRecord): SiteTemplate {
  return {
    settings: site.settings,
    media: site.media ?? [],
    blocks: (site.blocks ?? []) as SiteBlock[],
  };
}
