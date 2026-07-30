import { connectDB } from "@/lib/db";
import {
  normalizeSiteSettings,
  type SiteBlock,
  type SiteTemplate,
  type SiteTemplateMedia,
  type SiteTemplateSettings,
} from "@/lib/site-template";
import {
  SiteDraftModel,
  type SiteDraft,
} from "@/models/site-draft.model";
import {
  cloneDefaultSiteTemplate,
  SiteModel,
  type Site,
} from "@/models/site.model";
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
  publishedAt?: Date | null;
  publishedFromDraftUpdatedAt?: Date | null;
};

export type SiteDraftRecord = SiteDraft & {
  _id: mongoose.Types.ObjectId;
  hasUnpublishedChanges: boolean;
  lastSavedAt?: Date | null;
  updatedAt?: Date;
};

export type SiteStatus = "draft" | "published";

export type SitePublishStatus = {
  status: SiteStatus;
  hasUnpublishedChanges: boolean;
  publishedAt: string | null;
  lastSavedAt: string | null;
};

type LegacySiteDoc = Partial<SiteRecord> & {
  _id: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId | string;
  colors?: SiteTemplateSettings["colors"];
  fontFamily?: string;
  settings?: Partial<SiteTemplateSettings> & { fontFamily?: string };
  media?: SiteTemplateMedia[];
  blocks?: SiteBlock[];
  templateId?: string;
  publishedAt?: Date | null;
};

function isCompleteSite(site: LegacySiteDoc | null): site is SiteRecord {
  return Boolean(
    site?.settings?.colors &&
      site.settings.fonts?.header &&
      site.settings.fonts?.body &&
      typeof site.settings.fonts.useHeaderAsBody === "boolean" &&
      Array.isArray(site.media) &&
      Array.isArray(site.blocks),
  );
}

function isCompleteDraft(
  draft: SiteDraftRecord | null,
): draft is SiteDraftRecord {
  return Boolean(
    draft?.settings?.colors &&
      draft.settings.fonts?.header &&
      draft.settings.fonts?.body &&
      typeof draft.settings.fonts.useHeaderAsBody === "boolean" &&
      Array.isArray(draft.media) &&
      Array.isArray(draft.blocks),
  );
}

