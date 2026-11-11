import { NextRequest, NextResponse } from "next/server";
import { connectDB, Product } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ idOrHandle: string }>;
}

// GET /api/products/:idOrHandle
export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    await connectDB();
    const { idOrHandle } = await params;
    const decoded = decodeURIComponent(idOrHandle).trim();
    const cleanHandle = decoded.toLowerCase().replace(/[^a-z0-9\-]+/g, "");
    const escaped = decoded.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let product = await Product.findOne({
      $or: [
        { id: decoded },
        { handle: decoded.toLowerCase() },
        { handle: cleanHandle },
        { title: new RegExp(`^${escaped}$`, "i") },
        { _id: decoded.match(/^[0-9a-fA-F]{24}$/) ? decoded : null },
      ],
    }).lean();

    if (!product && cleanHandle.length > 0) {
      product = await Product.findOne({
        $or: [
          { handle: new RegExp(`^${cleanHandle}$`, "i") },
          { handle: new RegExp(cleanHandle, "i") },
          { title: new RegExp(escaped, "i") },
        ],
      }).lean();
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const similar = await Product.find({
      id: { $ne: product.id },
      category: product.category,
    })
      .limit(4)
      .lean();

    return NextResponse.json({
      product,
      similar,
    });
  } catch (err: any) {
    console.error("Error fetching single product:", err);
    return NextResponse.json({ error: "Failed to retrieve product details" }, { status: 500 });
  }
}

// PUT /api/products/:idOrHandle (Admin)
export async function PUT(req: NextRequest, { params }: RouteProps) {
  try {
    await verifyAdmin(req);
    await connectDB();
    const { idOrHandle } = await params;
    const updates = await req.json();

    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.compare_at_price !== undefined) {
      updates.compare_at_price = updates.compare_at_price ? Number(updates.compare_at_price) : null;
    }
    if (updates.compare_at_price && updates.price) {
      updates.is_sale = Number(updates.compare_at_price) > Number(updates.price);
    }

    if (updates.category) {
      updates.category = updates.category.trim();
      updates.product_type = updates.category;
      if (updates.category.toLowerCase().includes("sale")) {
        updates.is_sale = true;
      }
      if (Array.isArray(updates.tags)) {
        if (!updates.tags.some((t: string) => t.toLowerCase() === updates.category.toLowerCase())) {
          updates.tags.unshift(updates.category);
        }
      }
    }

    const updated = await Product.findOneAndUpdate(
      {
        $or: [
          { id: idOrHandle },
          { handle: idOrHandle.toLowerCase() },
          { _id: idOrHandle.match(/^[0-9a-fA-F]{24}$/) ? idOrHandle : null },
        ],
      },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product updated successfully in MongoDB",
      product: updated,
    });
  } catch (err: any) {
    console.error("Error updating product:", err);
    return NextResponse.json({ error: err.message || "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/products/:idOrHandle (Admin)
export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    await verifyAdmin(req);
    await connectDB();
    const { idOrHandle } = await params;

    const deleted = await Product.findOneAndDelete({
      $or: [
        { id: idOrHandle },
        { handle: idOrHandle.toLowerCase() },
        { _id: idOrHandle.match(/^[0-9a-fA-F]{24}$/) ? idOrHandle : null },
      ],
    });

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product deleted successfully from MongoDB",
      id: idOrHandle,
    });
  } catch (err: any) {
    console.error("Error deleting product:", err);
    return NextResponse.json({ error: err.message || "Failed to delete product" }, { status: 500 });
  }
}

