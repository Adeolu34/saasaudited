import type { Metadata } from "next";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ToolPicker from "@/components/comparison/ToolPicker";

export const metadata: Metadata = {
  title: "Build Your Comparison",
  description:
    "Pick any two SaaS tools in the same category and see an instant side-by-side comparison based on our editorial data.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/compare/build",
  },
  openGraph: {
    title: "Build Your Comparison — SaasAudited",
    description:
      "Pick any two SaaS tools and compare them side-by-side instantly.",
  },
};

export default function BuildComparePage() {
  return (
    <div className="pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-8 mb-12">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Compare", href: "/compare" },
            { label: "Build Your Comparison" },
          ]}
        />
      </div>

      <section className="max-w-7xl mx-auto px-8 mb-16">
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-widest text-primary font-semibold mb-4 block">
            Interactive comparison
          </span>
          <h1 className="font-headline text-[32px] md:text-[56px] leading-[1.1] text-on-surface font-bold mb-6">
            Build Your Own Comparison
          </h1>
          <p className="text-[17px] text-on-surface-variant leading-relaxed">
            Pick any SaaS tool, then choose a competitor in the same category.
            We&apos;ll generate an instant side-by-side comparison based on our
            editorial scores, metrics, and pricing data.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8">
        <ToolPicker />
      </section>
    </div>
  );
}
