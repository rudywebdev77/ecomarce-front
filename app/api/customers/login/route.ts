import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB, Customer, Order } from "@/app/lib/db";
import { JWT_SECRET } from "@/app/lib/auth";

// POST /api/customers/login (Sign In via Password OR Shopped Email)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Please enter your email address" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let customer = await Customer.findOne({ email: cleanEmail });

    // Fetch all orders placed with this email
    const orders = await Order.find({ "customer.email": cleanEmail }).sort({ created_at: -1 }).lean();

    if (!customer && orders.length === 0) {
      return NextResponse.json(
        {
          error: `No shopping orders or account found for "${cleanEmail}". Please check your email or Sign Up.`,
        },
        { status: 404 }
      );
    }

    // If customer has a registered password, verify it
    if (customer && customer.password) {
      if (!password) {
        return NextResponse.json({ error: "Please enter your account password" }, { status: 400 });
      }
      const isMatch = bcrypt.compareSync(password, customer.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
      }
    } else if (password) {
      // Customer shopped as guest earlier, now setting password
      const passwordHash = bcrypt.hashSync(password, 10);
      if (customer) {
        customer.password = passwordHash;
        customer.plain_password = password;
        await customer.save();
      } else {
        const lastOrder = orders[0];
        customer = await Customer.create({
          first_name: lastOrder?.customer?.first_name || "Customer",
          last_name: lastOrder?.customer?.last_name || "",
          email: cleanEmail,
          password: passwordHash,
          plain_password: password,
          phone: lastOrder?.customer?.phone || "",
          address: lastOrder?.customer?.address || "",
          city: lastOrder?.customer?.city || "",
          total_orders: orders.length,
          total_spent: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        });
      }
    } else {
      // Instant login for customers who shopped using this email
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
      message: "Welcome back!",
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
    console.error("Customer login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}

