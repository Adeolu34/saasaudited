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

export const metadata: Metadata = {
  title: {
    default: "SaasAudited | The Digital Curator for B2B Software",
    template: "%s | SaasAudited",
  },
  description:
    "Unbiased, data-driven insights into the stacks that scale. We test every feature so you don't have to waste your budget.",
  icons: {
    icon: "/saasreviewedfav.png",
    apple: "/saasreviewedfav.png",
  },
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
      <body className="bg-background text-on-background font-body antialiased min-h-screen flex flex-col grain-overlay overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
