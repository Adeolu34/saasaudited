import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import SearchInput from "@/components/admin/shared/SearchInput";
import Toast from "@/components/admin/shared/Toast";
import DeleteButton from "@/components/admin/shared/DeleteButton";

export const metadata = { title: "Blog Posts" };
export const dynamic = "force-dynamic";

async function getPosts(q: string, page: number) {
  await dbConnect();
  const limit = 20;
  const filter = q ? { title: { $regex: q, $options: "i" } } : {};
  const [posts, total] = await Promise.all([
    BlogPost.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    BlogPost.countDocuments(filter),
  ]);
  return {
    posts: posts.map((p) => ({
      _id: String(p._id),
      title: p.title,
      slug: p.slug,
      category: p.category,
      is_featured: p.is_featured,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const page = parseInt(sp.page || "1");
  const { posts, total, totalPages } = await getPosts(q, page);

  return (
    <div className="space-y-6">
      <Toast />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Blog Posts</h1>
          <p className="text-on-surface-variant text-sm mt-1">{total} posts total</p>
        </div>
        <Link href="/saasadmin/blog/new" className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span>
          New Post
        </Link>
      </div>
      <SearchInput placeholder="Search posts..." />
      <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Title</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Category</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Featured</th>
                <th className="px-4 py-3 text-right text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {posts.map((p) => (
                <tr key={p._id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{p.title}</td>
                  <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">{p.slug}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">{p.category}</td>
                  <td className="px-4 py-3">
                    {p.is_featured ? (
                      <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                    ) : (
                      <span className="text-on-surface-variant/30">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/saasadmin/blog/${p._id}/edit`} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary" title="Edit">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <DeleteButton id={p._id} name={p.title} resourceType="blog" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">inbox</span>
            <p className="text-on-surface-variant text-sm">No posts found.</p>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`/saasadmin/blog?q=${encodeURIComponent(q)}&page=${p}`} className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? "ember-gradient text-on-primary font-semibold" : "text-on-surface-variant hover:bg-surface-container"}`}>{p}</a>
          ))}
        </div>
      )}
    </div>
  );
}
