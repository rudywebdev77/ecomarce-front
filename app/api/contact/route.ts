import { NextRequest, NextResponse } from "next/server";
import { connectDB, Contact } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";

// GET /api/contact (Admin)
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      const q = new RegExp(search.trim(), "i");
      query.$or = [{ name: q }, { email: q }, { subject: q }, { message: q }];
    }

    const [messages, unreadCount] = await Promise.all([
      Contact.find(query).sort({ created_at: -1 }).lean(),
      Contact.countDocuments({ status: "new" }),
    ]);

    return NextResponse.json({
      messages,
      total: messages.length,
      unreadCount,
    });
  } catch (err: any) {
    console.error("Error fetching contact messages:", err);
    return NextResponse.json({ error: "Failed to retrieve messages" }, { status: 500 });
  }
}

// POST /api/contact (Public Contact Us submission)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const newInquiry = await Contact.create({
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || "",
      subject: subject || "General Store Inquiry",
      message: message.trim(),
      status: "new",
      reply: "",
      replied_at: null,
    });

    return NextResponse.json(
      {
        message: "Thank you for reaching out to Sillhouete. Our customer care team will respond promptly.",
        inquiry: newInquiry,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating contact inquiry in MongoDB:", err);
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}

