import { NextRequest, NextResponse } from "next/server";
import { saveBufferToUploads } from "@/app/lib/uploader";

// POST /api/upload
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const files = formData.getAll("files") as File[];

    if (files && files.length > 0) {
      const urls: string[] = [];
      for (const f of files) {
        if (f && typeof f.arrayBuffer === "function") {
          const buffer = Buffer.from(await f.arrayBuffer());
          const saved = await saveBufferToUploads(buffer, f.name, f.type);
          urls.push(saved.url);
        }
      }
      return NextResponse.json({ success: true, urls, count: urls.length });
    }

    if (file && typeof file.arrayBuffer === "function") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const saved = await saveBufferToUploads(buffer, file.name, file.type);
      return NextResponse.json({
        success: true,
        url: saved.url,
        filename: saved.filename,
        size: saved.size,
      });
    }

    return NextResponse.json({ error: "No file or files received" }, { status: 400 });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

