import Link from "next/link";

interface BlogPostCardProps {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  authorName: string;
  authorImage?: string;
  readTime: number;
  featuredImage?: string;
}

export default function BlogPostCard({
  slug,
  title,
  category,
  excerpt,
  authorName,
  authorImage,
  readTime,
  featuredImage,
}: BlogPostCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="group cursor-pointer block">
      {featuredImage ? (
        <div className="aspect-video rounded-xl overflow-hidden mb-6 relative">
          <img
            src={featuredImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      ) : (
        <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-surface-container-low flex items-center justify-center relative">
          <div className="absolute inset-0 dot-pattern opacity-10" />
          <span className="material-symbols-outlined text-5xl text-primary/15">article</span>
        </div>
      )}
      <span className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] mb-3 block">
        {category}
      </span>
      <h3 className="font-headline text-2xl text-on-surface mb-3 leading-tight group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="font-body text-[13px] text-on-surface-variant leading-relaxed mb-6">
        {excerpt}
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10 group-hover:border-outline-variant/25 transition-colors">
        {authorImage ? (
          <img
            src={authorImage}
            alt={authorName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface-variant">
            {authorName.charAt(0)}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-on-surface">{authorName}</span>
          <span className="text-[10px] text-on-surface-variant font-mono">
            {readTime} min read
          </span>
        </div>
      </div>
    </Link>
  );
}
