export const revalidate = 3600;

import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";
import Category from "@/lib/models/Category";
import Comparison from "@/lib/models/Comparison";
import ReviewCard from "@/components/review/ReviewCard";
import NewsletterBand from "@/components/shared/NewsletterBand";
import ScrollReveal from "@/components/shared/ScrollReveal";
import NumberTicker from "@/components/shared/NumberTicker";

export default async function HomePage() {
  await dbConnect();

  const [featuredTools, categories, comparisons] = await Promise.all([
    Tool.find({ is_featured: true }).sort({ overall_score: -1 }).limit(3).lean(),
    Category.find().lean(),
    Comparison.find().limit(3).lean(),
  ]);

  return (
    <>
      {/* Category Pills Strip */}
      <div className="w-full bg-surface-container-low border-b border-surface-container/50 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-3 items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline mr-2 shrink-0">
            Quick Filter:
          </span>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="px-4 py-1.5 rounded-full bg-surface-container-lowest text-on-surface-variant text-xs font-medium hover:bg-secondary-container/20 transition-all border border-outline-variant/10 whitespace-nowrap hover:border-primary/30 hover:text-primary"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Section — Editorial Magazine Layout */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-36 relative hero-glow">
        {/* Decorative editorial elements */}
        <div className="absolute top-16 left-6 hidden lg:block">
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-outline-variant/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Main headline — asymmetric, not centered */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="up">
              <span className="section-marker mb-6 block">
                Trusted B2B SaaS reviews
              </span>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={80}>
              <h1 className="font-headline text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] text-on-surface tracking-tight mb-8">
                Software
                <br />
                decisions,
                <br />
                <span className="italic ember-gradient-text">made simple.</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={160}>
              <p className="font-body text-on-surface-variant text-lg md:text-xl mb-12 leading-relaxed max-w-lg">
                Unbiased, data-driven insights into the stacks that scale. We test
                every feature so you don&apos;t have to waste your budget.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={240}>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/reviews"
                  className="ember-gradient text-on-primary px-8 py-4 rounded-xl font-semibold shadow-xl shadow-primary/10 hover:shadow-primary/25 active:scale-[0.98] transition-all"
                >
                  Browse reviews
                </Link>
                <Link
                  href="/compare"
                  className="bg-transparent border border-outline-variant/30 text-on-surface px-8 py-4 rounded-xl font-semibold hover:bg-surface-container-low hover:border-outline-variant/50 transition-all"
                >
                  See comparisons
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Animated stats + editorial detail */}
          <div className="lg:col-span-5 hidden lg:block">
            <ScrollReveal direction="right" delay={300}>
              <div className="relative">
                {/* Decorative dot pattern */}
                <div className="absolute -top-8 -right-4 w-48 h-48 dot-pattern opacity-30 rounded-2xl" />

                <div className="relative bg-surface-container-lowest rounded-2xl p-8 ghost-border space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                      Live editorial data
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <NumberTicker
                        value="1,200+"
                        className="font-mono text-3xl font-bold text-on-surface block"
                      />
                      <span className="text-[10px] font-label uppercase tracking-widest text-outline mt-1 block">
                        Reviews
                      </span>
                    </div>
                    <div>
                      <NumberTicker
                        value="142k"
                        className="font-mono text-3xl font-bold text-on-surface block"
                      />
                      <span className="text-[10px] font-label uppercase tracking-widest text-outline mt-1 block">
                        Monthly Readers
                      </span>
                    </div>
                    <div>
                      <NumberTicker
                        value="55"
                        className="font-mono text-3xl font-bold text-on-surface block"
                      />
                      <span className="text-[10px] font-label uppercase tracking-widest text-outline mt-1 block">
                        Tools Rated
                      </span>
                    </div>
                    <div>
                      <NumberTicker
                        value="9.4"
                        className="font-mono text-3xl font-bold text-primary block"
                      />
                      <span className="text-[10px] font-label uppercase tracking-widest text-outline mt-1 block">
                        Avg. Accuracy
                      </span>
                    </div>
                  </div>

                  {/* Mini editorial rule */}
                  <div className="h-px bg-gradient-to-r from-outline-variant/40 via-outline-variant/20 to-transparent" />

                  <p className="text-xs text-on-surface-variant italic font-headline">
                    &ldquo;The most thorough SaaS review platform we&apos;ve encountered.&rdquo;
                  </p>
                  <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                    &mdash; Product Hunt
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Mobile stats row */}
        <ScrollReveal direction="up" delay={320} className="lg:hidden mt-16">
          <div className="flex items-center justify-center gap-8 text-[11px] font-label uppercase tracking-widest text-outline">
            <span className="flex flex-col items-center gap-1">
              <NumberTicker value="1,200+" className="font-mono text-lg font-bold text-on-surface" />
              <span>Reviews</span>
            </span>
            <span className="w-px h-8 bg-outline-variant/30" />
            <span className="flex flex-col items-center gap-1">
              <NumberTicker value="55" className="font-mono text-lg font-bold text-on-surface" />
              <span>Tools</span>
            </span>
            <span className="w-px h-8 bg-outline-variant/30" />
            <span className="flex flex-col items-center gap-1">
              <span className="font-mono text-lg font-bold text-on-surface">100%</span>
              <span>Unbiased</span>
            </span>
          </div>
        </ScrollReveal>
      </section>

      {/* Editorial Rule Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent" />
      </div>

      {/* Top-rated Grid */}
      <section className="bg-surface-container-low py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="section-marker mb-4 block">01 — Featured</span>
                <h2 className="font-headline text-4xl text-on-surface mb-2">
                  The Verdict&apos;s Choice
                </h2>
                <p className="text-on-surface-variant">
                  Top-rated solutions for Q1 2026
                </p>
              </div>
              <Link
                href="/reviews"
                className="text-primary font-semibold arrow-slide text-sm"
              >
                View all
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-reveal-stagger="">
            {featuredTools.map((tool, i) => (
              <ScrollReveal key={tool.slug} direction="up" delay={i * 100}>
                <ReviewCard
                  slug={tool.slug}
                  name={tool.name}
                  category={tool.category}
                  shortDescription={tool.short_description}
                  overallScore={tool.overall_score}
                  metrics={tool.metrics}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section — Editorial Split Layout */}
      <section className="py-24 relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-surface-container/50 hidden lg:block" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <ScrollReveal direction="left">
              <div>
                <span className="section-marker mb-4 block">02 — Compare</span>
                <h2 className="font-headline text-4xl text-on-surface mb-6 leading-tight">
                  Head-to-Head
                  <br />
                  Comparisons
                </h2>
                <p className="text-on-surface-variant mb-10 max-w-md">
                  We put the top contenders side-by-side to find the hidden
                  trade-offs that sales teams won&apos;t tell you.
                </p>

                <Link
                  href="/compare"
                  className="ember-gradient text-on-primary px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:shadow-primary/15 active:scale-[0.98] transition-all"
                >
                  Build your own comparison
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={150}>
              <div className="space-y-4">
                {comparisons.map((comp, i) => (
                  <Link
                    key={comp.slug}
                    href={`/compare/${comp.slug}`}
                    className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-xl group ghost-border card-hover block"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-outline-variant w-6">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium text-on-surface group-hover:text-primary transition-colors">
                        {comp.title.replace(/:.*/, "")}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">
                      arrow_forward
                    </span>
                  </Link>
                ))}

                {/* Decorative "more" indicator */}
                <div className="flex items-center gap-3 pt-4 pl-10">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/25" />
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/15" />
                  </div>
                  <Link href="/compare" className="text-xs text-on-surface-variant link-underline">
                    and more comparisons
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Categories Marquee Strip */}
      <ScrollReveal direction="fade">
        <div className="py-12 bg-surface-container-low border-y border-outline-variant/10 overflow-hidden">
          <div className="flex items-center gap-8 animate-[marquee_40s_linear_infinite] whitespace-nowrap w-max">
            {[...categories, ...categories].map((cat, i) => (
              <Link
                key={`${cat.slug}-${i}`}
                href={`/categories/${cat.slug}`}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-lg opacity-40">
                  {cat.icon_name}
                </span>
                <span className="font-label text-sm font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Newsletter Band */}
      <NewsletterBand />
    </>
  );
}
