import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB, Customer, Order } from "@/app/lib/db";
import { JWT_SECRET } from "@/app/lib/auth";

// POST /api/customers/register (New Customer Sign Up)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { first_name, last_name = "", email, password, phone = "", address = "", city = "" } = body;

    if (!first_name || !email || !password) {
      return NextResponse.json(
        { error: "First name, email, and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let customer = await Customer.findOne({ email: cleanEmail });

    const passwordHash = bcrypt.hashSync(password, 10);

    if (customer) {
      if (customer.password) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please Sign In." },
          { status: 409 }
        );
      }
      customer.first_name = first_name.trim();
      customer.last_name = last_name.trim();
      customer.password = passwordHash;
      customer.plain_password = password;
      if (phone) customer.phone = phone;
      if (address) customer.address = address;
      if (city) customer.city = city;
      await customer.save();
    } else {
      customer = await Customer.create({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: cleanEmail,
        password: passwordHash,
        plain_password: password,
        phone,
        address,
        city,
        country: "Pakistan",
      });
    }

    // Pull past shopping orders placed with this email
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

    return NextResponse.json(
      {
        message: "Account created successfully! Welcome to your Sillhouete Customer Dashboard.",
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
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Customer registration error:", err);
    return NextResponse.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}

