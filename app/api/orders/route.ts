import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order, Customer } from "@/app/lib/db";

export const dynamic = "force-dynamic";

function parsePriceToNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let s = String(val).trim();
  s = s.replace(/^(Rs\.?|PKR|USD|\$|£|€|CAD\s*\$)\s*/i, "").trim();
  s = s.replace(/,/g, "");
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return 0;
  const n = parseFloat(m[0]);
  return isNaN(n) ? 0 : n;
}

// GET /api/orders
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const payment_status = searchParams.get("payment_status");
    const search = searchParams.get("search");
    const pageParam = searchParams.get("page") || "1";
    const limitParam = searchParams.get("limit") || "50";

    const query: Record<string, any> = {};

    if (status && status !== "all") {
      query.order_status = status;
    }

    if (payment_status && payment_status !== "all") {
      query.payment_status = payment_status;
    }

    if (search) {
      const q = search.trim();
      const num = parseInt(q, 10);
      const searchConditions: any[] = [
        { id: new RegExp(q, "i") },
        { "customer.email": new RegExp(q, "i") },
        { "customer.first_name": new RegExp(q, "i") },
        { "customer.last_name": new RegExp(q, "i") },
        { tracking_number: new RegExp(q, "i") },
      ];
      if (!isNaN(num)) {
        searchConditions.push({ order_number: num });
      }
      query.$or = searchConditions;
    }

    const p = Math.max(1, parseInt(pageParam, 10));
    const l = Math.max(1, parseInt(limitParam, 10));
    const skip = (p - 1) * l;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ created_at: -1 }).skip(skip).limit(l).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    });
  } catch (err: any) {
    console.error("Error fetching orders:", err);
    return NextResponse.json({ error: "Failed to retrieve orders" }, { status: 500 });
  }
}

// POST /api/orders (Public Checkout)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      customer,
      items,
      subtotal,
      shipping_fee = 0,
      discount = 0,
      total,
      currency = "PKR",
      payment_method = "stripe",
      payment_status = "pending",
      stripe_payment_intent_id = null,
      shipping_method = "Standard",
      notes = "",
    } = body;

    if (!customer || !customer.email || !customer.first_name) {
      return NextResponse.json({ error: "Customer information is required" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const highestOrder = await Order.findOne().sort({ order_number: -1 }).lean();
    const nextOrderNumber = highestOrder && highestOrder.order_number ? highestOrder.order_number + 1 : 1001;
    const orderId = `SIL-${nextOrderNumber}`;

    const calcSubtotal =
      parsePriceToNumber(subtotal) ||
      items.reduce((sum: number, item: any) => sum + parsePriceToNumber(item.raw_price || item.price) * (item.quantity || 1), 0);
    const numShippingFee = parsePriceToNumber(shipping_fee);
    const numDiscount = parsePriceToNumber(discount);
    const calcTotal = parsePriceToNumber(total) || Math.max(0, calcSubtotal + numShippingFee - numDiscount);

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
      subtotal: calcSubtotal,
      shipping_fee: numShippingFee,
      discount: numDiscount,
      total: calcTotal,
      currency,
      payment_method,
      payment_status,
      stripe_payment_intent_id,
      order_status: payment_status === "paid" ? "processing" : "pending",
      shipping_method,
      tracking_number: "",
      notes,
    });

    // Sync Customer in MongoDB
    const custEmail = customer.email.toLowerCase().trim();
    const newCustId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await Customer.findOneAndUpdate(
      { email: custEmail },
      {
        $setOnInsert: { id: newCustId },
        $inc: { total_orders: 1, total_spent: Number(calcTotal) },
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
        message: "Order created successfully in MongoDB",
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating order:", err);
    return NextResponse.json({ error: err.message || "Failed to place order" }, { status: 500 });
  }
}

