import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Author from "@/lib/models/Author";
import AuthorForm from "@/components/admin/forms/AuthorForm";

export const metadata = { title: "Edit Author" };

export default async function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();
  const raw = await Author.findById(id).lean();
  if (!raw) notFound();
  const author = JSON.parse(JSON.stringify({ ...raw, _id: String(raw._id) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Edit Author</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Update &ldquo;{author.name}&rdquo; — changes propagate to all their posts.
        </p>
      </div>
      <AuthorForm author={author} />
    </div>
  );
}
