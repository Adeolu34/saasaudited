import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Review from "@/lib/models/Review";
import SearchInput from "@/components/admin/shared/SearchInput";
import Toast from "@/components/admin/shared/Toast";
import DeleteButton from "@/components/admin/shared/DeleteButton";

export const metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

async function getReviews(q: string, page: number) {
  await dbConnect();
  const limit = 20;
  const filter = q ? { title: { $regex: q, $options: "i" } } : {};
  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);
  return {
    reviews: reviews.map((r) => ({
      _id: String(r._id),
      title: r.title,
      slug: r.slug,
      tool_slug: r.tool_slug,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const page = parseInt(sp.page || "1");
  const { reviews, total, totalPages } = await getReviews(q, page);

  return (
    <div className="space-y-6">
      <Toast />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Reviews</h1>
          <p className="text-on-surface-variant text-sm mt-1">{total} reviews total</p>
        </div>
        <Link href="/saasadmin/reviews/new" className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span>
          New Review
        </Link>
      </div>
      <SearchInput placeholder="Search reviews..." />
      <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Title</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Tool</th>
                <th className="px-4 py-3 text-right text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {reviews.map((r) => (
                <tr key={r._id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{r.title}</td>
                  <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">{r.slug}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">{r.tool_slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/reviews/${r.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary" title="View on site">
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                      </a>
                      <Link href={`/saasadmin/reviews/${r._id}/edit`} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary" title="Edit">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <DeleteButton id={r._id} name={r.title} resourceType="reviews" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reviews.length === 0 && (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">inbox</span>
            <p className="text-on-surface-variant text-sm">No reviews found.</p>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`/saasadmin/reviews?q=${encodeURIComponent(q)}&page=${p}`} className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? "ember-gradient text-on-primary font-semibold" : "text-on-surface-variant hover:bg-surface-container"}`}>{p}</a>
          ))}
        </div>
      )}
    </div>
  );
}
