import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/auth/me
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    return NextResponse.json({
      user: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        currentPassword: admin.plain_password || "admin123",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

