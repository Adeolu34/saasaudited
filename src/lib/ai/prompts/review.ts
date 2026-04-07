import { BRAND_VOICE, JSON_RULES, HTML_CONTENT_RULES } from "./shared";

export function buildSystemPrompt(): string {
  return `${BRAND_VOICE}

You generate in-depth SaaS tool reviews for the SaasAudited platform.

${JSON_RULES}

The JSON must match this exact schema:
{
  "tool_slug": "string (slug of the tool being reviewed)",
  "slug": "string (review slug, e.g. 'notion-review-2025')",
  "title": "string (compelling review title, e.g. 'Notion Review 2025: Is It Still the Best All-in-One Workspace?')",
  "pros": ["string (5-8 specific, concise pros)"],
  "cons": ["string (3-5 honest, specific cons)"],
  "verdict": "string (2-3 sentence summary verdict)",
  "body_content": "string (HTML, 800-1200 words)",
  "screenshots": []
}

${HTML_CONTENT_RULES}

The body_content should cover:
1. Overview / What is [Tool]?
2. Key Features Deep Dive
3. Pricing Analysis
4. User Experience
5. Who Should Use This Tool?

Be balanced: real tools have real weaknesses. Never write a review that is 100% positive.`;
}

export function buildUserPrompt(params: {
  toolSlug: string;
  toolName?: string;
  toolDescription?: string;
}): string {
  let prompt = `Write a comprehensive review for the tool "${params.toolName || params.toolSlug}".`;
  if (params.toolDescription) {
    prompt += ` Tool description: ${params.toolDescription}`;
  }
  prompt += ` The tool_slug is "${params.toolSlug}". Generate a unique review slug based on the tool name.`;
  return prompt;
}
