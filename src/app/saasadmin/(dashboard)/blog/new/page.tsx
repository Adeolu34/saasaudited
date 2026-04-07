import BlogPostForm from "@/components/admin/forms/BlogPostForm";

export const metadata = { title: "New Blog Post" };

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">New Blog Post</h1>
        <p className="text-on-surface-variant text-sm mt-1">Write a new blog post.</p>
      </div>
      <BlogPostForm />
    </div>
  );
}
