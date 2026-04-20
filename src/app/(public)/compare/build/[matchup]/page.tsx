import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getToolBySlug, findCuratedComparison } from "@/lib/queries";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ScoreCircle from "@/components/review/ScoreCircle";
import MetricComparisonRow from "@/components/comparison/MetricComparisonRow";
import QuickVerdict from "@/components/comparison/QuickVerdict";
import NewsletterBand from "@/components/shared/NewsletterBand";

export const revalidate = 3600;

interface Props {
  params: Promise<{ matchup: string }>;
}

function parseMatchup(matchup: string) {
  const parts = matchup.split("-vs-");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { slugA: parts[0], slugB: parts[1] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { matchup } = await params;
  const parsed = parseMatchup(matchup);
  if (!parsed) return { title: "Comparison Not Found" };

  const [toolA, toolB] = await Promise.all([
    getToolBySlug(parsed.slugA),
    getToolBySlug(parsed.slugB),
  ]);

  if (!toolA || !toolB) return { title: "Comparison Not Found" };

  const title = `${toolA.name} vs ${toolB.name}`;
  const description = `Side-by-side comparison of ${toolA.name} and ${toolB.name}. Scores, metrics, and pricing compared.`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `/compare/build/${[parsed.slugA, parsed.slugB].sort().join("-vs-")}`,
    },
    openGraph: { title, description },
    twitter: { card: "summary", title },
  };
}

