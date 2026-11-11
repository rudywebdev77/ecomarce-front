import { NextRequest, NextResponse } from "next/server";
import { saveBufferToUploads } from "@/app/lib/uploader";

// POST /api/upload/single
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = saveBufferToUploads(buffer, file.name);

    return NextResponse.json({
      success: true,
      url: saved.url,
      filename: saved.filename,
      size: saved.size,
      mimetype: file.type,
    });
  } catch (err: any) {
    console.error("Upload single error:", err);
    return NextResponse.json({ error: err.message || "File upload failed" }, { status: 500 });
  }
}
