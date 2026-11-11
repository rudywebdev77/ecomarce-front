import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  plain_password?: string;
  name?: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    plain_password: { type: String, default: "admin123" },
    name: { type: String, default: "Sillhouete Boutique Admin" },
    role: { type: String, default: "superadmin" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

