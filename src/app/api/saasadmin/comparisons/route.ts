import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comparison from "@/lib/models/Comparison";

export async function GET(request: NextRequest) {
  await dbConnect();
  const q = request.nextUrl.searchParams.get("q") || "";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = 20;
  const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = safeQ ? { title: { $regex: safeQ, $options: "i" } } : {};
  const [comparisons, total] = await Promise.all([
    Comparison.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Comparison.countDocuments(filter),
  ]);
  return NextResponse.json({ comparisons, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const comparison = await Comparison.create(body);
    return NextResponse.json({ comparison }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
