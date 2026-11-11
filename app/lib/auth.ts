import jwt from "jsonwebtoken";
import { connectDB, Admin } from "./db";

export const JWT_SECRET =
  process.env.JWT_SECRET || "sillhouete_luxury_couture_secret_jwt_key_2026";

export async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Missing or invalid token");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; email?: string; username?: string };
    await connectDB();

    let admin = null;
    if (decoded.id) {
      admin = await Admin.findById(decoded.id).catch(() => null);
    }
    if (!admin && decoded.email) {
      admin = await Admin.findOne({ email: decoded.email.toLowerCase() });
    }
    if (!admin && decoded.username) {
      admin = await Admin.findOne({ username: decoded.username });
    }

    if (!admin) {
      throw new Error("Unauthorized: Admin user not found");
    }

    return admin;
  } catch (err: any) {
    throw new Error(err.message || "Unauthorized: Token expired or invalid");
  }
}

