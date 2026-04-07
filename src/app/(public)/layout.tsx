import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/shared/JsonLd";
import ScrollProgress from "@/components/shared/ScrollProgress";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
      >
        Skip to content
      </a>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SaasAudited",
          description:
            "Unbiased, data-driven insights into the stacks that scale.",
          url: "https://saasaudited.com",
        }}
      />
      <TopNavBar />
      <ScrollProgress />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
