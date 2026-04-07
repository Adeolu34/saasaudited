import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { ids, action } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }
    if (action === "delete") {
      await Comment.deleteMany({ _id: { $in: ids } });
    } else if (["approved", "rejected", "spam"].includes(action)) {
      await Comment.updateMany({ _id: { $in: ids } }, { status: action });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
