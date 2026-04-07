import CategoryForm from "@/components/admin/forms/CategoryForm";

export const metadata = { title: "New Category" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">New Category</h1>
        <p className="text-on-surface-variant text-sm mt-1">Add a new category.</p>
      </div>
      <CategoryForm />
    </div>
  );
}
