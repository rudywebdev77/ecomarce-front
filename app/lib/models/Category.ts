import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  parent_name: string | null;
  description: string;
  image: string;
  display_order: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: {
      type: String,
      unique: true,
      index: true,
      default: () => `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    parent_id: {
      type: String,
      default: null,
      index: true,
    },
    parent_name: {
      type: String,
      default: null,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    display_order: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
