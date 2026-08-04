import {
  USAGE_EVENT_TYPES,
  type UsageEventType,
} from "@/lib/usage-limits";
import mongoose, { InferSchemaType, Schema } from "mongoose";

const UsageEventSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: USAGE_EVENT_TYPES,
      index: true,
    },

    /** UTC day key YYYY-MM-DD for daily quotas. */
    dayKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    meta: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

UsageEventSchema.index({ restaurantId: 1, type: 1, dayKey: 1 });

export type UsageEvent = InferSchemaType<typeof UsageEventSchema> & {
  type: UsageEventType;
};

if (mongoose.models.UsageEvent) {
  delete mongoose.models.UsageEvent;
}

export const UsageEventModel = mongoose.model("UsageEvent", UsageEventSchema);
