export function parseAIResponse<T>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `AI returned invalid JSON: ${(err as Error).message}. Raw: ${cleaned.substring(0, 200)}...`
    );
  }
}

export function ensureSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
