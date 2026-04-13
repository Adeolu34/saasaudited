import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import { requireApiRole } from "@/lib/auth/api-auth";
import { pickFields, CATEGORY_FIELDS } from "@/lib/validation";

export async function GET() {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  await dbConnect();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return NextResponse.json({ categories, total: categories.length });
}

export async function POST(request: NextRequest) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  try {
    await dbConnect();
    const body = pickFields(await request.json(), CATEGORY_FIELDS);
    const category = await Category.create(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
