import type {
  SiteBlock,
  SiteTemplateMedia,
  SiteTemplateSettings,
} from "@/lib/site-template";
import {
  SiteBlockSchema,
  SiteMediaSchema,
  SiteSettingsSchema,
} from "@/models/site.model";
import mongoose, { InferSchemaType, Schema } from "mongoose";

const SiteDraftSchema = new Schema(
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

    hasUnpublishedChanges: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },

    lastSavedAt: {
      type: Date,
      default: null,
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

export type SiteDraft = InferSchemaType<typeof SiteDraftSchema> & {
  settings: SiteTemplateSettings;
  media: SiteTemplateMedia[];
  blocks: SiteBlock[];
};

const SITE_DRAFT_MODEL_NAME = "SiteDraft";
const SITE_DRAFT_COLLECTION = "site_drafts";

if (mongoose.models[SITE_DRAFT_MODEL_NAME]) {
  delete mongoose.models[SITE_DRAFT_MODEL_NAME];
}

export const SiteDraftModel = mongoose.model(
  SITE_DRAFT_MODEL_NAME,
  SiteDraftSchema,
  SITE_DRAFT_COLLECTION,
);
