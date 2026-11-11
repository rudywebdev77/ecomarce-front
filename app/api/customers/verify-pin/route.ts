import { NextRequest, NextResponse } from "next/server";
import { connectDB, Customer } from "@/app/lib/db";

// POST /api/customers/verify-pin (Check if 6-digit PIN is valid before showing new password inputs)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, pin } = body;

    if (!email || !pin) {
      return NextResponse.json(
        { error: "Email and 6-digit verification PIN are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: cleanEmail });

    if (!customer) {
      return NextResponse.json({ error: "Customer account not found." }, { status: 404 });
    }

    if (!customer.reset_pin || customer.reset_pin !== pin.trim()) {
      return NextResponse.json(
        { error: "Invalid 6-digit PIN code. Please verify the code sent to your email." },
        { status: 400 }
      );
    }

    if (!customer.reset_pin_expires || new Date() > new Date(customer.reset_pin_expires)) {
      return NextResponse.json(
        { error: "This PIN code has expired. Please request a new PIN." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "PIN verified successfully! Now set your new password.",
    });
  } catch (err: any) {
    console.error("Verify PIN error:", err);
    return NextResponse.json({ error: "Failed to verify PIN." }, { status: 500 });
  }
}