function toIso(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function buildSitePublishStatus(
  site: Pick<SiteRecord, "publishedAt"> | null | undefined,
  draft: Pick<SiteDraftRecord, "hasUnpublishedChanges" | "lastSavedAt"> | null | undefined,
): SitePublishStatus {
  const publishedAt = toIso(site?.publishedAt);
  return {
    status: publishedAt ? "published" : "draft",
    hasUnpublishedChanges: Boolean(draft?.hasUnpublishedChanges),
    publishedAt,
    lastSavedAt: toIso(draft?.lastSavedAt),
  };
}

function normalizeContent(input: {
  templateId?: string;
  settings: SiteTemplateSettings;
  media: SiteTemplateMedia[];
  blocks: SiteBlock[];
}) {
  return {
    templateId: input.templateId?.trim() || "default",
    settings: normalizeSiteSettings(input.settings),
    media: input.media.map((item) => ({
      id: item.id.trim(),
      url: item.url.trim(),
    })),
    blocks: input.blocks,
  };
}

export async function findSiteByRestaurantId(restaurantId: string) {
  await connectDB();
  return SiteModel.findOne({
    restaurantId,
    deletedAt: null,
  }).lean<LegacySiteDoc>();
}

/** Live public site only — requires a successful publish. */
export async function findPublishedSiteByRestaurantId(restaurantId: string) {
  await connectDB();
  return SiteModel.findOne({
    restaurantId,
    deletedAt: null,
    publishedAt: { $ne: null },
  }).lean<SiteRecord>();
}

export async function findSiteDraftByRestaurantId(restaurantId: string) {
  await connectDB();
  return SiteDraftModel.findOne({
    restaurantId,
    deletedAt: null,
  }).lean<SiteDraftRecord>();
}

/** Returns existing published site or creates/migrates one from the default template. */
export async function getOrCreateSiteForRestaurant(
  restaurantId: string,
): Promise<SiteRecord> {
  await connectDB();

  const existing = await findSiteByRestaurantId(restaurantId);
  if (isCompleteSite(existing)) {
    return existing;
  }

  const template = cloneDefaultSiteTemplate();
  const settings = normalizeSiteSettings(
    {
      ...(existing?.settings ?? {}),
      ...(existing?.colors ? { colors: existing.colors } : {}),
      ...(existing?.fontFamily ? { fontFamily: existing.fontFamily } : {}),
      ...(existing?.settings?.fontFamily
        ? { fontFamily: existing.settings.fontFamily }
        : {}),
    },
    template.settings,
  );

  const media =
    existing?.media?.length &&
    existing.media.every((item) => item?.id && item?.url)
      ? existing.media
      : template.media;

  const blocks =
    existing?.blocks?.length &&
    existing.blocks.every((item) => item?.id && item?.type)
      ? existing.blocks
      : template.blocks;

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
        "settings.fontFamily": 1,
      },
      $setOnInsert: {
        restaurantId,
        deletedAt: null,
        publishedAt: null,
        publishedFromDraftUpdatedAt: null,
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

/** Editor working copy: existing draft, or seed from published site / default. */
export async function getOrCreateSiteDraftForRestaurant(
  restaurantId: string,
): Promise<{
  draft: SiteDraftRecord;
  site: SiteRecord;
  status: SitePublishStatus;
}> {
  await connectDB();

  const site = await getOrCreateSiteForRestaurant(restaurantId);
  const existingDraft = await findSiteDraftByRestaurantId(restaurantId);

  if (isCompleteDraft(existingDraft)) {
    return {
      draft: existingDraft,
      site,
      status: buildSitePublishStatus(site, existingDraft),
    };
  }

  const content = normalizeContent({
    templateId: site.templateId,
    settings: site.settings,
    media: site.media ?? [],
    blocks: (site.blocks ?? []) as SiteBlock[],
  });

  const draft = await SiteDraftModel.findOneAndUpdate(
    {
      restaurantId,
      deletedAt: null,
    },
    {
      $set: {
        ...content,
        hasUnpublishedChanges: !site.publishedAt,
        lastSavedAt: null,
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
  ).lean<SiteDraftRecord>();

  if (!draft || !isCompleteDraft(draft)) {
    throw new Error("Failed to create or migrate site draft");
  }

  return {
    draft,
    site,
    status: buildSitePublishStatus(site, draft),
  };
}

export async function saveSiteDraft(input: UpsertSiteInput) {
  await connectDB();

  const content = normalizeContent(input);
  const now = new Date();

  const draft = await SiteDraftModel.findOneAndUpdate(
    {
      restaurantId: input.restaurantId,
      deletedAt: null,
    },
    {
      $set: {
        ...content,
        hasUnpublishedChanges: true,
        lastSavedAt: now,
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
  ).lean<SiteDraftRecord>();

  const site = await findSiteByRestaurantId(input.restaurantId);

  return {
    draft,
    status: buildSitePublishStatus(site, draft),
  };
}

/** Copy draft into the published Site snapshot. */
export async function publishSiteDraft(restaurantId: string) {
  await connectDB();

  const draft = await findSiteDraftByRestaurantId(restaurantId);
  if (!draft || !isCompleteDraft(draft)) {
    throw new Error("Save a draft before publishing");
  }

  const content = normalizeContent({
    templateId: draft.templateId,
    settings: draft.settings,
    media: draft.media ?? [],
    blocks: (draft.blocks ?? []) as SiteBlock[],
  });

  const now = new Date();
  const draftUpdatedAt =
    draft.updatedAt instanceof Date ? draft.updatedAt : now;

  const site = await SiteModel.findOneAndUpdate(
    {
      restaurantId,
      deletedAt: null,
    },
    {
      $set: {
        ...content,
        publishedAt: now,
        publishedFromDraftUpdatedAt: draftUpdatedAt,
      },
      $unset: {
        colors: 1,
        fontFamily: 1,
        "settings.fontFamily": 1,
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
    },
  ).lean<SiteRecord>();

  const updatedDraft = await SiteDraftModel.findOneAndUpdate(
    {
      restaurantId,
      deletedAt: null,
    },
    {
      $set: {
        hasUnpublishedChanges: false,
      },
    },
    { new: true },
  ).lean<SiteDraftRecord>();

  return {
    site,
    draft: updatedDraft,
    status: buildSitePublishStatus(site, updatedDraft),
  };
}

/** @deprecated Prefer saveSiteDraft — kept for callers that still write Site directly. */
export async function upsertSite(input: UpsertSiteInput) {
  await connectDB();

  const content = normalizeContent(input);

  const site = await SiteModel.findOneAndUpdate(
    {
      restaurantId: input.restaurantId,
      deletedAt: null,
    },
    {
      $set: content,
      $unset: {
        colors: 1,
        fontFamily: 1,
        "settings.fontFamily": 1,
      },
      $setOnInsert: {
        restaurantId: input.restaurantId,
        deletedAt: null,
        publishedAt: null,
        publishedFromDraftUpdatedAt: null,
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

export function toSiteTemplate(site: SiteRecord | SiteDraftRecord): SiteTemplate {
  return {
    settings: normalizeSiteSettings(site.settings),
    media: site.media ?? [],
    blocks: (site.blocks ?? []) as SiteBlock[],
  };
}
