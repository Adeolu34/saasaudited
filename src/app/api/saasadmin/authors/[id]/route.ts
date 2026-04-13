import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Author from "@/lib/models/Author";
import BlogPost from "@/lib/models/BlogPost";
import { requireApiRole } from "@/lib/auth/api-auth";
import { pickFields, AUTHOR_FIELDS } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  await dbConnect();
  const { id } = await params;
  const author = await Author.findById(id).lean();
  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ author: { ...author, _id: String(author._id) } });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = pickFields(await request.json(), AUTHOR_FIELDS);

    // Get the old author name before updating (for propagation)
    const oldAuthor = await Author.findById(id).lean();
    if (!oldAuthor) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const author = await Author.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Propagate changes to all blog posts by this author
    const updateFields: Record<string, unknown> = {};
    if (body.name && body.name !== oldAuthor.name) updateFields["author.name"] = body.name;
    if (body.bio !== undefined) updateFields["author.bio"] = body.bio;
    if (body.image !== undefined) updateFields["author.image"] = body.image;

    if (Object.keys(updateFields).length > 0) {
      const result = await BlogPost.updateMany(
        { "author.name": oldAuthor.name },
        { $set: updateFields }
      );
      console.log(
        `[Authors] Updated ${result.modifiedCount} blog posts for author "${oldAuthor.name}"`
      );
    }

    return NextResponse.json({
      author: { ...author, _id: String(author._id) },
      postsUpdated: Object.keys(updateFields).length > 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update author";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  await dbConnect();
  const { id } = await params;
  const result = await Author.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
