import { NextRequest, NextResponse } from "next/server";
import { connectDB, Setting } from "@/app/lib/db";
import { getStripeInstance } from "@/app/lib/stripe";

// GET /api/payments/config
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const stripeInstance = getStripeInstance();
    const settingDoc = await Setting.findOne({ key: "site_config" }).lean();
    const publicKey =
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.STRIPE_PUBLIC_KEY ||
      settingDoc?.stripe_public_key ||
      "pk_test_51MockTestKeySillhouetePakistaniDressesPublic2026ForTestingOnly";

    return NextResponse.json({
      publishableKey: publicKey,
      isMock: !stripeInstance || publicKey.includes("MockTestKey"),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch payment config" }, { status: 500 });
  }
}

