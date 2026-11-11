import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
  id?: string;
  title: string;
  handle: string;
  author: string;
  excerpt: string;
  content: string;
  featured_image: string;
  tags: string[];
  published: boolean;
  published_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    id: { type: String, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    handle: { type: String, required: true, unique: true, index: true },
    author: { type: String, default: "Sillhouete Editorial" },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    featured_image: { type: String, default: "" },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: true, index: true },
    published_at: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
