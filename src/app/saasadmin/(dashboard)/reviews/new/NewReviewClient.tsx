"use client";

import { useState } from "react";
import ReviewForm from "@/components/admin/forms/ReviewForm";
import GenerateModal from "@/components/admin/ai/GenerateModal";

export default function NewReviewClient() {
  const [aiData, setAiData] = useState<Record<string, unknown> | undefined>();
  const [formKey, setFormKey] = useState(0);
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
            New Review
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Write a new editorial review.
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
        contentType="review"
        onGenerated={handleGenerated}
      />

      <ReviewForm key={formKey} review={aiData as any} />
    </div>
  );
}
