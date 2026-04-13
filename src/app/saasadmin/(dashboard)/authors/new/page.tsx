import AuthorForm from "@/components/admin/forms/AuthorForm";

export const metadata = { title: "New Author" };

export default function NewAuthorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">New Author</h1>
        <p className="text-on-surface-variant text-sm mt-1">Add a new author profile.</p>
      </div>
      <AuthorForm />
    </div>
  );
}
