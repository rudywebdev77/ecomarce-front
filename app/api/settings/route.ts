import { NextRequest, NextResponse } from "next/server";
import { connectDB, Setting } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/settings
export async function GET() {
  try {
    await connectDB();
    let settingDoc = await Setting.findOne({ key: "site_config" }).lean();

    if (!settingDoc) {
      settingDoc = await Setting.create({
        key: "site_config",
        site_title: "Sillhouete – Luxury Pakistani Designer Dresses",
        announcement_bar:
          "COMPLIMENTARY WORLDWIDE SHIPPING ON QUALIFYING ORDERS • BESPOKE BRIDAL COUTURE AVAILABLE",
        phone: "+92 331 0397865",
        whatsapp: "+92 331 0397865",
        email: "info@sillhouete.com",
        office_address_pk: "327-B, Street 7, Lane 15, Cavalry Ground, Lahore",
        studio_address_pk: "Sillhouete, Almas Tower, MM Alam Rd, Block T, Gulberg 2, Lahore",
        office_address_usa:
          "ADVENT BUSINESS CONSULTAX LLC, 18w100 22nd St, Ste 124, Oakbrook Terrace, IL, Zip Code 60181",
        phone_usa: "+1 217 2909383",
        stripe_public_key:
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
          "pk_test_51MockTestKeySillhouetePakistaniDressesPublic2026ForTestingOnly",
        currency: "PKR",
        discount_codes: [
          { code: "SILLHOUETE10", discount_percent: 10, description: "10% Welcome Discount", active: true },
          { code: "WELCOME10", discount_percent: 10, description: "10% Welcome Discount", active: true },
          { code: "BRIDAL20", discount_percent: 20, description: "20% Bridal Discount", active: true },
        ],
      });
    }

    return NextResponse.json({ settings: settingDoc });
  } catch (err: any) {
    console.error("Error fetching settings:", err);
    return NextResponse.json({ error: "Failed to retrieve settings" }, { status: 500 });
  }
}

// PUT /api/settings (Admin)
export async function PUT(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();
    const body = await req.json();

    const updated = await Setting.findOneAndUpdate(
      { key: "site_config" },
      { $set: body },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: "Settings updated successfully in MongoDB",
      settings: updated,
    });
  } catch (err: any) {
    console.error("Error updating settings:", err);
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}

