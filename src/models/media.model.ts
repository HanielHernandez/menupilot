import mongoose, { InferSchemaType, Schema } from "mongoose";

const MediaSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
      index: true,
    },

    userId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },

    weight: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    size: {
      type: Number,
      default: null,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    key: {
      type: String,
      required: true,
      trim: true,
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

MediaSchema.pre("validate", function () {
  if (!this.restaurantId && !this.userId) {
    throw new Error("Media must have a restaurantId or userId");
  }
});

MediaSchema.index({ restaurantId: 1, weight: 1 });
MediaSchema.index({ userId: 1, weight: 1 });

export type Media = InferSchemaType<typeof MediaSchema>;

// Drop cached model so schema/middleware changes apply under HMR.
delete mongoose.models.Media;

export const MediaModel = mongoose.model("Media", MediaSchema);
