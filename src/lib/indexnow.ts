const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

/**
 * Submit a URL to IndexNow for immediate search engine indexing.
 * IndexNow notifies Bing, Yandex, Seznam, and Naver.
 * Google also processes IndexNow submissions via Bing's shared pool.
 */
export async function submitUrlToIndexNow(url: string): Promise<boolean> {
  const apiKey = process.env.INDEXNOW_API_KEY;
  if (!apiKey) {
    console.warn("[IndexNow] INDEXNOW_API_KEY not set, skipping submission");
    return false;
  }

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(BASE_URL).hostname,
        key: apiKey,
        keyLocation: `${BASE_URL}/api/indexnow`,
        urlList: [url],
      }),
    });

    if (res.ok || res.status === 202) {
      console.log(`[IndexNow] Submitted: ${url}`);
    } else {
      console.error(`[IndexNow] Failed (${res.status}): ${url}`, await res.text());
    }
  } catch (err) {
    console.error("[IndexNow] Submission error:", err);
  }

  // Also ping Google to re-crawl the sitemap
  await pingSitemap();

  return true;
}

/**
 * Submit multiple URLs at once (up to 10,000).
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<boolean> {
  const apiKey = process.env.INDEXNOW_API_KEY;
  if (!apiKey || urls.length === 0) return false;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(BASE_URL).hostname,
        key: apiKey,
        keyLocation: `${BASE_URL}/api/indexnow`,
        urlList: urls.slice(0, 10000),
      }),
    });

    if (res.ok || res.status === 202) {
      console.log(`[IndexNow] Batch submitted ${urls.length} URLs`);
    } else {
      console.error(`[IndexNow] Batch failed (${res.status}):`, await res.text());
    }
  } catch (err) {
    console.error("[IndexNow] Batch submission error:", err);
  }

  await pingSitemap();
  return true;
}

/**
 * Ping Bing to re-crawl the sitemap.
 * Note: Google deprecated their sitemap ping endpoint in 2023.
 */
async function pingSitemap(): Promise<void> {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;

  try {
    await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      { method: "GET" }
    );
  } catch {
    // Sitemap ping is best-effort, don't fail the operation
  }
}
