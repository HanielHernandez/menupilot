import mongoose, { InferSchemaType, Schema } from "mongoose";

const MenuItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
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

MenuItemSchema.index({ restaurantId: 1, categoryId: 1 });

export type MenuItem = InferSchemaType<typeof MenuItemSchema>;

export const MenuItemModel =
  mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
