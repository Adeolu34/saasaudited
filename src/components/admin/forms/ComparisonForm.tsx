"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/admin/shared/FormField";
import TextareaField from "@/components/admin/shared/TextareaField";
import ArrayFieldEditor from "@/components/admin/shared/ArrayFieldEditor";

interface ComparisonData {
  _id?: string;
  slug?: string;
  title?: string;
  tool_a_slug?: string;
  tool_b_slug?: string;
  winner?: string;
  body_content?: string;
  tldr?: { title: string; description: string }[];
  features?: { name: string; tool_a: string; tool_b: string; winner?: string }[];
}

export default function ComparisonForm({ comparison }: { comparison?: ComparisonData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(comparison?._id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const tldr: { title: string; description: string }[] = [];
    for (let i = 0; ; i++) {
      const title = form.get(`tldr[${i}].title`);
      const description = form.get(`tldr[${i}].description`);
      if (title === null) break;
      if (String(title).trim())
        tldr.push({ title: String(title), description: String(description) });
    }

    const features: { name: string; tool_a: string; tool_b: string; winner?: string }[] = [];
    for (let i = 0; ; i++) {
      const name = form.get(`features[${i}].name`);
      const tool_a = form.get(`features[${i}].tool_a`);
      const tool_b = form.get(`features[${i}].tool_b`);
      const winner = form.get(`features[${i}].winner`);
      if (name === null) break;
      if (String(name).trim())
        features.push({
          name: String(name),
          tool_a: String(tool_a),
          tool_b: String(tool_b),
          winner: String(winner) || undefined,
        });
    }

    const body = {
      slug: form.get("slug"),
      title: form.get("title"),
      tool_a_slug: form.get("tool_a_slug"),
      tool_b_slug: form.get("tool_b_slug"),
      winner: form.get("winner"),
      body_content: form.get("body_content"),
      tldr,
      features,
    };

    try {
      const url = isEdit
        ? `/api/admin/comparisons/${comparison!._id}`
        : "/api/admin/comparisons";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      router.push(
        "/admin/comparisons?success=" +
          encodeURIComponent(isEdit ? "Comparison updated" : "Comparison created")
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
          <FormField label="Title" name="title" required defaultValue={comparison?.title} placeholder="Tool A vs Tool B" />
          <FormField label="Slug" name="slug" required defaultValue={comparison?.slug} placeholder="tool-a-vs-tool-b" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Tool A Slug" name="tool_a_slug" required defaultValue={comparison?.tool_a_slug} placeholder="tool-a" />
          <FormField label="Tool B Slug" name="tool_b_slug" required defaultValue={comparison?.tool_b_slug} placeholder="tool-b" />
          <FormField label="Winner" name="winner" defaultValue={comparison?.winner} placeholder="tool-a or tool-b" />
        </div>
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">TL;DR Points</h3>
        <ArrayFieldEditor
          label=""
          name="tldr"
          fields={[
            { key: "title", label: "Title", placeholder: "Point title" },
            { key: "description", label: "Description", placeholder: "Point description" },
          ]}
          defaultValue={comparison?.tldr}
        />
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">Feature Comparison</h3>
        <ArrayFieldEditor
          label=""
          name="features"
          fields={[
            { key: "name", label: "Feature", placeholder: "Feature name" },
            { key: "tool_a", label: "Tool A", placeholder: "Tool A value" },
            { key: "tool_b", label: "Tool B", placeholder: "Tool B value" },
            {
              key: "winner",
              label: "Winner",
              type: "select",
              options: [
                { value: "a", label: "Tool A" },
                { value: "b", label: "Tool B" },
                { value: "tie", label: "Tie" },
              ],
            },
          ]}
          defaultValue={comparison?.features?.map((f) => ({ ...f, winner: f.winner || "" }))}
        />
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">Content</h3>
        <TextareaField label="Body Content (HTML)" name="body_content" defaultValue={comparison?.body_content} rows={12} placeholder="<h2>Deep Dive</h2>..." />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="ember-gradient text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center gap-2">
          {saving && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
          {isEdit ? "Update Comparison" : "Create Comparison"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
