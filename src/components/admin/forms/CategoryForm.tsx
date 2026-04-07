"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/admin/shared/FormField";
import TextareaField from "@/components/admin/shared/TextareaField";
import TagInput from "@/components/admin/shared/TagInput";
import ArrayFieldEditor from "@/components/admin/shared/ArrayFieldEditor";

interface CategoryData {
  _id?: string;
  name?: string;
  slug?: string;
  description?: string;
  icon_name?: string;
  featured_tools?: string[];
  review_count?: number;
  faq?: { question: string; answer: string }[];
}

export default function CategoryForm({ category }: { category?: CategoryData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(category?._id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const faq: { question: string; answer: string }[] = [];
    for (let i = 0; ; i++) {
      const question = form.get(`faq[${i}].question`);
      const answer = form.get(`faq[${i}].answer`);
      if (question === null) break;
      if (String(question).trim())
        faq.push({ question: String(question), answer: String(answer) });
    }

    const body = {
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      icon_name: form.get("icon_name") || "category",
      featured_tools: form.getAll("featured_tools").filter(Boolean),
      review_count: Number(form.get("review_count")) || 0,
      faq,
    };

    try {
      const url = isEdit
        ? `/api/saasadmin/categories/${category!._id}`
        : "/api/saasadmin/categories";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      router.push(
        "/saasadmin/categories?success=" +
          encodeURIComponent(isEdit ? "Category updated" : "Category created")
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
          <FormField label="Name" name="name" required defaultValue={category?.name} placeholder="Category name" />
          <FormField label="Slug" name="slug" required defaultValue={category?.slug} placeholder="category-slug" />
        </div>
        <TextareaField label="Description" name="description" required defaultValue={category?.description} rows={3} placeholder="Category description..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Icon Name (Material)" name="icon_name" defaultValue={category?.icon_name || "category"} placeholder="e.g. category" />
          <FormField label="Review Count" name="review_count" type="number" defaultValue={category?.review_count || 0} />
        </div>
        <TagInput label="Featured Tools (slugs)" name="featured_tools" defaultValue={category?.featured_tools} placeholder="Add tool slug and press Enter" />
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">FAQ</h3>
        <ArrayFieldEditor
          label=""
          name="faq"
          fields={[
            { key: "question", label: "Question", placeholder: "FAQ question" },
            { key: "answer", label: "Answer", placeholder: "FAQ answer" },
          ]}
          defaultValue={category?.faq}
        />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="ember-gradient text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center gap-2">
          {saving && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
          {isEdit ? "Update Category" : "Create Category"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
