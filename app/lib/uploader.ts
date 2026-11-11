import path from "path";
import fs from "fs";

export function getUploadsDir(): string {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export function saveBufferToUploads(buffer: Buffer, originalname: string): { url: string; filename: string; size: number } {
  const dir = getUploadsDir();
  const ext = path.extname(originalname) || ".jpg";
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `couture-${uniqueSuffix}${ext}`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, buffer);
  return {
    url: `/uploads/${filename}`,
    filename,
    size: buffer.length,
  };
}

