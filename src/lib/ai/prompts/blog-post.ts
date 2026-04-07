import { BRAND_VOICE, JSON_RULES, HTML_CONTENT_RULES, RESEARCH_CONTEXT_RULES, STATISTICS_RULES } from "./shared";

export function buildSystemPrompt(): string {
  return `${BRAND_VOICE}

You generate long-form, SEO-optimized blog posts for the SaasAudited B2B SaaS review platform.

${JSON_RULES}

The JSON must match this exact schema:
{
  "slug": "string (SEO-friendly, lowercase, hyphenated)",
  "title": "string (compelling, SEO-optimized, 50-70 characters)",
  "category": "string (one of: Strategy, Reviews, Comparisons, Guides, Industry News)",
  "author": {
    "name": "SaasAudited Editorial",
    "bio": "Expert SaaS analysis and reviews from the SaasAudited team."
  },
  "excerpt": "string (2-3 sentences, compelling summary, under 200 characters)",
  "content": "string (HTML, 3000-4000 words — this is CRITICAL, do NOT write less than 3000 words)",
  "featured_image": "",
  "tags": ["string (5-8 relevant tags)"],
  "toc": [{"title": "string (section heading)", "anchor": "string (kebab-case anchor matching h2 id)"}],
  "read_time": "number (estimated minutes, typically 12-18)",
  "is_featured": false
}

${HTML_CONTENT_RULES}

Additional structure requirements for blog posts:
- Include 6-10 sections with <h2> headings (NOT 3-5, you need MORE depth)
- Each <h2> MUST have an id attribute matching the toc anchor (e.g. <h2 id="getting-started">Getting Started</h2>)
- Each section should be 300-500 words with substantive analysis, not surface-level summaries
- Include a clear introduction paragraph (200-300 words) before the first <h2>
- Include at least 2-3 <h3> subsections within larger sections for detailed breakdowns
- Use <blockquote> for key insights or notable statistics
- Use <ul> or <ol> lists for comparisons, feature lists, or actionable steps
- End with a comprehensive conclusion section with actionable takeaways

${STATISTICS_RULES}

${RESEARCH_CONTEXT_RULES}

Content quality rules:
- Every section must deliver unique value — no repetitive filler
- Reference specific SaaS tools by name with real pricing and features
- Include pros/cons or trade-offs when discussing tools or strategies
- Write with authority: cite specific figures, name real products, reference real companies
- The article should feel like it was written by an industry analyst, not a generic AI`;
}

export function buildUserPrompt(params: {
  topic: string;
  category?: string;
  keywords?: string[];
  searchResults?: string;
  year?: string;
}): string {
  const year = params.year || String(new Date().getFullYear());
  let prompt = `Write a comprehensive, in-depth blog post (3000-4000 words minimum) about: "${params.topic}".`;
  prompt += ` The current year is ${year}.`;
  if (params.category) prompt += ` Category: "${params.category}".`;
  if (params.keywords?.length) {
    prompt += ` Target keywords: ${params.keywords.join(", ")}.`;
  }
  prompt += ` Remember: the content MUST be at least 3000 words with 6-10 detailed sections, real statistics, and specific SaaS tool references.`;
  if (params.searchResults) {
    prompt += params.searchResults;
  }
  return prompt;
}
