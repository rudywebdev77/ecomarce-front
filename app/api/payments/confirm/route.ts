import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order, Customer } from "@/app/lib/db";
import { parsePriceToNumber } from "@/app/lib/stripe";

// POST /api/payments/confirm
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      paymentIntentId,
      customer,
      items,
      subtotal,
      shipping_fee = 0,
      discount = 0,
      total,
      currency = "PKR",
      shipping_method = "Standard",
      notes = "",
    } = body;

    if (!customer || !customer.email || !items || items.length === 0) {
      return NextResponse.json({ error: "Incomplete order payload" }, { status: 400 });
    }

    // Determine next order number in MongoDB
    const highestOrder = await Order.findOne().sort({ order_number: -1 }).lean();
    const nextOrderNumber = highestOrder && highestOrder.order_number ? highestOrder.order_number + 1 : 1001;
    const orderId = `SIL-${nextOrderNumber}`;

    const newOrder = await Order.create({
      id: orderId,
      order_number: nextOrderNumber,
      customer: {
        first_name: customer.first_name,
        last_name: customer.last_name || "",
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone || "",
        address: customer.address || "",
        apartment: customer.apartment || "",
        city: customer.city || "",
        state: customer.state || "",
        postal_code: customer.postal_code || "",
        country: customer.country || "Pakistan",
      },
      items: items.map((it: any) => ({
        id: it.id || "",
        title: it.title || "",
        price: String(it.price || ""),
        raw_price: parsePriceToNumber(it.raw_price || it.price),
        quantity: it.quantity || 1,
        size: it.size || "M",
        selectedOptions: it.selectedOptions || {},
        image: it.image || "",
      })),
      subtotal: parsePriceToNumber(subtotal),
      shipping_fee: parsePriceToNumber(shipping_fee),
      discount: parsePriceToNumber(discount),
      total: parsePriceToNumber(total),
      currency,
      payment_method: "stripe",
      payment_status: "paid",
      stripe_payment_intent_id: paymentIntentId || `pi_direct_${Date.now()}`,
      order_status: "processing",
      shipping_method,
      tracking_number: "",
      notes,
    });

    // Update or insert Customer in MongoDB
    const custEmail = customer.email.toLowerCase().trim();
    const newCustId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await Customer.findOneAndUpdate(
      { email: custEmail },
      {
        $setOnInsert: { id: newCustId },
        $inc: { total_orders: 1, total_spent: Number(total) },
        $set: {
          first_name: customer.first_name,
          last_name: customer.last_name || "",
          phone: customer.phone || "",
          address: customer.address || "",
          city: customer.city || "",
          country: customer.country || "Pakistan",
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Payment confirmed and order placed successfully in MongoDB",
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error confirming payment in MongoDB:", err);
    return NextResponse.json({ error: "Failed to record order" }, { status: 500 });
  }
}

