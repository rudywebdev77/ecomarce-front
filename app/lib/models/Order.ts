import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  id: string;
  title: string;
  price: string;
  raw_price: number;
  quantity: number;
  size: string;
  selectedOptions?: Record<string, any>;
  image?: string;
}

export interface ICustomerDetails {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface IOrder extends Document {
  id: string;
  order_number: number;
  customer: ICustomerDetails;
  items: IOrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  stripe_payment_intent_id?: string | null;
  order_status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  shipping_method: string;
  tracking_number?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    id: String,
    title: String,
    price: String,
    raw_price: Number,
    quantity: { type: Number, default: 1 },
    size: { type: String, default: "M" },
    selectedOptions: { type: Schema.Types.Mixed, default: {} },
    image: String,
  },
  { _id: false }
);

const CustomerDetailsSchema = new Schema<ICustomerDetails>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, default: "" },
    email: { type: String, required: true, index: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    apartment: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postal_code: { type: String, default: "" },
    country: { type: String, default: "Pakistan" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true, index: true },
    order_number: { type: Number, required: true, unique: true, index: true },
    customer: { type: CustomerDetailsSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping_fee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "PKR" },
    payment_method: { type: String, default: "stripe", index: true },
    payment_status: { type: String, default: "pending", index: true },
    stripe_payment_intent_id: { type: String, default: null },
    order_status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      index: true,
    },
    shipping_method: { type: String, default: "Standard" },
    tracking_number: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
