import { NextRequest, NextResponse } from "next/server";
import { connectDB, Contact } from "@/app/lib/db";
import { verifyAdmin } from "@/app/lib/auth";

// PATCH / PUT /api/contact/[id] (Admin reply or status update)
async function updateContact(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { status, reply } = body;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    const updates: any = {};
    if (status) updates.status = status;
    if (reply !== undefined) {
      updates.reply = reply;
      updates.status = "replied";
      updates.replied_at = new Date();
    }

    const updated = await Contact.findOneAndUpdate(
      { $or: [{ id }, { _id: isMongoId ? id : null }] },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Message updated successfully in MongoDB",
      inquiry: updated,
    });
  } catch (err: any) {
    console.error("Error updating inquiry:", err);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export const PATCH = updateContact;
export const PUT = updateContact;

// DELETE /api/contact/[id] (Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    const deleted = await Contact.findOneAndDelete({
      $or: [{ id }, { _id: isMongoId ? id : null }],
    });

    if (!deleted) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Message deleted successfully from MongoDB", id });
  } catch (err: any) {
    console.error("Error deleting contact message:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}

