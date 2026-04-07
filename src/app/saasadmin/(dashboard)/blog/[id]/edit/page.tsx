import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import BlogPostForm from "@/components/admin/forms/BlogPostForm";

export const metadata = { title: "Edit Blog Post" };

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();
  const raw = await BlogPost.findById(id).lean();
  if (!raw) notFound();
  const post = JSON.parse(JSON.stringify({ ...raw, _id: String(raw._id) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Edit Blog Post</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Update &ldquo;{post.title}&rdquo;
        </p>
      </div>
      <BlogPostForm post={post} />
    </div>
  );
}
