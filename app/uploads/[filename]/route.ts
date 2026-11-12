import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/db";
import { getMimeType } from "@/app/lib/uploader";

export const dynamic = "force-dynamic";

function buildRangeResponse(
  totalSize: number,
  contentType: string,
  rangeHeader: string | null,
  createStream: (start?: number, endInclusive?: number) => NodeJS.ReadableStream
): Response {
  const baseHeaders: Record<string, string> = {
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
    if (match) {
      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end = match[2] ? Math.min(parseInt(match[2], 10), totalSize - 1) : totalSize - 1;

      if (start >= totalSize || start > end || Number.isNaN(start) || Number.isNaN(end)) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${totalSize}` },
        });
      }

      const stream = createStream(start, end);
      return new Response(Readable.toWeb(stream as Readable) as ReadableStream, {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Range": `bytes ${start}-${end}/${totalSize}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }
  }

  const stream = createStream();
  return new Response(Readable.toWeb(stream as Readable) as ReadableStream, {
    status: 200,
    headers: {
      ...baseHeaders,
      "Content-Length": String(totalSize),
    },
  });
}

// GET /uploads/[filename]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const safeName = path.basename(decodeURIComponent(filename));
    if (!safeName || safeName === "." || safeName === "..") {
      return new Response("Invalid filename", { status: 400 });
    }

    const rangeHeader = req.headers.get("range");
    const fallbackMime = getMimeType(safeName);

    // 1. Check local disk (fast path if present on server)
    const diskPath = path.join(process.cwd(), "public", "uploads", safeName);
    if (fs.existsSync(diskPath)) {
      const stat = fs.statSync(diskPath);
      if (stat.isFile()) {
        return buildRangeResponse(stat.size, fallbackMime, rangeHeader, (start, end) =>
          start !== undefined && end !== undefined
            ? fs.createReadStream(diskPath, { start, end })
            : fs.createReadStream(diskPath)
        );
      }
    }

    // 2. Fetch from MongoDB GridFS (persisted uploads for serverless/live)
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return new Response("Database unavailable", { status: 503 });
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });
    const files = await bucket.find({ filename: safeName }).limit(1).toArray();
    if (!files || files.length === 0) {
      return new Response("File not found", { status: 404 });
    }

    const fileDoc = files[0];
    const contentType =
      (fileDoc.metadata?.contentType as string | undefined) || fallbackMime;

    return buildRangeResponse(fileDoc.length, contentType, rangeHeader, (start, end) =>
      start !== undefined && end !== undefined
        ? bucket.openDownloadStream(fileDoc._id, { start, end: end + 1 })
        : bucket.openDownloadStream(fileDoc._id)
    );
  } catch (err) {
    console.error("Serve upload error:", err);
    return new Response("Failed to serve media", { status: 500 });
  }
}

