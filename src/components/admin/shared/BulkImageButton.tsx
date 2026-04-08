"use client";

import { useState } from "react";

export default function BulkImageButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleClick() {
    if (!confirm("Generate AI images for all blog posts that are missing one? This may take a few minutes.")) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/saasadmin/ai/image/bulk", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ message: data.message, type: "success" });
    } catch (err: unknown) {
      setResult({ message: err instanceof Error ? err.message : "Failed", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
        ) : (
          <span className="material-symbols-outlined text-lg">auto_awesome</span>
        )}
        {loading ? "Generating..." : "Generate Missing Images"}
      </button>
      {result && (
        <span className={`text-sm ${result.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {result.message}
        </span>
      )}
    </div>
  );
}
