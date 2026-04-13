import sanitizeHtmlLib from "sanitize-html";

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      ...sanitizeHtmlLib.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href", "name", "target", "rel"],
      h2: ["id"],
      h3: ["id"],
      figure: ["class"],
      code: ["class"],
      pre: ["class"],
    },
    allowedClasses: {
      figure: ["post-inline-image"],
      code: [/^language-/],
      pre: [/^language-/],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

/** Sanitize fields that must be strings — AI sometimes returns {} or [] */
export function sanitizeBody(body: Record<string, unknown>) {
  for (const key of ["featured_image", "logo_url"]) {
    if (body[key] && typeof body[key] !== "string") {
      body[key] = "";
    }
  }
  return body;
}
