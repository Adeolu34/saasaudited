"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";

export default function DeleteButton({
  id,
  name,
  resourceType,
}: {
  id: string;
  name: string;
  resourceType: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    try {
      const res = await fetch(`/api/saasadmin/${resourceType}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch {
      // silently handle
    }
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg hover:bg-error-container transition-colors text-on-surface-variant hover:text-error"
        title="Delete"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
      </button>
      <ConfirmDialog
        open={open}
        title="Delete Item"
        message={`Are you sure you want to delete "${name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
