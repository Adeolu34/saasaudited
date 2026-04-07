import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import CategoryForm from "@/components/admin/forms/CategoryForm";

export const metadata = { title: "Edit Category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();
  const raw = await Category.findById(id).lean();
  if (!raw) notFound();
  const category = JSON.parse(JSON.stringify({ ...raw, _id: String(raw._id) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Edit Category</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Update &ldquo;{category.name}&rdquo;
        </p>
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
