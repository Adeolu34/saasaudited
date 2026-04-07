"use client";

import { useEffect, useState } from "react";

interface AuditEntry {
  _id: string;
  type: string;
  method?: string;
  path: string;
  status_code?: number;
  error_message?: string;
  duration_ms?: number;
  createdAt: string;
}

interface DailyUsage {
  _id: string;
  count: number;
}

export default function MonitoringPage() {
  const [errors, setErrors] = useState<AuditEntry[]>([]);
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"errors" | "logs" | "usage">("errors");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/saasadmin/dashboard");
        const data = await res.json();
        setErrors(data.recentErrors || []);
        setLogs(data.recentLogs || []);
        setDailyUsage(data.dailyUsage || []);
      } catch {
        // silently handle
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const maxUsage = Math.max(...dailyUsage.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Monitoring</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Error logs, API usage, and system activity
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {(["errors", "logs", "usage"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm capitalize font-medium ${
              tab === t
                ? "ember-gradient text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {t === "errors" && (
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">error</span>
                Errors ({errors.length})
              </span>
            )}
            {t === "logs" && (
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">list_alt</span>
                Activity
              </span>
            )}
            {t === "usage" && (
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">trending_up</span>
                API Usage
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-surface-container-lowest ghost-border rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-2xl text-primary animate-spin">progress_activity</span>
        </div>
      ) : (
        <>
          {/* Errors Tab */}
          {tab === "errors" && (
            <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
              {errors.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-green-500 mb-3 block">check_circle</span>
                  <p className="text-on-surface font-medium">No errors recorded</p>
                  <p className="text-on-surface-variant text-sm mt-1">Everything is running smoothly.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/30">
                        <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Path</th>
                        <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/15">
                      {errors.map((e) => (
                        <tr key={e._id} className="hover:bg-surface-container-low/40">
                          <td className="px-4 py-3 text-xs font-mono text-on-surface-variant whitespace-nowrap">
                            {new Date(e.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-on-surface">
                            {e.method && <span className="text-primary font-semibold mr-1">{e.method}</span>}
                            {e.path}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-error font-semibold">{e.status_code}</td>
                          <td className="px-4 py-3 text-sm text-error max-w-xs truncate">{e.error_message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {tab === "logs" && (
            <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
              {logs.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">list_alt</span>
                  <p className="text-on-surface-variant text-sm">No activity recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/30">
                        <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Path</th>
                        <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/15">
                      {logs.map((l) => (
                        <tr key={l._id} className="hover:bg-surface-container-low/40">
                          <td className="px-4 py-3 text-xs font-mono text-on-surface-variant whitespace-nowrap">
                            {new Date(l.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs capitalize text-on-surface">{l.type.replace("_", " ")}</td>
                          <td className="px-4 py-3 text-xs font-mono font-semibold text-primary">{l.method || "-"}</td>
                          <td className="px-4 py-3 text-sm font-mono text-on-surface">{l.path}</td>
                          <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">
                            {l.duration_ms ? `${l.duration_ms}ms` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Usage Chart Tab */}
          {tab === "usage" && (
            <div className="bg-surface-container-lowest ghost-border rounded-xl p-6">
              <h3 className="font-headline text-lg font-bold text-on-surface mb-4">
                API Requests (Last 30 Days)
              </h3>
              {dailyUsage.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">trending_up</span>
                  <p className="text-on-surface-variant text-sm">No API usage data yet.</p>
                </div>
              ) : (
                <div className="flex items-end gap-1 h-48">
                  {dailyUsage.map((d) => (
                    <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {d.count}
                      </span>
                      <div
                        className="w-full ember-gradient rounded-t"
                        style={{ height: `${(d.count / maxUsage) * 160}px` }}
                        title={`${d._id}: ${d.count} requests`}
                      />
                      <span className="text-[9px] font-mono text-on-surface-variant -rotate-45 origin-top-left whitespace-nowrap">
                        {d._id.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
