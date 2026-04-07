import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";
import Category from "@/lib/models/Category";
import ToolForm from "@/components/admin/forms/ToolForm";

export const metadata = { title: "Edit Tool" };

export default async function EditToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();
  const [rawTool, cats] = await Promise.all([
    Tool.findById(id).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);
  if (!rawTool) notFound();

  const tool = JSON.parse(JSON.stringify({ ...rawTool, _id: String(rawTool._id) }));
  const categories = cats.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Edit Tool
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Update &ldquo;{tool.name}&rdquo;
        </p>
      </div>
      <ToolForm tool={tool} categories={categories} />
    </div>
  );
}
