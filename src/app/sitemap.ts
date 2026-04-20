import type { MetadataRoute } from "next";
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";
import BlogPost from "@/lib/models/BlogPost";
import Category from "@/lib/models/Category";
import Comparison from "@/lib/models/Comparison";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  const [tools, posts, categories, comparisons] = await Promise.all([
    Tool.find(
      { slug: { $exists: true, $ne: "" } },
      { slug: 1, updatedAt: 1 }
    ).lean(),
    BlogPost.find(
      { status: { $ne: "draft" }, slug: { $exists: true, $ne: "" } },
      { slug: 1, updatedAt: 1 }
    ).lean(),
    Category.find(
      { slug: { $exists: true, $ne: "" } },
      { slug: 1, updatedAt: 1 }
    ).lean(),
    Comparison.find(
      { slug: { $exists: true, $ne: "" } },
      { slug: 1, updatedAt: 1 }
    ).lean(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/reviews`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const reviewPages: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${BASE_URL}/reviews/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/categories/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const comparisonPages: MetadataRoute.Sitemap = comparisons.map((c) => ({
    url: `${BASE_URL}/compare/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...reviewPages,
    ...blogPages,
    ...categoryPages,
    ...comparisonPages,
  ];
}
