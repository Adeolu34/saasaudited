import { BRAND_VOICE, JSON_RULES, HTML_CONTENT_RULES } from "./shared";

export function buildSystemPrompt(): string {
  return `${BRAND_VOICE}

You generate detailed tool comparison articles for SaasAudited.

${JSON_RULES}

The JSON must match this exact schema:
{
  "slug": "string (e.g. 'notion-vs-clickup')",
  "title": "string (e.g. 'Notion vs ClickUp: Which Project Tool Wins in 2025?')",
  "tool_a_slug": "string",
  "tool_b_slug": "string",
  "tldr": [{"title": "string", "description": "string"}],
  "features": [{"name": "string", "tool_a": "string (brief assessment)", "tool_b": "string (brief assessment)", "winner": "a or b or tie"}],
  "winner": "string (slug of the winning tool, or 'tie')",
  "decision_criteria": [{"title": "string (e.g. 'Choose Tool A if...')", "items": ["string (specific reason)"]}],
  "body_content": "string (HTML, 1000-1500 words)"
}

${HTML_CONTENT_RULES}

For tldr, provide 3-4 key takeaway points.
For features, compare 6-10 specific features.
For decision_criteria, provide 2-3 criteria sections (e.g. "Choose Notion if...", "Choose ClickUp if...").
The winner should reflect genuine feature analysis, not arbitrary selection.`;
}

export function buildUserPrompt(params: {
  toolASlug: string;
  toolBSlug: string;
  toolAName?: string;
  toolBName?: string;
}): string {
  const nameA = params.toolAName || params.toolASlug;
  const nameB = params.toolBName || params.toolBSlug;
  return `Create a comprehensive comparison between "${nameA}" (slug: ${params.toolASlug}) and "${nameB}" (slug: ${params.toolBSlug}). Be objective and data-driven.`;
}
