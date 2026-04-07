import Link from "next/link";

interface ReviewCardRankedProps {
  rank: number;
  slug: string;
  name: string;
  shortDescription: string;
  overallScore: number;
  logoUrl?: string;
}

export default function ReviewCardRanked({
  rank,
  slug,
  name,
  shortDescription,
  overallScore,
  logoUrl,
}: ReviewCardRankedProps) {
  return (
    <Link
      href={`/reviews/${slug}`}
      className="bg-surface rounded-2xl p-8 transition-all hover:shadow-editorial relative group block"
    >
      <div className="absolute top-8 right-8 font-mono text-4xl font-bold text-surface-container-highest">
        {String(rank).padStart(2, "0")}
      </div>
      <div className="flex items-center gap-4 mb-8">
        {logoUrl ? (
          <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-outline-variant/10 flex items-center justify-center p-2">
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-on-surface-variant">
              {name.charAt(0)}
            </span>
          </div>
        )}
        <h3 className="font-headline text-2xl font-bold">{name}</h3>
      </div>
      <p className="text-on-surface-variant text-sm mb-8 leading-relaxed line-clamp-3">
        {shortDescription}
      </p>
      <div className="flex items-center justify-between mt-auto pt-6 border-t border-outline-variant/10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-bold text-primary">
            {overallScore.toFixed(1)}
          </span>
          <span className="font-mono text-[8px] text-on-surface-variant leading-none uppercase">
            Score
          </span>
        </div>
        <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
          Read Review{" "}
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
        </span>
      </div>
    </Link>
  );
}
