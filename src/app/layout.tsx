import type { Metadata } from "next";
import { Newsreader, Manrope, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SaasAudited — Unbiased B2B SaaS Reviews & Software Comparisons",
    template: "%s | SaasAudited",
  },
  description:
    "Data-driven B2B SaaS reviews, head-to-head software comparisons, and expert buying guides. We test every feature so you pick the right tools for your stack.",
  keywords: [
    "B2B SaaS reviews",
    "software comparisons",
    "SaaS tools",
    "best SaaS software",
    "SaaS buying guide",
    "B2B software reviews",
  ],
  icons: {
    icon: "/saasreviewedfav.png",
    apple: "/saasreviewedfav.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "SaasAudited",
    url: BASE_URL,
    title: "SaasAudited — Unbiased B2B SaaS Reviews & Software Comparisons",
    description:
      "Data-driven B2B SaaS reviews, head-to-head software comparisons, and expert buying guides. We test every feature so you pick the right tools for your stack.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "SaasAudited — Unbiased B2B SaaS Reviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaasAudited — Unbiased B2B SaaS Reviews & Software Comparisons",
    description:
      "Data-driven B2B SaaS reviews, software comparisons, and expert buying guides.",
    images: ["/api/og"],
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
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-body antialiased min-h-screen flex flex-col grain-overlay overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
