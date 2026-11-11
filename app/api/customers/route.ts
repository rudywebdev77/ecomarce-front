import { NextRequest, NextResponse } from "next/server";
import { connectDB, Customer } from "@/app/lib/db";

export const dynamic = "force-dynamic";

// GET /api/customers
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const pageParam = searchParams.get("page") || "1";
    const limitParam = searchParams.get("limit") || "50";

    const query: Record<string, any> = {};
    if (search) {
      const q = new RegExp(search.trim(), "i");
      query.$or = [{ first_name: q }, { last_name: q }, { email: q }, { phone: q }, { city: q }, { country: q }];
    }

    const p = Math.max(1, parseInt(pageParam, 10));
    const l = Math.max(1, parseInt(limitParam, 10));
    const skip = (p - 1) * l;

    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ total_spent: -1 }).skip(skip).limit(l).lean(),
      Customer.countDocuments(query),
    ]);

    return NextResponse.json({
      customers,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    });
  } catch (err: any) {
    console.error("Error fetching customers:", err);
    return NextResponse.json({ error: "Failed to retrieve customers" }, { status: 500 });
  }
}

// POST /api/customers (Admin / Public create customer)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { first_name, last_name, email, phone, address, city, country } = body;

    if (!first_name || !email) {
      return NextResponse.json({ error: "First name and email are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Customer.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json({ error: "Customer with this email already exists" }, { status: 409 });
    }

    const newCustomer = await Customer.create({
      id: `cust_${Date.now()}`,
      first_name: first_name.trim(),
      last_name: (last_name || "").trim(),
      email: cleanEmail,
      phone: phone || "",
      address: address || "",
      city: city || "",
      country: country || "Pakistan",
      total_orders: 0,
      total_spent: 0,
    });

    return NextResponse.json(
      {
        message: "Customer created successfully in MongoDB",
        customer: newCustomer,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating customer:", err);
    return NextResponse.json({ error: err.message || "Failed to create customer" }, { status: 500 });
  }
}

