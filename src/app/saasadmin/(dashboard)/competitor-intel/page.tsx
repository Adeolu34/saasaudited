import dbConnect from "@/lib/mongodb";
import CompetitorIngestion from "@/lib/models/CompetitorIngestion";

export const metadata = { title: "Competitor Intelligence Queue" };

export default async function CompetitorIntelPage() {
  await dbConnect();

  const [summary, pendingItems, reviewItems] = await Promise.all([
    CompetitorIngestion.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
    CompetitorIngestion.find({ status: "pending" })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean(),
    CompetitorIngestion.find({ status: "needs_review" })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean(),
  ]);

  const summaryMap = new Map<string, number>(
    summary.map((item) => [String(item._id), Number(item.count)])
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Competitor Intelligence Queue</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Public-source ingest records and confidence-based review queue.
        </p>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["pending", "needs_review", "upserted", "skipped", "error"].map((status) => (
          <div
            key={status}
            className="bg-surface-container-lowest ghost-border rounded-xl p-4"
          >
            <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">
              {status.replace("_", " ")}
            </p>
            <p className="text-2xl font-bold">{summaryMap.get(status) ?? 0}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Pending Upsert</h2>
        <div className="overflow-x-auto bg-surface-container-lowest rounded-xl ghost-border">
          <table className="w-full text-sm">
            <thead className="text-left text-on-surface-variant border-b border-outline-variant/20">
              <tr>
                <th className="p-3">Source</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">URL</th>
              </tr>
            </thead>
            <tbody>
              {pendingItems.map((item) => (
                <tr key={String(item._id)} className="border-b border-outline-variant/10">
                  <td className="p-3 font-mono text-xs">{item.source}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.mapped_category || item.category_text || "—"}</td>
                  <td className="p-3">{(item.confidence ?? 0).toFixed(2)}</td>
                  <td className="p-3 max-w-[360px] truncate">
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {item.source_url}
                    </a>
                  </td>
                </tr>
              ))}
              {pendingItems.length === 0 && (
                <tr>
                  <td className="p-4 text-on-surface-variant" colSpan={5}>
                    No pending records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Needs Review</h2>
        <div className="overflow-x-auto bg-surface-container-lowest rounded-xl ghost-border">
          <table className="w-full text-sm">
            <thead className="text-left text-on-surface-variant border-b border-outline-variant/20">
              <tr>
                <th className="p-3">Source</th>
                <th className="p-3">Name</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {reviewItems.map((item) => (
                <tr key={String(item._id)} className="border-b border-outline-variant/10">
                  <td className="p-3 font-mono text-xs">{item.source}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{(item.confidence ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-on-surface-variant">{item.notes || "Manual triage required"}</td>
                </tr>
              ))}
              {reviewItems.length === 0 && (
                <tr>
                  <td className="p-4 text-on-surface-variant" colSpan={4}>
                    No records waiting for review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
