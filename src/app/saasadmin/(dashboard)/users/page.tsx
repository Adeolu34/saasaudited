"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import Toast from "@/components/admin/shared/Toast";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";

interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  last_login_at?: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/saasadmin/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function deleteUser() {
    if (!deleting) return;
    await fetch(`/api/saasadmin/users/${deleting._id}`, { method: "DELETE" });
    setDeleting(null);
    fetchUsers();
  }

  async function toggleActive(user: AdminUser) {
    await fetch(`/api/saasadmin/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !user.is_active }),
    });
    fetchUsers();
  }

  return (
    <div className="space-y-6">
      <Toast />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Admin Users</h1>
          <p className="text-on-surface-variant text-sm mt-1">{users.length} users</p>
        </div>
        <button
          onClick={() => router.push("/saasadmin/users/new")}
          className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New User
        </button>
      </div>

      <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-2xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{u.email}</td>
                    <td className="px-4 py-3 text-sm capitalize text-on-surface">{u.role}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleActive(u)}
                          className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
                          title={u.is_active ? "Deactivate" : "Activate"}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {u.is_active ? "toggle_on" : "toggle_off"}
                          </span>
                        </button>
                        <button
                          onClick={() => setDeleting(u)}
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
        open={!!deleting}
        title="Delete User"
        message={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
        onConfirm={deleteUser}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
