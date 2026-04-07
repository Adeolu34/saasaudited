import dbConnect from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import NewToolClient from "./NewToolClient";

export const metadata = { title: "New Tool" };

export default async function NewToolPage() {
  await dbConnect();
  const cats = await Category.find().sort({ name: 1 }).lean();
  const categories = cats.map((c) => ({ value: c.slug, label: c.name }));

  return <NewToolClient categories={categories} />;
}
