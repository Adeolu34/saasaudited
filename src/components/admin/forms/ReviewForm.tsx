"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/admin/shared/FormField";
import TextareaField from "@/components/admin/shared/TextareaField";
import TagInput from "@/components/admin/shared/TagInput";

interface ReviewData {
  _id?: string;
  tool_slug?: string;
  slug?: string;
  title?: string;
  pros?: string[];
  cons?: string[];
  verdict?: string;
  body_content?: string;
  screenshots?: string[];
}

export default function ReviewForm({ review }: { review?: ReviewData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(review?._id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      tool_slug: form.get("tool_slug"),
      slug: form.get("slug"),
      title: form.get("title"),
      pros: form.getAll("pros").filter(Boolean),
      cons: form.getAll("cons").filter(Boolean),
      verdict: form.get("verdict"),
      body_content: form.get("body_content"),
      screenshots: form.getAll("screenshots").filter(Boolean),
    };

    try {
      const url = isEdit
        ? `/api/admin/reviews/${review!._id}`
        : "/api/admin/reviews";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      router.push(
        "/admin/reviews?success=" +
          encodeURIComponent(isEdit ? "Review updated" : "Review created")
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
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Basic Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Title" name="title" required defaultValue={review?.title} placeholder="Review title" />
          <FormField label="Slug" name="slug" required defaultValue={review?.slug} placeholder="review-slug" />
        </div>
        <FormField label="Tool Slug" name="tool_slug" required defaultValue={review?.tool_slug} placeholder="tool-slug" />
        <TextareaField label="Verdict" name="verdict" required defaultValue={review?.verdict} rows={3} placeholder="Summary verdict..." />
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Pros & Cons
        </h3>
        <TagInput label="Pros" name="pros" defaultValue={review?.pros} placeholder="Add a pro and press Enter" />
        <TagInput label="Cons" name="cons" defaultValue={review?.cons} placeholder="Add a con and press Enter" />
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Content
        </h3>
        <TextareaField label="Body Content (HTML)" name="body_content" required defaultValue={review?.body_content} rows={12} placeholder="<h2>Introduction</h2>..." />
        <TagInput label="Screenshots (URLs)" name="screenshots" defaultValue={review?.screenshots} placeholder="Add screenshot URL and press Enter" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="ember-gradient text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center gap-2">
          {saving && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
          {isEdit ? "Update Review" : "Create Review"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
