import { NextRequest, NextResponse } from "next/server";
import { connectDB, Order, Product, Customer, Contact } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/stats (Admin Dashboard Analytics)
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const [orders, totalProducts, totalCustomers, unreadMessagesCount, recentMessages] = await Promise.all([
      Order.find().lean(),
      Product.countDocuments(),
      Customer.countDocuments(),
      Contact.countDocuments({ status: "new" }),
      Contact.find().sort({ created_at: -1 }).limit(5).lean(),
    ]);

    const validOrders = orders.filter((o) => o.payment_status === "paid" || o.order_status === "delivered");
    const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    const statusCounts: Record<string, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (statusCounts[o.order_status] !== undefined) {
        statusCounts[o.order_status]++;
      }
    });

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5);

    const productSalesMap: Record<string, number> = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item: any) => {
        productSalesMap[item.title] = (productSalesMap[item.title] || 0) + (item.quantity || 1);
      });
    });

    const topProducts = Object.entries(productSalesMap)
      .map(([title, qty]) => ({ title, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts,
        totalCustomers,
        unreadMessagesCount,
      },
      statusCounts,
      recentOrders,
      recentMessages,
      topProducts,
    });
  } catch (err: any) {
    console.error("Error fetching stats:", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve stats" }, { status: 500 });
  }
}
