import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB, Customer, Order } from "@/app/lib/db";
import { JWT_SECRET } from "@/app/lib/auth";

// POST /api/customers/access-by-order-email
// Instant access for shoppers who made a purchase with an email
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Please enter the email address used during shopping." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const orders = await Order.find({ "customer.email": cleanEmail })
      .sort({ created_at: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        {
          error: `No shopping orders found for "${cleanEmail}". Please check your email or place an order first.`,
        },
        { status: 404 }
      );
    }

    let customer = await Customer.findOne({ email: cleanEmail });
    if (!customer) {
      const lastOrder = orders[0];
      customer = await Customer.create({
        first_name: lastOrder?.customer?.first_name || "Customer",
        last_name: lastOrder?.customer?.last_name || "",
        email: cleanEmail,
        phone: lastOrder?.customer?.phone || "",
        address: lastOrder?.customer?.address || "",
        city: lastOrder?.customer?.city || "",
        total_orders: orders.length,
        total_spent: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      });
    }

    const token = jwt.sign(
      {
        id: customer._id.toString(),
        email: customer.email,
        name: `${customer.first_name} ${customer.last_name}`.trim(),
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      message: "Shopping orders verified! Welcome to your customer dashboard.",
      token,
      customer: {
        id: customer._id.toString(),
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        total_orders: orders.length,
      },
      orders,
    });
  } catch (err: any) {
    console.error("Order email access error:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
