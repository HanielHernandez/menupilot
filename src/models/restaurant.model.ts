import mongoose, { InferSchemaType, Schema } from "mongoose";

const RestaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    logoMediaId: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
      index: true,
    },

    address: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phoneNumber: {
      type: String,
      default: "",
    },

    whatsappNumber: {
      type: String,
      default: "",
    },

    socials: {
      facebook: {
        type: String,
        default: "",
      },

      instagram: {
        type: String,
        default: "",
      },

      tiktok: {
        type: String,
        default: "",
      },

      x: {
        type: String,
        default: "",
      },

      youtube: {
        type: String,
        default: "",
      },

      website: {
        type: String,
        default: "",
      },
    },

    ownerId: {
      type: String,
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

export type Restaurant = InferSchemaType<typeof RestaurantSchema>;

export const RestaurantModel =
  mongoose.models.Restaurant || mongoose.model("Restaurant", RestaurantSchema);
