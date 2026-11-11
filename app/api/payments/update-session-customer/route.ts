import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order } from "@/app/lib/db";

// POST /api/payments/update-session-customer
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { sessionId, customer } = body;

    if (sessionId && customer) {
      await Order.updateOne(
        { stripe_payment_intent_id: sessionId },
        {
          $set: {
            "customer.first_name": customer.first_name || "Customer",
            "customer.last_name": customer.last_name || "",
            "customer.email": (customer.email || "").toLowerCase().trim(),
            "customer.phone": customer.phone || "",
            "customer.address": customer.address || "",
            "customer.apartment": customer.apartment || "",
            "customer.city": customer.city || "",
            "customer.country": customer.country || "Pakistan",
          },
        }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

