import { NextRequest, NextResponse } from "next/server";
import { connectDB, Product } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/products
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const limitParam = searchParams.get("limit") || "50";
    const pageParam = searchParams.get("page") || "1";
    const in_stock = searchParams.get("in_stock");

    const query: Record<string, any> = {};

    // Filter Category
    if (category && category !== "all") {
      const catRegex = new RegExp(category, "i");
      query.$or = [{ category: catRegex }, { product_type: catRegex }, { tags: catRegex }];
    }

    // Filter Search
    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      const searchConditions = [
        { title: searchRegex },
        { handle: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Filter In Stock
    if (in_stock !== null && in_stock !== undefined) {
      query.in_stock = in_stock === "true";
    }

    // Sort
    let sortObj: Record<string, any> = { created_at: -1 };
    if (sort === "price-asc") sortObj = { price: 1 };
    else if (sort === "price-desc") sortObj = { price: -1 };
    else if (sort === "title-asc") sortObj = { title: 1 };
    else if (sort === "title-desc") sortObj = { title: -1 };
    else if (sort === "oldest") sortObj = { created_at: 1 };

    const p = Math.max(1, parseInt(pageParam, 10));
    const l = Math.max(1, parseInt(limitParam, 10));
    const skip = (p - 1) * l;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(l).lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    });
  } catch (err: any) {
    console.error("Error fetching products:", err);
    return NextResponse.json({ error: "Failed to retrieve products" }, { status: 500 });
  }
}

// POST /api/products (Admin)
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const body = await req.json();
    const {
      title,
      handle,
      price,
      compare_at_price,
      category,
      description,
      images = [],
      video_url = "",
      fabric = "",
      color = "",
      pieces = "3-Piece (Shirt, Dupatta & Trouser)",
      dress_style = "",
      work_details = "",
      delivery_time = "Ready to Dispatch (3-5 business days)",
      care_instructions = "Dry Clean Only",
      sizes = ["XS", "S", "M", "L", "XL"],
      tags = [],
      in_stock = true,
      is_new = false,
      is_sale = false,
      is_featured = false,
      variants,
    } = body;

    if (!title || price === undefined) {
      return NextResponse.json({ error: "Title and price are required" }, { status: 400 });
    }

    let cleanHandle =
      handle && handle.trim()
        ? handle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (!cleanHandle) {
      cleanHandle = `outfit-${Date.now()}`;
    }

    let candidateHandle = cleanHandle;
    let counter = 1;
    while (await Product.exists({ handle: candidateHandle })) {
      candidateHandle = `${cleanHandle}-${counter++}`;
    }
    cleanHandle = candidateHandle;

    const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const catName = category ? category.trim() : "Luxury Pret";
    const tagList = Array.isArray(tags) ? [...tags] : [];
    if (catName && !tagList.some((t) => t.toLowerCase() === catName.toLowerCase())) {
      tagList.unshift(catName);
    }
    const isSale =
      !!is_sale ||
      catName.toLowerCase().includes("sale") ||
      Boolean(compare_at_price && Number(compare_at_price) > Number(price));

    const newProduct = await Product.create({
      id: productId,
      title: title.trim(),
      handle: cleanHandle,
      price: Number(price),
      compare_at_price: compare_at_price ? Number(compare_at_price) : null,
      category: catName,
      product_type: catName,
      description: description || "",
      vendor: "Sillhouete",
      images: Array.isArray(images) && images.length > 0 ? images : ["https://sillhouete.com/cdn/shop/files/IMG_3962.jpg"],
      video_url: video_url ? video_url.trim() : "",
      fabric: fabric ? fabric.trim() : "",
      color: color ? color.trim() : "",
      pieces: pieces ? pieces.trim() : "3-Piece (Shirt, Dupatta & Trouser)",
      dress_style: dress_style ? dress_style.trim() : "",
      work_details: work_details ? work_details.trim() : "",
      delivery_time: delivery_time ? delivery_time.trim() : "Ready to Dispatch (3-5 business days)",
      care_instructions: care_instructions ? care_instructions.trim() : "Dry Clean Only",
      sizes: Array.isArray(sizes) ? sizes : ["XS", "S", "M", "L", "XL"],
      tags: tagList,
      in_stock: in_stock !== false,
      is_new: !!is_new,
      is_sale: isSale,
      is_featured: !!is_featured,
      variants:
        Array.isArray(variants) && variants.length > 0
          ? variants
          : [
              {
                id: `v_${Date.now()}`,
                title: "Standard",
                price: Number(price),
                compare_at_price: compare_at_price ? Number(compare_at_price) : null,
              },
            ],
    });

    return NextResponse.json({
      message: "Product created successfully in MongoDB",
      product: newProduct,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating product:", err);
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  }
}

