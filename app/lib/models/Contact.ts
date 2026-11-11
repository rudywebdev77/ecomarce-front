import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied";
  reply?: string;
  replied_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    id: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "General Store Inquiry" },
    message: { type: String, required: true },
    status: {
      type: String,
      default: "new",
      enum: ["new", "read", "replied"],
      index: true,
    },
    reply: { type: String, default: "" },
    replied_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

