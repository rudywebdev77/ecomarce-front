import { NextRequest, NextResponse } from "next/server";
import { connectDB, Customer, Order } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";

// GET /api/customers/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    const customer = await Customer.findOne({
      $or: [{ id }, { _id: isMongoId ? id : null }],
    }).lean();

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const orders = await Order.find({ "customer.email": customer.email })
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ customer, orders });
  } catch (err: any) {
    console.error("Error fetching customer details:", err);
    return NextResponse.json({ error: "Failed to retrieve customer" }, { status: 500 });
  }
}

// PUT /api/customers/[id] (Admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    const updated = await Customer.findOneAndUpdate(
      { $or: [{ id }, { _id: isMongoId ? id : null }] },
      { $set: body },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Customer updated successfully in MongoDB",
      customer: updated,
    });
  } catch (err: any) {
    console.error("Error updating customer:", err);
    return NextResponse.json({ error: err.message || "Failed to update customer" }, { status: 500 });
  }
}

// DELETE /api/customers/[id] (Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    const deleted = await Customer.findOneAndDelete({
      $or: [{ id }, { _id: isMongoId ? id : null }],
    });

    if (!deleted) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Customer deleted successfully from MongoDB", id });
  } catch (err: any) {
    console.error("Error deleting customer:", err);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}

