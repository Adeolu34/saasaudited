import { chromium } from "playwright";
import { fetchRobotsRules, evaluateRobotsAccess } from "./robots";
import type { ExtractedCompetitorTool } from "./types";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function toAbsoluteUrl(url: string): string {
  return new URL(url, "https://www.saasworthy.com").toString();
}

export async function collectSaasworthyToolsViaBrowser(options?: {
  maxListPages?: number;
  maxProducts?: number;
}): Promise<ExtractedCompetitorTool[]> {
  const maxListPages = Math.max(1, options?.maxListPages ?? 8);
  const maxProducts = Math.max(10, options?.maxProducts ?? 300);
  const rules = await fetchRobotsRules("saasworthy");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    const productLinks = new Set<string>();

    for (let i = 1; i <= maxListPages; i += 1) {
      const listUrl =
        i === 1
          ? "https://www.saasworthy.com/list"
          : `https://www.saasworthy.com/list?page=${i}`;

      const allowed = evaluateRobotsAccess("saasworthy", listUrl, rules);
      if (!allowed.allowed) continue;

      await page.goto(listUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(1500);

      const linksOnPage = await page.$$eval("a[href*='/product/']", (anchors) =>
        anchors
          .map((a) => a.getAttribute("href") || "")
          .filter((href) => href.includes("/product/"))
      );

      for (const href of linksOnPage) {
        const absolute = toAbsoluteUrl(href);
        const decision = evaluateRobotsAccess("saasworthy", absolute, rules);
        if (!decision.allowed) continue;
        productLinks.add(absolute);
        if (productLinks.size >= maxProducts) break;
      }

      if (productLinks.size >= maxProducts) break;
    }

    const products: ExtractedCompetitorTool[] = [];
    const links = [...productLinks].slice(0, maxProducts);

    for (const url of links) {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(1200);

      const extracted = await page.evaluate((sourceUrl) => {
        const titleEl = document.querySelector("h1");
        const title =
          titleEl?.textContent?.trim() ||
          document.title.replace(/\s*[-|].*$/g, "").trim();
        if (!title) return null;

        const normalizedName = title
          .replace(/\s*[-|].*$/g, "")
          .replace(/\s+features.*$/i, "")
          .replace(/\s+reviews?.*$/i, "")
          .replace(/\s+pricing.*$/i, "")
          .trim();

        const ratingCandidates = Array.from(
          document.querySelectorAll("[class*='rating'], [data-rating], .score, .sw-score")
        )
          .map((node) => node.textContent?.trim() || "")
          .filter(Boolean);

        let rating: number | null = null;
        for (const candidate of ratingCandidates) {
          const match = candidate.match(/([0-5](?:\.[0-9]+)?)\s*\/\s*5/i) || candidate.match(/^([0-5](?:\.[0-9]+)?)$/);
          if (match?.[1] && /^([0-5](?:\.[0-9]+)?)$/.test(match[1])) {
            const value = Number.parseFloat(match[1]);
            if (Number.isFinite(value) && value >= 0 && value <= 5) {
              rating = value;
              break;
            }
          }
        }

        const reviewMatch = (document.body.textContent || "").match(/([\d,]+)\s+reviews?/i);
        const reviewCount = reviewMatch?.[1]
          ? Number.parseInt(reviewMatch[1].replace(/,/g, ""), 10)
          : null;

        const categoryEl =
          document.querySelector("a[href*='/list/']") ||
          document.querySelector("[class*='category'] a") ||
          document.querySelector("[class*='breadcrumb'] a:last-child");
        const categoryText = categoryEl?.textContent?.trim() || null;

        const officialLink = Array.from(document.querySelectorAll("a[href^='http']"))
          .map((a) => ({
            href: a.getAttribute("href") || "",
            text: (a.textContent || "").toLowerCase(),
          }))
          .find((item) =>
            item.text.includes("visit website") ||
            item.text.includes("official website") ||
            item.text.includes("website")
          )?.href || null;

        const pricingSignals: string[] = [];
        const bodyText = (document.body.textContent || "").toLowerCase();
        if (bodyText.includes("free trial")) pricingSignals.push("free_trial");
        if (bodyText.includes("free plan")) pricingSignals.push("free_plan");
        if (/\$[0-9]+/.test(bodyText)) pricingSignals.push("paid_pricing");
        if (bodyText.includes("contact sales") || bodyText.includes("custom pricing")) {
          pricingSignals.push("contact_sales");
        }

        return {
          sourceUrl,
          name: normalizedName,
          rating,
          reviewCount:
            reviewCount !== null && Number.isFinite(reviewCount) ? reviewCount : null,
          categoryText,
          officialLink,
          pricingSignals,
        };
      }, url);

      if (!extracted?.name) continue;
      const sourceToolId = new URL(url).pathname.split("/").filter(Boolean).pop() || "unknown";

      products.push({
        source: "saasworthy",
        sourceUrl: extracted.sourceUrl,
        sourceToolId,
        name: extracted.name,
        slugCandidate: slugify(extracted.name),
        officialUrl: extracted.officialLink,
        categoryText: extracted.categoryText,
        rating: extracted.rating,
        reviewCount: extracted.reviewCount,
        pricingSignals: extracted.pricingSignals,
        pageType: "product",
      });
    }

    return products;
  } finally {
    await context.close();
    await browser.close();
  }
}
