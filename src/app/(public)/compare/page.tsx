import type { Metadata } from "next";
export const revalidate = 3600;
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Comparison from "@/lib/models/Comparison";
import ScrollReveal from "@/components/shared/ScrollReveal";

export const metadata: Metadata = {
  title: "Compare SaaS Tools",
  description:
    "Head-to-head comparisons of the top B2B software. Find the hidden trade-offs.",
};

export default async function ComparePage() {
  await dbConnect();
  const comparisons = await Comparison.find().lean();

  return (
    <div className="pt-8 pb-24">
      <section className="max-w-7xl mx-auto px-8 mb-16">
        <ScrollReveal direction="up">
          <div className="max-w-2xl">
            <span className="section-marker mb-4 block">
              Side-by-side analysis
            </span>
            <h1 className="font-headline text-[32px] md:text-[56px] leading-[1.1] text-on-surface font-bold mb-6">
              Head-to-Head
              <br />
              <span className="italic ember-gradient-text">Comparisons</span>
            </h1>
            <p className="text-[17px] text-on-surface-variant leading-relaxed">
              We put the top contenders side-by-side to find the hidden trade-offs
              that sales teams won&apos;t tell you.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Build Your Own CTA */}
      <section className="max-w-7xl mx-auto px-8 mb-16">
        <ScrollReveal direction="scale">
          <Link
            href="/compare/build"
            className="block bg-surface-container-low rounded-2xl p-10 md:p-12 card-hover group relative overflow-hidden"
          >
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] ember-gradient" />
            {/* Decorative dots */}
            <div className="absolute bottom-4 right-4 w-24 h-24 dot-pattern opacity-20 rounded-xl" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
              <div>
                <span className="section-marker mb-3 block">
                  New feature
                </span>
                <h2 className="font-headline text-3xl md:text-4xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                  Build Your Own Comparison
                </h2>
                <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-lg">
                  Pick any two SaaS tools in the same category and get an instant
                  side-by-side comparison based on our editorial data.
                </p>
              </div>
              <span className="ember-gradient text-white px-8 py-3 rounded-lg font-semibold arrow-slide shrink-0">
                Start comparing
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </span>
            </div>
          </Link>
        </ScrollReveal>
      </section>

      {/* Editorial Comparisons */}
      <section className="max-w-7xl mx-auto px-8 mb-8">
        <ScrollReveal direction="up">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-headline text-2xl font-bold">
              Editorial Comparisons
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-outline-variant/30 to-transparent" />
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {comparisons.map((comp, i) => (
            <ScrollReveal key={comp.slug} direction="up" delay={i * 80}>
              <Link
                href={`/compare/${comp.slug}`}
                className="relative bg-surface-container-lowest ghost-border rounded-xl p-8 card-hover group block overflow-hidden"
              >
                {/* Hover accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] ember-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="flex items-start gap-4 mb-4">
                  <span className="font-mono text-xs text-outline-variant/60 mt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-headline text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                    {comp.title}
                  </h3>
                </div>
                {comp.tldr?.[0] && (
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6 pl-10">
                    {comp.tldr[0].description}
                  </p>
                )}
                <span className="text-primary font-semibold text-sm arrow-slide pl-10">
                  Read comparison
                  <span className="material-symbols-outlined text-xs">
                    arrow_forward
                  </span>
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
