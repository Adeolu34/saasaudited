import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is required");
    client = new OpenAI({ apiKey });
  }
  return client;
}

export const DEFAULT_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
export const DEFAULT_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS) || 8192;
