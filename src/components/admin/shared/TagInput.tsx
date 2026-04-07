"use client";

import { useState, useRef } from "react";

export default function TagInput({
  label,
  name,
  defaultValue = [],
  placeholder = "Type and press Enter",
}: {
  label: string;
  name: string;
  defaultValue?: string[];
  placeholder?: string;
}) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(value: string) {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
  }

  function removeTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const input = inputRef.current;
      if (input) {
        addTag(input.value);
        input.value = "";
      }
    } else if (
      e.key === "Backspace" &&
      inputRef.current?.value === "" &&
      tags.length > 0
    ) {
      removeTag(tags.length - 1);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
        {label}
      </label>
      {/* Hidden inputs for form submission */}
      {tags.map((tag, i) => (
        <input key={i} type="hidden" name={name} value={tag} />
      ))}
      <div className="flex flex-wrap gap-2 p-2.5 bg-surface-container-low rounded-lg min-h-[42px] focus-within:ring-2 focus-within:ring-primary/40 transition-shadow">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-2.5 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
        />
      </div>
    </div>
  );
}
