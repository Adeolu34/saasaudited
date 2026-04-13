import { notFound } from "next/navigation";
export const revalidate = 3600;
import type { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";
import Review from "@/lib/models/Review";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProsCons from "@/components/review/ProsCons";
import VerdictCard from "@/components/review/VerdictCard";
import ScoreCircle from "@/components/review/ScoreCircle";
import MetricBar from "@/components/review/MetricBar";
import Link from "next/link";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";
import { getReviewAndTool } from "@/lib/queries";
import JsonLd from "@/components/shared/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  await dbConnect();
  const reviews = await Review.find({}, { slug: 1 }).lean();
  return reviews.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { review, tool } = await getReviewAndTool(slug);
  if (!review) return { title: "Review Not Found" };
  const description = `In-depth ${tool?.name || ""} review: features, pricing, pros & cons. ${review.title}`;
  const ogImage = tool?.logo_url
    ? tool.logo_url
    : `/api/og?title=${encodeURIComponent(review.title)}&subtitle=${encodeURIComponent("Expert SaaS Review")}`;
  return {
    title: review.title,
    description,
    alternates: { canonical: `/reviews/${slug}` },
    openGraph: {
      title: review.title,
      description,
      type: "article",
      url: `/reviews/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: review.title,
      description,
      images: [ogImage],
    },
  };
}


export default async function ReviewPage({ params }: Props) {
  const { slug } = await params;
  const { review, tool } = await getReviewAndTool(slug);

  if (!review || !tool) notFound();

  const ratingLabel =
    tool.overall_score >= 9
      ? "Excellent"
      : tool.overall_score >= 8
        ? "Great"
        : tool.overall_score >= 7
          ? "Good"
          : "Fair";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Review",
          name: review.title,
          reviewBody: review.verdict,
          itemReviewed: {
            "@type": "SoftwareApplication",
            name: tool.name,
            applicationCategory: tool.category,
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: tool.overall_score,
            bestRating: 10,
          },
          publisher: {
            "@type": "Organization",
            name: "SaasAudited",
          },
        }}
      />
      {/* Main Content */}
      <div className="lg:col-span-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Reviews", href: "/reviews" },
            { label: tool.category, href: `/categories/${tool.category.toLowerCase().replace(/\s+/g, "-")}` },
            { label: tool.name },
          ]}
        />

        {/* Affiliate Disclosure */}
        <div id="affiliate-disclosure" className="bg-amber-50 border border-amber-200 text-amber-700 text-[13px] px-4 py-2 rounded-lg mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span>
            We may earn a commission when you click through links on our site.{" "}
            <a href="#affiliate-disclosure" className="underline font-medium">
              Learn more
            </a>
            .
          </span>
        </div>

        {/* Review Header */}
        <div className="max-w-[760px] mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
              {tool.category}
            </span>
          </div>
          <h1 className="font-headline text-[40px] leading-tight font-bold text-on-surface mb-4">
            {review.title}
          </h1>
          <div className="flex items-center gap-4 text-stone-400 text-sm font-medium">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                edit_note
              </span>
              <span>Updated {new Date(review.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[16px]">
                verified
              </span>
              <span>Expert Verified</span>
            </div>
          </div>
        </div>

        {/* Pros/Cons */}
        <ProsCons pros={review.pros} cons={review.cons} />

        {/* Verdict */}
        <VerdictCard verdict={review.verdict} />

        {/* Article Body */}
        <article
          className="prose max-w-[720px] font-body text-stone-700"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(review.body_content) }}
        />
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-8">
        <div className="sticky top-24 space-y-8">
          {/* Score Card */}
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-editorial border border-outline-variant/10">
            <div className="flex flex-col items-center text-center mb-8">
              <ScoreCircle
                score={tool.overall_score}
                size="md"
                label="Verdict Score"
              />
              <h3 className="text-xl font-bold text-on-surface mt-4">
                {ratingLabel}
              </h3>
              <p className="text-stone-400 text-sm">
                SaasAudited Performance Score
              </p>
            </div>
            <div className="space-y-4 mb-8">
              {tool.metrics.map((m: { label: string; value: number }) => (
                <MetricBar
                  key={m.label}
                  label={m.label}
                  value={m.value}
                  maxValue={100}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={tool.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ember-gradient text-white text-center py-4 rounded-xl font-bold cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all block"
              >
                Visit {tool.name} →
              </a>
            </div>
          </div>

          {/* Quick Facts */}
          <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
            <h4 className="font-headline text-lg font-bold mb-4">
              Quick Facts
            </h4>
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-2">
                  Category
                </span>
                <p className="text-sm font-medium">{tool.category}</p>
              </div>
              {tool.pricing_tiers && tool.pricing_tiers.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-2">
                    Pricing Tiers
                  </span>
                  <div className="space-y-2 mt-2">
                    {tool.pricing_tiers.map(
                      (tier: { name: string; price: string }) => (
                        <div
                          key={tier.name}
                          className="flex justify-between items-center p-2 bg-white rounded border border-stone-100 shadow-sm"
                        >
                          <span className="text-xs font-semibold">
                            {tier.name}
                          </span>
                          <span className="text-xs font-mono">
                            {tier.price}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
