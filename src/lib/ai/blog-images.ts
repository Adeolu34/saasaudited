interface BlogImageContextParams {
  title: string;
  category?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
}

export function stripHtmlForImageContext(html: string, maxLength = 700): string {
  const plain = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, maxLength);
}

export function buildBlogImageContext(params: BlogImageContextParams): string {
  const parts: string[] = [];
  parts.push(`Title: ${params.title}`);
  if (params.category) parts.push(`Category: ${params.category}`);
  if (params.excerpt) parts.push(`Excerpt: ${params.excerpt}`);
  if (params.tags?.length) parts.push(`Tags: ${params.tags.join(", ")}`);
  if (params.content) {
    parts.push(`Body context: ${stripHtmlForImageContext(params.content)}`);
  }
  return parts.join(" | ");
}

export function insertInlineImageIntoBlogContent(
  content: string,
  imageUrl: string,
  altText: string
): string {
  if (!content || !imageUrl) return content;

  const figure = `<figure class="post-inline-image"><img src="${imageUrl}" alt="${escapeHtmlAttr(
    altText
  )}" loading="lazy" /><figcaption>${escapeHtml(altText)}</figcaption></figure>`;

  const headingRegex = /<h2\b[^>]*>[\s\S]*?<\/h2>/gi;
  const headingMatches = Array.from(content.matchAll(headingRegex));

  // Insert before a middle section for better reading flow.
  if (headingMatches.length >= 2) {
    const middleMatch = headingMatches[Math.floor(headingMatches.length / 2)];
    if (middleMatch.index !== undefined) {
      return (
        content.slice(0, middleMatch.index) + figure + "\n\n" + content.slice(middleMatch.index)
      );
    }
  }

  // Fallback: append near the end if section structure is missing.
  return `${content}\n\n${figure}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(text: string): string {
  return escapeHtml(text).replace(/`/g, "&#96;");
}
