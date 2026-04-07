import ComparisonForm from "@/components/admin/forms/ComparisonForm";

export const metadata = { title: "New Comparison" };

export default function NewComparisonPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">New Comparison</h1>
        <p className="text-on-surface-variant text-sm mt-1">Create a new tool comparison.</p>
      </div>
      <ComparisonForm />
    </div>
  );
}
