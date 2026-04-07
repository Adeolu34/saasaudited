import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/lib/models/Category";

export async function GET(request: NextRequest) {
  await dbConnect();
  const q = request.nextUrl.searchParams.get("q") || "";
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const categories = await Category.find(filter).sort({ name: 1 }).lean();
  return NextResponse.json({ categories, total: categories.length });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const category = await Category.create(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