export default async function MatchupPage({ params }: Props) {
  const { matchup } = await params;
  const parsed = parseMatchup(matchup);
  if (!parsed) notFound();

  // Canonical URL: alphabetically sorted slugs
  const sorted = [parsed.slugA, parsed.slugB].sort();
  const canonical = `${sorted[0]}-vs-${sorted[1]}`;
  if (matchup !== canonical) {
    redirect(`/compare/build/${canonical}`);
  }

  const [toolA, toolB] = await Promise.all([
    getToolBySlug(sorted[0]),
    getToolBySlug(sorted[1]),
  ]);

  if (!toolA || !toolB) notFound();

  // Check for curated editorial comparison
  const curated = await findCuratedComparison(toolA.slug, toolB.slug);

  // Build aligned metrics — match by label
  const allLabels = new Set([
    ...toolA.metrics.map((m: { label: string }) => m.label),
    ...toolB.metrics.map((m: { label: string }) => m.label),
  ]);
  const metricsA = new Map<string, number>(
    toolA.metrics.map((m: { label: string; value: number }) => [m.label, m.value])
  );
  const metricsB = new Map<string, number>(
    toolB.metrics.map((m: { label: string; value: number }) => [m.label, m.value])
  );

  // Pricing comparison
  const maxPricingRows = Math.max(
    toolA.pricing_tiers?.length || 0,
    toolB.pricing_tiers?.length || 0
  );

  return (
    <div className="pt-8 pb-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-8 mb-12">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Compare", href: "/compare" },
            { label: "Build", href: "/compare/build" },
            { label: `${toolA.name} vs ${toolB.name}` },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 mb-16">
        <div className="max-w-4xl">
          <span className="font-mono text-[11px] uppercase tracking-widest text-primary font-semibold mb-4 block">
            {toolA.category} comparison
          </span>
          <h1 className="font-headline text-[32px] md:text-[56px] lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-on-surface mb-6">
            {toolA.name}{" "}
            <span className="text-primary italic font-light">vs</span>{" "}
            {toolB.name}
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl">
            An auto-generated comparison based on our editorial scores, metrics,
            and pricing data for these two {toolA.category} tools.
          </p>
        </div>
      </section>

      {/* Curated comparison banner */}
      {curated && (
        <section className="max-w-7xl mx-auto px-8 mb-12">
          <Link
            href={`/compare/${curated.slug}`}
            className="block bg-primary/5 border border-primary/20 rounded-xl p-6 hover:bg-primary/10 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-2xl">
                auto_awesome
              </span>
              <div>
                <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Editorial comparison available
                </p>
                <p className="text-sm text-on-surface-variant">
                  We have a detailed, hand-written comparison for this matchup.
                  Read our in-depth analysis.
                </p>
              </div>
              <span className="material-symbols-outlined text-primary ml-auto group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Quick Verdict */}
      <section className="max-w-7xl mx-auto px-8 mb-16">
        <QuickVerdict
          nameA={toolA.name}
          nameB={toolB.name}
          scoreA={toolA.overall_score}
          scoreB={toolB.overall_score}
          category={toolA.category}
        />
      </section>

      {/* Side-by-Side Score Cards */}
      <section className="max-w-7xl mx-auto px-8 mb-16">
        <h2 className="font-headline text-3xl font-bold mb-8">
          Overall Scores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[toolA, toolB].map((tool) => {
            const isWinner =
              tool.overall_score ===
              Math.max(toolA.overall_score, toolB.overall_score);
            return (
              <div
                key={tool.slug}
                className={`bg-surface rounded-2xl p-10 relative overflow-hidden shadow-sm ${
                  isWinner && toolA.overall_score !== toolB.overall_score
                    ? "border-2 border-primary/40"
                    : "ghost-border"
                }`}
              >
                {isWinner && toolA.overall_score !== toolB.overall_score && (
                  <div className="absolute top-0 right-0 bg-primary/10 px-4 py-1 text-xs font-mono font-bold text-primary tracking-widest uppercase rounded-bl-xl">
                    Higher Score
                  </div>
                )}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-headline text-3xl font-bold">
                      {tool.name}
                    </h3>
                    <p className="font-mono text-sm text-on-surface-variant mt-2">
                      {tool.category} &middot; {tool.rating_label}
                    </p>
                    {tool.short_description && (
                      <p className="text-sm text-on-surface-variant mt-3 leading-relaxed max-w-sm">
                        {tool.short_description}
                      </p>
                    )}
                  </div>
                  <ScoreCircle score={tool.overall_score} size="sm" />
                </div>
                {tool.official_url && (
                  <a
                    href={tool.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Visit website
                    <span className="material-symbols-outlined text-sm">
                      open_in_new
                    </span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Metrics Comparison */}
      {allLabels.size > 0 && (
        <section className="max-w-7xl mx-auto px-8 mb-16">
          <h2 className="font-headline text-3xl font-bold mb-8">
            Metric-by-Metric Breakdown
          </h2>
          <div className="bg-surface-container-lowest ghost-border rounded-2xl p-8 md:p-12 space-y-8">
            {Array.from(allLabels).map((label) => (
              <MetricComparisonRow
                key={label}
                label={label}
                valueA={metricsA.get(label) ?? 0}
                valueB={metricsB.get(label) ?? 0}
                nameA={toolA.name}
                nameB={toolB.name}
              />
            ))}
          </div>
        </section>
      )}

      {/* Pricing Comparison */}
      {maxPricingRows > 0 && (
        <section className="max-w-7xl mx-auto px-8 mb-16">
          <h2 className="font-headline text-3xl font-bold mb-8">
            Pricing Comparison
          </h2>
          <div className="overflow-x-auto">
            <div className="overflow-hidden rounded-2xl ghost-border">
              <table className="w-full text-left font-body border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/10">
                    <th className="p-6 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                      Tier
                    </th>
                    <th className="p-6 font-headline text-xl font-bold">
                      {toolA.name}
                    </th>
                    <th className="p-6 font-headline text-xl font-bold">
                      {toolB.name}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {Array.from({ length: maxPricingRows }).map((_, i) => {
                    const tierA = toolA.pricing_tiers?.[i];
                    const tierB = toolB.pricing_tiers?.[i];
                    const tierName = tierA?.name || tierB?.name || `Tier ${i + 1}`;
                    return (
                      <tr
                        key={tierName}
                        className={
                          i % 2 === 0
                            ? "bg-surface"
                            : "bg-surface-container-low/30"
                        }
                      >
                        <td className="p-6 font-medium">{tierName}</td>
                        <td className="p-6 text-sm">
                          {tierA ? (
                            <span>
                              <span className="font-semibold">
                                {tierA.price}
                              </span>
                            </span>
                          ) : (
                            <span className="text-on-surface-variant">&mdash;</span>
                          )}
                        </td>
                        <td className="p-6 text-sm">
                          {tierB ? (
                            <span>
                              <span className="font-semibold">
                                {tierB.price}
                              </span>
                            </span>
                          ) : (
                            <span className="text-on-surface-variant">&mdash;</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* CTA to review pages */}
      <section className="max-w-7xl mx-auto px-8 mb-16">
        <div className="bg-surface-container-low rounded-xl p-10 text-center">
          <h2 className="font-headline text-2xl font-bold mb-4">
            Want the full story?
          </h2>
          <p className="text-on-surface-variant mb-8 max-w-lg mx-auto">
            Read our complete, in-depth reviews for each tool.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/reviews/${toolA.slug}`}
              className="ember-gradient text-white px-8 py-3 rounded-lg font-semibold active:scale-95 transition-transform flex items-center gap-2"
            >
              Read {toolA.name} Review
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
            <Link
              href={`/reviews/${toolB.slug}`}
              className="bg-surface-container-lowest ghost-border px-8 py-3 rounded-lg font-semibold active:scale-95 transition-transform flex items-center gap-2 hover:shadow-editorial"
            >
              Read {toolB.name} Review
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Build another comparison */}
      <section className="max-w-7xl mx-auto px-8 mb-16 text-center">
        <Link
          href="/compare/build"
          className="text-primary font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
        >
          <span className="material-symbols-outlined text-sm">
            compare_arrows
          </span>
          Build another comparison
        </Link>
      </section>

      <NewsletterBand />
    </div>
  );
}
