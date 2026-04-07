"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import Toast from "@/components/admin/shared/Toast";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";

interface ApiKey {
  _id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  usage_count: number;
  rate_limit: number;
  last_used_at?: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);

  async function fetchKeys() {
    setLoading(true);
    const res = await fetch("/api/saasadmin/api-keys");
    const data = await res.json();
    setKeys(data.keys || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  async function revokeKey() {
    if (!revoking) return;
    await fetch(`/api/saasadmin/api-keys/${revoking._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    });
    setRevoking(null);
    fetchKeys();
  }

  async function deleteKey(id: string) {
    await fetch(`/api/saasadmin/api-keys/${id}`, { method: "DELETE" });
    fetchKeys();
  }

  return (
    <div className="space-y-6">
      <Toast />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">API Keys</h1>
          <p className="text-on-surface-variant text-sm mt-1">{keys.length} keys</p>
        </div>
        <button
          onClick={() => router.push("/saasadmin/api-keys/new")}
          className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Generate Key
        </button>
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-2xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">key</span>
            <p className="text-on-surface-variant text-sm">No API keys yet. Generate your first key.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Rate Limit</th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {keys.map((k) => (
                  <tr key={k._id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">{k.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">{k.key_prefix}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                          <div
                            className="h-full ember-gradient rounded-full"
                            style={{ width: `${Math.min((k.usage_count / 1000) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-on-surface-variant">{k.usage_count}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-on-surface">{k.rate_limit}/min</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={k.is_active ? "active" : "revoked"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {k.is_active && (
                          <button
                            onClick={() => setRevoking(k)}
                            className="p-1.5 rounded-lg hover:bg-amber-100 text-on-surface-variant hover:text-amber-800 transition-colors"
                            title="Revoke"
                          >
                            <span className="material-symbols-outlined text-lg">block</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteKey(k._id)}
                          className="p-1.5 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition-colors"
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

      <ConfirmDialog
        open={!!revoking}
        title="Revoke API Key"
        message={`Are you sure you want to revoke "${revoking?.name}"? This key will no longer work.`}
        confirmLabel="Revoke"
        onConfirm={revokeKey}
        onCancel={() => setRevoking(null)}
      />
    </div>
  );
}
