import { NextRequest, NextResponse } from "next/server";
import { saveBufferToUploads } from "@/app/lib/uploader";

// POST /api/upload/multiple
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files received" }, { status: 400 });
    }

    const urls: string[] = [];
    for (const file of files) {
      if (file && typeof file.arrayBuffer === "function") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const saved = await saveBufferToUploads(buffer, file.name, file.type);
        urls.push(saved.url);
      }
    }

    return NextResponse.json({
      success: true,
      urls,
      count: urls.length,
    });
  } catch (err: any) {
    console.error("Upload multiple error:", err);
    return NextResponse.json({ error: err.message || "Multiple files upload failed" }, { status: 500 });
  }
}

