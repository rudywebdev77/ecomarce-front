import { NextRequest, NextResponse } from "next/server";
import { connectDB, Category, Product } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";
import { slugify } from "@/app/lib/defaultCategories";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// PUT /api/categories/:id (Admin)
export async function PUT(req: NextRequest, { params }: RouteProps) {
  try {
    await verifyAdmin(req);
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { name, slug, parent_id, parent_name, description, image, display_order, is_active } = body;

    const existingCat = await Category.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!existingCat) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const oldName = existingCat.name;

    if (name && name.trim()) existingCat.name = name.trim();
    if (slug && slug.trim()) existingCat.slug = slugify(slug);
    if (description !== undefined) existingCat.description = (description || "").trim();
    if (image !== undefined) existingCat.image = (image || "").trim();
    if (Number.isInteger(display_order)) existingCat.display_order = display_order;
    if (is_active !== undefined) existingCat.is_active = is_active;

    if (parent_id !== undefined) {
      if (parent_id) {
        const parent = await Category.findOne({
          $or: [{ id: parent_id }, { _id: parent_id.match(/^[0-9a-fA-F]{24}$/) ? parent_id : null }],
        });
        existingCat.parent_id = parent ? parent.id : parent_id;
        existingCat.parent_name = parent ? parent.name : parent_name || null;
      } else {
        existingCat.parent_id = null;
        existingCat.parent_name = null;
      }
    }

    await existingCat.save();

    // If category was renamed, synchronize outfits
    if (name && name.trim() !== oldName) {
      await Product.updateMany({ category: oldName }, { $set: { category: existingCat.name } });
    }

    return NextResponse.json({
      message: `Category "${existingCat.name}" updated successfully!`,
      category: existingCat,
    });
  } catch (err: any) {
    console.error("Error updating category:", err);
    return NextResponse.json({ error: err.message || "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/categories/:id (Admin)
export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    await verifyAdmin(req);
    await connectDB();
    const { id } = await params;

    const deleted = await Category.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Detach any subcategories
    await Category.updateMany(
      { parent_id: deleted.id },
      { $set: { parent_id: null, parent_name: null } }
    );

    return NextResponse.json({
      message: `Category "${deleted.name}" deleted successfully!`,
      id,
    });
  } catch (err: any) {
    console.error("Error deleting category:", err);
    return NextResponse.json({ error: err.message || "Failed to delete category" }, { status: 500 });
  }
}

