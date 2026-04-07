"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/admin/shared/FormField";

export default function NewApiKeyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      rate_limit: Number(form.get("rate_limit")) || 60,
    };

    try {
      const res = await fetch("/api/saasadmin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate key");
      setGeneratedKey(data.key.full_key);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (generatedKey) {
    return (
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">API Key Generated</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Copy this key now. You won&apos;t be able to see it again.
          </p>
        </div>

        <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-4">
          <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-lg font-mono text-sm break-all">
            {generatedKey}
          </div>
          <button
            onClick={copyKey}
            className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              {copied ? "check" : "content_copy"}
            </span>
            {copied ? "Copied!" : "Copy Key"}
          </button>
        </div>

        <button
          onClick={() => router.push("/saasadmin/api-keys")}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          Back to API Keys
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Generate API Key</h1>
        <p className="text-on-surface-variant text-sm mt-1">Create a new API key for programmatic access.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
          <FormField label="Key Name" name="name" required placeholder="e.g. Production API" />
          <FormField label="Rate Limit (req/min)" name="rate_limit" type="number" defaultValue={60} placeholder="60" />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="ember-gradient text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
            Generate Key
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
