"use client";

import { useState } from "react";

interface AuthorResult {
  name: string;
  status: string;
  image?: string;
  error?: string;
}

export default function AuthorImagesButton() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AuthorResult[] | null>(null);

  async function handleClick() {
    if (!confirm("Generate AI profile images for both authors? This takes about a minute.")) return;

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/saasadmin/ai/authors", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResults(data.results);
    } catch (err: unknown) {
      setResults([{ name: "Error", status: "error", error: err instanceof Error ? err.message : "Failed" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
        ) : (
          <span className="material-symbols-outlined text-lg">face</span>
        )}
        {loading ? "Generating Authors..." : "Generate Author Images"}
      </button>
      {results && (
        <div className="flex gap-4">
          {results.map((r) => (
            <div key={r.name} className="flex items-center gap-3 bg-surface-container-low rounded-lg p-3">
              {r.image && (
                <img src={r.image} alt={r.name} className="w-12 h-12 rounded-full object-cover" />
              )}
              <div>
                <div className="text-sm font-medium text-on-surface">{r.name}</div>
                <div className={`text-xs ${r.status === "success" ? "text-green-400" : "text-red-400"}`}>
                  {r.status === "success" ? "Generated" : r.error}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
