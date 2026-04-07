import ReviewForm from "@/components/admin/forms/ReviewForm";

export const metadata = { title: "New Review" };

export default function NewReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">New Review</h1>
        <p className="text-on-surface-variant text-sm mt-1">Write a new editorial review.</p>
      </div>
      <ReviewForm />
    </div>
  );
}
