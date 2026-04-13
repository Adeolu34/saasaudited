import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Author from "@/lib/models/Author";

export async function GET(request: NextRequest) {
  await dbConnect();
  const q = request.nextUrl.searchParams.get("q") || "";
  const filter = q
    ? { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
    : {};
  const authors = await Author.find(filter).sort({ name: 1 }).lean();
  return NextResponse.json({
    authors: authors.map((a) => ({
      ...a,
      _id: String(a._id),
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const author = await Author.create(body);
    return NextResponse.json({ author }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create author";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
