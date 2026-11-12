import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order } from "@/app/lib/db";
import { getStripeInstance } from "@/app/lib/stripe";

export const dynamic = "force-dynamic";

// POST /api/payments/sync-session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, orderId } = body;

    if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return NextResponse.json({ synced: false });
    }

    const stripe = getStripeInstance();
    if (!stripe) {
      return NextResponse.json({ synced: false });
    }

    await connectDB();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const details = session?.customer_details;
    const stripeEmail = (details?.email || "").toLowerCase().trim();

    if (!stripeEmail) {
      return NextResponse.json({ synced: false });
    }

    const query = orderId
      ? { $or: [{ stripe_payment_intent_id: sessionId }, { id: orderId }] }
      : { stripe_payment_intent_id: sessionId };

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json({ synced: false });
    }

    const currentEmail = (order.customer?.email || "").toLowerCase().trim();
    const isMissingEmail = !currentEmail || currentEmail === "guest@sillhouete.com";

    if (isMissingEmail) {
      order.customer.email = stripeEmail;
    }

    if ((!order.customer?.first_name || order.customer.first_name === "Customer") && details?.name) {
      const parts = details.name.trim().split(/\s+/);
      order.customer.first_name = parts[0] || "Customer";
      if (!order.customer.last_name && parts.length > 1) {
        order.customer.last_name = parts.slice(1).join(" ");
      }
    }

    if (!order.customer?.phone && details?.phone) {
      order.customer.phone = details.phone;
    }
    if (!order.customer?.address && details?.address?.line1) {
      order.customer.address = details.address.line1;
    }
    if (!order.customer?.city && details?.address?.city) {
      order.customer.city = details.address.city;
    }

    if (session.payment_status === "paid") {
      order.payment_status = "paid";
    }

    await order.save();
    return NextResponse.json({ synced: true, email: order.customer.email });
  } catch (err: any) {
    console.warn("sync-session notice:", err.message);
    return NextResponse.json({ synced: false });
  }
}
