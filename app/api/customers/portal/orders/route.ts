import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB, Customer, Order } from "@/app/lib/db";
import { JWT_SECRET } from "@/app/lib/auth";

// GET /api/customers/portal/orders (Get current logged in customer's live orders)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Please sign in to view your dashboard" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 }
      );
    }

    await connectDB();
    const cleanEmail = (decoded.email || "").toLowerCase().trim();

    const [customer, orders] = await Promise.all([
      Customer.findOne({ email: cleanEmail }).lean(),
      Order.find({ "customer.email": cleanEmail }).sort({ created_at: -1 }).lean(),
    ]);

    return NextResponse.json({
      customer: customer || {
        first_name: decoded.name ? decoded.name.split(" ")[0] : "Customer",
        last_name: decoded.name ? decoded.name.split(" ").slice(1).join(" ") : "",
        email: cleanEmail,
        total_orders: orders.length,
      },
      orders,
    });
  } catch (err: any) {
    console.error("Portal orders fetch error:", err);
    return NextResponse.json(
      { error: "Session expired. Please sign in again." },
      { status: 401 }
    );
  }
}

