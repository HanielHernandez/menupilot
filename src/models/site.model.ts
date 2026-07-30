import {
  DEFAULT_SITE_TEMPLATE,
  SITE_BLOCK_TYPES,
  type SiteBlock,
  type SiteTemplate,
  type SiteTemplateMedia,
  type SiteTemplateSettings,
} from "@/lib/site-template";
import mongoose, { InferSchemaType, Schema } from "mongoose";

export { SITE_BLOCK_TYPES };

const SiteColorsSchema = new Schema(
  {
    primary: { type: String, required: true, trim: true },
    secondary: { type: String, required: true, trim: true },
    accent: { type: String, required: true, trim: true },
    background: { type: String, required: true, trim: true },
    foreground: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const SiteSettingsSchema = new Schema(
  {
    colors: { type: SiteColorsSchema, required: true },
    fontFamily: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const SiteMediaSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

/** Discriminated block payload; extra fields vary by `type`. */
const SiteBlockSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: SITE_BLOCK_TYPES,
    },
  },
  {
    _id: false,
    strict: false,
  },
);

const SiteSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true,
      index: true,
    },

    templateId: {
      type: String,
      required: true,
      default: "default",
      trim: true,
      index: true,
    },

    settings: {
      type: SiteSettingsSchema,
      required: true,
    },

    media: {
      type: [SiteMediaSchema],
      default: [],
    },

    blocks: {
      type: [SiteBlockSchema],
      default: [],
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type Site = InferSchemaType<typeof SiteSchema> & {
  settings: SiteTemplateSettings;
  media: SiteTemplateMedia[];
  blocks: SiteBlock[];
};

export type SiteSettings = SiteTemplateSettings;
export type SiteMedia = SiteTemplateMedia;
export type { SiteBlock, SiteTemplate };

/**
 * Use a fresh model name so Turbopack/dev can't keep a stale `Site` schema
 * (old top-level colors/fontFamily) while still writing to the `sites` collection.
 */
const SITE_MODEL_NAME = "RestaurantSite";
const SITE_COLLECTION = "sites";

if (mongoose.models[SITE_MODEL_NAME]) {
  delete mongoose.models[SITE_MODEL_NAME];
}
if (mongoose.models.Site) {
  delete mongoose.models.Site;
}

export const SiteModel = mongoose.model(
  SITE_MODEL_NAME,
  SiteSchema,
  SITE_COLLECTION,
);

export function cloneDefaultSiteTemplate(): SiteTemplate {
  return structuredClone(DEFAULT_SITE_TEMPLATE);
}
