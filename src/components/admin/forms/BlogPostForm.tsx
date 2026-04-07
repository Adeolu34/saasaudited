"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/admin/shared/FormField";
import TextareaField from "@/components/admin/shared/TextareaField";
import TagInput from "@/components/admin/shared/TagInput";

interface BlogPostData {
  _id?: string;
  slug?: string;
  title?: string;
  category?: string;
  author?: { name?: string; image?: string; bio?: string };
  excerpt?: string;
  content?: string;
  featured_image?: string;
  tags?: string[];
  read_time?: number;
  is_featured?: boolean;
}

export default function BlogPostForm({ post }: { post?: BlogPostData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(post?._id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      slug: form.get("slug"),
      title: form.get("title"),
      category: form.get("category"),
      author: {
        name: form.get("author_name"),
        image: form.get("author_image") || undefined,
        bio: form.get("author_bio") || undefined,
      },
      excerpt: form.get("excerpt"),
      content: form.get("content"),
      featured_image: form.get("featured_image") || undefined,
      tags: form.getAll("tags").filter(Boolean),
      read_time: Number(form.get("read_time")) || 5,
      is_featured: form.has("is_featured"),
    };

    try {
      const url = isEdit ? `/api/saasadmin/blog/${post!._id}` : "/api/saasadmin/blog";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      router.push(
        "/saasadmin/blog?success=" +
          encodeURIComponent(isEdit ? "Post updated" : "Post created")
      );
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Title" name="title" required defaultValue={post?.title} placeholder="Post title" />
          <FormField label="Slug" name="slug" required defaultValue={post?.slug} placeholder="post-slug" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Category" name="category" required defaultValue={post?.category} placeholder="e.g. Industry Insights" />
          <FormField label="Read Time (min)" name="read_time" type="number" defaultValue={post?.read_time || 5} />
        </div>
        <TextareaField label="Excerpt" name="excerpt" required defaultValue={post?.excerpt} rows={3} placeholder="Brief summary..." />
        <FormField label="Featured Image URL" name="featured_image" defaultValue={post?.featured_image} placeholder="https://..." />
        <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
          <input type="checkbox" name="is_featured" defaultChecked={post?.is_featured} className="w-4 h-4 accent-primary" />
          Featured Post
        </label>
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">Author</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Author Name" name="author_name" required defaultValue={post?.author?.name} placeholder="Author name" />
          <FormField label="Author Image URL" name="author_image" defaultValue={post?.author?.image} placeholder="https://..." />
        </div>
        <TextareaField label="Author Bio" name="author_bio" defaultValue={post?.author?.bio} rows={2} placeholder="Short bio..." />
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">Content</h3>
        <TextareaField label="Content (HTML)" name="content" required defaultValue={post?.content} rows={16} placeholder="<h2>Introduction</h2>..." />
        <TagInput label="Tags" name="tags" defaultValue={post?.tags} placeholder="Add a tag and press Enter" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="ember-gradient text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center gap-2">
          {saving && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
          {isEdit ? "Update Post" : "Create Post"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
