import dbConnect from "@/lib/mongodb";
import AiSettings, { IAiSettings } from "@/lib/models/AiSettings";
import { DEFAULT_MODEL, DEFAULT_MAX_TOKENS } from "./openai";

export interface ResolvedSettings {
  model: string;
  temperature: number;
  max_tokens: number;
  search_enabled: boolean;
  auto_generate_images: boolean;
  topic_pool: string[];
  search_queries: string[];
}

export interface ResolvedPrompts {
  systemPrompt: string;
  userPromptTemplate: string;
}

// Simple TTL cache for settings (60 seconds)
let cachedGlobal: { data: ResolvedSettings; expires: number } | null = null;
const promptCache = new Map<string, { data: IAiSettings | null; expires: number }>();
const CACHE_TTL = 60_000;

export async function getGlobalSettings(): Promise<ResolvedSettings> {
  if (cachedGlobal && Date.now() < cachedGlobal.expires) {
    return cachedGlobal.data;
  }

  await dbConnect();
  const doc = await AiSettings.findOne({ config_key: "global" }).lean<IAiSettings>();

  const settings: ResolvedSettings = {
    model: doc?.ai_model || DEFAULT_MODEL,
    temperature: doc?.temperature ?? 0.7,
    max_tokens: doc?.max_tokens || DEFAULT_MAX_TOKENS,
    search_enabled: doc?.search_enabled ?? false,
    auto_generate_images: doc?.auto_generate_images ?? true,
    topic_pool: doc?.topic_pool?.length ? doc.topic_pool : [],
    search_queries: doc?.search_queries?.length ? doc.search_queries : [],
  };

  cachedGlobal = { data: settings, expires: Date.now() + CACHE_TTL };
  return settings;
}

export async function getPromptOverrides(
  contentType: "blog" | "tool" | "review" | "comparison" | "category"
): Promise<ResolvedPrompts | null> {
  const cached = promptCache.get(contentType);
  if (cached && Date.now() < cached.expires) {
    if (!cached.data) return null;
    if (!cached.data.system_prompt && !cached.data.user_prompt_template) return null;
    return {
      systemPrompt: cached.data.system_prompt || "",
      userPromptTemplate: cached.data.user_prompt_template || "",
    };
  }

  await dbConnect();
  const doc = await AiSettings.findOne({ config_key: contentType }).lean<IAiSettings>();

  promptCache.set(contentType, { data: doc ?? null, expires: Date.now() + CACHE_TTL });

  if (!doc || (!doc.system_prompt && !doc.user_prompt_template)) {
    return null;
  }

  return {
    systemPrompt: doc.system_prompt || "",
    userPromptTemplate: doc.user_prompt_template || "",
  };
}

export function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

// Clear cache (useful after settings update)
export function clearSettingsCache() {
  cachedGlobal = null;
  promptCache.clear();
}
