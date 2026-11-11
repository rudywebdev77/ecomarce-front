import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB, Customer, Order } from "@/app/lib/db";
import { JWT_SECRET } from "@/app/lib/auth";

// POST /api/customers/reset-password (Verify PIN and set new password)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, pin, new_password } = body;

    if (!email || !pin || !new_password) {
      return NextResponse.json(
        { error: "Email, 6-digit PIN, and new password are required" },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: cleanEmail });

    if (!customer) {
      return NextResponse.json({ error: "Customer account not found." }, { status: 404 });
    }

    if (!customer.reset_pin || customer.reset_pin !== pin.trim()) {
      return NextResponse.json(
        { error: "Invalid 6-digit PIN code. Please verify the code sent to your email." },
        { status: 400 }
      );
    }

    if (!customer.reset_pin_expires || new Date() > new Date(customer.reset_pin_expires)) {
      return NextResponse.json(
        { error: "This PIN code has expired. Please request a new PIN." },
        { status: 400 }
      );
    }

    // Hash and store the new password
    customer.password = bcrypt.hashSync(new_password, 10);
    customer.plain_password = new_password;
    customer.reset_pin = null;
    customer.reset_pin_expires = null;
    await customer.save();

    const orders = await Order.find({ "customer.email": cleanEmail })
      .sort({ created_at: -1 })
      .lean();

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
      message: "Your password has been successfully reset! Welcome to your customer portal.",
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
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}

