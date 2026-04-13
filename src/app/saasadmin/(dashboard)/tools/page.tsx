import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";
import SearchInput from "@/components/admin/shared/SearchInput";
import Toast from "@/components/admin/shared/Toast";
import DeleteButton from "@/components/admin/shared/DeleteButton";

export const metadata = { title: "Tools" };
export const dynamic = "force-dynamic";

async function getTools(q: string, page: number) {
  await dbConnect();
  const limit = 20;
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const [tools, total] = await Promise.all([
    Tool.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Tool.countDocuments(filter),
  ]);
  return {
    tools: tools.map((t) => ({
      _id: String(t._id),
      name: t.name,
      slug: t.slug,
      category: t.category,
      overall_score: t.overall_score,
      is_featured: t.is_featured,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const page = parseInt(sp.page || "1");
  const { tools, total, totalPages } = await getTools(q, page);

  return (
    <div className="space-y-6">
      <Toast />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Tools
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {total} tools total
          </p>
        </div>
        <Link
          href="/saasadmin/tools/new"
          className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Tool
        </Link>
      </div>

      <SearchInput placeholder="Search tools..." />

      <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                  Featured
                </th>
                <th className="px-4 py-3 text-right text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {tools.map((t) => (
                <tr
                  key={t._id}
                  className="hover:bg-surface-container-low/40 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">
                    {t.slug}
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface">
                    {t.category}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-primary">
                    {t.overall_score}
                  </td>
                  <td className="px-4 py-3">
                    {t.is_featured ? (
                      <span
                        className="material-symbols-outlined text-primary text-lg"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        star
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/30">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/reviews/${t.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
                        title="View on site"
                      >
                        <span className="material-symbols-outlined text-lg">
                          open_in_new
                        </span>
                      </a>
                      <Link
                        href={`/saasadmin/tools/${t._id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                      </Link>
                      <DeleteButton
                        id={t._id}
                        name={t.name}
                        resourceType="tools"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tools.length === 0 && (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">
              inbox
            </span>
            <p className="text-on-surface-variant text-sm">No tools found.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/saasadmin/tools?q=${encodeURIComponent(q)}&page=${p}`}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                p === page
                  ? "ember-gradient text-on-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
