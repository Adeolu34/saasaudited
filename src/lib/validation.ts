import mongoose from "mongoose";

/**
 * Pick only allowed keys from a body object. Returns a new shallow-copied object.
 */
export function pickFields<T extends Record<string, unknown>>(
  body: T,
  allowedFields: readonly string[]
): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) {
      result[key] = body[key];
    }
  }
  return result as Partial<T>;
}

/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
export function isValidObjectId(id: unknown): boolean {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

/**
 * Clamp page number to >= 1, defaulting to 1 on NaN/invalid.
 */
export function clampPage(raw: string | null): number {
  const parsed = parseInt(raw || "1", 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  return parsed;
}

// -- Field whitelists per model --

export const BLOG_POST_FIELDS = [
  "title", "category", "author", "excerpt", "content",
  "featured_image", "tags", "toc", "status", "is_featured",
] as const;

export const REVIEW_FIELDS = [
  "title", "tool_slug", "pros", "cons", "verdict",
  "body_content", "screenshots",
] as const;

export const TOOL_FIELDS = [
  "name", "category", "logo_url", "official_url", "overall_score",
  "rating_label", "short_description", "is_featured", "is_editors_pick",
  "pricing_tiers", "metrics",
] as const;

export const COMPARISON_FIELDS = [
  "title", "tool_a_slug", "tool_b_slug", "tldr", "features",
  "winner", "decision_criteria", "body_content",
] as const;

export const CATEGORY_FIELDS = [
  "name", "description", "icon_name", "faq",
] as const;

export const AUTHOR_FIELDS = [
  "name", "bio", "image", "role", "content_types",
] as const;

export const RESEARCH_PUT_FIELDS = [
  "topic", "keywords", "suggested_angle", "suggested_category",
] as const;

export const ADMIN_USER_CREATE_FIELDS = [
  "email", "password", "name", "role",
] as const;

export const ADMIN_USER_UPDATE_FIELDS = [
  "name", "email", "role", "is_active", "password",
] as const;
