import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/reviews/brevo",
        destination: "/reviews",
        permanent: true,
      },
      {
        source: "/reviews/attio",
        destination: "/reviews",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.saasaudited.com" }],
        destination: "https://saasaudited.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "pbxt.replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.+\\.(?:png|jpg|jpeg|gif|ico|svg|webp))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https://lh3.googleusercontent.com https://replicate.delivery https://pbxt.replicate.delivery https://res.cloudinary.com data: blob:; connect-src 'self' https://api.openai.com https://api.replicate.com https://google.serper.dev https://api.indexnow.org https://www.bing.com; worker-src 'self' blob:; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
