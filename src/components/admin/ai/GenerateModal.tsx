"use client";

import { useState, useEffect, useRef } from "react";
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

const PROGRESS_STEPS = [
  { text: "Researching topic...", duration: 3000 },
  { text: "Generating content...", duration: 8000 },
  { text: "Adding statistics & data...", duration: 5000 },
  { text: "Generating featured image...", duration: 10000 },
  { text: "Finalizing...", duration: 5000 },
];

export default function GenerateModal({
  isOpen,
  onClose,
  contentType,
  onGenerated,
}: GenerateModalProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [progressStep, setProgressStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Progress animation
  useEffect(() => {
    if (!generating) {
      setProgressStep(0);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    function advanceStep(step: number) {
      if (step >= PROGRESS_STEPS.length) return;
      setProgressStep(step);
      timerRef.current = setTimeout(() => advanceStep(step + 1), PROGRESS_STEPS[step].duration);
    }

    advanceStep(0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [generating]);

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

  const currentStep = PROGRESS_STEPS[Math.min(progressStep, PROGRESS_STEPS.length - 1)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={generating ? undefined : onClose} />
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
            disabled={generating}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant disabled:opacity-30"
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

          {/* Progress indicator */}
          {generating && (
            <div className="bg-surface-container rounded-lg px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary animate-spin">
                  progress_activity
                </span>
                <span className="text-sm text-on-surface font-medium">
                  {currentStep.text}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-surface-container-low rounded-full overflow-hidden">
                <div
                  className="h-full ember-gradient rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((progressStep + 1) / PROGRESS_STEPS.length) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant">
                This may take 30-60 seconds for long-form content with images.
              </p>
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
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-30"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
