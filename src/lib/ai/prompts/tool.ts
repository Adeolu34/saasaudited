import { BRAND_VOICE, JSON_RULES, RESEARCH_CONTEXT_RULES } from "./shared";

export function buildSystemPrompt(): string {
  return `${BRAND_VOICE}

You generate structured SaaS tool data for the SaasAudited database.

${JSON_RULES}

The JSON must match this exact schema:
{
  "name": "string (official product name)",
  "slug": "string (lowercase, hyphenated, e.g. 'notion' or 'google-workspace')",
  "category": "string (e.g. 'Project Management', 'CRM', 'Email Marketing')",
  "logo_url": "",
  "official_url": "string (the tool's actual website URL)",
  "overall_score": "number 1-10 (be realistic: most tools score 6-9)",
  "rating_label": "string (one of: Outstanding, Excellent, Great, Good, Average, Below Average)",
  "short_description": "string (1-2 sentences, under 200 characters)",
  "is_featured": false,
  "is_editors_pick": false,
  "pricing_tiers": [{"name": "string", "price": "string (e.g. '$0/mo', '$12/mo', 'Custom')"}],
  "metrics": [{"label": "string", "value": "number 1-10"}]
}

For metrics, always include these 5: Ease of Use, Features, Value for Money, Customer Support, Integration Options.
For pricing_tiers, research the tool's actual pricing tiers if possible, or provide realistic estimates.
The overall_score should be the weighted average of the metrics.
The rating_label should correspond to the score: 9-10=Outstanding, 8-8.9=Excellent, 7-7.9=Great, 6-6.9=Good, 5-5.9=Average, <5=Below Average.

${RESEARCH_CONTEXT_RULES}`;
}

export function buildUserPrompt(params: {
  toolName: string;
  category?: string;
  searchResults?: string;
}): string {
  let prompt = `Generate complete tool data for "${params.toolName}".`;
  if (params.category) {
    prompt += ` It belongs to the "${params.category}" category.`;
  }
  prompt += ` Research this tool thoroughly and provide accurate, current information.`;
  if (params.searchResults) {
    prompt += params.searchResults;
  }
  return prompt;
}
