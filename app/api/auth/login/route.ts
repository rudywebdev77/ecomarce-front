import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB, Admin } from "@/app/lib/db";
import { JWT_SECRET } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanInput = email.toLowerCase().trim();
    const admin = await Admin.findOne({
      $or: [{ email: cleanInput }, { username: cleanInput }],
    });

    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!admin.plain_password) {
      admin.plain_password = password;
      await admin.save().catch(() => {});
    }

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        currentPassword: admin.plain_password || password,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error during login" }, { status: 500 });
  }
}
