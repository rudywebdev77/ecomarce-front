import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order } from "@/app/lib/db";
import { parsePriceToNumber, getStripeInstance } from "@/app/lib/stripe";

// POST /api/payments/create-checkout-session
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      amount,
      currency = "pkr",
      customer,
      items,
      subtotal,
      shipping_fee = 0,
      discount = 0,
      total,
      shipping_method = "Standard Free Delivery",
      notes = "",
    } = body;

    const stripeInstance = getStripeInstance();
    if (!stripeInstance) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const totalAmount = Number(amount || total) || 31500;
    const amountInCents = Math.round(totalAmount * 100);
    const curr = (currency || "pkr").toLowerCase();

    // Determine next order number in MongoDB
    const highestOrder = await Order.findOne().sort({ order_number: -1 }).lean();
    const nextOrderNumber = highestOrder && highestOrder.order_number ? highestOrder.order_number + 1 : 1001;
    const orderId = `SIL-${nextOrderNumber}`;

    const newOrder = await Order.create({
      id: orderId,
      order_number: nextOrderNumber,
      customer: {
        first_name: customer?.first_name || "Customer",
        last_name: customer?.last_name || "",
        email: (customer?.email || "guest@sillhouete.com").toLowerCase().trim(),
        phone: customer?.phone || "",
        address: customer?.address || "",
        apartment: customer?.apartment || "",
        city: customer?.city || "",
        state: customer?.state || "",
        postal_code: customer?.postal_code || "",
        country: customer?.country || "Pakistan",
      },
      items: (items || []).map((it: any) => ({
        id: it.id || "",
        title: it.title || "",
        price: String(it.price || ""),
        raw_price: parsePriceToNumber(it.raw_price || it.price),
        quantity: it.quantity || 1,
        size: it.size || "M",
        selectedOptions: it.selectedOptions || {},
        image: it.image || "",
      })),
      subtotal: parsePriceToNumber(subtotal || totalAmount),
      shipping_fee: parsePriceToNumber(shipping_fee),
      discount: parsePriceToNumber(discount),
      total: totalAmount,
      currency: curr.toUpperCase(),
      payment_method: "stripe",
      payment_status: "paid",
      stripe_payment_intent_id: `cs_${Date.now()}`,
      order_status: "processing",
      shipping_method,
      tracking_number: "",
      notes,
    });

    const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";
    const successReturnUrl = `${origin}/order-success?orderId=${newOrder.id}&number=${newOrder.order_number}&email=${encodeURIComponent(customer?.email || "")}&total=${totalAmount}&method=stripe&session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripeInstance.checkout.sessions.create({
      mode: "payment",
      ui_mode: "form" as any,
      line_items: [
        {
          price_data: {
            currency: curr,
            product_data: {
              name: items?.[0]?.title ? `${items[0].title} - Sillhouete Atelier` : "Sillhouete Boutique Order",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      submit_type: "auto",
      return_url: successReturnUrl,
    });

    // Link actual Stripe session id with order
    await Order.updateOne({ id: orderId }, { stripe_payment_intent_id: session.id });

    return NextResponse.json({
      client_secret: session.client_secret,
      sessionId: session.id,
      url: session.url,
      order: newOrder,
    });
  } catch (err: any) {
    console.error("Error in create-checkout-session:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initialize Stripe checkout session" },
      { status: 500 }
    );
  }
}
