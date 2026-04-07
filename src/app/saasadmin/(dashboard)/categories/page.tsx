import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import SearchInput from "@/components/admin/shared/SearchInput";
import Toast from "@/components/admin/shared/Toast";
import DeleteButton from "@/components/admin/shared/DeleteButton";

export const metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

async function getCategories(q: string) {
  await dbConnect();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const categories = await Category.find(filter).sort({ name: 1 }).lean();
  return categories.map((c) => ({
    _id: String(c._id),
    name: c.name,
    slug: c.slug,
    icon_name: c.icon_name,
    review_count: c.review_count,
  }));
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const categories = await getCategories(q);

  return (
    <div className="space-y-6">
      <Toast />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Categories</h1>
          <p className="text-on-surface-variant text-sm mt-1">{categories.length} categories</p>
        </div>
        <Link href="/saasadmin/categories/new" className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span>
          New Category
        </Link>
      </div>
      <SearchInput placeholder="Search categories..." />
      <div className="bg-surface-container-lowest ghost-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Icon</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Name</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">Reviews</th>
                <th className="px-4 py-3 text-right text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-4 py-3"><span className="material-symbols-outlined text-primary text-xl">{c.icon_name}</span></td>
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{c.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">{c.slug}</td>
                  <td className="px-4 py-3 text-sm font-mono text-on-surface">{c.review_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/saasadmin/categories/${c._id}/edit`} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary" title="Edit">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <DeleteButton id={c._id} name={c.name} resourceType="categories" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">inbox</span>
            <p className="text-on-surface-variant text-sm">No categories found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
