"use client";

import { useState } from "react";

interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface ArrayFieldEditorProps {
  label: string;
  name: string;
  fields: FieldDef[];
  defaultValue?: Record<string, string | number>[];
}

export default function ArrayFieldEditor({
  label,
  name,
  fields,
  defaultValue = [],
}: ArrayFieldEditorProps) {
  const [items, setItems] = useState<Record<string, string | number>[]>(
    defaultValue.length > 0
      ? defaultValue
      : [Object.fromEntries(fields.map((f) => [f.key, ""]))]
  );

  function addItem() {
    setItems([...items, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }

  function updateItem(index: number, key: string, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  }

  return (
    <div className="space-y-2">
      <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
        {label}
      </label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            {/* Hidden inputs */}
            {fields.map((field) => (
              <input
                key={field.key}
                type="hidden"
                name={`${name}[${index}].${field.key}`}
                value={String(item[field.key] ?? "")}
              />
            ))}
            {fields.map((field) => (
              <div key={field.key} className="flex-1">
                {field.type === "select" && field.options ? (
                  <select
                    value={String(item[field.key] ?? "")}
                    onChange={(e) =>
                      updateItem(index, field.key, e.target.value)
                    }
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">{field.placeholder || "Select..."}</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    value={String(item[field.key] ?? "")}
                    onChange={(e) =>
                      updateItem(
                        index,
                        field.key,
                        field.type === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                    placeholder={field.placeholder || field.label}
                    step={field.type === "number" ? "any" : undefined}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="p-2 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <span className="material-symbols-outlined text-lg">remove_circle</span>
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary-fixed/50 rounded-lg transition-colors"
      >
        <span className="material-symbols-outlined text-lg">add_circle</span>
        Add item
      </button>
    </div>
  );
}
