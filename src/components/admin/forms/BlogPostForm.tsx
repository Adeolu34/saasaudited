"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import FormField from "@/components/admin/shared/FormField";
import TextareaField from "@/components/admin/shared/TextareaField";
import TagInput from "@/components/admin/shared/TagInput";

interface TocItem {
  title: string;
  anchor: string;
}

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
  toc?: TocItem[];
  read_time?: number;
  is_featured?: boolean;
}

/** Extract TOC from HTML by parsing <h2 id="...">...</h2> tags */
function extractTocFromHtml(html: string): TocItem[] {
  const regex = /<h2[^>]+id=["']([^"']+)["'][^>]*>(.*?)<\/h2>/gi;
  const items: TocItem[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    items.push({
      anchor: match[1],
      title: match[2].replace(/<[^>]+>/g, "").trim(),
    });
  }
  return items;
}

/** Calculate read time from HTML content (230 words per minute) */
function calcReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 230));
}

export default function BlogPostForm({ post }: { post?: BlogPostData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toc, setToc] = useState<TocItem[]>(post?.toc || []);
  const [readTime, setReadTime] = useState(post?.read_time || 5);
  const [featuredImage, setFeaturedImage] = useState(
    typeof post?.featured_image === "string" ? post.featured_image : ""
  );
  const [generatingImage, setGeneratingImage] = useState(false);
  const [authorName, setAuthorName] = useState(post?.author?.name || "");
  const [authorImage, setAuthorImage] = useState(post?.author?.image || "");
  const [authorBio, setAuthorBio] = useState(post?.author?.bio || "");
  const [authorsList, setAuthorsList] = useState<{ name: string; bio: string; image: string }[]>([]);
  const isEdit = Boolean(post?._id);

  // Fetch available authors on mount
  useEffect(() => {
    fetch("/api/saasadmin/ai/authors")
      .then((r) => r.json())
      .then((data) => {
        if (data.authors) setAuthorsList(data.authors);
      })
      .catch(() => {});
  }, []);

  // On mount or when post data changes (e.g. AI data loaded), auto-extract TOC and read_time from content
  useEffect(() => {
    if (post?.content) {
      if (!post.toc || post.toc.length === 0) {
        const extracted = extractTocFromHtml(post.content);
        if (extracted.length > 0) setToc(extracted);
      }
      setReadTime(post.read_time || calcReadTime(post.content));
    }
    if (post?.featured_image && typeof post.featured_image === "string") setFeaturedImage(post.featured_image);
    if (post?.author?.name) setAuthorName(post.author.name);
    if (post?.author?.image) setAuthorImage(post.author.image);
    if (post?.author?.bio) setAuthorBio(post.author.bio);
  }, [post?.content, post?.toc, post?.read_time, post?.featured_image, post?.author]);

  async function handleGenerateImage() {
    // Get the title from the form
    const titleInput = document.querySelector<HTMLInputElement>('input[name="title"]');
    const title = titleInput?.value?.trim();
    if (!title) {
      setError("Enter a post title first so we can generate a relevant image.");
      return;
    }

    setGeneratingImage(true);
    setError("");
    try {
      const res = await fetch("/api/saasadmin/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, contentType: "blog" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");
      setFeaturedImage(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setGeneratingImage(false);
    }
  }

  /** When content changes, auto-extract TOC and recalculate read time */
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const html = e.target.value;
      const extracted = extractTocFromHtml(html);
      if (extracted.length > 0) setToc(extracted);
      setReadTime(calcReadTime(html));
    },
    []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const content = String(form.get("content") || "");

    // Auto-extract TOC from content if not already set
    let finalToc = toc;
    if (finalToc.length === 0 && content) {
      finalToc = extractTocFromHtml(content);
    }

    const body = {
      slug: form.get("slug"),
      title: form.get("title"),
      category: form.get("category"),
      author: {
        name: authorName,
        image: authorImage || undefined,
        bio: authorBio || undefined,
      },
      excerpt: form.get("excerpt"),
      content,
      featured_image: featuredImage || undefined,
      tags: form.getAll("tags").filter(Boolean),
      toc: finalToc,
      read_time: readTime || calcReadTime(content),
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
          <FormField label="Read Time (min)" name="read_time" type="number" value={readTime} readOnly />
        </div>
        <TextareaField label="Excerpt" name="excerpt" required defaultValue={post?.excerpt} rows={3} placeholder="Brief summary..." />

        {/* Featured Image with AI Generate */}
        <div className="space-y-1.5">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
            Featured Image
          </label>
          <div className="flex gap-2">
            <input
              name="featured_image"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://... or generate with AI"
              className="flex-1 px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm"
            />
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={generatingImage}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {generatingImage ? (
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
              )}
              {generatingImage ? "Generating..." : "Generate"}
            </button>
          </div>
          {featuredImage && (
            <div className="mt-3 relative group">
              <img
                src={featuredImage}
                alt="Featured image preview"
                className="w-full max-h-48 object-cover rounded-lg border border-outline-variant/20"
              />
              <button
                type="button"
                onClick={() => setFeaturedImage("")}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
          <input type="checkbox" name="is_featured" defaultChecked={post?.is_featured} className="w-4 h-4 accent-primary" />
          Featured Post
        </label>
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">Author</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
              Author <span className="text-error ml-0.5">*</span>
            </label>
            <select
              name="author_name"
              value={authorName}
              onChange={(e) => {
                const name = e.target.value;
                setAuthorName(name);
                const match = authorsList.find((a) => a.name === name);
                if (match) {
                  setAuthorBio(match.bio);
                  if (match.image) setAuthorImage(match.image);
                }
              }}
              required
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm"
            >
              <option value="">Select an author</option>
              {authorsList.map((a) => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
              Author Image URL
            </label>
            <input
              name="author_image"
              value={authorImage}
              onChange={(e) => setAuthorImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
            Author Bio
          </label>
          <textarea
            name="author_bio"
            value={authorBio}
            onChange={(e) => setAuthorBio(e.target.value)}
            rows={2}
            placeholder="Short bio..."
            className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm resize-y"
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">Content</h3>
        <TextareaField label="Content (HTML)" name="content" required defaultValue={post?.content} rows={16} placeholder="<h2>Introduction</h2>..." onChange={handleContentChange} />
        <TagInput label="Tags" name="tags" defaultValue={post?.tags} placeholder="Add a tag and press Enter" />

        {/* TOC Preview */}
        {toc.length > 0 && (
          <div className="bg-surface-container rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-lg">list</span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Table of Contents ({toc.length} sections)</span>
            </div>
            <ol className="space-y-1 text-sm text-on-surface-variant">
              {toc.map((item, i) => (
                <li key={item.anchor} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-outline w-5">{i + 1}.</span>
                  <span>{item.title}</span>
                  <span className="text-[10px] font-mono text-outline ml-auto">#{item.anchor}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
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
