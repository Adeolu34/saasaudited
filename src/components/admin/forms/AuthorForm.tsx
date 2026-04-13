"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import FormField from "@/components/admin/shared/FormField";
import TextareaField from "@/components/admin/shared/TextareaField";

interface AuthorData {
  _id?: string;
  name?: string;
  bio?: string;
  image?: string;
  role?: string;
  content_types?: string[];
}

export default function AuthorForm({ author }: { author?: AuthorData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(author?.image || "");
  const [generatingImage, setGeneratingImage] = useState(false);

  async function generateAuthorImage(name: string) {
    if (!name.trim()) return;
    setGeneratingImage(true);
    try {
      const res = await fetch("/api/saasadmin/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name, contentType: "author" }),
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      }
    } catch {
      console.error("Failed to generate author image");
    } finally {
      setGeneratingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      bio: form.get("bio"),
      image: imageUrl,
      role: form.get("role"),
      content_types: (form.get("content_types") as string || "blog")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const url = author?._id
        ? `/api/saasadmin/authors/${author._id}`
        : "/api/saasadmin/authors";
      const method = author?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }

      router.push("/saasadmin/authors?toast=saved");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Avatar Preview */}
      <div className="flex items-center gap-6">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Author avatar"
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">
              person
            </span>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium text-on-surface">Author Photo</p>
          <p className="text-xs text-on-surface-variant">
            Enter a URL below or generate an AI avatar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Name"
          name="name"
          required
          defaultValue={author?.name}
          placeholder="Maya Chen"
        />
        <FormField
          label="Role"
          name="role"
          defaultValue={author?.role || "Staff Writer"}
          placeholder="Senior Analyst"
        />
      </div>

      <TextareaField
        label="Bio"
        name="bio"
        rows={3}
        defaultValue={author?.bio}
        placeholder="Short author biography that appears on blog posts..."
      />

      <div className="space-y-1.5">
        <label
          htmlFor="image"
          className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold"
        >
          Image URL
        </label>
        <div className="flex gap-2">
          <input
            id="image"
            name="image"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm"
          />
          <button
            type="button"
            onClick={() => {
              const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
              generateAuthorImage(nameInput?.value || author?.name || "");
            }}
            disabled={generatingImage}
            className="px-4 py-2.5 bg-surface-container-low hover:bg-surface-container rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">
              {generatingImage ? "hourglass_top" : "auto_awesome"}
            </span>
            {generatingImage ? "Generating..." : "AI Avatar"}
          </button>
        </div>
      </div>

      <FormField
        label="Content Types"
        name="content_types"
        defaultValue={author?.content_types?.join(", ") || "blog"}
        placeholder="blog, review, comparison"
      />

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="ember-gradient text-on-primary px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : author?._id ? "Save Changes" : "Create Author"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          Cancel
        </button>
      </div>

      {author?._id && (
        <p className="text-xs text-on-surface-variant/60 italic">
          Saving will automatically update this author&apos;s name, bio, and image on all
          their existing blog posts.
        </p>
      )}
    </form>
  );
}
