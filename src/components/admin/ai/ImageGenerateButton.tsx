"use client";

import { useState } from "react";

interface Props {
  title: string;
  contentType: "blog" | "tool";
  onImageGenerated: (url: string) => void;
}

export default function ImageGenerateButton({
  title,
  contentType,
  onImageGenerated,
}: Props) {
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!title) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/saasadmin/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, contentType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onImageGenerated(data.url);
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={generating || !title}
      className="p-2 rounded-lg hover:bg-violet-100 text-violet-600 disabled:opacity-30 transition-colors"
      title="Generate image with AI"
    >
      <span className="material-symbols-outlined text-lg">
        {generating ? "progress_activity" : "image"}
      </span>
    </button>
  );
}
