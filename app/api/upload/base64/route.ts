import { NextRequest, NextResponse } from "next/server";
import { saveBufferToUploads } from "@/app/lib/uploader";

// POST /api/upload/base64
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64Data } = body;

    if (!base64Data) {
      return NextResponse.json({ error: "No base64 data provided" }, { status: 400 });
    }

    const matches = base64Data.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Invalid base64 data" }, { status: 400 });
    }

    const ext = matches[1].split("/")[1] || "jpg";
    const buffer = Buffer.from(matches[2], "base64");
    const saved = saveBufferToUploads(buffer, `image.${ext}`);

    return NextResponse.json({
      success: true,
      url: saved.url,
      filename: saved.filename,
    });
  } catch (err: any) {
    console.error("Upload base64 error:", err);
    return NextResponse.json({ error: err.message || "Base64 upload failed" }, { status: 500 });
  }
}
