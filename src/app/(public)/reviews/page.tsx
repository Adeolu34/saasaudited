import type { Metadata } from "next";
export const revalidate = 1800;
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";
import Category from "@/lib/models/Category";
import ReviewCard from "@/components/review/ReviewCard";
import Pagination from "@/components/shared/Pagination";
import ScoreCircle from "@/components/review/ScoreCircle";
import MetricBar from "@/components/review/MetricBar";
import ScrollReveal from "@/components/shared/ScrollReveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "B2B SaaS Reviews — Honest, Data-Driven Software Analysis",
  description:
    "Every B2B SaaS tool, honestly reviewed. Objective, data-driven analysis of CRM, project management, AI tools, and the software that powers your business.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "B2B SaaS Reviews — Honest, Data-Driven Software Analysis",
    description:
      "Every B2B SaaS tool, honestly reviewed with data-driven analysis.",
    url: "/reviews",
    images: [{ url: "/api/og?title=All%20SaaS%20Reviews&subtitle=Honest%2C%20Data-Driven%20Analysis", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "B2B SaaS Reviews — Honest, Data-Driven Software Analysis",
    images: ["/api/og?title=All%20SaaS%20Reviews&subtitle=Honest%2C%20Data-Driven%20Analysis"],
  },
};

const PER_PAGE = 6;

interface Props {
  searchParams: Promise<{ category?: string; sort?: string; page?: string }>;
}

export default async function ReviewsIndex({ searchParams }: Props) {
  await dbConnect();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || "1"));
  const sortKey =
    params.sort === "newest"
      ? "createdAt"
      : params.sort === "az"
        ? "name"
        : "overall_score";
  const sortDir = params.sort === "az" ? 1 : -1;
  const sort = { [sortKey]: sortDir } as Record<string, 1 | -1>;

  const categoryParam =
    typeof params.category === "string" ? params.category : undefined;
  const filter = categoryParam ? { category: categoryParam } : {};

  const [tools, total, categories, editorsPick] = await Promise.all([
    Tool.find(filter)
      .sort(sort)
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .lean(),
    Tool.countDocuments(filter),
    Category.find().lean(),
    Tool.findOne({ is_editors_pick: true }).lean(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="pt-8 pb-24">
      {/* Hero */}
      <header className="max-w-7xl mx-auto px-8 mb-16">
        <ScrollReveal direction="up">
          <div className="max-w-[720px]">
            <span className="section-marker mb-4 block">
              {total} reviews &middot; Updated weekly
            </span>
            <h1 className="font-headline text-[32px] md:text-[56px] leading-[1.1] text-on-surface font-bold -tracking-[0.02em] mb-6">
              Every B2B tool,
              <br />
              <span className="italic">honestly reviewed.</span>
            </h1>
            <p className="text-[17px] text-on-surface-variant leading-relaxed">
              Objective, data-driven analysis of the software that powers your
              business. We test, you decide.
            </p>
          </div>
        </ScrollReveal>
      </header>

      {/* Category Strip */}
      <div className="w-full mb-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            <Link
              href="/reviews"
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !params.category
                  ? "ember-gradient text-white shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/reviews?category=${encodeURIComponent(cat.name)}`}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  params.category === cat.name
                    ? "ember-gradient text-white shadow-sm"
                    : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Bar */}
      <div className="sticky top-12 z-40 bg-background/95 backdrop-blur-sm border-b border-outline-variant/10 mb-16 py-4">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <span className="text-sm font-mono text-on-surface-variant">
            Showing {total} reviews
          </span>
          <div className="flex gap-2">
            {[
              { label: "Top rated", value: "" },
              { label: "Newest", value: "newest" },
              { label: "A\u2013Z", value: "az" },
            ].map((s) => (
              <Link
                key={s.value}
                href={`/reviews?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), ...(s.value ? { sort: s.value } : {}) }).toString()}`}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  (params.sort || "") === s.value
                    ? "bg-surface-container-high text-on-surface"
                    : "bg-transparent text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Editor's Pick Spotlight */}
      {editorsPick && page === 1 && !params.category && (
        <section className="max-w-7xl mx-auto px-8 mb-24">
          <ScrollReveal direction="scale">
            <div className="bg-surface-container-low rounded-xl p-12 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-full h-[2px] ember-gradient" />

              <div className="flex-1">
                <span className="section-marker mb-4 block">
                  Editors&apos; Pick
                </span>
                <h2 className="font-headline text-[40px] text-on-surface font-bold mb-4">
                  {editorsPick.name}: {editorsPick.short_description}
                </h2>
                <div className="flex gap-4 mt-8">
                  <Link
                    href={`/reviews/${editorsPick.slug}`}
                    className="ember-gradient text-white px-8 py-3 rounded-lg font-semibold active:scale-95 transition-transform arrow-slide"
                  >
                    Read the Verdict
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-12 bg-white/40 backdrop-blur p-10 rounded-2xl border border-white/50 shadow-sm">
                <ScoreCircle score={editorsPick.overall_score} size="md" />
                <div className="space-y-4 w-48">
                  {editorsPick.metrics.slice(0, 3).map((m: { label: string; value: number }) => (
                    <MetricBar
                      key={m.label}
                      label={m.label}
                      value={m.value}
                      maxValue={100}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Review Grid */}
      <section className="max-w-7xl mx-auto px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, i) => (
            <ScrollReveal key={tool.slug} direction="up" delay={i * 80}>
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
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/reviews"
          searchParams={
            params.category ? { category: params.category } : undefined
          }
        />
      )}
    </div>
  );
}
