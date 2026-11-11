import { NextRequest, NextResponse } from "next/server";
import { connectDB, Blog } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";

// GET /api/blogs/[idOrHandle]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idOrHandle: string }> }
) {
  try {
    await connectDB();
    const { idOrHandle } = await params;
    const decoded = decodeURIComponent(idOrHandle).trim();
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(decoded);

    const blog = await Blog.findOne({
      $or: [
        { id: decoded },
        { handle: decoded.toLowerCase() },
        { _id: isMongoId ? decoded : null },
      ],
    }).lean();

    if (!blog) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const recentPosts = await Blog.find({ _id: { $ne: (blog as any)._id }, published: true })
      .limit(3)
      .lean();

    return NextResponse.json({ blog, recentPosts });
  } catch (err: any) {
    console.error("Error fetching single blog post:", err);
    return NextResponse.json({ error: "Failed to retrieve blog article" }, { status: 500 });
  }
}

// PUT /api/blogs/[idOrHandle] (Admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ idOrHandle: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const { idOrHandle } = await params;
    const decoded = decodeURIComponent(idOrHandle).trim();
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(decoded);
    const updates = await req.json();

    if (updates.published) {
      updates.published_at = new Date();
    }

    const updated = await Blog.findOneAndUpdate(
      {
        $or: [
          { id: decoded },
          { handle: decoded.toLowerCase() },
          { _id: isMongoId ? decoded : null },
        ],
      },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Blog post updated successfully in MongoDB",
      blog: updated,
    });
  } catch (err: any) {
    console.error("Error updating blog post:", err);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

// DELETE /api/blogs/[idOrHandle] (Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ idOrHandle: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const { idOrHandle } = await params;
    const decoded = decodeURIComponent(idOrHandle).trim();
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(decoded);

    const deleted = await Blog.findOneAndDelete({
      $or: [
        { id: decoded },
        { handle: decoded.toLowerCase() },
        { _id: isMongoId ? decoded : null },
      ],
    });

    if (!deleted) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog post deleted successfully from MongoDB", id: idOrHandle });
  } catch (err: any) {
    console.error("Error deleting blog post:", err);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
