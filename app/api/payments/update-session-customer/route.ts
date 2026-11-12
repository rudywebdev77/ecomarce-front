import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order } from "@/app/lib/db";

// POST /api/payments/update-session-customer
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { sessionId, customer } = body;

    if (sessionId && customer) {
      const updates: Record<string, string> = {};
      const cleanEmail = (customer.email || "").toLowerCase().trim();
      const cleanFirst = (customer.first_name || "").trim();

      if (cleanFirst) updates["customer.first_name"] = cleanFirst;
      if (customer.last_name !== undefined) updates["customer.last_name"] = customer.last_name || "";
      if (cleanEmail) updates["customer.email"] = cleanEmail;
      if (customer.phone) updates["customer.phone"] = customer.phone;
      if (customer.address) updates["customer.address"] = customer.address;
      if (customer.apartment !== undefined) updates["customer.apartment"] = customer.apartment || "";
      if (customer.city) updates["customer.city"] = customer.city;
      if (customer.country) updates["customer.country"] = customer.country;

      if (Object.keys(updates).length > 0) {
        await Order.updateOne(
          { stripe_payment_intent_id: sessionId },
          { $set: updates }
        );
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
