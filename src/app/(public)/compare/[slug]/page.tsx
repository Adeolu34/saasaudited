import { notFound } from "next/navigation";
export const revalidate = 3600;
import type { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Comparison from "@/lib/models/Comparison";
import Tool from "@/lib/models/Tool";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ComparisonTable from "@/components/comparison/ComparisonTable";
import ScoreCircle from "@/components/review/ScoreCircle";
import NewsletterBand from "@/components/shared/NewsletterBand";
import { sanitizeHtml } from "@/lib/sanitize";
import { getComparison } from "@/lib/queries";
import JsonLd from "@/components/shared/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  await dbConnect();
  const comparisons = await Comparison.find({}, { slug: 1 }).lean();
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = await getComparison(slug);
  if (!comp) return { title: "Comparison Not Found" };
  const description = `${comp.title}: features, pricing, and performance compared side-by-side with data-driven analysis.`;
  const ogImage = `/api/og?title=${encodeURIComponent(comp.title)}&subtitle=${encodeURIComponent("Head-to-Head Comparison")}`;
  return {
    title: comp.title,
    description,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title: comp.title,
      description,
      url: `/compare/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: comp.title,
      description,
      images: [ogImage],
    },
  };
}


export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;

  const comp = await getComparison(slug);
  if (!comp) notFound();

  await dbConnect();
  const [toolA, toolB] = await Promise.all([
    Tool.findOne({ slug: comp.tool_a_slug }).lean(),
    Tool.findOne({ slug: comp.tool_b_slug }).lean(),
  ]);

  if (!toolA || !toolB) notFound();

  return (
    <div className="pt-8 pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: comp.title,
          description: `${comp.title}: features, pricing, and performance compared side-by-side.`,
          publisher: {
            "@type": "Organization",
            name: "SaasAudited",
          },
          about: [
            { "@type": "SoftwareApplication", name: toolA.name },
            { "@type": "SoftwareApplication", name: toolB.name },
          ],
        }}
      />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-8 mb-12">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Compare", href: "/compare" },
            { label: comp.title.replace(/:.*/, "") },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 mb-20">
        <div className="max-w-4xl">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-on-surface mb-8">
            {toolA.name}{" "}
            <span className="text-primary italic font-light">vs</span>{" "}
            {toolB.name}
            {comp.title.includes(":") && (
              <>
                :<br />
                <span className="text-4xl font-normal text-on-surface-variant">
                  {comp.title.split(":")[1].trim()}
                </span>
              </>
            )}
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed font-body max-w-2xl">
            A clinical breakdown of the two titans. We examine if legacy power
            still justifies friction, or if modern architecture has closed the
            gap.
          </p>
        </div>
      </section>

      {/* TL;DR Grid */}
      <section className="max-w-7xl mx-auto px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-xl ghost-border overflow-hidden">
          {comp.tldr.map(
            (item: { title: string; description: string }, i: number) => (
              <div key={i} className="bg-surface p-8">
                <h3 className="font-headline text-2xl font-bold mb-4">
                  {item.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Winner Banner */}
      <section className="max-w-7xl mx-auto px-8 mb-20">
        <div className="bg-inverse-surface rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-editorial">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-3xl">
                workspace_premium
              </span>
            </div>
            <div>
              <h2 className="font-headline text-2xl text-inverse-on-surface font-semibold tracking-tight capitalize">
                Our pick: {comp.winner.replace(/-/g, " ")}
              </h2>
              <p className="text-surface-container-highest/60 text-sm">
                Best overall for mid-market and modern enterprises
              </p>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-center">
              <div className="font-mono text-primary-fixed-dim text-xl font-bold tracking-tighter">
                {(comp.winner === comp.tool_a_slug
                  ? toolA.overall_score
                  : toolB.overall_score
                ).toFixed(1)}
                /10
              </div>
              <div className="text-[10px] uppercase tracking-widest text-surface-container-highest/40 font-bold">
                Editorial Score
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Score Cards */}
      <section className="max-w-7xl mx-auto px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              tool: toolA,
              isWinner: comp.winner === comp.tool_a_slug,
            },
            {
              tool: toolB,
              isWinner: comp.winner === comp.tool_b_slug,
            },
          ].map(({ tool, isWinner }) => (
            <div
              key={tool.slug}
              className={`bg-surface rounded-2xl p-10 relative overflow-hidden shadow-sm ${
                isWinner
                  ? "border-2 border-primary/40"
                  : "ghost-border"
              }`}
            >
              {isWinner && (
                <div className="absolute top-0 right-0 bg-primary/10 px-4 py-1 text-xs font-mono font-bold text-primary tracking-widest uppercase rounded-bl-xl">
                  Top Performer
                </div>
              )}
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="font-headline text-4xl font-bold">
                    {tool.name}
                  </h3>
                  <p className="font-mono text-sm text-on-surface-variant mt-2">
                    {tool.category}
                  </p>
                </div>
                <ScoreCircle score={tool.overall_score} size="sm" />
              </div>
              <ul className="space-y-4">
                {tool.metrics
                  .slice(0, 3)
                  .map((m: { label: string; value: number }) => (
                    <li key={m.label} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-600 text-xl">
                        check_circle
                      </span>
                      <span className="text-sm font-medium">
                        {m.label}: {m.value}%
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-7xl mx-auto px-8 mb-20">
        <h2 className="font-headline text-4xl font-bold mb-10">
          Feature Comparison Matrix
        </h2>
        <div className="overflow-x-auto">
        <ComparisonTable
          toolAName={toolA.name}
          toolBName={toolB.name}
          features={comp.features}
        />
        </div>
      </section>

      {/* Decision Callout Boxes */}
      {comp.decision_criteria && comp.decision_criteria.length > 0 && (
        <section className="max-w-7xl mx-auto px-8 mb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          {comp.decision_criteria.map(
            (
              criteria: { title: string; items: string[] },
              i: number
            ) => (
              <div
                key={i}
                className={`bg-surface-container-low rounded-2xl p-10 border-l-4 ${
                  i === 0 ? "border-primary" : "border-on-surface-variant"
                }`}
              >
                <h3 className="font-headline text-2xl font-bold mb-6">
                  {criteria.title}
                </h3>
                <ul className="space-y-4 text-on-surface-variant">
                  {criteria.items.map((item: string, j: number) => (
                    <li key={j} className="flex gap-3">
                      <span
                        className={`font-mono font-bold ${i === 0 ? "text-primary" : "text-on-surface-variant"}`}
                      >
                        {String(j + 1).padStart(2, "0")}.
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </section>
      )}

      {/* Article Body */}
      {comp.body_content && (
        <article
          className="max-w-[720px] mx-auto px-8 prose prose-stone font-body mb-20"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(comp.body_content) }}
        />
      )}

      <NewsletterBand />
    </div>
  );
}
