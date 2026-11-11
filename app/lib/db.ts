import mongoose from "mongoose";
import dns from "dns";
import bcrypt from "bcryptjs";
import { Product } from "./models/Product";
import { Category } from "./models/Category";
import { Order } from "./models/Order";
import { Customer } from "./models/Customer";
import { Contact } from "./models/Contact";
import { Blog } from "./models/Blog";
import { Setting } from "./models/Setting";
import { Admin } from "./models/Admin";

// Setup DNS servers for reliable MongoDB SRV lookup
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in browser or edge
}

const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
const rawUri = (process.env.MONGODB_URI || "").trim().replace(/^["']|["']$/g, "");
const LOCAL_URI = "mongodb://127.0.0.1:27017/sillhouete_db";
const MONGODB_URI = rawUri || (isProduction ? "" : LOCAL_URI);

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isSeeded: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: GlobalMongoose | undefined;
}

let cached: GlobalMongoose = global.mongooseCache || {
  conn: null,
  promise: null,
  isSeeded: false,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

function sanitizeMongoUri(uri: string): string {
  if (!uri) return uri;
  try {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@([^@]+)$/);
    if (match) {
      const prefix = match[1];
      const user = match[2];
      const rawPass = match[3];
      const hostAndDb = match[4];
      const encodedPass = encodeURIComponent(decodeURIComponent(rawPass));
      return `${prefix}${user}:${encodedPass}@${hostAndDb}`;
    }
  } catch {}
  return uri;
}

async function autoSeedDefaults() {
  if (cached.isSeeded) return;
  try {
    // 1. Seed Admin if missing
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const passwordHash = bcrypt.hashSync("admin123", 10);
      await Admin.create({
        username: "admin",
        email: "admin@sillhouete.com",
        password: passwordHash,
        plain_password: "admin123",
        name: "Sillhouete Boutique Admin",
        role: "superadmin",
      });
      console.log("✓ Default admin seeded (admin@sillhouete.com / admin123)");
    }

    // 2. Seed Default Settings if missing
    const settingCount = await Setting.countDocuments({ key: "site_config" });
    if (settingCount === 0) {
      await Setting.create({
        key: "site_config",
        site_title: "Sillhouete – Luxury Pakistani Designer Dresses for Women Online",
        announcement_bar:
          "COMPLIMENTARY WORLDWIDE SHIPPING ON QUALIFYING ORDERS • BESPOKE BRIDAL COUTURE AVAILABLE",
        phone: "+92 331 0397865",
        whatsapp: "+92 331 0397865",
        email: "info@sillhouete.com",
        logo: "https://sillhouete.com/cdn/shop/files/sillhouete_logo_1.png?v=1744702089&width=220",
        estimated_delivery: "3 - 7 Business Days (Worldwide Couture Delivery)",
        account_page: {
          banner_subtitle: "Sillhouete Atelier • Customer Care",
          banner_title: "Customer Account & Orders",
          banner_description:
            "Sign in with the email you used while shopping, or create an account to view your live order tracking.",
          empty_orders_title: "No Shopping Orders Yet",
          empty_orders_description:
            "When you purchase any Pakistani designer dress from Sillhouete, its live tailoring and delivery status will appear here automatically.",
          empty_orders_btn_text: "Explore Bridal & Formal Collections",
          empty_orders_btn_link: "/collections/all",
          whatsapp_inquiry_template: "Hello Sillhouete Boutique, I want to inquire about my order {order_id}.",
          helpline_label: "Boutique Helpline",
          progression_steps: [
            { key: "confirmed", label: "Order Confirmed" },
            { key: "processing", label: "Artisan Tailoring & Handcrafting" },
            { key: "shipped", label: "Express Air Transit / Dispatched" },
            { key: "delivered", label: "Hand Delivered to Customer" },
          ],
        },
      });
      console.log("✓ Site config initialized in MongoDB");
    }

    cached.isSeeded = true;
  } catch (seedErr: any) {
    console.warn("⚠️ Auto-seed note:", seedErr.message);
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const primaryUri = sanitizeMongoUri(MONGODB_URI);

    if (!primaryUri) {
      throw new Error("MONGODB_URI is not set in environment variables");
    }

    const opts = {
      serverSelectionTimeoutMS: 15000,
      bufferCommands: false,
    };

    try {
      const dns = await import("node:dns");
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch {}

    cached.promise = mongoose
      .connect(primaryUri, opts)
      .then(async (m) => {
        console.log(`✓ MongoDB Connected Successfully to: ${m.connection.host}/${m.connection.name}`);
        await autoSeedDefaults();
        return m;
      })
      .catch(async (err) => {
        console.error("❌ Primary MongoDB Connection Error:", err.message);

        // Fallback to local MongoDB in development if available
        if (!isProduction && primaryUri !== LOCAL_URI) {
          console.warn("⚠️ Attempting fallback to local MongoDB (127.0.0.1:27017)...");
          try {
            const localM = await mongoose.connect(LOCAL_URI, {
              serverSelectionTimeoutMS: 5000,
              bufferCommands: false,
            });
            console.log("✓ Fallback Local MongoDB Connected Successfully");
            await autoSeedDefaults();
            return localM;
          } catch (localErr: any) {
            console.error("❌ Fallback MongoDB Connection Error:", localErr.message);
          }
        }
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export {
  Product,
  Category,
  Order,
  Customer,
  Contact,
  Blog,
  Setting,
  Admin,
};
