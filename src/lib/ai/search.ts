interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

interface SerperResponse {
  organic?: SerperResult[];
}

export interface SearchResults {
  query: string;
  results: SerperResult[];
}

const DISCOVERY_QUERIES = [
  "best new B2B SaaS tools launched {year}",
  "trending SaaS products {year}",
  "top SaaS startups to watch {year}",
  "new project management SaaS tools {year}",
  "best CRM software for small business {year}",
  "emerging AI SaaS tools for businesses {year}",
  "top rated SaaS tools on G2 {year}",
  "new marketing automation platforms {year}",
  "best team collaboration software {year}",
  "SaaS tools replacing legacy software {year}",
  "fastest growing SaaS companies {year}",
  "best customer support software {year}",
  "new HR tech SaaS platforms {year}",
  "top cloud accounting software {year}",
  "best sales enablement tools {year}",
];

export async function searchSaaS(query: string): Promise<SearchResults> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.warn("[Search] SERPER_API_KEY not set, skipping web search");
    return { query, results: [] };
  }

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: 10,
      }),
    });

    if (!res.ok) {
      console.error("[Search] Serper API error:", res.status, await res.text());
      return { query, results: [] };
    }

    const data: SerperResponse = await res.json();
    const results = (data.organic || []).slice(0, 8).map((r) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet,
      date: r.date,
    }));

    return { query, results };
  } catch (err) {
    console.error("[Search] Failed:", err);
    return { query, results: [] };
  }
}

export async function discoverTrendingSaaS(): Promise<SearchResults> {
  const year = new Date().getFullYear();
  const query = DISCOVERY_QUERIES[
    Math.floor(Math.random() * DISCOVERY_QUERIES.length)
  ].replace("{year}", String(year));

  return searchSaaS(query);
}

export function formatSearchResultsForPrompt(search: SearchResults): string {
  if (!search.results.length) return "";

  const lines = search.results.map(
    (r, i) =>
      `${i + 1}. "${r.title}" — ${r.snippet}${r.date ? ` (${r.date})` : ""}`
  );

  return `\n\n--- WEB RESEARCH CONTEXT (search: "${search.query}") ---\nUse these real, current search results to inform your content with accurate data:\n${lines.join("\n")}\n--- END RESEARCH CONTEXT ---`;
}
