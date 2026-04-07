import dbConnect from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import ToolForm from "@/components/admin/forms/ToolForm";

export const metadata = { title: "New Tool" };

export default async function NewToolPage() {
  await dbConnect();
  const cats = await Category.find().sort({ name: 1 }).lean();
  const categories = cats.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          New Tool
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Add a new software tool to the database.
        </p>
      </div>
      <ToolForm categories={categories} />
    </div>
  );
}
