"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/admin/shared/FormField";
import TextareaField from "@/components/admin/shared/TextareaField";
import SelectField from "@/components/admin/shared/SelectField";
import ArrayFieldEditor from "@/components/admin/shared/ArrayFieldEditor";

interface ToolData {
  _id?: string;
  name?: string;
  slug?: string;
  category?: string;
  logo_url?: string;
  official_url?: string;
  overall_score?: number;
  rating_label?: string;
  short_description?: string;
  is_featured?: boolean;
  is_editors_pick?: boolean;
  pricing_tiers?: { name: string; price: string }[];
  metrics?: { label: string; value: number }[];
}

export default function ToolForm({
  tool,
  categories,
}: {
  tool?: ToolData;
  categories: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(tool?._id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const pricing_tiers: { name: string; price: string }[] = [];
    for (let i = 0; ; i++) {
      const name = form.get(`pricing_tiers[${i}].name`);
      const price = form.get(`pricing_tiers[${i}].price`);
      if (name === null) break;
      if (String(name).trim())
        pricing_tiers.push({ name: String(name), price: String(price) });
    }

    const metrics: { label: string; value: number }[] = [];
    for (let i = 0; ; i++) {
      const label = form.get(`metrics[${i}].label`);
      const value = form.get(`metrics[${i}].value`);
      if (label === null) break;
      if (String(label).trim())
        metrics.push({ label: String(label), value: Number(value) });
    }

    const body = {
      name: form.get("name"),
      slug: form.get("slug"),
      category: form.get("category"),
      logo_url: form.get("logo_url") || undefined,
      official_url: form.get("official_url") || undefined,
      overall_score: Number(form.get("overall_score")),
      rating_label: form.get("rating_label") || "Good",
      short_description: form.get("short_description"),
      is_featured: form.has("is_featured"),
      is_editors_pick: form.has("is_editors_pick"),
      pricing_tiers,
      metrics,
    };

    try {
      const url = isEdit
        ? `/api/saasadmin/tools/${tool!._id}`
        : "/api/saasadmin/tools";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      router.push(
        "/saasadmin/tools?success=" +
          encodeURIComponent(isEdit ? "Tool updated" : "Tool created")
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
          <FormField
            label="Name"
            name="name"
            required
            defaultValue={tool?.name}
            placeholder="e.g. Notion"
          />
          <FormField
            label="Slug"
            name="slug"
            required
            defaultValue={tool?.slug}
            placeholder="e.g. notion"
          />
        </div>
        <SelectField
          label="Category"
          name="category"
          required
          defaultValue={tool?.category}
          options={categories}
        />
        <TextareaField
          label="Short Description"
          name="short_description"
          required
          defaultValue={tool?.short_description}
          rows={3}
          placeholder="Brief description of the tool..."
        />
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Logo URL"
            name="logo_url"
            defaultValue={tool?.logo_url}
            placeholder="https://..."
          />
          <FormField
            label="Official URL"
            name="official_url"
            defaultValue={tool?.official_url}
            placeholder="https://..."
          />
          <FormField
            label="Overall Score"
            name="overall_score"
            type="number"
            required
            defaultValue={tool?.overall_score}
            placeholder="0-10"
          />
          <SelectField
            label="Rating Label"
            name="rating_label"
            defaultValue={tool?.rating_label || "Good"}
            options={[
              { value: "Outstanding", label: "Outstanding" },
              { value: "Excellent", label: "Excellent" },
              { value: "Great", label: "Great" },
              { value: "Good", label: "Good" },
              { value: "Average", label: "Average" },
              { value: "Below Average", label: "Below Average" },
            ]}
          />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={tool?.is_featured}
              className="w-4 h-4 accent-primary"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
            <input
              type="checkbox"
              name="is_editors_pick"
              defaultChecked={tool?.is_editors_pick}
              className="w-4 h-4 accent-primary"
            />
            Editor&apos;s Pick
          </label>
        </div>
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Pricing Tiers
        </h3>
        <ArrayFieldEditor
          label=""
          name="pricing_tiers"
          fields={[
            {
              key: "name",
              label: "Tier Name",
              placeholder: "e.g. Free, Pro, Enterprise",
            },
            {
              key: "price",
              label: "Price",
              placeholder: "e.g. $0/mo, $12/mo",
            },
          ]}
          defaultValue={tool?.pricing_tiers}
        />
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Metrics
        </h3>
        <ArrayFieldEditor
          label=""
          name="metrics"
          fields={[
            {
              key: "label",
              label: "Metric",
              placeholder: "e.g. Ease of Use",
            },
            {
              key: "value",
              label: "Score",
              type: "number",
              placeholder: "0-10",
            },
          ]}
          defaultValue={tool?.metrics?.map((m) => ({
            label: m.label,
            value: m.value,
          }))}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="ember-gradient text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
        >
          {saving && (
            <span className="material-symbols-outlined text-lg animate-spin">
              progress_activity
            </span>
          )}
          {isEdit ? "Update Tool" : "Create Tool"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
