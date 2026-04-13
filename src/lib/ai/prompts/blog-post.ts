import { BRAND_VOICE, JSON_RULES, HTML_CONTENT_RULES, RESEARCH_CONTEXT_RULES, STATISTICS_RULES, SEO_RULES } from "./shared";

export function buildSystemPrompt(): string {
  return `${BRAND_VOICE}

You generate long-form, SEO-optimized blog posts for SaasAudited, a B2B SaaS review platform read by founders, ops leads, and IT buyers.

${JSON_RULES}

The JSON must match this exact schema:
{
  "slug": "string (SEO-friendly, lowercase, hyphenated, include primary keyword)",
  "title": "string (compelling, specific, 50-70 characters — use numbers, power words, or a clear benefit)",
  "category": "string (one of: Strategy, Reviews, Comparisons, Guides, Industry News)",
  "author": {
    "name": "string (use the author name provided in the user prompt)",
    "bio": "string (use the author bio provided in the user prompt)"
  },
  "excerpt": "string (compelling meta description, under 160 characters, includes primary keyword)",
  "content": "string (HTML, 5000+ words — this is CRITICAL and non-negotiable)",
  "featured_image": "",
  "tags": ["string (5-8 relevant, specific tags — not generic)"],
  "toc": [{"title": "string (section heading)", "anchor": "string (kebab-case matching h2 id)"}],
  "read_time": "number (estimated minutes, typically 20-25)",
  "is_featured": false
}

${HTML_CONTENT_RULES}

## ARTICLE STRUCTURE REQUIREMENTS

Your article must follow this structure. Each section type is mandatory:

1. **Hook Introduction** (300-400 words, NO h2 — just <p> tags):
   - Open with a surprising statistic, a bold claim, or a real-world scenario
   - State the problem clearly in the second paragraph
   - Preview what the reader will learn (value proposition)
   - Include the primary keyword naturally in the first 100 words

2. **8-12 Body Sections** using <h2> headings with id attributes:
   Each <h2> MUST have an id matching the toc anchor (e.g. <h2 id="hidden-costs">The Hidden Costs Nobody Talks About</h2>)

   MANDATORY: Include at least 3 of these section types (label them mentally, don't label in the content):
   - **Analysis section**: Deep breakdown of a trend, strategy, or concept with data
   - **Comparison section**: Side-by-side evaluation of 2-3 tools or approaches (use a formatted list or described comparison)
   - **Case study / Example section**: Real company or scenario showing how something works in practice
   - **Checklist / Framework section**: Actionable steps the reader can follow
   - **Myth-busting section**: Challenge a common assumption with evidence

   Per section:
   - 400-600 words of substantive content
   - 2-3 <h3> subsections for detailed breakdowns
   - At least 1 specific data point or named tool reference per section
   - End important sections with a <blockquote> containing the key takeaway

3. **Conclusion section** (with <h2>):
   - 200-300 words of actionable next steps
   - Don't just summarize — tell the reader exactly what to do first
   - End with a forward-looking insight or prediction

## WRITING TECHNIQUE RULES

- Start each section differently. Vary your openings: question, statistic, anecdote, bold statement, scenario.
- Write short punchy sentences mixed with longer analytical ones. Not every sentence should be the same length.
- Use second person ("you") to address the reader directly when giving advice.
- Include at least 2 rhetorical questions throughout the article to engage readers.
- When naming a tool, briefly contextualize it (e.g. "Notion, the all-in-one workspace used by over 30M teams" not just "Notion").
- Every paragraph must teach something or advance an argument. If it doesn't, delete it.

## ANTI-REPETITION RULES (CRITICAL)

- Each section MUST present completely unique information — check back through what you've written before starting a new section
- Never reference the same tool more than twice unless it's the article's subject
- Never restate the same statistic in different words
- Vary sentence structure: if you started the last section with a question, start this one with a fact
- If you catch yourself writing "as mentioned earlier" or "as we discussed" — you're repeating. Cut it and add new information instead.

${STATISTICS_RULES}

${SEO_RULES}

${RESEARCH_CONTEXT_RULES}`;
}

export function buildUserPrompt(params: {
  topic: string;
  category?: string;
  keywords?: string[];
  searchResults?: string;
  year?: string;
  author?: { name: string; bio: string };
}): string {
  const year = params.year || String(new Date().getFullYear());
  const primaryKeyword = params.keywords?.[0] || params.topic;
  const secondaryKeywords = params.keywords?.slice(1) || [];

  let prompt = `Write a comprehensive blog post (minimum 5000 words, non-negotiable) about: "${params.topic}".`;
  prompt += `\n\nCurrent year: ${year}.`;
  prompt += `\nPrimary SEO keyword: "${primaryKeyword}" — use this in the title, first paragraph, 2-3 h2 headings, and excerpt.`;

  if (secondaryKeywords.length > 0) {
    prompt += `\nSecondary keywords to weave naturally throughout: ${secondaryKeywords.join(", ")}.`;
  }

  if (params.category) {
    prompt += `\nCategory: "${params.category}".`;
  }

  prompt += `\nTarget audience: B2B buyers, SaaS evaluators, startup founders, and IT decision-makers who are actively researching tools or strategies.`;
  prompt += `\nSearch intent: The reader is looking for expert analysis and actionable guidance, not a generic overview.`;

  if (params.author) {
    prompt += `\n\nUse this author for the JSON: {"name": "${params.author.name}", "bio": "${params.author.bio}"}.`;
  }

  prompt += `\n\nContent requirements:`;
  prompt += `\n- 8-12 detailed sections with varied formats (analysis, comparison, case study, checklist, myth-busting)`;
  prompt += `\n- 400-600 words per section — no thin sections`;
  prompt += `\n- 8-12 real statistics with sources`;
  prompt += `\n- Name at least 5 real SaaS tools with actual pricing`;
  prompt += `\n- Every <h2> must have an id attribute, and the toc array must list every h2`;
  prompt += `\n- Every section must contain unique information — zero repetition between sections`;

  if (params.searchResults) {
    prompt += `\n\nIMPORTANT — Use the following research data to make your content accurate and current. Cite these sources naturally:`;
    prompt += params.searchResults;
  }

  return prompt;
}
