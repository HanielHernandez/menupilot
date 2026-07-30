import mongoose, { InferSchemaType, Schema } from "mongoose";

export const MENU_IMAGE_STATUSES = [
  "uploaded",
  "processing",
  "extracted",
] as const;

export type MenuImageStatus = (typeof MENU_IMAGE_STATUSES)[number];

const MenuImageSchema = new Schema(
  {
    mediaId: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: MENU_IMAGE_STATUSES,
      default: "uploaded",
      required: true,
      index: true,
    },

    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
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

MenuImageSchema.index({ restaurantId: 1, status: 1 });

export type MenuImage = InferSchemaType<typeof MenuImageSchema>;

// Drop cached model so schema changes apply under HMR.
delete mongoose.models.MenuImage;

export const MenuImageModel = mongoose.model("MenuImage", MenuImageSchema);
