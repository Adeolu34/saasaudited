"use client";

import Link from "next/link";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  editHref?: (item: T) => string;
  onDelete?: (item: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  editHref,
  onDelete,
  emptyMessage = "No items found.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-surface-container-lowest ghost-border rounded-xl p-12 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">
          inbox
        </span>
        <p className="text-on-surface-variant text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
              {(editHref || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {data.map((item) => (
              <tr
                key={getRowKey(item)}
                className="hover:bg-surface-container-low/40 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-on-surface ${col.className || ""}`}
                  >
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
                {(editHref || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editHref && (
                        <Link
                          href={editHref(item)}
                          className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">
                            edit
                          </span>
                        </Link>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="p-1.5 rounded-lg hover:bg-error-container transition-colors text-on-surface-variant hover:text-error"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
