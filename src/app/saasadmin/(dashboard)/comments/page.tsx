"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import Toast from "@/components/admin/shared/Toast";

interface Comment {
  _id: string;
  target_type: string;
  target_slug: string;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function CommentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/saasadmin/comments?${params}`);
    const data = await res.json();
    setComments(data.comments || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/saasadmin/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchComments();
  }

  async function deleteComment(id: string) {
    await fetch(`/api/saasadmin/comments/${id}`, { method: "DELETE" });
    fetchComments();
  }

  async function bulkAction(action: string) {
    if (selected.size === 0) return;
    await fetch("/api/saasadmin/comments/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), action }),
    });
    setSelected(new Set());
    fetchComments();
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === comments.length) setSelected(new Set());
    else setSelected(new Set(comments.map((c) => c._id)));
  };

  const statuses = ["", "pending", "approved", "rejected", "spam"];

  return (
    <div className="space-y-6">
      <Toast />
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Comments
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          {total} comments total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() =>
              router.push(`/saasadmin/comments${s ? `?status=${s}` : ""}`)
            }
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
              statusFilter === s
                ? "ember-gradient text-on-primary font-semibold"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-lg">
          <span className="text-sm text-on-surface font-medium">
            {selected.size} selected
          </span>
          <button
            onClick={() => bulkAction("approved")}
            className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
          >
            Approve
          </button>
          <button
            onClick={() => bulkAction("rejected")}
            className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
          >
            Reject
          </button>
          <button
            onClick={() => bulkAction("spam")}
            className="px-3 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200"
          >
            Spam
          </button>
          <button
            onClick={() => bulkAction("delete")}
            className="px-3 py-1 rounded text-xs font-medium bg-error text-on-error hover:bg-error/90"
          >
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-2xl text-primary animate-spin">
              progress_activity
            </span>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">
              forum
            </span>
            <p className="text-on-surface-variant text-sm">No comments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === comments.length && comments.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-primary"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                    Comment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {comments.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c._id)}
                        onChange={() => toggleSelect(c._id)}
                        className="w-4 h-4 accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-on-surface">{c.author_name}</p>
                      <p className="text-xs text-on-surface-variant">{c.author_email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface max-w-xs truncate">
                      {c.content}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-on-surface-variant">
                        {c.target_type}/{c.target_slug}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {c.status !== "approved" && (
                          <button
                            onClick={() => updateStatus(c._id, "approved")}
                            className="p-1 rounded hover:bg-green-100 text-green-700"
                            title="Approve"
                          >
                            <span className="material-symbols-outlined text-lg">check</span>
                          </button>
                        )}
                        {c.status !== "rejected" && (
                          <button
                            onClick={() => updateStatus(c._id, "rejected")}
                            className="p-1 rounded hover:bg-red-100 text-red-700"
                            title="Reject"
                          >
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteComment(c._id)}
                          className="p-1 rounded hover:bg-error-container text-on-surface-variant hover:text-error"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
