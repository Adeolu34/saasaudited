"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/admin/shared/FormField";
import SelectField from "@/components/admin/shared/SelectField";

export default function NewUserPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role: form.get("role"),
    };

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      router.push("/admin/users?success=User+created");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">New Admin User</h1>
        <p className="text-on-surface-variant text-sm mt-1">Create a new admin account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 space-y-5">
          <FormField label="Name" name="name" required placeholder="Full name" />
          <FormField label="Email" name="email" type="email" required placeholder="user@saasaudited.com" />
          <FormField label="Password" name="password" type="password" required placeholder="Minimum 8 characters" />
          <SelectField
            label="Role"
            name="role"
            required
            defaultValue="editor"
            options={[
              { value: "editor", label: "Editor" },
              { value: "admin", label: "Admin" },
              { value: "superadmin", label: "Super Admin" },
            ]}
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="ember-gradient text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
            Create User
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
