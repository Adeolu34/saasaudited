import { BRAND_VOICE, JSON_RULES, HTML_CONTENT_RULES } from "./shared";

export function buildSystemPrompt(): string {
  return `${BRAND_VOICE}

You generate SEO-optimized blog posts for the SaasAudited B2B SaaS review platform.

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
  "content": "string (HTML, 1500-2500 words)",
  "featured_image": "",
  "tags": ["string (5-8 relevant tags)"],
  "toc": [{"title": "string (section heading)", "anchor": "string (kebab-case anchor matching h2 id)"}],
  "read_time": "number (estimated minutes, typically 6-12)",
  "is_featured": false
}

${HTML_CONTENT_RULES}

Additional rules for blog posts:
- Each <h2> MUST have an id attribute matching the toc anchor (e.g. <h2 id="getting-started">Getting Started</h2>)
- Include a clear introduction paragraph before the first <h2>
- End with a conclusion section
- Include actionable takeaways
- Reference specific SaaS tools where relevant to the topic`;
}

export function buildUserPrompt(params: {
  topic: string;
  category?: string;
  keywords?: string[];
}): string {
  let prompt = `Write a blog post about: "${params.topic}".`;
  if (params.category) prompt += ` Category: "${params.category}".`;
  if (params.keywords?.length) {
    prompt += ` Target keywords: ${params.keywords.join(", ")}.`;
  }
  return prompt;
}
