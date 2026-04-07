import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Comparison from "@/lib/models/Comparison";
import SearchInput from "@/components/admin/shared/SearchInput";
import Toast from "@/components/admin/shared/Toast";
import DeleteButton from "@/components/admin/shared/DeleteButton";

export const metadata = { title: "Comparisons" };
export const dynamic = "force-dynamic";

async function getComparisons(q: string, page: number) {
  await dbConnect();
  const limit = 20;
  const filter = q ? { title: { $regex: q, $options: "i" } } : {};
  const [comparisons, total] = await Promise.all([
    Comparison.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Comparison.countDocuments(filter),
  ]);
  return {
    comparisons: comparisons.map((c) => ({
      _id: String(c._id),
      title: c.title,
      slug: c.slug,
      tool_a_slug: c.tool_a_slug,
      tool_b_slug: c.tool_b_slug,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function ComparisonsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const page = parseInt(sp.page || "1");
  const { comparisons, total, totalPages } = await getComparisons(q, page);

  return (
    <div className="space-y-6">
      <Toast />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Comparisons</h1>
          <p className="text-on-surface-variant text-sm mt-1">{total} comparisons total</p>
        </div>
        <Link href="/saasadmin/comparisons/new" className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span>
          New Comparison
        </Link>
      </div>
      <SearchInput placeholder="Search comparisons..." />
      <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Title</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Tool A</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Tool B</th>
                <th className="px-4 py-3 text-right text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {comparisons.map((c) => (
                <tr key={c._id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{c.title}</td>
                  <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">{c.slug}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">{c.tool_a_slug}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">{c.tool_b_slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/saasadmin/comparisons/${c._id}/edit`} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary" title="Edit">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <DeleteButton id={c._id} name={c.title} resourceType="comparisons" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {comparisons.length === 0 && (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">inbox</span>
            <p className="text-on-surface-variant text-sm">No comparisons found.</p>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`/saasadmin/comparisons?q=${encodeURIComponent(q)}&page=${p}`} className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? "ember-gradient text-on-primary font-semibold" : "text-on-surface-variant hover:bg-surface-container"}`}>{p}</a>
          ))}
        </div>
      )}
    </div>
  );
}
