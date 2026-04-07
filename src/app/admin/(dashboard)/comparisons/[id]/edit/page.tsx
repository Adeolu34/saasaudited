import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Comparison from "@/lib/models/Comparison";
import ComparisonForm from "@/components/admin/forms/ComparisonForm";

export const metadata = { title: "Edit Comparison" };

export default async function EditComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();
  const raw = await Comparison.findById(id).lean();
  if (!raw) notFound();
  const comparison = JSON.parse(JSON.stringify({ ...raw, _id: String(raw._id) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Edit Comparison</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Update &ldquo;{comparison.title}&rdquo;
        </p>
      </div>
      <ComparisonForm comparison={comparison} />
    </div>
  );
}
