import mongoose, { InferSchemaType, Schema } from "mongoose";

const CategorySchema = new Schema(
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

CategorySchema.index(
  { restaurantId: 1, name: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);

export type Category = InferSchemaType<typeof CategorySchema>;

export const CategoryModel =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
