import type { Metadata } from "next";
export const revalidate = 3600;
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import Tool from "@/lib/models/Tool";
import StatsBand from "@/components/shared/StatsBand";
import ScrollReveal from "@/components/shared/ScrollReveal";

export const metadata: Metadata = {
  title: "SaaS Software Categories — Browse B2B Tools by Category",
  description:
    "Browse B2B SaaS software by category. CRM, project management, AI tools, marketing automation, and more — each meticulously curated with rigorous evaluation standards.",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "SaaS Software Categories — Browse B2B Tools by Category",
    description:
      "Browse B2B SaaS software by category with expert curation.",
    url: "/categories",
    images: [{ url: "/api/og?title=SaaS%20Categories&subtitle=Browse%20B2B%20Tools%20by%20Category", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Software Categories — Browse B2B Tools by Category",
    images: ["/api/og?title=SaaS%20Categories&subtitle=Browse%20B2B%20Tools%20by%20Category"],
  },
};

export default async function CategoriesHub() {
  await dbConnect();

  const [categories, toolCount] = await Promise.all([
    Category.find().lean(),
    Tool.countDocuments(),
  ]);

  const featured = categories.find((c) => c.slug === "crm-software");

  return (
    <div className="pt-8">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 mb-24">
        <ScrollReveal direction="up">
          <div className="max-w-3xl">
            <span className="section-marker mb-4 block">
              {categories.length} categories &middot; {toolCount}+ reviews
            </span>
            <h1 className="font-headline text-[52px] leading-[1.1] text-on-surface mb-6 tracking-tight">
              Find software
              <br />
              <span className="italic ember-gradient-text">by category.</span>
            </h1>
            <p className="text-[17px] text-on-surface-variant leading-relaxed max-w-xl">
              Every category is meticulously curated. We don&apos;t just list
              tools; we evaluate them against the rigorous standards of modern
              digital architecture.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Featured Spotlight */}
      {featured && (
        <section className="bg-[#F5F3EF] py-20 px-8 mb-24 relative overflow-hidden">
          {/* Decorative dots */}
          <div className="absolute top-8 right-8 w-48 h-48 dot-pattern opacity-20 rounded-2xl hidden lg:block" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative">
            <ScrollReveal direction="left">
              <div className="space-y-6">
                <span className="inline-block px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">
                  Most searched
                </span>
                <h2 className="font-headline text-4xl text-on-surface">
                  {featured.name}
                </h2>
                <p className="font-mono text-sm text-primary">
                  {featured.review_count} detailed reviews
                </p>
                <p className="text-on-surface-variant leading-relaxed max-w-md">
                  {featured.description}
                </p>
                <Link
                  href={`/categories/${featured.slug}`}
                  className="px-8 py-4 ember-gradient text-white rounded-full font-medium arrow-slide hover:shadow-lg hover:shadow-primary/15 transition-all active:scale-95 w-fit"
                >
                  Browse {featured.review_count} CRM reviews
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={150}>
              <div className="space-y-4">
                {featured.featured_tools.slice(0, 3).map((toolSlug: string, i: number) => (
                  <Link
                    key={toolSlug}
                    href={`/reviews/${toolSlug}`}
                    className="bg-surface p-6 rounded-xl shadow-sm flex justify-between items-center group card-hover block"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-outline-variant/50 w-6">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center">
                        <span className="font-mono text-sm font-bold text-on-surface-variant">
                          {toolSlug.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-headline text-xl capitalize group-hover:text-primary transition-colors">
                        {toolSlug.replace(/-/g, " ")}
                      </h4>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">
                      arrow_forward
                    </span>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-8 mb-32">
        <ScrollReveal direction="up">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="font-headline text-2xl font-bold">All Categories</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-outline-variant/30 to-transparent" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.slug} direction="up" delay={i * 60}>
              <Link
                href={`/categories/${cat.slug}`}
                className="relative bg-surface-container-lowest ghost-border p-8 rounded-xl card-hover group block overflow-hidden"
              >
                {/* Hover accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] ember-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="flex justify-between items-start mb-8">
                  <span className="material-symbols-outlined text-[28px] text-primary">
                    {cat.icon_name}
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant px-2 py-1 bg-surface-container-low rounded">
                    {cat.review_count} Reviews
                  </span>
                </div>
                <h3 className="font-headline text-2xl mb-4 text-on-surface group-hover:text-primary transition-colors duration-300">
                  {cat.name}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-8 line-clamp-2">
                  {cat.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 border-t border-surface-container-high">
                  {cat.featured_tools.slice(0, 3).map((t: string) => (
                    <span
                      key={t}
                      className="text-sm text-primary capitalize"
                    >
                      {t.replace(/-/g, " ")}
                    </span>
                  ))}
                  <span className="ml-auto text-xs font-bold text-on-surface arrow-slide group-hover:text-primary transition-colors">
                    Browse all
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_outward
                    </span>
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Stats Band */}
      <StatsBand
        stats={[
          { value: "1,248", label: "Verified Reviews" },
          { value: "142k", label: "Monthly Readers" },
          { value: String(categories.length), label: "Curated Categories" },
          { value: "24h", label: "Update Cadence" },
        ]}
      />
    </div>
  );
}
