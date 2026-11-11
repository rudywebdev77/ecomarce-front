import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      status: "ok",
      platform: "Next.js Full-Stack App Router (TypeScript)",
      database: "MongoDB Atlas / Local",
      store: "Sillhouete Pakistani Luxury Couture",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
