import { notFound } from "next/navigation";
export const revalidate = 3600;
import type { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import Tool from "@/lib/models/Tool";
import Comparison from "@/lib/models/Comparison";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ScoreCircle from "@/components/review/ScoreCircle";
import MetricBar from "@/components/review/MetricBar";
import ReviewCardRanked from "@/components/review/ReviewCardRanked";
import FAQAccordion from "@/components/shared/FAQAccordion";
import NewsletterBand from "@/components/shared/NewsletterBand";
import Link from "next/link";
import { getCategory } from "@/lib/queries";
import JsonLd from "@/components/shared/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  await dbConnect();
  const categories = await Category.find({}, { slug: 1 }).lean();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found" };
  const title = `Best ${category.name} Software of 2026 — Reviews & Rankings`;
  const ogImage = `/api/og?title=${encodeURIComponent(`Best ${category.name} of 2026`)}&subtitle=${encodeURIComponent("Category Rankings & Reviews")}`;
  return {
    title,
    description: category.description,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: {
      title,
      description: category.description,
      url: `/categories/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: category.description,
      images: [ogImage],
    },
  };
}


export default async function CategoryListing({ params }: Props) {
  const { slug } = await params;

  const category = await getCategory(slug);
  if (!category) notFound();

  await dbConnect();
  const tools = await Tool.find({ category: category.name })
    .sort({ overall_score: -1 })
    .lean();

  const comparisons = await Comparison.find({
    $or: [
      { tool_a_slug: { $in: tools.map((t) => t.slug) } },
      { tool_b_slug: { $in: tools.map((t) => t.slug) } },
    ],
  })
    .limit(1)
    .lean();

  const topTool = tools[0];
  const restTools = tools.slice(1);

  return (
    <div className="pt-8">
      {category.faq && category.faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: category.faq.map((f: { question: string; answer: string }) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.answer,
              },
            })),
          }}
        />
      )}
      {/* Category Hero */}
      <section className="bg-surface-container-low w-full pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Categories", href: "/categories" },
              { label: category.name },
            ]}
          />
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container-highest">
              <span
                className="material-symbols-outlined text-primary text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {category.icon_name}
              </span>
            </div>
            <h1 className="font-headline text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
              Best {category.name}{" "}
              <br />
              <span className="italic font-normal text-primary">of 2026</span>
            </h1>
            <div className="flex flex-wrap gap-6 mb-10 font-mono text-[12px] text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  analytics
                </span>
                <span>{category.review_count} TOOLS REVIEWED</span>
              </div>
              <div className="flex items-center gap-2 border-l border-outline-variant/30 pl-6">
                <span className="material-symbols-outlined text-sm">
                  event
                </span>
                <span>LAST UPDATED APR 2026</span>
              </div>
            </div>
            <p className="font-body text-xl text-on-surface-variant leading-relaxed max-w-2xl">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      {/* #1 Spotlight Card */}
      {topTool && (
        <section className="max-w-7xl mx-auto px-8 -mt-12 mb-24 relative z-10">
          <div className="bg-surface-container-lowest rounded-3xl p-12 shadow-editorial grid lg:grid-cols-2 gap-16 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 font-mono text-[160px] font-bold text-surface-container-low select-none leading-none opacity-50 group-hover:opacity-100 transition-opacity">
              01
            </div>
            <div className="relative z-10">
              <span className="ember-gradient text-on-primary text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-8 inline-block">
                The Top Choice
              </span>
              <h2 className="font-headline text-5xl font-bold mb-6">
                {topTool.name}
              </h2>
              <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
                {topTool.short_description}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href={`/reviews/${topTool.slug}`}
                  className="ember-gradient text-on-primary px-8 py-4 rounded-xl font-bold active:scale-95 transition-transform flex items-center gap-2"
                >
                  View Official Verdict{" "}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
            <div className="relative z-10 flex flex-col justify-center items-center lg:items-end">
              <div className="mb-12">
                <ScoreCircle
                  score={topTool.overall_score}
                  size="lg"
                  label="Verdict Score"
                />
              </div>
              <div className="w-full max-w-xs space-y-4">
                {topTool.metrics.map((m: { label: string; value: number }) => (
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
        </section>
      )}

      {/* Review Grid */}
      {restTools.length > 0 && (
        <section className="max-w-7xl mx-auto px-8 mb-32">
          <div className="grid md:grid-cols-3 gap-8">
            {restTools.map((tool, i) => (
              <ReviewCardRanked
                key={tool.slug}
                rank={i + 2}
                slug={tool.slug}
                name={tool.name}
                shortDescription={tool.short_description}
                overallScore={tool.overall_score}
                logoUrl={tool.logo_url}
              />
            ))}
          </div>
        </section>
      )}

      {/* Comparison CTA */}
      {comparisons.length > 0 && (
        <section className="max-w-7xl mx-auto px-8 mb-24">
          <div className="bg-surface-container-low rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="font-bold text-lg">Still undecided?</p>
              <p className="text-on-surface-variant text-sm">
                Use our interactive tool to compare side-by-side.
              </p>
            </div>
            <Link
              href={`/compare/${comparisons[0].slug}`}
              className="px-8 py-3 rounded-xl bg-on-background text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Compare Top {category.name} Tools
            </Link>
          </div>
        </section>
      )}

      {/* Comparison Table */}
      {tools.length > 1 && (
        <section className="max-w-7xl mx-auto px-8 mb-32">
          <h2 className="font-headline text-4xl font-bold mb-12 text-center">
            Snapshot Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-highest">
                  <th className="text-left py-6 px-6 font-mono text-[10px] tracking-widest uppercase text-on-surface-variant rounded-tl-2xl">
                    Software
                  </th>
                  <th className="text-center py-6 px-6 font-mono text-[10px] tracking-widest uppercase text-on-surface-variant">
                    Verdict Score
                  </th>
                  <th className="text-center py-6 px-6 font-mono text-[10px] tracking-widest uppercase text-on-surface-variant">
                    Starting Price
                  </th>
                  <th className="text-right py-6 px-6 font-mono text-[10px] tracking-widest uppercase text-on-surface-variant rounded-tr-2xl">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {tools.slice(0, 5).map((tool) => (
                  <tr
                    key={tool.slug}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="py-6 px-6 font-bold">{tool.name}</td>
                    <td className="py-6 px-6 text-center font-mono font-bold text-primary">
                      {tool.overall_score.toFixed(1)}
                    </td>
                    <td className="py-6 px-6 text-center font-mono">
                      {tool.pricing_tiers?.[0]?.price || "Contact"}
                    </td>
                    <td className="py-6 px-6 text-right">
                      <Link
                        href={`/reviews/${tool.slug}`}
                        className="text-primary font-bold text-sm"
                      >
                        Read Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* FAQ */}
      {category.faq && category.faq.length > 0 && (
        <section className="max-w-3xl mx-auto px-8 mb-32">
          <h2 className="font-headline text-4xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={category.faq.map((f: { question: string; answer: string }) => ({ question: f.question, answer: f.answer }))} />
        </section>
      )}

      {/* Newsletter */}
      <NewsletterBand />
    </div>
  );
}
