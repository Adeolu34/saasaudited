import type { Metadata } from "next";
import { Newsreader, Manrope, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/shared/JsonLd";
import ScrollProgress from "@/components/shared/ScrollProgress";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SaasAudited | The Digital Curator for B2B Software",
    template: "%s | SaasAudited",
  },
  description:
    "Unbiased, data-driven insights into the stacks that scale. We test every feature so you don't have to waste your budget.",
  openGraph: {
    type: "website",
    siteName: "SaasAudited",
    title: "SaasAudited | The Digital Curator for B2B Software",
    description:
      "Unbiased, data-driven insights into the stacks that scale. We test every feature so you don't have to waste your budget.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaasAudited | The Digital Curator for B2B Software",
    description:
      "Unbiased, data-driven insights into the stacks that scale.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${manrope.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-body antialiased min-h-screen flex flex-col grain-overlay">
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
      </body>
    </html>
  );
}
