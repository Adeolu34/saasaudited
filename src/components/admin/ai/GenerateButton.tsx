"use client";

import { useState } from "react";

interface GenerateButtonProps {
  contentType: "tool" | "review" | "blog" | "comparison" | "category";
  onGenerated: (data: Record<string, unknown>) => void;
  getParams: () => Record<string, unknown>;
  label?: string;
}

export default function GenerateButton({
  contentType,
  onGenerated,
  getParams,
  label = "Generate with AI",
}: GenerateButtonProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/saasadmin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          params: getParams(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Generation failed");

      onGenerated(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        <span className="material-symbols-outlined text-lg">
          {generating ? "progress_activity" : "auto_awesome"}
        </span>
        {generating ? "Generating..." : label}
      </button>
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
