import type { Metadata } from "next";
export const revalidate = 1800;
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import BlogPostCard from "@/components/blog/BlogPostCard";
import Pagination from "@/components/shared/Pagination";
import ScrollReveal from "@/components/shared/ScrollReveal";
import Link from "next/link";
import NewsletterForm from "@/components/shared/NewsletterForm";

export const metadata: Metadata = {
  title: "The SaasAudited Journal — SaaS Insights & Buying Guides",
  description:
    "Expert SaaS insights, B2B software strategy, buying guides, and industry analysis for modern operators and decision-makers.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The SaasAudited Journal — SaaS Insights & Buying Guides",
    description:
      "Expert SaaS insights, B2B software strategy, and buying guides.",
    url: "/blog",
    images: [{ url: "/api/og?title=The%20SaasAudited%20Journal&subtitle=SaaS%20Insights%20%26%20Buying%20Guides", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The SaasAudited Journal — SaaS Insights & Buying Guides",
    images: ["/api/og?title=The%20SaasAudited%20Journal&subtitle=SaaS%20Insights%20%26%20Buying%20Guides"],
  },
};

const PER_PAGE = 6;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogIndex({ searchParams }: Props) {
  await dbConnect();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));

  const publishedFilter = { status: { $ne: "draft" } };

  const [posts, total, featured] = await Promise.all([
    BlogPost.find(publishedFilter)
      .sort({ published_at: -1 })
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .lean(),
    BlogPost.countDocuments(publishedFilter),
    BlogPost.findOne({ is_featured: true, ...publishedFilter }).lean(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const firstRow = posts.slice(0, 3);
  const secondRow = posts.slice(3, 6);

  return (
    <div className="max-w-7xl mx-auto px-8 pb-24">
      {/* Hero */}
      <section className="py-20 max-w-[860px]">
        <ScrollReveal direction="up">
          <span className="section-marker mb-6 block">
            The SaasAudited Journal
          </span>
          <h1 className="font-headline text-6xl italic leading-tight text-on-surface mb-10">
            Insights for the
            <br />
            <span className="ember-gradient-text">modern operator.</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={100}>
          <div className="flex flex-wrap gap-3">
            {["Strategy", "Reviews", "Comparisons", "Guides", "Industry News"].map(
              (cat) => (
                <Link
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}`}
                  className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-medium hover:bg-primary hover:text-on-primary transition-all duration-300"
                >
                  {cat}
                </Link>
              )
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* Featured Post */}
      {featured && page === 1 && (
        <ScrollReveal direction="scale">
          <Link
            href={`/blog/${featured.slug}`}
            className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col md:flex-row shadow-editorial group cursor-pointer transition-all duration-500 hover:translate-y-[-4px] mb-20 block relative"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] ember-gradient" />

            <div className="w-full md:w-[60%] p-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <span className="ember-gradient text-on-primary text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-wider">
                  Featured
                </span>
                <span className="text-on-surface-variant text-xs font-mono uppercase tracking-widest">
                  {featured.category}
                </span>
              </div>
              <h2 className="font-headline text-4xl text-on-surface mb-6 leading-snug group-hover:text-primary transition-colors duration-300">
                {featured.title}
              </h2>
              <p className="font-body text-lg text-on-surface-variant leading-relaxed mb-8 max-w-xl">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-3">
                {featured.author?.image && (
                  <img
                    src={featured.author.image}
                    alt={featured.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="text-sm font-bold text-on-surface">
                    {featured.author?.name}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {featured.read_time} min read
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-[40%] relative overflow-hidden bg-surface-container-low min-h-[300px] flex items-center justify-center">
              {featured.featured_image ? (
                <img
                  src={featured.featured_image}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 dot-pattern opacity-10" />
                  <span className="material-symbols-outlined text-6xl text-primary/20">
                    article
                  </span>
                </div>
              )}
            </div>
          </Link>
        </ScrollReveal>
      )}

      {/* Post Grid Row 1 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {firstRow.map((post, i) => (
          <ScrollReveal key={post.slug} direction="up" delay={i * 100}>
            <BlogPostCard
              slug={post.slug}
              title={post.title}
              category={post.category}
              excerpt={post.excerpt}
              authorName={post.author?.name || "Staff"}
              authorImage={post.author?.image}
              readTime={post.read_time}
              featuredImage={post.featured_image}
            />
          </ScrollReveal>
        ))}
      </section>

      {/* Inline Newsletter CTA */}
      {page === 1 && (
        <ScrollReveal direction="up" className="mt-24">
          <section className="bg-[#1C1917] rounded-xl p-12 flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-md relative">
              <h3 className="font-headline text-3xl text-white mb-2 leading-tight">
                Weekly intel for B2B operators.
              </h3>
              <p className="text-stone-400 font-body text-sm">
                Join 12,000+ founders and operators receiving our curated
                deep-dives every Tuesday.
              </p>
            </div>
            <div className="w-full md:w-auto relative">
              <NewsletterForm />
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Post Grid Row 2 */}
      {secondRow.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-24">
          {secondRow.map((post, i) => (
            <ScrollReveal key={post.slug} direction="up" delay={i * 100}>
              <BlogPostCard
                slug={post.slug}
                title={post.title}
                category={post.category}
                excerpt={post.excerpt}
                authorName={post.author?.name || "Staff"}
                authorImage={post.author?.image}
                readTime={post.read_time}
                featuredImage={post.featured_image}
              />
            </ScrollReveal>
          ))}
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-20">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/blog"
          />
        </div>
      )}
    </div>
  );
}
