"use client";

import { useState, useEffect } from "react";
import ToolForm from "@/components/admin/forms/ToolForm";
import GenerateModal from "@/components/admin/ai/GenerateModal";

export default function NewToolClient({
  categories,
}: {
  categories: { value: string; label: string }[];
}) {
  const [aiData, setAiData] = useState<Record<string, unknown> | undefined>();
  const [formKey, setFormKey] = useState(0);

  // Check for AI data from Research page
  useEffect(() => {
    const stored = sessionStorage.getItem("ai-generated-data");
    if (stored) {
      sessionStorage.removeItem("ai-generated-data");
      try {
        setAiData(JSON.parse(stored));
        setFormKey((k) => k + 1);
      } catch { /* ignore */ }
    }
  }, []);
  const [modalOpen, setModalOpen] = useState(false);

  function handleGenerated(data: Record<string, unknown>) {
    setAiData(data);
    setFormKey((k) => k + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            New Tool
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Add a new software tool to the database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">auto_awesome</span>
          Generate with AI
        </button>
      </div>

      <GenerateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contentType="tool"
        onGenerated={handleGenerated}
      />

      <ToolForm key={formKey} tool={aiData as any} categories={categories} />
    </div>
  );
}
