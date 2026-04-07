"use client";

import { useState } from "react";
import FormField from "@/components/admin/shared/FormField";

type ContentType = "tool" | "review" | "blog" | "comparison" | "category";

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  onGenerated: (data: Record<string, unknown>) => void;
}

const paramConfig: Record<
  ContentType,
  { name: string; label: string; placeholder: string; required?: boolean }[]
> = {
  tool: [
    { name: "toolName", label: "Tool Name", placeholder: "e.g. Notion", required: true },
    { name: "category", label: "Category", placeholder: "e.g. Project Management" },
  ],
  review: [
    { name: "toolSlug", label: "Tool Slug", placeholder: "e.g. notion", required: true },
    { name: "toolName", label: "Tool Name", placeholder: "e.g. Notion" },
    { name: "toolDescription", label: "Tool Description", placeholder: "Brief description..." },
  ],
  blog: [
    { name: "topic", label: "Topic / Title Idea", placeholder: "e.g. Best project management tools for startups", required: true },
    { name: "category", label: "Category", placeholder: "e.g. Strategy, Guides, Industry News" },
  ],
  comparison: [
    { name: "toolASlug", label: "Tool A Slug", placeholder: "e.g. notion", required: true },
    { name: "toolBSlug", label: "Tool B Slug", placeholder: "e.g. clickup", required: true },
    { name: "toolAName", label: "Tool A Name", placeholder: "e.g. Notion" },
    { name: "toolBName", label: "Tool B Name", placeholder: "e.g. ClickUp" },
  ],
  category: [
    { name: "categoryName", label: "Category Name", placeholder: "e.g. Project Management", required: true },
  ],
};

const typeLabels: Record<ContentType, string> = {
  tool: "Tool",
  review: "Review",
  blog: "Blog Post",
  comparison: "Comparison",
  category: "Category",
};

export default function GenerateModal({
  isOpen,
  onClose,
  contentType,
  onGenerated,
}: GenerateModalProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const fields = paramConfig[contentType];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGenerating(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const params: Record<string, string> = {};
    fields.forEach((f) => {
      const val = form.get(f.name);
      if (val) params[f.name] = String(val);
    });

    try {
      const res = await fetch("/api/saasadmin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: contentType, params }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Generation failed");

      onGenerated(result.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-violet-600">auto_awesome</span>
            <h2 className="font-headline text-xl font-bold text-on-surface">
              Generate {typeLabels[contentType]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              label={field.label}
              name={field.name}
              required={field.required}
              placeholder={field.placeholder}
            />
          ))}

          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                {generating ? "progress_activity" : "auto_awesome"}
              </span>
              {generating ? "Generating..." : "Generate"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={generating}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
