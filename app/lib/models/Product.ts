import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVariant {
  id: string;
  title: string;
  price: number;
  compare_at_price?: number | null;
  sku?: string;
  inventory_quantity?: number;
}

export interface IProduct extends Document {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  product_type: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  images: string[];
  video_url: string;
  fabric: string;
  color: string;
  pieces: string;
  dress_style: string;
  work_details: string;
  delivery_time: string;
  care_instructions: string;
  variants: IVariant[];
  sizes: string[];
  tags: string[];
  in_stock: boolean;
  is_new: boolean;
  is_sale: boolean;
  is_featured: boolean;
  created_at?: Date;
  updated_at?: Date;
}

const VariantSchema = new Schema<IVariant>(
  {
    id: String,
    title: { type: String, default: "Standard" },
    price: { type: Number, required: true },
    compare_at_price: { type: Number, default: null },
    sku: String,
    inventory_quantity: { type: Number, default: 10 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    handle: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    vendor: { type: String, default: "Sillhouete" },
    product_type: { type: String, default: "Luxury Pret", index: true },
    category: { type: String, default: "Luxury Pret", index: true },
    price: { type: Number, required: true },
    compare_at_price: { type: Number, default: null },
    currency: { type: String, default: "PKR" },
    images: { type: [String], default: [] },
    video_url: { type: String, default: "" },
    fabric: { type: String, default: "" },
    color: { type: String, default: "" },
    pieces: { type: String, default: "3-Piece (Shirt, Dupatta & Trouser)" },
    dress_style: { type: String, default: "" },
    work_details: { type: String, default: "" },
    delivery_time: { type: String, default: "Ready to Dispatch (3-5 business days)" },
    care_instructions: { type: String, default: "Dry Clean Only" },
    variants: { type: [VariantSchema], default: [] },
    sizes: { type: [String], default: ["XS", "S", "M", "L", "XL", "Custom Size"] },
    tags: { type: [String], default: [], index: true },
    in_stock: { type: Boolean, default: true },
    is_new: { type: Boolean, default: false },
    is_sale: { type: Boolean, default: false },
    is_featured: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

ProductSchema.index({ title: "text", description: "text", handle: "text", tags: "text" });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
