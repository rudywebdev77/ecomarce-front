import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order } from "@/app/lib/db";

export const dynamic = "force-dynamic";

// GET /api/orders/track/lookup
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Please provide an Order ID, Email, or Phone number" }, { status: 400 });
    }

    const clean = query.trim();
    const num = parseInt(clean.replace(/[^0-9]/g, ""), 10);

    const orderConditions: any[] = [
      { id: new RegExp(`^${clean}$`, "i") },
      { id: new RegExp(`^SIL-${clean}$`, "i") },
    ];
    if (!isNaN(num)) {
      orderConditions.push({ order_number: num });
    }

    const singleOrder = await Order.findOne({ $or: orderConditions }).lean();

    if (singleOrder) {
      return NextResponse.json({
        type: "single",
        order: singleOrder,
        orders: [singleOrder],
      });
    }

    const customerOrders = await Order.find({
      $or: [
        { "customer.email": clean.toLowerCase() },
        { "customer.phone": new RegExp(clean.replace(/[^0-9+]/g, ""), "i") },
      ],
    })
      .sort({ created_at: -1 })
      .lean();

    if (customerOrders && customerOrders.length > 0) {
      return NextResponse.json({
        type: "list",
        order: customerOrders[0],
        orders: customerOrders,
      });
    }

    return NextResponse.json(
      {
        error: `No orders found matching "${clean}". Please check your Order ID (e.g. SIL-1034) or Email address.`,
      },
      { status: 404 }
    );
  } catch (err: any) {
    console.error("Error in order lookup:", err);
    return NextResponse.json({ error: "Failed to look up order" }, { status: 500 });
  }
}

