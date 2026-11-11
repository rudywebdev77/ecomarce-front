import { NextRequest, NextResponse } from "next/server";
import { connectDB, Customer, Order } from "@/app/lib/db";
import { sendResetPinEmail } from "@/app/lib/email";

// POST /api/customers/forgot-password (Generate 6-digit PIN and send email)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Please enter your account email address" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let customer = await Customer.findOne({ email: cleanEmail });
    const order = await Order.findOne({ "customer.email": cleanEmail }).lean();

    if (!customer && !order) {
      return NextResponse.json(
        {
          error: `No account or order record found for "${cleanEmail}". Please check your email or create a new account.`,
        },
        { status: 404 }
      );
    }

    // Generate random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    if (!customer) {
      customer = await Customer.create({
        first_name: order?.customer?.first_name || "Customer",
        last_name: order?.customer?.last_name || "",
        email: cleanEmail,
        reset_pin: pin,
        reset_pin_expires: expires,
      });
    } else {
      customer.reset_pin = pin;
      customer.reset_pin_expires = expires;
      await customer.save();
    }

    const customerName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Customer";
    const emailResult = await sendResetPinEmail(cleanEmail, pin, customerName);

    if (emailResult.configured && !emailResult.sent) {
      return NextResponse.json(
        {
          error: `Could not send email to ${cleanEmail}: ${emailResult.error || "SMTP delivery failed"}. Please check your SMTP credentials.`,
        },
        { status: 500 }
      );
    }

    if (!emailResult.configured) {
      return NextResponse.json({
        message: `A 6-digit verification PIN has been generated for ${cleanEmail}. (To receive live emails in your Gmail inbox, please configure your Gmail address and 16-character App Password in .env.local).`,
        email: cleanEmail,
        smtp_configured: false,
      });
    }

    return NextResponse.json({
      message: `A 6-digit verification PIN has been sent to ${cleanEmail}. Please check your inbox or spam folder.`,
      email: cleanEmail,
      smtp_configured: true,
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
