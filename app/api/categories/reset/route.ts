import { NextRequest, NextResponse } from "next/server";
import { connectDB, Category } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";
import { COMPLETE_CATEGORIES } from "@/app/lib/defaultCategories";

export const dynamic = "force-dynamic";

// POST /api/categories/reset (Admin - Reset and restore all 34 Couture collections)
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    for (const cat of COMPLETE_CATEGORIES) {
      let parent = await Category.findOne({ slug: cat.slug });
      if (!parent) {
        parent = await Category.create({
          id: `cat_${cat.slug.replace(/[^a-zA-Z0-9]/g, "_")}`,
          name: cat.name,
          slug: cat.slug,
          parent_id: null,
          parent_name: null,
          description: cat.description,
          image: cat.image,
          display_order: cat.display_order,
          is_active: true,
        });
      } else {
        parent.name = cat.name;
        parent.description = cat.description;
        parent.image = cat.image;
        parent.display_order = cat.display_order;
        parent.is_active = true;
        await parent.save();
      }

      if (cat.subcategories && cat.subcategories.length > 0) {
        for (const sub of cat.subcategories) {
          const existingSub = await Category.findOne({ slug: sub.slug });
          if (!existingSub) {
            await Category.create({
              id: `cat_${sub.slug.replace(/[^a-zA-Z0-9]/g, "_")}`,
              name: sub.name,
              slug: sub.slug,
              parent_id: parent.id,
              parent_name: parent.name,
              description: sub.description,
              image: sub.image,
              display_order: sub.display_order,
              is_active: true,
            });
          } else {
            existingSub.name = sub.name;
            existingSub.parent_id = parent.id;
            existingSub.parent_name = parent.name;
            existingSub.description = sub.description;
            existingSub.image = sub.image;
            existingSub.display_order = sub.display_order;
            existingSub.is_active = true;
            await existingSub.save();
          }
        }
      }
    }

    const allCategories = await Category.find().sort({ display_order: 1, created_at: 1 });

    return NextResponse.json({
      message: "All 34 couture collections and subcategories have been successfully restored and synchronized!",
      categories: allCategories,
      total: allCategories.length,
    });
  } catch (err: any) {
    console.error("Error resetting categories:", err);
    return NextResponse.json({ error: err.message || "Failed to reset categories" }, { status: 500 });
  }
}
