import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "@/app/lib/db";
import { verifyAdmin, JWT_SECRET } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// PUT /api/auth/profile
export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    if (name && name.trim()) {
      admin.name = name.trim();
    }

    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = await Admin.findOne({ email: cleanEmail, _id: { $ne: admin._id } });
      if (existing) {
        return NextResponse.json({ error: "This email is already in use by another account" }, { status: 400 });
      }
      admin.email = cleanEmail;
      admin.username = cleanEmail;
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }
      const isMatch = bcrypt.compareSync(currentPassword, admin.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 });
      }
      admin.password = bcrypt.hashSync(newPassword, 10);
      admin.plain_password = newPassword;
    }

    await admin.save();

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Admin account settings updated successfully",
      token,
      user: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        currentPassword: admin.plain_password || "admin123",
      },
    });
  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: err.message || "Failed to update admin account settings" }, { status: 500 });
  }
}
