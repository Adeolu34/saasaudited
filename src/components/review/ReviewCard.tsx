import Link from "next/link";
import MetricBar from "./MetricBar";

interface ReviewCardProps {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  overallScore: number;
  metrics: { label: string; value: number }[];
}

export default function ReviewCard({
  slug,
  name,
  category,
  shortDescription,
  overallScore,
  metrics,
}: ReviewCardProps) {
  const scoreColor =
    overallScore >= 8.5
      ? "bg-green-50 text-green-800 border-green-200/50"
      : overallScore >= 7
        ? "bg-amber-50 text-amber-800 border-amber-200/50"
        : "bg-red-50 text-red-800 border-red-200/50";

  return (
    <Link
      href={`/reviews/${slug}`}
      className="relative bg-surface-container-lowest rounded-xl p-8 card-hover group block ghost-border overflow-hidden"
    >
      {/* Hover accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] ember-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

      <div className="flex justify-between items-start mb-6">
        <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          {category}
        </span>
        <div className={`font-mono text-sm px-2.5 py-1 rounded-lg border ${scoreColor} font-semibold`}>
          {overallScore.toFixed(1)}
        </div>
      </div>
      <h3 className="font-headline text-2xl text-on-surface font-bold mb-3 group-hover:text-primary transition-colors duration-300">
        {name}
      </h3>
      <p className="text-on-surface-variant text-sm mb-8 leading-relaxed line-clamp-2">
        {shortDescription}
      </p>
      <div className="space-y-4 mb-8">
        {metrics.slice(0, 3).map((m) => (
          <MetricBar key={m.label} label={m.label} value={m.value} maxValue={100} />
        ))}
      </div>
      <span className="text-primary font-semibold text-sm arrow-slide">
        Read review
        <span className="material-symbols-outlined text-xs">
          arrow_forward
        </span>
      </span>
    </Link>
  );
}
