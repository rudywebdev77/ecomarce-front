import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET /api/orders/:id
export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    await connectDB();
    const { id } = await params;
    const num = parseInt(id, 10);

    const conditions: any[] = [{ id }];
    if (!isNaN(num)) conditions.push({ order_number: num });

    const order = await Order.findOne({ $or: conditions }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("Error fetching single order:", err);
    return NextResponse.json({ error: "Failed to retrieve order" }, { status: 500 });
  }
}

// PATCH/PUT /api/orders/:id (Admin update status or tracking)
export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    await verifyAdmin(req);
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { order_status, payment_status, tracking_number } = body;

    const updates: Record<string, any> = {};
    if (order_status) updates.order_status = order_status;
    if (payment_status) updates.payment_status = payment_status;
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;

    const updated = await Order.findOneAndUpdate(
      {
        $or: [
          { id },
          { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        ],
      },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Order updated successfully in MongoDB",
      order: updated,
    });
  } catch (err: any) {
    console.error("Error updating order:", err);
    return NextResponse.json({ error: err.message || "Failed to update order" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: RouteProps) {
  return PATCH(req, props);
}

