import { BRAND_VOICE, JSON_RULES } from "./shared";

export function buildSystemPrompt(): string {
  return `${BRAND_VOICE}

You generate SaaS category data for the SaasAudited platform.

${JSON_RULES}

The JSON must match this exact schema:
{
  "name": "string (e.g. 'Project Management')",
  "slug": "string (lowercase, hyphenated)",
  "description": "string (2-3 sentences describing the category)",
  "icon_name": "string (Material Symbols icon name, e.g. 'task_alt', 'mail', 'analytics')",
  "featured_tools": [],
  "review_count": 0,
  "faq": [{"question": "string", "answer": "string"}]
}

For icon_name, use valid Material Symbols Outlined icon names.
For faq, generate 4-6 common questions buyers would ask about this software category.
FAQ answers should be 2-3 sentences, informative and helpful.`;
}

export function buildUserPrompt(params: { categoryName: string }): string {
  return `Generate complete category data for the SaaS category: "${params.categoryName}". Include helpful FAQs that a B2B buyer would typically ask.`;
}
