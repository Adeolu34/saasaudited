"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import FormField from "@/components/admin/shared/FormField";

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
  const [bio, setBio] = useState(author?.bio || "");
  const [role, setRole] = useState(author?.role || "Staff Writer");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  function getName(): string {
    const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
    return nameInput?.value?.trim() || author?.name || "";
  }

  async function generateAuthorImage(name?: string) {
    const authorName = name || getName();
    if (!authorName) {
      setError("Enter the author name first.");
      return;
    }
    setGeneratingImage(true);
    try {
      const res = await fetch("/api/saasadmin/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: authorName, contentType: "author" }),
      });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
      else if (data.error) setError(data.error);
    } catch {
      setError("Failed to generate image.");
    } finally {
      setGeneratingImage(false);
    }
  }

  async function generateAuthorBio(name?: string) {
    const authorName = name || getName();
    if (!authorName) {
      setError("Enter the author name first.");
      return;
    }
    setGeneratingBio(true);
    try {
      const roleInput = document.querySelector<HTMLInputElement>('input[name="role"]');
      const currentRole = roleInput?.value?.trim() || role;

      const res = await fetch("/api/saasadmin/ai/author-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: authorName, role: currentRole }),
      });
      const data = await res.json();
      if (data.bio) setBio(data.bio);
      if (data.role && !author?.role) setRole(data.role);
      if (data.error) setError(data.error);
    } catch {
      setError("Failed to generate bio.");
    } finally {
      setGeneratingBio(false);
    }
  }

  async function generateAll() {
    const authorName = getName();
    if (!authorName) {
      setError("Enter the author name first.");
      return;
    }
    setGeneratingAll(true);
    setError("");

    // Run bio and image generation in parallel
    await Promise.all([
      generateAuthorBio(authorName),
      generateAuthorImage(authorName),
    ]);

    setGeneratingAll(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      bio,
      image: imageUrl,
      role,
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

  const isGenerating = generatingImage || generatingBio || generatingAll;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Avatar Preview + Generate All */}
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
        <div className="space-y-3">
          <p className="text-sm font-medium text-on-surface">Author Profile</p>
          <button
            type="button"
            onClick={generateAll}
            disabled={isGenerating}
            className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              {generatingAll ? "hourglass_top" : "auto_awesome"}
            </span>
            {generatingAll ? "Generating..." : "Generate Bio & Avatar with AI"}
          </button>
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
        <div className="space-y-1.5">
          <label
            htmlFor="role"
            className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold"
          >
            Role
          </label>
          <input
            id="role"
            name="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Senior Analyst"
            className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm"
          />
        </div>
      </div>

      {/* Bio with AI generate button */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="bio"
            className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold"
          >
            Bio
          </label>
          <button
            type="button"
            onClick={() => generateAuthorBio()}
            disabled={isGenerating}
            className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            {generatingBio ? "Generating..." : "AI Bio"}
          </button>
        </div>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short author biography that appears on blog posts..."
          className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm resize-y"
        />
      </div>

      {/* Image URL with AI generate button */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="image"
            className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold"
          >
            Image URL
          </label>
          <button
            type="button"
            onClick={() => generateAuthorImage()}
            disabled={isGenerating}
            className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            {generatingImage ? "Generating..." : "AI Avatar"}
          </button>
        </div>
        <input
          id="image"
          name="image"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm"
        />
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
          disabled={saving || isGenerating}
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
