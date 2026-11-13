import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order } from "@/app/lib/db";
import { getStripeInstance } from "@/app/lib/stripe";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// POST /api/orders/[id]/cancel-and-refund
export async function POST(req: NextRequest, { params }: RouteProps) {
  try {
    await connectDB();
    const { id } = await params;
    const num = parseInt(id, 10);

    const conditions: any[] = [{ id }];
    if (!isNaN(num)) conditions.push({ order_number: num });
    if (id.match(/^[0-9a-fA-F]{24}$/)) conditions.push({ _id: id });

    const order = await Order.findOne({ $or: conditions });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.order_status === "cancelled" && order.payment_status === "refunded") {
      return NextResponse.json({
        success: true,
        message: `Order ${order.id} is already cancelled and refunded.`,
        order,
      });
    }

    // Orders that are already shipped, dispatched, or delivered cannot be cancelled directly
    const shippedStatuses = ["shipped", "dispatched", "in_transit", "delivered"];
    if (shippedStatuses.includes((order.order_status || "").toLowerCase())) {
      return NextResponse.json(
        {
          error: `Order ${order.id} has already been dispatched/shipped and cannot be cancelled automatically. Please contact customer care.`,
          isShipped: true,
          redirectTo: `/pages/contact-us?orderId=${encodeURIComponent(order.id)}&reason=cancellation`,
        },
        { status: 400 }
      );
    }

    let refundMessage = "";

    // Process Stripe refund if paid via Stripe
    if (order.payment_method === "stripe" && order.stripe_payment_intent_id) {
      const stripe = getStripeInstance();
      if (stripe) {
        const identifier = order.stripe_payment_intent_id;
        try {
          let paymentIntentId = "";

          if (identifier.startsWith("cs_")) {
            // Retrieve checkout session to get payment_intent
            const session = await stripe.checkout.sessions.retrieve(identifier);
            if (typeof session.payment_intent === "string") {
              paymentIntentId = session.payment_intent;
            } else if (session.payment_intent && (session.payment_intent as any).id) {
              paymentIntentId = (session.payment_intent as any).id;
            }
          } else if (identifier.startsWith("pi_")) {
            paymentIntentId = identifier;
          }

          if (paymentIntentId) {
            const refund = await stripe.refunds.create({
              payment_intent: paymentIntentId,
            });
            refundMessage = `Stripe refund issued successfully (${refund.id}).`;
          } else if (identifier.startsWith("ch_")) {
            const refund = await stripe.refunds.create({
              charge: identifier,
            });
            refundMessage = `Stripe refund issued successfully (${refund.id}).`;
          } else {
            refundMessage = "Stripe payment intent was not captured or session was pending.";
          }
        } catch (stripeErr: any) {
          console.warn("Stripe refund notice:", stripeErr.message);
          if (stripeErr.message?.includes("already been refunded")) {
            refundMessage = "Payment was already refunded on Stripe.";
          } else {
            refundMessage = `Stripe notice: ${stripeErr.message}`;
          }
        }
      } else {
        refundMessage = "Stripe instance not configured, order marked as cancelled in store.";
      }
    } else {
      refundMessage = `Order marked as cancelled (${order.payment_method || "COD"}).`;
    }

    // Update order status in MongoDB
    order.order_status = "cancelled";
    order.payment_status = "refunded";
    const cancellationNote = `[Cancelled & Refunded on ${new Date().toISOString()}] ${refundMessage}`;
    order.notes = order.notes ? `${order.notes}\n${cancellationNote}` : cancellationNote;
    await order.save();

    return NextResponse.json({
      success: true,
      message: `Order ${order.id} has been cancelled and your payment of Rs.${Number(order.total || 0).toLocaleString()} has been refunded.`,
      order,
    });
  } catch (err: any) {
    console.error("Error cancelling order and issuing refund:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel order and process refund" },
      { status: 500 }
    );
  }
}

