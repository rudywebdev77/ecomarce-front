import { NextRequest, NextResponse } from "next/server";
import { connectDB, Blog } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";

// GET /api/blogs (Public / Admin)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const admin = searchParams.get("admin");

    const query: any = {};
    if (admin !== "true") {
      query.published = true;
    }

    if (tag) {
      query.tags = new RegExp(tag.trim(), "i");
    }

    if (search) {
      const q = new RegExp(search.trim(), "i");
      query.$or = [{ title: q }, { excerpt: q }, { content: q }];
    }

    const blogs = await Blog.find(query)
      .sort({ published_at: -1, created_at: -1 })
      .lean();

    return NextResponse.json({
      blogs,
      total: blogs.length,
    });
  } catch (err: any) {
    console.error("Error fetching blogs:", err);
    return NextResponse.json({ error: "Failed to retrieve blogs" }, { status: 500 });
  }
}

// POST /api/blogs (Admin)
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { title, handle, author, excerpt, content, featured_image, tags = [], published = true } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const cleanHandle =
      handle && handle.trim()
        ? handle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newBlog = await Blog.create({
      id: `blog_${Date.now()}`,
      title: title.trim(),
      handle: cleanHandle,
      author: author || "Sillhouete Editorial",
      excerpt: excerpt || title,
      content,
      featured_image: featured_image || "https://sillhouete.com/cdn/shop/files/IMG_3962.jpg",
      tags: Array.isArray(tags) ? tags : [],
      published: published !== false,
      published_at: published ? new Date() : undefined,
    });

    return NextResponse.json(
      {
        message: "Blog post published successfully in MongoDB",
        blog: newBlog,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating blog post:", err);
    return NextResponse.json({ error: err.message || "Failed to create blog post" }, { status: 500 });
  }
}
