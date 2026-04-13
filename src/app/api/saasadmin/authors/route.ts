import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Author from "@/lib/models/Author";
import { requireApiRole } from "@/lib/auth/api-auth";
import { pickFields, AUTHOR_FIELDS } from "@/lib/validation";

export async function GET() {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  await dbConnect();
  const authors = await Author.find().sort({ name: 1 }).lean();
  return NextResponse.json({
    authors: authors.map((a) => ({
      ...a,
      _id: String(a._id),
    })),
  });
}

export async function POST(request: NextRequest) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  try {
    await dbConnect();
    const body = pickFields(await request.json(), AUTHOR_FIELDS);
    const author = await Author.create(body);
    return NextResponse.json({ author }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create author";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
