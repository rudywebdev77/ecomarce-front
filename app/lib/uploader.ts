import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { connectDB } from "./db";

export function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".avif": "image/avif",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".m4v": "video/x-m4v",
  };
  return mimeMap[ext] || "application/octet-stream";
}

export function getUploadsDir(): string {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export async function saveBufferToUploads(
  buffer: Buffer,
  originalname: string,
  mimeType?: string
): Promise<{ url: string; filename: string; size: number }> {
  const ext = path.extname(originalname) || ".jpg";
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `couture-${uniqueSuffix}${ext}`;
  const resolvedMime = mimeType || getMimeType(filename);

  // Persist to MongoDB GridFS so uploads work on serverless deployments (e.g. Vercel)
  let savedToDb = false;
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (db) {
      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });
      await new Promise<void>((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
          metadata: { contentType: resolvedMime },
        });
        uploadStream.on("finish", () => resolve());
        uploadStream.on("error", reject);
        uploadStream.end(buffer);
      });
      savedToDb = true;
    }
  } catch (err) {
    console.warn("⚠️ GridFS upload fallback to local disk:", err);
  }

  // Best-effort local disk write for local development (read-only on Vercel)
  try {
    const dir = getUploadsDir();
    fs.writeFileSync(path.join(dir, filename), buffer);
  } catch (fsErr) {
    if (!savedToDb) {
      throw fsErr;
    }
  }

  return {
    url: `/uploads/${filename}`,
    filename,
    size: buffer.length,
  };
}
