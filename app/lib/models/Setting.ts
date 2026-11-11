import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscountCode {
  code: string;
  discount_percent: number;
  description?: string;
  active: boolean;
}

export interface ISetting extends Document {
  key: string;
  site_title: string;
  announcement_bar: string;
  phone: string;
  whatsapp: string;
  email: string;
  office_address_pk: string;
  studio_address_pk: string;
  office_address_usa: string;
  phone_usa: string;
  stripe_public_key: string;
  currency: string;
  logo: string;
  estimated_delivery: string;
  store_info?: any;
  announcements: string[];
  navigation?: any;
  hero_slides?: any;
  shop_by_event?: any;
  account_page?: any;
  discount_codes: IDiscountCode[];
  currency_rates?: any;
  created_at?: Date;
  updated_at?: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, default: "site_config", unique: true, index: true },
    site_title: { type: String, default: "Sillhouete – Luxury Pakistani Designer Dresses" },
    announcement_bar: {
      type: String,
      default: "COMPLIMENTARY WORLDWIDE SHIPPING ON QUALIFYING ORDERS • BESPOKE BRIDAL COUTURE AVAILABLE",
    },
    phone: { type: String, default: "+92 331 0397865" },
    whatsapp: { type: String, default: "+92 331 0397865" },
    email: { type: String, default: "info@sillhouete.com" },
    office_address_pk: { type: String, default: "327-B, Street 7, Lane 15, Cavalry Ground, Lahore" },
    studio_address_pk: { type: String, default: "Sillhouete, Almas Tower, MM Alam Rd, Block T, Gulberg 2, Lahore" },
    office_address_usa: {
      type: String,
      default: "ADVENT BUSINESS CONSULTAX LLC, 18w100 22nd St, Ste 124, Oakbrook Terrace, IL, Zip Code 60181",
    },
    phone_usa: { type: String, default: "+1 217 2909383" },
    stripe_public_key: { type: String, default: "pk_test_51MockTestKeySillhouetePakistaniDressesPublic2026ForTestingOnly" },
    currency: { type: String, default: "PKR" },
    logo: { type: String, default: "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png?v=1744702089&width=220" },
    estimated_delivery: { type: String, default: "3 - 7 Business Days (Worldwide Couture Delivery)" },
    store_info: { type: Schema.Types.Mixed },
    announcements: { type: [String], default: [] },
    navigation: { type: Schema.Types.Mixed },
    hero_slides: { type: Schema.Types.Mixed },
    shop_by_event: { type: Schema.Types.Mixed },
    account_page: { type: Schema.Types.Mixed },
    discount_codes: {
      type: [
        {
          code: { type: String, required: true },
          discount_percent: { type: Number, required: true },
          description: { type: String, default: "" },
          active: { type: Boolean, default: true },
        },
      ],
      default: [
        { code: "SILLHOUETE10", discount_percent: 10, description: "10% Welcome Discount", active: true },
        { code: "WELCOME10", discount_percent: 10, description: "10% Welcome Discount", active: true },
        { code: "BRIDAL20", discount_percent: 20, description: "20% Bridal Discount", active: true },
      ],
    },
    currency_rates: {
      type: Schema.Types.Mixed,
      default: {
        PKR: { symbol: "Rs.", rate: 1, prefix: true },
        USD: { symbol: "$", rate: 0.0036, prefix: true },
      },
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);

