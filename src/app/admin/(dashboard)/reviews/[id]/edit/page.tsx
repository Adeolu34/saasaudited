import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Review from "@/lib/models/Review";
import ReviewForm from "@/components/admin/forms/ReviewForm";

export const metadata = { title: "Edit Review" };

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();
  const raw = await Review.findById(id).lean();
  if (!raw) notFound();
  const review = JSON.parse(JSON.stringify({ ...raw, _id: String(raw._id) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Edit Review</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Update &ldquo;{review.title}&rdquo;
        </p>
      </div>
      <ReviewForm review={review} />
    </div>
  );
}
