import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  password?: string | null;
  plain_password?: string | null;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  reset_pin?: string | null;
  reset_pin_expires?: Date | null;
  total_orders?: number;
  total_spent?: number;
  created_at?: Date;
  updated_at?: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    id: {
      type: String,
      unique: true,
      index: true,
      default: () => `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    },
    first_name: { type: String, required: true },
    last_name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, default: null },
    plain_password: { type: String, default: null },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "Pakistan" },
    reset_pin: { type: String, default: null },
    reset_pin_expires: { type: Date, default: null },
    total_orders: { type: Number, default: 0 },
    total_spent: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

