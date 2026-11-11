import { NextRequest, NextResponse } from "next/server";
import { connectDB, Category, Product } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";
import { COMPLETE_CATEGORIES, slugify } from "@/app/lib/defaultCategories";

export const dynamic = "force-dynamic";

async function ensureDefaultCategories() {
  try {
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
          } else if (!existingSub.parent_id) {
            existingSub.parent_id = parent.id;
            existingSub.parent_name = parent.name;
            await existingSub.save();
          }
        }
      }
    }
  } catch (err: any) {
    console.warn("ensureDefaultCategories note:", err.message);
  }
}

// GET /api/categories
export async function GET() {
  try {
    await connectDB();
    await ensureDefaultCategories();

    const categories = await Category.find().sort({ display_order: 1, created_at: 1 }).lean();

    const categoriesWithCount = await Promise.all(
      categories.map(async (c: any) => {
        const subCats = categories.filter((sub: any) => sub.parent_id === c.id);
        const namesToMatch = [c.name, ...subCats.map((s: any) => s.name)];

        const distinctWord = c.name
          .replace(/['’]2[0-9]/g, "")
          .replace(/(Luxury|Pret|Formals|Formal|Birdal|Bridal|Dresses|Collection|Solids|Solid|Eid|II)/gi, "")
          .trim();

        const conditions: any[] = [
          { category: { $in: namesToMatch.map((n) => new RegExp(`^${n.trim()}$`, "i")) } },
          { product_type: { $in: namesToMatch.map((n) => new RegExp(`^${n.trim()}$`, "i")) } },
          { tags: { $in: namesToMatch.map((n) => new RegExp(`^${n.trim()}$`, "i")) } },
        ];

        if (distinctWord.length >= 3) {
          const wordRegex = new RegExp(distinctWord, "i");
          conditions.push({ category: wordRegex });
          conditions.push({ tags: wordRegex });
        }

        const product_count = await Product.countDocuments({
          $or: conditions,
        });

        return {
          ...c,
          product_count,
          has_subcategories: subCats.length > 0,
          subcategories_count: subCats.length,
        };
      })
    );

    return NextResponse.json({
      categories: categoriesWithCount,
      total: categoriesWithCount.length,
    });
  } catch (err: any) {
    console.error("Error fetching categories:", err);
    return NextResponse.json({ error: "Failed to retrieve categories" }, { status: 500 });
  }
}

// POST /api/categories (Admin)
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const body = await req.json();
    const { name, slug, parent_id, parent_name, description, image, display_order, is_active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanSlug = slug && slug.trim() ? slugify(slug) : slugify(cleanName);

    const existingSlug = await Category.findOne({ slug: cleanSlug });
    if (existingSlug) {
      return NextResponse.json({ error: `A category with slug "${cleanSlug}" already exists.` }, { status: 409 });
    }

    let resolvedParentName = parent_name || null;
    let resolvedParentId = parent_id || null;
    if (parent_id) {
      const parent = await Category.findOne({
        $or: [{ id: parent_id }, { _id: parent_id.match(/^[0-9a-fA-F]{24}$/) ? parent_id : null }],
      });
      if (parent) {
        resolvedParentName = parent.name;
        resolvedParentId = parent.id;
      }
    }

    const newCat = await Category.create({
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      slug: cleanSlug,
      parent_id: resolvedParentId,
      parent_name: resolvedParentName,
      description: (description || "").trim(),
      image: (image || "").trim(),
      display_order: Number.isInteger(display_order) ? display_order : 0,
      is_active: is_active !== false,
    });

    return NextResponse.json(
      {
        message: `Category "${cleanName}" created successfully!`,
        category: {
          ...newCat.toObject(),
          product_count: 0,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating category:", err);
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
  }
}
